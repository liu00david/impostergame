export type Phase = 'setup' | 'reveal' | 'game' | 'vote' | 'results'
export type Category = 'Animals'| 'AsianFood' | 'Celebrities' | 'Cities' | 'FictionalCharacter' | 'Food' | 'Hobbies' | 'Jobs' | 'Movies' | 'Sports'

export interface Player {
  id: string
  name: string
  isImpostor: boolean
  hasSeenRole: boolean
  order: number  // insertion order, stable across role shuffles
}

export interface VoteBallot {
  voterId: string
  suspects: string[]
}

export interface GameSettings {
  spiesKnowEachOther: boolean
  spiesVoteCount: boolean
  signalMode: 'signal' | 'interrogation'
}

export interface GameState {
  phase: Phase
  players: Player[]
  impostorCount: 1 | 2 | 3        // actual count used this game (picked at START_GAME)
  selectedCounts: (1 | 2 | 3)[]   // which spy counts are toggled on in setup
  selectedCategory: Category | null
  useRandomCategory: boolean
  secretWord: string | null
  startingPlayerIndex: number
  currentRevealIndex: number
  currentVoterIndex: number
  ballots: VoteBallot[]
  elapsedSeconds: number
  loopComplete: boolean
  settings: GameSettings
  interrogationPairs: [string, string][]  // snapshot at game start: [asker, answerer]
}
