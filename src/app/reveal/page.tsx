'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ExitButton } from '@/components/ui/ExitButton'
import { Player } from '@/types/game'
import { DomainLabel } from '@/components/ui/DomainLabel'

export default function RevealPage() {
  const { state, dispatch } = useGame()
  const { theme } = useTheme()
  const router = useRouter()
  const [activePlayer, setActivePlayer] = useState<Player | null>(null)

  useEffect(() => {
    if (state.players.length === 0) router.replace('/')
  }, [state.players.length, router])

  if (state.players.length === 0) return null

  const allRevealed = state.players.every(p => p.hasSeenRole)

  const spyPartners = (player: Player) =>
    state.players.filter(p => p.isImpostor && p.id !== player.id).map(p => p.name)

  function handleGotIt() {
    if (!activePlayer) return
    dispatch({ type: 'MARK_ROLE_SEEN', id: activePlayer.id })
    setActivePlayer(null)
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <DomainLabel category={state.selectedCategory} />
          <h1 className="text-2xl font-bold">Assignment</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
            Each operative taps their name privately to receive their role
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
                borderColor: '#000',
                background: theme === 'dark'
                  ? 'radial-gradient(circle at center, rgb(144, 55, 75) 0%, rgb(60, 10, 23) 100%)'
                  : 'radial-gradient(circle at center, rgba(255, 255, 255, 0) 0%, rgb(255, 220, 227) 100%)',
                color: 'var(--fg)',
                boxShadow: '0 4px 24px rgba(155,28,49,0.15)',
              }}
            >
              <span className={`font-bold truncate w-full ${hasSeen ? 'text-xl' : 'text-2xl'}`}>
                {player.name}
              </span>
              {hasSeen
                ? <span className="text-green-500 text-sm font-bold">✓ Ready</span>
                : <span className="text-sm font-bold" style={{ color: 'var(--fg-subtle)' }}>Tap to receive</span>
              }
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <Button fullWidth size="lg" disabled={!allRevealed} onClick={() => router.push('/game')}>
          {allRevealed ? 'Proceed to Signal' : `Waiting (${state.players.filter(p => p.hasSeenRole).length}/${state.players.length} ready)`}
        </Button>
      </div>

      <Modal open={activePlayer !== null}>
        {activePlayer && (
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
              {activePlayer.name}
            </p>
            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--fg-muted)' }}>Domain</p>
              <p className="text-2xl font-bold">{state.selectedCategory}</p>
            </div>
            {activePlayer.isImpostor ? (
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)' }}>
                <p className="text-3xl font-bold" style={{ color: '#e8385a' }}>You are a Spy!</p>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Blend in. Don&apos;t reveal yourself.</p>
                {spyPartners(activePlayer).length > 0 && (
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    {spyPartners(activePlayer).length === 1 ? 'Partner' : 'Partners'}:{' '}
                    <span className="font-bold" style={{ color: 'var(--fg)' }}>{spyPartners(activePlayer).join(', ')}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-4 space-y-1" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)' }}>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Codeword</p>
                <p className="text-4xl font-bold" style={{ color: '#ffffff' }}>{state.secretWord}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--fg-subtle)' }}>You are an Operative. Protect the codeword.</p>
              </div>
            )}
            <Button fullWidth size="lg" onClick={handleGotIt}>Understood</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
