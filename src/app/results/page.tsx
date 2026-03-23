'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { Button } from '@/components/ui/Button'
import { tallyVotes, checkImpostorsCaught } from '@/lib/gameLogic'

export default function ResultsPage() {
  const { state, dispatch } = useGame()
  const router = useRouter()

  const [wordRevealed, setWordRevealed] = useState(false)

  useEffect(() => {
    if (state.players.length === 0) router.replace('/')
  }, [state.players.length, router])

  if (state.players.length === 0 || state.phase !== 'results' || state.ballots.length === 0) return null

  const results = tallyVotes(state.ballots, state.players)
  const spiesCaught = checkImpostorsCaught(results, state.players, state.impostorCount)
  const spies = state.players.filter(p => p.isImpostor)
  const playerMap = new Map(state.players.map(p => [p.id, p]))

  function handleReset() {
    router.push('/setup')
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
      <header className="mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>
            Domain: <span className="text-rose-800">{state.selectedCategory}</span>
          </p>
          <h1 className="text-2xl font-bold mb-1">Outcome</h1>
        </div>
      </header>

      <div className="text-center mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-subtle)' }}>Codeword</p>
        <button
          onClick={() => setWordRevealed(r => !r)}
          className="w-full rounded-xl transition-all active:scale-95 flex items-center justify-center min-h-[72px] border-2"
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
            <span className="text-5xl font-bold text-rose-800">{state.secretWord}</span>
          ) : (
            <span className="text-lg font-semibold" style={{ color: 'var(--fg-muted)' }}>Tap to reveal</span>
          )}
        </button>
      </div>

      {spiesCaught ? (
        <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <p className="font-title text-2xl font-bold mb-1" style={{ color: 'var(--fg)' }}>Spies Identified!</p>
          <p className="text-base" style={{ color: 'var(--fg-muted)' }}>
            One last chance — spies can guess the codeword to steal the win!
          </p>
          <p className="text-base mt-2" style={{ color: 'var(--fg-muted)' }}>
            Spies: <span className="font-bold" style={{ color: 'var(--fg)' }}>
              {spies.map(p => p.name).join(', ')}
            </span>
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <p className="font-title text-2xl font-bold mb-1" style={{ color: 'var(--fg)' }}>Mission Sabotaged!</p>
          <p className="text-base mb-2" style={{ color: 'var(--fg-muted)' }}>The spies blended in perfectly.</p>
          <p className="text-base" style={{ color: 'var(--fg-muted)' }}>
            They were: <span className="font-bold" style={{ color: 'var(--fg)' }}>
              {spies.map(p => p.name).join(', ')}
            </span>
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
          return (
            <div
              key={result.playerId}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={player.isImpostor
                ? { borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)' }
                : { borderColor: 'var(--border)', background: 'var(--bg-card)' }
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-base w-5" style={{ color: 'var(--fg-subtle)' }}>{rank + 1}.</span>
                <span className="font-medium text-base">{player.name}</span>
                {player.isImpostor && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.18)', color: 'rgba(0,0,0,0.8)' }}>
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
