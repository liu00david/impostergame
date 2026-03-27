'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { danger, dangerSubtle } from '@/lib/colors'

export function ExitButton() {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { dispatch } = useGame()
  const { theme, toggle: toggleTheme } = useTheme()
  const router = useRouter()

  function handleAbort() {
    router.replace('/setup')
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-full"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
        aria-label="Game menu"
      >
        <Menu size={16} />
      </button>

      {open && !confirming && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 200 }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Game Menu</h2>
            <button
              onClick={() => toggleTheme()}
              className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4"
              style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
            >{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
            <button
              onClick={() => setConfirming(true)}
              className="w-full py-3 rounded-xl text-sm font-bold text-left px-4"
              style={{ background: dangerSubtle, color: danger }}
            >Abort Mission</button>
            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'transparent', color: 'var(--fg-subtle)' }}
            >Cancel</button>
          </div>
        </div>
      )}

      {confirming && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 200 }}
          onClick={() => { setConfirming(false); setOpen(false) }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-lg font-bold">Abort Mission?</p>
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Your current mission will be lost.</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setConfirming(false); setOpen(false) }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
              >Cancel</button>
              <button
                onClick={handleAbort}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: dangerSubtle, color: danger }}
              >Abort</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
