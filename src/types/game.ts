export type Phase = 'setup' | 'reveal' | 'game' | 'vote' | 'results'
export type Category = 'Food' | 'Movies' | 'Animals' | 'Travel' | 'Sports' | 'Music' | 'Nature' | 'Tech'

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

export interface GameState {
  phase: Phase
  players: Player[]
  impostorCount: 1 | 2 | 3
  selectedCategory: Category | null
  secretWord: string | null
  startingPlayerIndex: number
  currentRevealIndex: number
  currentVoterIndex: number
  ballots: VoteBallot[]
  elapsedSeconds: number
  loopComplete: boolean
  turnIndex: number
}
