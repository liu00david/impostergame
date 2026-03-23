'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ExitButton } from '@/components/ui/ExitButton'
import { Player } from '@/types/game'
import { DomainLabel } from '@/components/ui/DomainLabel'

export default function VotePage() {
  const { state, dispatch } = useGame()
  const { theme } = useTheme()
  const router = useRouter()
  const [activeVoter, setActiveVoter] = useState<Player | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const confirmCooldown = useRef(false)

  useEffect(() => {
    if (state.players.length === 0) router.replace('/')
  }, [state.players.length, router])

  if (state.players.length === 0) return null

  const voted = new Set(state.ballots.map(b => b.voterId))
  const allVoted = voted.size >= state.players.length

  function handleTap(player: Player) {
    if (voted.has(player.id)) return
    setActiveVoter(player)
    setSelected(new Set())
  }

  function toggleSelect(id: string) {
    if (!activeVoter || id === activeVoter.id) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size < state.impostorCount) next.add(id)
      }
      return next
    })
  }

  function handleConfirm() {
    if (!activeVoter || confirmCooldown.current) return
    confirmCooldown.current = true
    setTimeout(() => { confirmCooldown.current = false }, 300)
    dispatch({ type: 'CAST_VOTE', ballot: { voterId: activeVoter.id, suspects: Array.from(selected) } })
    setActiveVoter(null)
    setSelected(new Set())
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <DomainLabel category={state.selectedCategory} />
          <h1 className="text-2xl font-bold">Voting</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
            Each operative casts a private vote.
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>
            Voted: {voted.size}/{state.players.length}
          </p>
        </div>
        <ExitButton />
      </header>

      <div className="grid grid-cols-2 gap-4 flex-1 content-start">
        {[...state.players].sort((a, b) => a.order - b.order).map(player => {
          const hasVoted = voted.has(player.id)
          const bg = hasVoted
            ? 'var(--bg-card)'
            : theme === 'dark' ? '#3c0a17' : '#fff0f3'
          const border = hasVoted ? 'var(--border)' : '#666666'
          return (
            <button
              key={player.id}
              onClick={() => handleTap(player)}
              disabled={hasVoted}
              className="relative overflow-hidden border transition-all flex flex-col items-center justify-center text-center gap-1 active:scale-95"
              style={{
                minHeight: '96px',
                borderColor: border,
                borderWidth: '1.5px',
                background: bg,
                color: hasVoted ? 'var(--fg-subtle)' : 'var(--fg)',
                borderRadius: '4px',
                boxShadow: hasVoted ? 'none' : '0 2px 12px rgba(155,28,49,0.18)',
              }}
            >
              {/* Envelope flap */}
              <div
                className="absolute top-0 left-0 w-full"
                style={{
                  height: '36%',
                  background: hasVoted
                    ? (theme === 'dark' ? '#251c1e' : '#e8e8e8')
                    : (theme === 'dark' ? '#5c1a2a' : '#f5c8d0'),
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                }}
              />
              <div className="relative flex flex-col items-center gap-1 mt-6">
                <span className={`font-bold truncate w-full px-3 ${hasVoted ? 'text-lg' : 'text-xl'}`}>
                  {player.name}
                </span>
                {hasVoted
                  ? <span className="text-green-500 text-sm font-bold">✓ Voted</span>
                  : <span className="text-sm font-bold" style={{ color: 'var(--fg-subtle)' }}>Tap to vote</span>
                }
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <Button fullWidth size="lg" disabled={!allVoted} onClick={() => router.push('/results')}>
          {allVoted ? 'See Verdict' : `Waiting (${voted.size}/${state.players.length} voted)`}
        </Button>
      </div>

      <Modal open={activeVoter !== null}>
        {activeVoter && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-muted)' }}>
                {activeVoter.name}&apos;s ruling
              </p>
              <p className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
                Identify up to {state.impostorCount} spy{state.impostorCount > 1 ? 's' : ''} (or skip)
              </p>
            </div>
            <div className="space-y-2">
              {[...state.players].sort((a, b) => a.order - b.order).map(player => {
                const isSelf = player.id === activeVoter.id
                const isSelected = selected.has(player.id)
                return (
                  <button
                    key={player.id}
                    onClick={() => toggleSelect(player.id)}
                    disabled={isSelf}
                    className="w-full flex items-center justify-between rounded-xl border px-4 py-3 min-h-[52px] transition-all"
                    style={isSelf ? {
                      borderColor: 'var(--border)', background: 'var(--bg-card)',
                      color: 'var(--fg-subtle)', opacity: 0.5, cursor: 'not-allowed',
                    } : isSelected ? {
                      borderColor: '#ef4444', background: 'rgba(239,68,68,0.15)', color: '#f87171',
                    } : {
                      borderColor: 'var(--border)', background: 'var(--bg-elevated)', color: 'var(--fg)',
                    }}
                  >
                    <span className="font-medium">{player.name}</span>
                    {isSelf && <span className="text-sm" style={{ color: 'var(--fg-subtle)' }}>you</span>}
                    {isSelected && <span className="text-red-400 text-lg">✓</span>}
                    {!isSelf && !isSelected && (
                      <div className="w-5 h-5 rounded border" style={{ borderColor: 'var(--border)' }} />
                    )}
                  </button>
                )
              })}
            </div>
            <Button fullWidth size="lg" onClick={handleConfirm}>
              {selected.size === 0 ? 'Abstain' : `Flag ${selected.size} as spy${selected.size > 1 ? 's' : ''}`}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
