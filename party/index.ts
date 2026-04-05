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
  signalOrder: [],
  ballots: [],
  elapsedSeconds: 0,
  settings: {
    spiesKnowEachOther: true,
    spiesVoteCount: true,
  },
})

const DISCONNECT_GRACE_MS = 60_000

export default class SpyhuntServer implements Party.Server {
  state: OnlineGameState
  timerInterval: ReturnType<typeof setInterval> | null = null
  disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

  constructor(readonly room: Party.Room) {
    this.state = initialState()
  }

  // Assign host to next best player and broadcast HOST_CHANGED if someone new gets it
  reassignHost(previousHostId: string) {
    const nextHost = this.state.players
      .filter(p => p.isConnected)
      .sort((a, b) => a.order - b.order)[0]
      ?? this.state.players.sort((a, b) => a.order - b.order)[0]
    if (nextHost) {
      nextHost.isHost = true
      this.broadcast({ type: 'HOST_CHANGED', newHostName: nextHost.name })
    }
  }

  // Reset room if no active (non-left) players remain
  resetIfEmpty() {
    if (this.state.players.filter(p => !p.hasLeft).length === 0) {
      this.stopTimer()
      this.state = initialState()
    }
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

    // Mark disconnected immediately so UI reflects it
    player.isConnected = false
    this.broadcast({ type: 'STATE', state: this.state })

    // Grace period before actually removing/demoting
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(conn.id)
      // Player didn't reconnect in time
      if (this.state.phase === 'lobby') {
        this.state.players = this.state.players.filter(p => p.id !== conn.id)
      }
      // In-game: keep the slot but reassign host if needed
      if (player.isHost) {
        player.isHost = false
        this.reassignHost(conn.id)
      }
      this.resetIfEmpty()
      this.broadcast({ type: 'STATE', state: this.state })
    }, DISCONNECT_GRACE_MS)

    this.disconnectTimers.set(conn.id, timer)
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
          // Reconnect: cancel grace timer, reassign connection slot
          const pendingTimer = this.disconnectTimers.get(matchByName.id)
          if (pendingTimer) {
            clearTimeout(pendingTimer)
            this.disconnectTimers.delete(matchByName.id)
          }
          matchByName.id = sender.id
          matchByName.isConnected = true
          this.sendTo(sender, { type: 'STATE', state: this.state })
          this.broadcast({ type: 'STATE', state: this.state })
          break
        }

        // Lobby: check for name collision (always, even if this connection already has a slot)
        const matchByName = this.state.players.find(
          p => p.id !== sender.id && p.name.toLowerCase() === trimmedName.toLowerCase()
        )
        if (matchByName) {
          if (matchByName.isConnected) {
            // Active player — hard block
            this.sendTo(sender, { type: 'ERROR', message: 'Name already taken' })
            break
          } else {
            // Disconnected slot in grace period — allow reclaim
            const pendingTimer = this.disconnectTimers.get(matchByName.id)
            if (pendingTimer) { clearTimeout(pendingTimer); this.disconnectTimers.delete(matchByName.id) }
            // Remove existing slot for this connection if any
            if (existing) this.state.players = this.state.players.filter(p => p.id !== sender.id)
            matchByName.id = sender.id
            matchByName.isConnected = true
            this.broadcast({ type: 'STATE', state: this.state })
            break
          }
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

        const activePlayers = this.state.players.filter(p => !p.hasLeft)
        const startingPlayer = activePlayers[
          Math.floor(Math.random() * activePlayers.length)
        ]
        const restShuffled = shuffle(activePlayers.filter(p => p.id !== startingPlayer.id))
        const signalOrder = [startingPlayer, ...restShuffled].map(p => p.id)

        this.state.phase = 'reveal'
        this.state.selectedCategory = category
        this.state.impostorCount = impostorCount
        this.state.secretWord = pickWord(category)
        this.state.startingPlayerId = startingPlayer.id
        this.state.signalOrder = signalOrder
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
        this.state.elapsedSeconds = 0
        this.state.phase = 'debrief'
        this.startTimer()
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'DEBRIEF_COMPLETE': {
        if (!this.isHost(sender.id)) break
        this.stopTimer()
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

      case 'FORCE_RESULTS': {
        if (!this.isHost(sender.id)) break
        if (this.state.phase !== 'vote') break
        this.state.phase = 'results'
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'RESET_GAME': {
        if (!this.isHost(sender.id)) break
        this.stopTimer()
        const preserved = {
          players: this.state.players
            .filter(p => !p.hasLeft)
            .sort((a, b) => a.order - b.order)
            .map(p => ({ ...p, isImpostor: false, hasSeenRole: false, hasVoted: false, hasLeft: false })),
          selectedCounts: this.state.selectedCounts,
          selectedCategory: this.state.useRandomCategory ? null : this.state.selectedCategory,
          useRandomCategory: this.state.useRandomCategory,
          settings: this.state.settings,
        }
        this.state = { ...initialState(), ...preserved }
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'LEAVE_GAME': {
        const leaving = this.state.players.find(p => p.id === sender.id)
        if (!leaving) break
        // Cancel any pending disconnect timer
        const t = this.disconnectTimers.get(sender.id)
        if (t) { clearTimeout(t); this.disconnectTimers.delete(sender.id) }
        const inGame = ['reveal', 'game', 'debrief', 'vote'].includes(this.state.phase)
        if (inGame && leaving.isImpostor) {
          // Keep impostor in list for results display, just mark as left
          leaving.hasLeft = true
          leaving.isConnected = false
          leaving.isHost = false
        } else {
          this.state.players = this.state.players.filter(p => p.id !== sender.id)
        }
        if (leaving.isHost) this.reassignHost(sender.id)
        // If mid-game and all spies have now left, advance to results
        if (inGame && this.state.players.filter(p => !p.hasLeft).length > 0) {
          const remainingSpies = this.state.players.filter(p => p.isImpostor && !p.hasLeft)
          if (remainingSpies.length === 0) {
            this.stopTimer()
            this.state.phase = 'results'
          }
        }
        this.resetIfEmpty()
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'DISBAND_ROOM': {
        if (!this.isHost(sender.id)) break
        // Kick every non-host player
        for (const p of this.state.players) {
          if (p.id === sender.id) continue
          const conn = this.room.getConnection(p.id)
          if (conn) { this.sendTo(conn, { type: 'KICKED' }); conn.close() }
        }
        // Clear all players and reset
        this.stopTimer()
        this.state = initialState()
        break
      }

      case 'MAKE_HOST': {
        if (!this.isHost(sender.id)) break
        const newHost = this.state.players.find(p => p.id === msg.playerId)
        if (!newHost) break
        // Demote current host, promote new one
        this.state.players.forEach(p => { p.isHost = false })
        newHost.isHost = true
        this.broadcast({ type: 'HOST_CHANGED', newHostName: newHost.name })
        this.broadcast({ type: 'STATE', state: this.state })
        break
      }

      case 'KICK_PLAYER': {
        if (!this.isHost(sender.id)) break
        const kicked = this.state.players.find(p => p.id === msg.playerId)
        const kickedConn = this.room.getConnection(msg.playerId)
        // Notify and close the kicked connection
        if (kickedConn) {
          this.sendTo(kickedConn, { type: 'KICKED' })
          kickedConn.close()
        }
        const inGame = ['reveal', 'game', 'debrief', 'vote'].includes(this.state.phase)
        if (kicked && inGame && kicked.isImpostor) {
          // Keep impostor in list for results display
          kicked.hasLeft = true
          kicked.isConnected = false
          kicked.isHost = false
        } else {
          this.state.players = this.state.players.filter(p => p.id !== msg.playerId)
        }
        // If all spies are now gone mid-game, advance to results
        if (inGame && this.state.players.filter(p => !p.hasLeft).length > 0) {
          const remainingSpies = this.state.players.filter(p => p.isImpostor && !p.hasLeft)
          if (remainingSpies.length === 0) {
            this.stopTimer()
            this.state.phase = 'results'
          }
        }
        this.resetIfEmpty()
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
