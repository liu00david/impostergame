import { Player, Category, VoteBallot } from '@/types/game'
import { WORD_LISTS } from './wordLists'

export const CATEGORIES: Category[] = [
  'Animals', 'AsianFood', 'Celebrities', 'Cities', 'FictionalCharacter', 'Food', 'Hobbies',
  'Jobs', 'Movies', 'Sports'
]

export const CATEGORY_LABELS: Record<Category, string> = {
  Animals: 'Animals',
  AsianFood: 'Asian Food',
  Celebrities: 'Celebrities',
  Cities: 'Cities',
  FictionalCharacter: 'Fictional Character',
  Food: 'Food',
  Hobbies: 'Hobbies',
  Jobs: 'Jobs',
  Movies: 'Movies',
  Sports: 'Sports',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function assignRoles(players: Player[], impostorCount: 1 | 2 | 3): Player[] {
  const shuffled = shuffle(players)
  return shuffled.map((player, index) => ({ ...player, isImpostor: index < impostorCount, hasSeenRole: false }))
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

export function checkImpostorsCaught(results: TallyResult[], players: Player[], impostorCount: 1 | 2 | 3): boolean {
  const impostorIds = new Set(players.filter(p => p.isImpostor).map(p => p.id))
  const impostorVotes = results.filter(r => impostorIds.has(r.playerId))
  const maxCivilianVotes = results.filter(r => !impostorIds.has(r.playerId)).reduce((m, r) => Math.max(m, r.votes), 0)
  return impostorVotes.every(r => r.votes > maxCivilianVotes)
}
