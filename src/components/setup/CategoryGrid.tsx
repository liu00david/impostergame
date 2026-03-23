'use client'

import { useState } from 'react'
import { useGame } from '@/context/GameContext'
import { Category } from '@/types/game'

const CATEGORIES: Category[] = [
  'Food', 'Movies', 'Animals', 'Travel', 'Sports', 'Music',
  'Nature', 'Tech', 'TV Shows', 'Celebrities', 'Brands', 'Holidays',
]

export function CategoryGrid() {
  const { state, dispatch } = useGame()
  const [randomSelected, setRandomSelected] = useState(false)

  function handleSelect(category: Category) {
    setRandomSelected(false)
    dispatch({ type: 'SET_CATEGORY', category })
  }

  function handleRandom() {
    const pick = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    dispatch({ type: 'SET_CATEGORY', category: pick })
    setRandomSelected(true)
  }

  const selectedStyle = {
    borderColor: '#7c3aed',
    background: 'rgba(124,58,237,0.15)',
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
        Category
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map(name => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            className="rounded-xl border px-4 py-2 text-center transition-all min-h-[36px]"
            style={!randomSelected && state.selectedCategory === name ? selectedStyle : defaultStyle}
          >
            {name}
          </button>
        ))}
        <button
          onClick={handleRandom}
          className="col-span-2 rounded-xl border px-4 py-2 text-center transition-all min-h-[36px]"
          style={randomSelected ? selectedStyle : defaultStyle}
        >
          Random
        </button>
      </div>
    </div>
  )
}
