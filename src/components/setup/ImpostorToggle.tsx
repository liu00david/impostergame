'use client'

import { useGame } from '@/context/GameContext'

const OPTIONS: { count: 1 | 2 | 3; minPlayers: number }[] = [
  { count: 1, minPlayers: 3 },
  { count: 2, minPlayers: 5 },
  { count: 3, minPlayers: 7 },
]

export function ImpostorToggle() {
  const { state, dispatch } = useGame()

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
        Impostors
      </h2>
      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        {OPTIONS.map(({ count, minPlayers }) => {
          const isSelected = state.impostorCount === count
          const isDisabled = state.players.length < minPlayers
          return (
            <button
              key={count}
              onClick={() => !isDisabled && dispatch({ type: 'SET_IMPOSTOR_COUNT', count })}
              disabled={isDisabled}
              className="flex-1 py-3 text-base font-semibold transition-all min-h-[44px] flex flex-col items-center justify-center gap-0.5"
              style={isSelected
                ? { background: '#7c3aed', color: '#fff' }
                : isDisabled
                ? { color: 'var(--fg-subtle)', opacity: 0.4, cursor: 'not-allowed' }
                : { color: 'var(--fg-muted)', background: 'transparent' }
              }
            >
              <span>{count}</span>
              <span className="text-xs font-normal" style={{ color: isSelected ? '#ddd6fe' : 'var(--fg-subtle)' }}>
                {minPlayers}+ players
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
