'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useGame } from '@/context/GameContext'
import { useTheme } from '@/context/ThemeContext'
import { danger, dangerLight, dangerSubtle } from '@/lib/colors'

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
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>Game Menu</h2>
            <button
              onClick={() => toggleTheme()}
              className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-2"
              style={{ background: 'var(--bg-elevated)', color: theme === 'dark' ? '#ffffff' : 'var(--fg-muted)' }}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="w-full py-3 rounded-xl text-sm font-bold text-left px-4"
              style={{ background: dangerSubtle, color: theme === 'dark' ? '#ffffff' : danger }}
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
                style={{ background: dangerSubtle, color: theme === 'dark' ? '#ffffff' : danger }}
              >Abort</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
