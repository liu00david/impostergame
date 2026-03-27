'use client'

import { useGame } from '@/context/GameContext'
import { IMPOSTOR_MIN_PLAYERS } from '@/lib/constants'
import { brand, brandDark, brandPink } from '@/lib/colors'

const OPTIONS: { count: 1 | 2 | 3; minPlayers: number }[] = [
  { count: 1, minPlayers: 3 },
  { count: 2, minPlayers: 5 },
  { count: 3, minPlayers: 7 },
]

export function ImpostorToggle() {
  const { state, dispatch } = useGame()
  const isRandom = state.selectedCounts.length > 1

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
        Spies{isRandom && <span className="ml-2 text-xs font-normal" style={{ color: brand }}>random</span>}
      </h2>
      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        {OPTIONS.map(({ count, minPlayers }) => {
          const isSelected = state.selectedCounts.includes(count)
          const isDisabled = state.players.length < IMPOSTOR_MIN_PLAYERS[count]
          return (
            <button
              key={count}
              onClick={() => !isDisabled && dispatch({ type: 'TOGGLE_SPY_COUNT', count })}
              disabled={isDisabled}
              className="flex-1 py-3 text-base font-semibold transition-all min-h-[44px] flex flex-col items-center justify-center gap-0.5"
              style={isSelected && !isDisabled
                ? { background: brandDark, color: '#fff' }
                : isDisabled
                ? { color: 'var(--fg-subtle)', opacity: 0.4, cursor: 'not-allowed' }
                : { color: 'var(--fg-muted)', background: 'transparent' }
              }
            >
              <span>{count}</span>
              <span className="text-sm font-normal" style={{ color: isSelected && !isDisabled ? brandPink : 'var(--fg-subtle)', opacity: isDisabled ? undefined : 0.95 }}>
                {minPlayers}+ players
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
