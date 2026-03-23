'use client'

import React, { useState } from 'react'
import { useGame } from '@/context/GameContext'
import { Button } from '@/components/ui/Button'

export function PlayerList() {
  const { state, dispatch } = useGame()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const errorTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function showError(msg: string) {
    setError(msg)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setError(''), 2000)
  }

  function handleAdd() {
    const name = input.trim()
    if (!name) return
    if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      showError('Name is taken!')
      return
    }
    if (state.players.length >= 12) {
      showError('Maximum 12 players')
      return
    }
    dispatch({ type: 'ADD_PLAYER', name })
    setInput('')
    setError('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
        Players ({state.players.length}/12)
      </h2>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border px-4 py-3 focus:outline-none focus:border-rose-800 transition-colors"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }}
          placeholder="Enter player name"
          value={input}
          onChange={e => { setInput(e.target.value); if (errorTimer.current) clearTimeout(errorTimer.current); setError('') }}
          onKeyDown={handleKeyDown}
          maxLength={20}
        />
        <Button
          onClick={handleAdd}
          disabled={!input.trim() || state.players.length >= 12}
          className="px-5"
        >
          Add
        </Button>
      </div>
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-2 text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}
      <ul className="space-y-2">
        {[...state.players].sort((a, b) => a.order - b.order).map((player, i) => (
          <li
            key={player.id}
            className="flex items-center justify-between rounded-xl border px-4 py-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <span className="text-lg" style={{ color: 'var(--fg)' }}>
              <span className="mr-2 text-base" style={{ color: 'var(--fg-subtle)' }}>{i + 1}.</span>
              {player.name}
            </span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: player.id })}
              className="hover:text-red-400 transition-colors p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
              style={{ color: 'var(--fg-subtle)' }}
              aria-label={`Remove ${player.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
