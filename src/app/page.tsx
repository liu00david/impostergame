'use client'

import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { PlayerList } from '@/components/setup/PlayerList'
import { ImpostorToggle } from '@/components/setup/ImpostorToggle'
import { CategoryGrid } from '@/components/setup/CategoryGrid'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function SetupPage() {
  const { state, dispatch } = useGame()
  const router = useRouter()

  const minPlayers = state.impostorCount === 3 ? 7 : state.impostorCount === 2 ? 5 : 3
  const canStart = state.players.length >= minPlayers && state.selectedCategory !== null

  function handleStart() {
    dispatch({ type: 'START_GAME' })
    router.push('/reveal')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
      <ThemeToggle />
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-violet-500">SusOut</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>Word deduction party game</p>
      </header>

      <div className="flex flex-col gap-6 flex-1">
        <PlayerList />

        {state.players.length > 0 && (
          <button
            onClick={() => dispatch({ type: 'CLEAR_PLAYERS' })}
            className="text-sm transition-colors self-start hover:text-red-400"
            style={{ color: 'var(--fg-subtle)' }}
          >
            Reset players
          </button>
        )}

        <ImpostorToggle />
        <CategoryGrid />

        <div className="mt-auto pt-4">
          {state.players.length < minPlayers && (
            <p className="text-center text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>
              Need at least {minPlayers} players for {state.impostorCount} impostor{state.impostorCount > 1 ? 's' : ''}
            </p>
          )}
          <Button fullWidth size="lg" onClick={handleStart} disabled={!canStart}>
            Start Game
          </Button>
        </div>
      </div>
    </div>
  )
}
