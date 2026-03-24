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
import { CATEGORY_LABELS } from '@/lib/gameLogic'

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
            Each agent taps their name privately to receive their role
          </p>
        </div>
        <ExitButton />
      </header>

      <div className="grid grid-cols-2 gap-4 flex-1 content-start">
        {[...state.players].sort((a, b) => a.order - b.order).map(player => {
          const hasSeen = player.hasSeenRole
          const bg = hasSeen
            ? 'var(--bg-card)'
            : theme === 'dark' ? '#3c0a17' : '#fff0f3'
          const flapBg = hasSeen
            ? (theme === 'dark' ? '#1e1215' : '#e2e2e2')
            : (theme === 'dark' ? '#5a1525' : '#f0bcc8')
          return (
            <button
              key={player.id}
              onClick={() => setActivePlayer(player)}
              className="relative overflow-hidden transition-all flex flex-col items-center justify-center text-center active:scale-95"
              style={{
                minHeight: '100px',
                background: bg,
                color: hasSeen ? 'var(--fg-subtle)' : 'var(--fg)',
                borderRadius: '6px',
                border: hasSeen
                  ? '1px solid var(--border)'
                  : `1.5px solid ${theme === 'dark' ? '#7a1a30' : '#c06070'}`,
                boxShadow: hasSeen
                  ? 'none'
                  : theme === 'dark'
                    ? '0 4px 20px rgba(155,28,49,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 4px 16px rgba(155,28,49,0.15)',
              }}
            >
              {/* Envelope flap */}
              <div
                className="absolute top-0 left-0 w-full"
                style={{
                  height: '38%',
                  background: flapBg,
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                }}
              />
              <div className="relative flex flex-col items-center gap-0.5 mt-7 px-2">
                <span className={`font-spy truncate w-full ${hasSeen ? 'text-base' : 'text-lg'}`}>
                  {player.name}
                </span>
                {hasSeen
                  ? <span className="text-green-500 text-xs font-bold tracking-wide">✓ READY</span>
                  : <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg-subtle)' }}>Open</span>
                }
              </div>
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
              <p className="text-2xl font-bold">{state.selectedCategory ? (CATEGORY_LABELS[state.selectedCategory] ?? state.selectedCategory) : ''}</p>
            </div>
            {activePlayer.isImpostor ? (
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)' }}>
                <p className="text-3xl font-bold" style={{ color: '#e8385a' }}>You are a Spy!</p>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Blend in. Don&apos;t reveal yourself.</p>
                {state.settings.spiesKnowEachOther && spyPartners(activePlayer).length > 0 && (
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    {spyPartners(activePlayer).length === 1 ? 'Partner' : 'Partners'}:{' '}
                    <span className="font-bold" style={{ color: 'var(--fg)' }}>{spyPartners(activePlayer).join(', ')}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)' }}>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Codeword</p>
                <p className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : 'var(--fg)' }}>{state.secretWord}</p>
                <p className="text-sm mt-2" style={{ color: 'var(--fg-subtle)' }}>You are an Operative. Protect the codeword.</p>
              </div>
            )}
            <Button fullWidth size="lg" onClick={handleGotIt}>Understood</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
