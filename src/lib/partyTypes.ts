// Shared types between PartyKit server and Next.js client

export type OnlinePhase =
  | 'lobby'      // waiting for players to join
  | 'reveal'     // each player sees their own role
  | 'game'       // signal phase
  | 'debrief'    // discussion
  | 'vote'       // voting
  | 'results'    // outcome

export interface OnlinePlayer {
  id: string        // connection id (set by partykit)
  name: string
  isHost: boolean
  isConnected: boolean
  isImpostor: boolean
  hasSeenRole: boolean
  hasVoted: boolean
  order: number
  hasLeft?: boolean  // true if player left mid-game (kept for results display)
}

export interface OnlineVoteBallot {
  voterId: string
  suspects: string[]  // player ids
}

export interface OnlineGameState {
  phase: OnlinePhase
  players: OnlinePlayer[]
  selectedCategory: string | null
  useRandomCategory: boolean
  selectedCounts: (1 | 2 | 3)[]
  impostorCount: 1 | 2 | 3
  secretWord: string | null
  startingPlayerId: string | null
  signalOrder: string[]  // player names in randomized signal turn order (snapshot at game start)
  ballots: OnlineVoteBallot[]
  elapsedSeconds: number
  settings: {
    spiesKnowEachOther: boolean
    spiesVoteCount: boolean
  }
}

// Messages sent from CLIENT → SERVER
export type ClientMessage =
  | { type: 'SET_NAME'; name: string }
  | { type: 'TOGGLE_SPY_COUNT'; count: 1 | 2 | 3 }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_RANDOM_CATEGORY' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<OnlineGameState['settings']> }
  | { type: 'START_GAME' }
  | { type: 'MARK_ROLE_SEEN' }
  | { type: 'FORCE_START' }       // host skips waiting for all role reveals
  | { type: 'SIGNAL_COMPLETE' }   // host taps "proceed to debrief"
  | { type: 'DEBRIEF_COMPLETE' }  // host taps "proceed to voting"
  | { type: 'CAST_VOTE'; suspects: string[] }
  | { type: 'FORCE_RESULTS' }     // host skips waiting for all votes
  | { type: 'RESET_GAME' }
  | { type: 'KICK_PLAYER'; playerId: string }
  | { type: 'MAKE_HOST'; playerId: string }
  | { type: 'LEAVE_GAME' }
  | { type: 'DISBAND_ROOM' }

// Messages sent from SERVER → CLIENT (broadcast)
export type ServerMessage =
  | { type: 'STATE'; state: OnlineGameState }
  | { type: 'ERROR'; message: string }
  | { type: 'KICKED' }
  | { type: 'HOST_CHANGED'; newHostName: string }
