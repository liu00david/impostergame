'use client'

import { useGame } from '@/context/GameContext'
import { Category } from '@/types/game'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/gameLogic'

export function CategoryGrid() {
  const { state, dispatch } = useGame()

  function handleSelect(category: Category) {
    dispatch({ type: 'SET_CATEGORY', category })
  }

  function handleRandom() {
    dispatch({ type: 'SET_RANDOM_CATEGORY' })
  }

  const selectedStyle = {
    borderColor: '#9b1c31',
    background: 'rgba(155,28,49,0.15)',
    color: 'var(--fg)',
    fontWeight: 700,
  }
  const defaultStyle = {
    borderColor: 'var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--fg-muted)',
    fontWeight: 400,
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
        Domain
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map(name => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            className="rounded-xl border px-4 py-2 text-center transition-all min-h-[36px]"
            style={!state.useRandomCategory && state.selectedCategory === name ? selectedStyle : defaultStyle}
          >
            {CATEGORY_LABELS[name]}
          </button>
        ))}
        <button
          onClick={handleRandom}
          className="col-span-2 rounded-xl border px-4 py-2 text-center transition-all min-h-[36px]"
          style={state.useRandomCategory ? selectedStyle : defaultStyle}
        >
          Random
        </button>
      </div>
    </div>
  )
}
