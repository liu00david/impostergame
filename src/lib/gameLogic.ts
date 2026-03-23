import { Player, Category, VoteBallot } from '@/types/game'
import { WORD_LISTS } from './wordLists'

export function assignRoles(players: Player[], impostorCount: 1 | 2 | 3): Player[] {
  const shuffled = [...players]
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.map((player, index) => ({
    ...player,
    isImpostor: index < impostorCount,
    hasSeenRole: false,
  }))
}

export function pickWord(category: Category): string {
  const words = WORD_LISTS[category]
  return words[Math.floor(Math.random() * words.length)]
}

export function pickStartingPlayer(playerCount: number): number {
  return Math.floor(Math.random() * playerCount)
}

export interface TallyResult {
  playerId: string
  votes: number
}

export function tallyVotes(ballots: VoteBallot[], players: Player[]): TallyResult[] {
  const counts = new Map<string, number>()
  players.forEach(p => counts.set(p.id, 0))

  ballots.forEach(ballot => {
    ballot.suspects.forEach(suspectId => {
      counts.set(suspectId, (counts.get(suspectId) ?? 0) + 1)
    })
  })

  return Array.from(counts.entries())
    .map(([playerId, votes]) => ({ playerId, votes }))
    .sort((a, b) => b.votes - a.votes)
}

export function checkImpostorsCaught(
  results: TallyResult[],
  players: Player[],
  impostorCount: 1 | 2 | 3
): boolean {
  const impostorIds = new Set(players.filter(p => p.isImpostor).map(p => p.id))
  const civilianIds = new Set(players.filter(p => !p.isImpostor).map(p => p.id))

  const impostorVotes = results.filter(r => impostorIds.has(r.playerId))
  const civilianVotes = results.filter(r => civilianIds.has(r.playerId))

  const maxCivilianVotes = civilianVotes.reduce((m, r) => Math.max(m, r.votes), 0)

  // Every impostor must have strictly more votes than every civilian
  return impostorVotes.every(r => r.votes > maxCivilianVotes)
}
