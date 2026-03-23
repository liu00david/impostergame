'use client'

import { useTheme } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 z-40 w-9 h-9 flex items-center justify-center rounded-full border transition-colors"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        color: 'var(--fg)',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
