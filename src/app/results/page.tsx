'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/Button'
import { tallyVotes, checkImpostorsCaught } from '@/lib/gameLogic'
import { DomainLabel } from '@/components/ui/DomainLabel'

export default function ResultsPage() {
  const { state, dispatch } = useGame()
  const { theme } = useTheme()
  const router = useRouter()

  const [wordRevealed, setWordRevealed] = useState(false)

  useEffect(() => {
    if (state.players.length === 0) router.replace('/')
  }, [state.players.length, router])

  if (state.players.length === 0 || state.phase !== 'results' || state.ballots.length === 0) return null

  const spyIds = new Set(state.players.filter(p => p.isImpostor).map(p => p.id))
  const effectiveBallots = state.settings.spiesVoteCount
    ? state.ballots
    : state.ballots.filter(b => !spyIds.has(b.voterId))
  const results = tallyVotes(effectiveBallots, state.players)
  const spiesCaught = checkImpostorsCaught(results, state.players, state.impostorCount)
  const spies = state.players.filter(p => p.isImpostor)
  const playerMap = new Map(state.players.map(p => [p.id, p]))

  // Compute eliminated set: take whole vote-count groups from the top.
  // A group fits only if slotsUsed + groupSize <= impostorCount.
  // Example: votes [2,2,1], 2 spies → group {2 votes, size 2} fits in 2 slots → both eliminated.
  // Example: votes [2,1,1], 1 spy → group {2 votes, size 1} fits in 1 slot → only top eliminated.
  // Example: votes [1,1,1], 1 spy → group {1 vote, size 3} doesn't fit in 1 slot → nobody eliminated.
  const eliminatedIds = new Set<string>()
  let slotsUsed = 0
  let i = 0
  while (i < results.length && slotsUsed < state.impostorCount) {
    const groupVotes = results[i].votes
    const group: string[] = []
    while (i < results.length && results[i].votes === groupVotes) {
      group.push(results[i].playerId)
      i++
    }
    if (slotsUsed + group.length <= state.impostorCount) {
      group.forEach(id => eliminatedIds.add(id))
      slotsUsed += group.length
    } else {
      break // group straddles the cutoff — don't partially eliminate
    }
  }

  const eliminatedNames = [...eliminatedIds]
    .map(id => playerMap.get(id)?.name)
    .filter(Boolean)
    .join(', ') || 'Nobody'

  function handleReset() {
    dispatch({ type: 'RESET_GAME' })
    router.push('/setup')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-6">
        <div>
          <DomainLabel category={state.selectedCategory} />
          <h1 className="text-2xl font-bold mb-1">Outcome</h1>
        </div>
      </header>

      <div className="text-center mb-4">
        <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-subtle)' }}>Codeword</p>
        <button
          onClick={() => setWordRevealed(r => !r)}
          className="w-full rounded-xl transition-all active:scale-95 flex items-center justify-center min-h-[60px] border-2"
          style={wordRevealed ? {
            borderColor: 'rgba(155,28,49,0.4)',
            background: 'rgba(155,28,49,0.08)',
          } : {
            borderStyle: 'dashed',
            borderColor: 'rgba(155,28,49,0.5)',
            background: 'var(--bg-elevated)',
          }}
        >
          {wordRevealed ? (
            <span className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{state.secretWord}</span>
          ) : (
            <span className="text-lg font-semibold" style={{ color: 'var(--fg-muted)' }}>Tap to reveal</span>
          )}
        </button>
      </div>

      {spiesCaught ? (
        <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: theme === 'dark' ? 'rgba(34, 245, 111, 0.23)' : 'rgba(145, 255, 185, 0.39)', border: '3px solid rgba(0, 147, 54, 0.68)', boxShadow: '0 0 0 1px rgba(0,147,54,0.15)' }}>
          <p className="font-title text-3xl font-bold mb-3" style={{ color: 'var(--fg)' }}>Spies Caught!</p>
          <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>
            One last chance for spies to guess the codeword to steal the win!
          </p>
          <p className="text-lg mt-2" style={{ color: 'var(--fg-muted)' }}>
            Spies: <span className="font-bold" style={{ color: 'var(--fg)' }}>{spies.map(p => p.name).join(', ')}</span>
          </p>
          <p className="text-lg mt-1" style={{ color: 'var(--fg-muted)' }}>
            Identified: <span className="font-bold" style={{ color: 'var(--fg)' }}>{eliminatedNames}</span>
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: theme === 'dark' ? 'rgba(180, 30, 60, 0.35)' : 'rgba(230, 165, 176, 0.18)', border: `3px solid ${theme === 'dark' ? 'rgba(200, 60, 80, 0.65)' : 'rgba(180, 60, 80, 0.55)'}`, boxShadow: `0 0 0 1px ${theme === 'dark' ? 'rgba(200,60,80,0.15)' : 'rgba(180,60,80,0.1)'}` }}>
          <p className="font-title text-3xl font-bold mb-3" style={{ color: 'var(--fg)' }}>Mission Sabotaged!</p>
          <p className="text-lg mb-2" style={{ color: 'var(--fg-muted)' }}>The spies were not eliminated.</p>
          <p className="text-lg mb-1" style={{ color: 'var(--fg-muted)' }}>
            Spies: <span className="font-bold" style={{ color: 'var(--fg)' }}>{spies.map(p => p.name).join(', ')}</span>
          </p>
          <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>
            Eliminated: <span className="font-bold" style={{ color: 'var(--fg)' }}>{eliminatedNames}</span>
          </p>
        </div>
      )}

      <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-subtle)' }}>
        Vote Tally
      </h2>
      <div className="space-y-2 mb-8">
        {results.map((result, rank) => {
          const player = playerMap.get(result.playerId)
          if (!player) return null
          const isEliminated = eliminatedIds.has(result.playerId)
          const rowStyle = isEliminated
            ? player.isImpostor
              ? { borderColor: 'rgba(34,197,94,0.45)', background: 'rgba(34,197,94,0.10)' }
              : { borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)' }
            : { borderColor: 'var(--border)', background: 'var(--bg-card)' }
          return (
            <div
              key={result.playerId}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={rowStyle}
            >
              <div className="flex items-center gap-3">
                <span className="text-base w-5" style={{ color: 'var(--fg-subtle)' }}>{rank + 1}.</span>
                <span className="font-medium text-base">{player.name}</span>
                {player.isImpostor && (
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(161, 10, 10, 0.93)', color: 'rgba(255, 255, 255, 0.9)' }}>
                    SPY
                  </span>
                )}
              </div>
              <span className="font-bold" style={{ color: result.votes > 0 ? 'var(--fg)' : 'var(--fg-subtle)' }}>
                {result.votes} vote{result.votes !== 1 ? 's' : ''}
              </span>
            </div>
          )
        })}
      </div>

      <Button fullWidth size="lg" onClick={handleReset}>
        New Mission
      </Button>
    </div>
  )
}
