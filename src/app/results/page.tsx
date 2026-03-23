'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { Button } from '@/components/ui/Button'
import { tallyVotes, checkImpostorsCaught } from '@/lib/gameLogic'

export default function ResultsPage() {
  const { state, dispatch } = useGame()
  const router = useRouter()

  useEffect(() => {
    if (state.players.length === 0) router.replace('/')
  }, [state.players.length, router])

  if (state.players.length === 0 || state.phase !== 'results' || state.ballots.length === 0) return null

  const results = tallyVotes(state.ballots, state.players)
  const impostorsCaught = checkImpostorsCaught(results, state.players, state.impostorCount)
  const impostors = state.players.filter(p => p.isImpostor)
  const playerMap = new Map(state.players.map(p => [p.id, p]))

  const [wordRevealed, setWordRevealed] = useState(false)

  function handleReset() {
    router.push('/')
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
      <header className="mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>
            Category: <span className="text-violet-500">{state.selectedCategory}</span>
          </p>
          <h1 className="text-3xl font-bold mb-1">Results</h1>
        </div>
      </header>

      <div className="text-center mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>Word</p>
        {wordRevealed ? (
          <p className="text-5xl font-bold text-violet-500">{state.secretWord}</p>
        ) : (
          <button
            onClick={() => setWordRevealed(true)}
            className="text-5xl font-bold rounded-xl px-4 py-1 transition-all active:scale-95"
            style={{ background: 'var(--bg-elevated)', color: 'transparent', textShadow: 'none',
              backdropFilter: 'blur(8px)', letterSpacing: '0.05em', border: '2px dashed',
              borderColor: 'rgba(124,58,237,0.5)' }}
          >
            <span className="text-violet-400 text-lg font-semibold" style={{ color: 'var(--fg-muted)' }}>
              Tap to reveal
            </span>
          </button>
        )}
      </div>

      {impostorsCaught ? (
        <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-5 mb-6 text-center">
          <p className="text-2xl font-bold text-green-500 mb-1">Impostors Caught!</p>
          <p className="text-green-400 text-sm">
            One last chance — let them guess the secret word to steal the win!
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--fg-muted)' }}>
            Impostors: <span className="font-bold" style={{ color: 'var(--fg)' }}>
              {impostors.map(p => p.name).join(', ')}
            </span>
          </p>
        </div>
      ) : (
        <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-5 mb-6 text-center">
          <p className="text-2xl font-bold text-red-500 mb-1">Impostors Win!</p>
          <p className="text-red-400 text-sm mb-2">They blended in perfectly.</p>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            They were: <span className="font-bold" style={{ color: 'var(--fg)' }}>
              {impostors.map(p => p.name).join(', ')}
            </span>
          </p>
        </div>
      )}

      <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-subtle)' }}>
        Vote Results
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
                <span className="text-sm w-5" style={{ color: 'var(--fg-subtle)' }}>{rank + 1}.</span>
                <span className="font-medium">{player.name}</span>
                {player.isImpostor && (
                  <span className="text-xs font-bold text-red-500 bg-red-500/20 px-2 py-0.5 rounded-full">
                    IMPOSTOR
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

      <Button fullWidth size="lg" variant="secondary" onClick={handleReset}>
        Play Again
      </Button>
    </div>
  )
}
