import type * as Party from 'partykit/server'
import type {
  OnlineGameState,
  OnlinePlayer,
  ClientMessage,
  ServerMessage,
} from '../src/lib/partyTypes'

// Word lists and category helpers inlined (can't import from src/ in party/)
const CATEGORIES = [
  'Animals', 'AsianFood', 'Celebrities', 'Cities', 'FictionalCharacter',
  'Food', 'Hobbies', 'Internet', 'Movies', 'Sports',
]

const WORD_LISTS: Record<string, string[]> = {
  Animals: ['Lion', 'Elephant', 'Dolphin', 'Eagle', 'Fox', 'Penguin', 'Tiger', 'Gorilla', 'Cheetah', 'Panda', 'Crocodile', 'Giraffe', 'Kangaroo', 'Octopus', 'Parrot', 'Shark', 'Snake', 'Wolf', 'Zebra', 'Bear'],
  AsianFood: ['Sushi', 'Ramen', 'Dim Sum', 'Pad Thai', 'Bibimbap', 'Pho', 'Dumpling', 'Takoyaki', 'Tteokbokki', 'Banh Mi', 'Kimchi', 'Miso Soup', 'Tempura', 'Laksa', 'Nasi Goreng', 'Satay', 'Tom Yum', 'Char Siu', 'Onigiri', 'Gyoza'],
  Celebrities: ['Taylor Swift', 'Elon Musk', 'Beyoncé', 'LeBron James', 'Rihanna', 'Tom Hanks', 'Oprah Winfrey', 'Drake', 'Cristiano Ronaldo', 'Adele', 'Jeff Bezos', 'Lady Gaga', 'Kanye West', 'Serena Williams', 'Brad Pitt', 'Billie Eilish', 'Barack Obama', 'Kim Kardashian', 'Dwayne Johnson', 'Zendaya'],
  Cities: ['Tokyo', 'Paris', 'New York', 'London', 'Dubai', 'Sydney', 'Rome', 'Bangkok', 'Singapore', 'Barcelona', 'Istanbul', 'Los Angeles', 'Mumbai', 'Seoul', 'Cairo', 'Amsterdam', 'Buenos Aires', 'Toronto', 'Berlin', 'Mexico City'],
  FictionalCharacter: ['Sherlock Holmes', 'Harry Potter', 'Darth Vader', 'Hermione Granger', 'James Bond', 'Batman', 'Gandalf', 'Elizabeth Bennet', 'Katniss Everdeen', 'Frodo Baggins', 'Tony Stark', 'Hannibal Lecter', 'Daenerys Targaryen', 'Walter White', 'Winnie-the-Pooh', 'Atticus Finch', 'Odysseus', 'Dracula', 'Holden Caulfield', 'Jay Gatsby'],
  Food: ['Pizza', 'Sushi', 'Burger', 'Pasta', 'Tacos', 'Ice Cream', 'Steak', 'Chocolate', 'Sandwich', 'Salad', 'Fried Chicken', 'Cheesecake', 'Croissant', 'Pancakes', 'Lasagna', 'Curry', 'Hot Dog', 'Waffles', 'Burrito', 'Dumplings'],
  Hobbies: ['Photography', 'Hiking', 'Knitting', 'Chess', 'Surfing', 'Gardening', 'Painting', 'Rock Climbing', 'Cooking', 'Cycling', 'Reading', 'Gaming', 'Yoga', 'Dancing', 'Fishing', 'Pottery', 'Running', 'Skateboarding', 'Bird Watching', 'Woodworking'],
  Internet: ['Meme', 'Podcast', 'Streaming', 'TikTok', 'Reddit', 'Influencer', 'Viral', 'Algorithm', 'Discord', 'NFT', 'Twitch', 'YouTube', 'Hashtag', 'Deepfake', 'VPN', 'Phishing', 'Spam', 'Cryptocurrency', 'Dark Web', 'Doxxing'],
  Movies: ['The Godfather', 'Titanic', 'Inception', 'The Matrix', 'Jurassic Park', 'Star Wars', 'The Lion King', 'Interstellar', 'Avengers', 'Pulp Fiction', 'Fight Club', 'Forrest Gump', 'The Dark Knight', 'Gladiator', 'Toy Story', 'Schindler\'s List', 'Parasite', 'Get Out', 'La La Land', 'Mad Max'],
  Sports: ['Soccer', 'Basketball', 'Tennis', 'Swimming', 'Boxing', 'Golf', 'Baseball', 'Rugby', 'Volleyball', 'Gymnastics', 'Cycling', 'Wrestling', 'Skiing', 'Surfing', 'Athletics', 'Badminton', 'Ice Hockey', 'Cricket', 'Fencing', 'Rowing'],
}

