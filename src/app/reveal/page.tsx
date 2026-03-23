'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ExitButton } from '@/components/ui/ExitButton'
import { Player } from '@/types/game'

export default function RevealPage() {
  const { state, dispatch } = useGame()
  const router = useRouter()
  const [activePlayer, setActivePlayer] = useState<Player | null>(null)

  useEffect(() => {
    if (state.players.length === 0) router.replace('/')
  }, [state.players.length, router])

  if (state.players.length === 0) return null

  const allRevealed = state.players.every(p => p.hasSeenRole)

  const impostorPartners = (player: Player) =>
    state.players.filter(p => p.isImpostor && p.id !== player.id).map(p => p.name)

  function handleGotIt() {
    if (!activePlayer) return
    dispatch({ type: 'MARK_ROLE_SEEN', id: activePlayer.id })
    setActivePlayer(null)
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>
            Category: <span className="text-violet-500">{state.selectedCategory}</span>
          </p>
          <h1 className="text-2xl font-bold">Role Reveal</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
            Each player taps their name privately to see their role
          </p>
        </div>
        <ExitButton />
      </header>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {[...state.players].sort((a, b) => a.order - b.order).map(player => {
          const hasSeen = player.hasSeenRole
          return (
            <button
              key={player.id}
              onClick={() => setActivePlayer(player)}
              className="rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-1 active:scale-95"
              style={hasSeen ? {
                minHeight: '72px', padding: '16px',
                borderColor: 'var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--fg-subtle)',
              } : {
                minHeight: '88px', padding: '20px',
                borderColor: '#7c3aed',
                background: 'rgba(124,58,237,0.12)',
                color: 'var(--fg)',
                boxShadow: '0 4px 24px rgba(124,58,237,0.15)',
              }}
            >
              <span className={`font-semibold truncate w-full ${hasSeen ? 'text-base' : 'text-lg'}`}>
                {player.name}
              </span>
              {hasSeen
                ? <span className="text-green-500 text-sm">✓ Done</span>
                : <span className="text-violet-400 text-xs">Tap to reveal</span>
              }
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <Button fullWidth size="lg" disabled={!allRevealed} onClick={() => router.push('/game')}>
          {allRevealed ? 'Start Round' : `Waiting (${state.players.filter(p => p.hasSeenRole).length}/${state.players.length} ready)`}
        </Button>
      </div>

      <Modal open={activePlayer !== null}>
        {activePlayer && (
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              {activePlayer.name}
            </p>
            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--fg-muted)' }}>Category</p>
              <p className="text-2xl font-bold">{state.selectedCategory}</p>
            </div>
            {activePlayer.isImpostor ? (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 space-y-2">
                <p className="text-red-500 text-2xl font-bold">You are the Impostor!</p>
                {impostorPartners(activePlayer).length > 0 && (
                  <p className="text-red-400 text-sm">
                    {impostorPartners(activePlayer).length === 1 ? 'Partner' : 'Partners'}:{' '}
                    <span className="font-bold">{impostorPartners(activePlayer).join(', ')}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <p className="text-sm mb-1" style={{ color: 'var(--fg-muted)' }}>Secret Word</p>
                <p className="text-4xl font-bold text-violet-500">{state.secretWord}</p>
              </div>
            )}
            <Button fullWidth size="lg" onClick={handleGotIt}>Got it!</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
