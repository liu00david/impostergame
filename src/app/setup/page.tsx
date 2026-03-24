'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { PlayerList } from '@/components/setup/PlayerList'
import { ImpostorToggle } from '@/components/setup/ImpostorToggle'
import { CategoryGrid } from '@/components/setup/CategoryGrid'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'
import { IMPOSTOR_MIN_PLAYERS } from '@/lib/constants'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative inline-flex items-center rounded-full transition-colors flex-shrink-0"
      style={{
        width: '44px', height: '24px',
        background: value ? '#16a34a' : 'rgba(128,128,128,0.4)',
      }}
      aria-checked={value}
      role="switch"
    >
      <span
        className="inline-block rounded-full bg-white transition-transform"
        style={{
          width: '18px', height: '18px',
          transform: value ? 'translateX(23px)' : 'translateX(3px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}

export default function SetupPage() {
  const { state, dispatch } = useGame()
  const { theme, toggle: toggleTheme } = useTheme()
  const router = useRouter()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const minPlayersNeeded = state.selectedCounts.length > 0 ? IMPOSTOR_MIN_PLAYERS[state.selectedCounts[0]] : 3
  const canStart = state.selectedCounts.length > 0
    && state.players.length >= minPlayersNeeded
    && (state.selectedCategory !== null || state.useRandomCategory)

  function handleStart() {
    dispatch({ type: 'START_GAME' })
    router.push('/reveal')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-title" style={{ color: 'var(--fg)' }}>Mission Setup</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>Configure your agents and domain</p>
        </div>
        <Link href="/" className="text-xl min-h-[36px] px-2 flex items-center transition-colors" style={{ color: 'var(--fg-muted)' }} aria-label="Back">←</Link>
      </header>

      <div className="flex flex-col gap-6 flex-1">
        <PlayerList />

        <div className="flex items-center justify-between">
          {state.players.length > 0 ? (
            <button
              onClick={() => dispatch({ type: 'CLEAR_PLAYERS' })}
              className="text-sm transition-colors hover:text-red-400"
              style={{ color: 'var(--fg-subtle)' }}
            >
              Reset players
            </button>
          ) : <span />}
          <button
            onClick={() => setShowAdvanced(true)}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--fg-subtle)' }}
          >
            ⚙ Advanced Settings
          </button>
        </div>

        <ImpostorToggle />
        <CategoryGrid />

        <div className="mt-auto pt-4 space-y-3">
          {state.selectedCounts.length === 0 && (
            <p className="text-center text-sm" style={{ color: 'var(--fg-muted)', opacity: 0.95 }}>
              Select at least one spy count above
            </p>
          )}
          {state.selectedCounts.length > 0 && state.players.length < minPlayersNeeded && (
            <p className="text-center text-sm" style={{ color: 'var(--fg-muted)', opacity: 0.95 }}>
              Need at least {minPlayersNeeded} agents for {state.selectedCounts[0]} spy{state.selectedCounts[0] > 1 ? 's' : ''}
            </p>
          )}
          <Button fullWidth size="lg" onClick={handleStart} disabled={!canStart}>
            Begin Assignment
          </Button>
        </div>
      </div>

      <Modal open={showAdvanced}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Advanced Settings</h2>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-xl leading-none p-1"
              style={{ color: 'var(--fg-subtle)' }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <SettingRow
              label="Spies know each other"
              description="Spies are told who their fellow spies are"
              value={state.settings.spiesKnowEachOther}
              onChange={v => dispatch({ type: 'UPDATE_SETTINGS', settings: { spiesKnowEachOther: v } })}
            />
            <SettingRow
              label="Spy votes count"
              description="Spies' votes affect the tally outcome"
              value={state.settings.spiesVoteCount}
              onChange={v => dispatch({ type: 'UPDATE_SETTINGS', settings: { spiesVoteCount: v } })}
            />
            <SettingRow
              label="Dark mode"
              description="Use dark theme"
              value={theme === 'dark'}
              onChange={() => toggleTheme()}
            />
          </div>

          <Button fullWidth onClick={() => setShowAdvanced(false)}>Done</Button>
        </div>
      </Modal>
    </div>
  )
}

function SettingRow({ label, description, value, onChange }: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-subtle)' }}>{description}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}