const IMPOSTOR_MIN_PLAYERS: Record<number, number> = { 1: 3, 2: 5, 3: 7 }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickWord(category: string): string {
  const words = WORD_LISTS[category] ?? WORD_LISTS['Food']
  return words[Math.floor(Math.random() * words.length)]
}

const initialState = (): OnlineGameState => ({
  phase: 'lobby',
  players: [],
  selectedCategory: null,
  useRandomCategory: false,
  selectedCounts: [],
  impostorCount: 1,
  secretWord: null,
  startingPlayerId: null,
  ballots: [],
  elapsedSeconds: 0,
  settings: {
    spiesKnowEachOther: true,
    spiesVoteCount: true,
  },
})

export default class SpyhuntServer implements Party.Server {
  state: OnlineGameState
  timerInterval: ReturnType<typeof setInterval> | null = null

  constructor(readonly room: Party.Room) {
    this.state = initialState()
  }

  broadcast(msg: ServerMessage) {
    this.room.broadcast(JSON.stringify(msg))
  }

  sendTo(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg))
  }

  onConnect(conn: Party.Connection) {
    // Mark player as connected if they're reconnecting
    const existing = this.state.players.find(p => p.id === conn.id)
    if (existing) {
      existing.isConnected = true
      this.broadcast({ type: 'STATE', state: this.state })
    }
    // Send current state to the new connection
    this.sendTo(conn, { type: 'STATE', state: this.state })
  }

  onClose(conn: Party.Connection) {
    const player = this.state.players.find(p => p.id === conn.id)
    if (!player) return

    if (this.state.phase === 'lobby') {
      // Remove from lobby entirely
      this.state.players = this.state.players.filter(p => p.id !== conn.id)
    } else {
      // Keep in game but mark disconnected
      player.isConnected = false
    }

    // Reassign host to next connected player by join order if host disconnected
    if (player.isHost) {
      player.isHost = false
      const nextHost = this.state.players
        .filter(p => p.isConnected)
        .sort((a, b) => a.order - b.order)[0]
      if (nextHost) nextHost.isHost = true
    }

    this.broadcast({ type: 'STATE', state: this.state })
  }

  onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message) as ClientMessage

    switch (msg.type) {
      case 'SET_NAME': {
        const existing = this.state.players.find(p => p.id === sender.id)
        const trimmedName = msg.name.trim()

        if (this.state.phase !== 'lobby') {
          // Game in progress: only allow rejoining by matching an existing disconnected player name
          const matchByName = this.state.players.find(
            p => p.name.toLowerCase() === trimmedName.toLowerCase()
          )
          if (!matchByName) {
            this.sendTo(sender, { type: 'ERROR', message: 'Game in progress — new players cannot join' })
            break
          }
          if (matchByName.isConnected && matchByName.id !== sender.id) {
            this.sendTo(sender, { type: 'ERROR', message: `${matchByName.name} is already online` })
            break
          }
          // Reconnect: reassign this connection to the existing player slot
          matchByName.id = sender.id
          matchByName.isConnected = true
          this.sendTo(sender, { type: 'STATE', state: this.state })
          this.broadcast({ type: 'STATE', state: this.state })
          break
        }

        // Lobby: normal join / rename flow
        const duplicate = this.state.players.find(
          p => p.id !== sender.id && p.name.toLowerCase() === trimmedName.toLowerCase()
        )
        if (duplicate) {
          this.sendTo(sender, { type: 'ERROR', message: 'Name already taken' })
          break
        }
        const isFirst = this.state.players.length === 0
        if (existing) {
          existing.name = trimmedName
          existing.isConnected = true
        } else {
          const newPlayer: OnlinePlayer = {
            id: sender.id,
            name: trimmedName,
            isHost: isFirst,
            isConnected: true,
            isImpostor: false,
            hasSeenRole: false,
            hasVoted: false,
            order: this.state.players.length,
          }
          this.state.players.push(newPlayer)
          if (this.state.players.length === 3 && this.state.selectedCounts.length === 0) {
            this.state.selectedCounts = [1]
          }
        }
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'TOGGLE_SPY_COUNT': {
        if (!this.isHost(sender.id)) break
        const { count } = msg
        const already = this.state.selectedCounts.includes(count)
        this.state.selectedCounts = already
          ? this.state.selectedCounts.filter(c => c !== count)
          : ([...this.state.selectedCounts, count].sort() as (1 | 2 | 3)[])
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'SET_CATEGORY': {
        if (!this.isHost(sender.id)) break
        this.state.selectedCategory = msg.category
        this.state.useRandomCategory = false
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'SET_RANDOM_CATEGORY': {
        if (!this.isHost(sender.id)) break
        this.state.useRandomCategory = true
        this.state.selectedCategory = null
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'UPDATE_SETTINGS': {
        if (!this.isHost(sender.id)) break
        this.state.settings = { ...this.state.settings, ...msg.settings }
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'START_GAME': {
        if (!this.isHost(sender.id)) break
        if (this.state.selectedCounts.length === 0) break
        if (!this.state.selectedCategory && !this.state.useRandomCategory) break

        const category = this.state.useRandomCategory
          ? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
          : this.state.selectedCategory!

        const impostorCount = this.state.selectedCounts[
          Math.floor(Math.random() * this.state.selectedCounts.length)
        ] as 1 | 2 | 3

        // Assign roles
        const shuffled = shuffle(this.state.players)
        shuffled.forEach((p, i) => {
          p.isImpostor = i < impostorCount
          p.hasSeenRole = false
          p.hasVoted = false
        })

        const startingPlayer = this.state.players[
          Math.floor(Math.random() * this.state.players.length)
        ]

        this.state.phase = 'reveal'
        this.state.selectedCategory = category
        this.state.impostorCount = impostorCount
        this.state.secretWord = pickWord(category)
        this.state.startingPlayerId = startingPlayer.id
        this.state.ballots = []
        this.state.elapsedSeconds = 0

        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'MARK_ROLE_SEEN': {
        const player = this.state.players.find(p => p.id === sender.id)
        if (player) {
          player.hasSeenRole = true
          // If all have seen, advance to game phase
          if (this.state.players.every(p => p.hasSeenRole)) {
            this.state.phase = 'game'
            this.startTimer()
          }
          this.broadcast({ type: 'STATE', state: this.state })
        }
        break
      }

      case 'FORCE_START': {
        if (!this.isHost(sender.id)) break
        if (this.state.phase !== 'reveal') break
        this.state.phase = 'game'
        this.startTimer()
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'SIGNAL_COMPLETE': {
        if (!this.isHost(sender.id)) break
        this.stopTimer()
        this.state.phase = 'debrief'
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'DEBRIEF_COMPLETE': {
        if (!this.isHost(sender.id)) break
        this.state.phase = 'vote'
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'CAST_VOTE': {
        const voter = this.state.players.find(p => p.id === sender.id)
        if (!voter || voter.hasVoted) break
        voter.hasVoted = true
        this.state.ballots.push({ voterId: sender.id, suspects: msg.suspects })
        if (this.state.players.every(p => p.hasVoted)) {
          this.state.phase = 'results'
        }
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'RESET_GAME': {
        if (!this.isHost(sender.id)) break
        this.stopTimer()
        const preserved = {
          players: this.state.players
            .sort((a, b) => a.order - b.order)
            .map(p => ({ ...p, isImpostor: false, hasSeenRole: false, hasVoted: false })),
          selectedCounts: this.state.selectedCounts,
          selectedCategory: this.state.useRandomCategory ? null : this.state.selectedCategory,
          useRandomCategory: this.state.useRandomCategory,
          settings: this.state.settings,
        }
        this.state = { ...initialState(), ...preserved }
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'KICK_PLAYER': {
        if (!this.isHost(sender.id)) break
        const kickedConn = this.room.getConnection(msg.playerId)
        // Remove player from state
        this.state.players = this.state.players.filter(p => p.id !== msg.playerId)
        // Notify and close the kicked connection
        if (kickedConn) {
          this.sendTo(kickedConn, { type: 'KICKED' })
          kickedConn.close()
        }
        // Broadcast updated state to remaining players
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }
    }
  }

  isHost(id: string): boolean {
    return this.state.players.find(p => p.id === id)?.isHost ?? false
  }

  startTimer() {
    this.stopTimer()
    this.timerInterval = setInterval(() => {
      this.state.elapsedSeconds++
      this.broadcast({ type: 'STATE', state: this.state })
    }, 1000)
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }
}
