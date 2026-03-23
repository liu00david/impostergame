'use client'

import { useGame } from '@/context/GameContext'
import { Category } from '@/types/game'

const CATEGORIES: Category[] = [
  'Food', 'Movies', 'Animals', 'Travel', 'Sports', 'Music', 'Nature', 'Tech',
]

export function CategoryGrid() {
  const { state, dispatch } = useGame()

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
        Category
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map(name => {
          const isSelected = state.selectedCategory === name
          return (
            <button
              key={name}
              onClick={() => dispatch({ type: 'SET_CATEGORY', category: name })}
              className="rounded-xl border px-4 py-2 text-center transition-all min-h-[36px]"
              style={isSelected ? {
                borderColor: '#7c3aed',
                background: 'rgba(124,58,237,0.15)',
                color: 'var(--fg)',
                fontWeight: 700,
              } : {
                borderColor: 'var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--fg-muted)',
                fontWeight: 400,
              }}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
