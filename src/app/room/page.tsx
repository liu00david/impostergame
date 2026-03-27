'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { brand, brandBorder, danger, dangerSubtle, dangerBorder } from '@/lib/colors'

const LS_NAME_KEY = 'spyhunt_name'
const LS_ROOM_KEY = 'spyhunt_room'

function randomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function RoomEntryInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wasKicked = searchParams.get('kicked') === '1'
  const [joinCode, setJoinCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleJoin() {
    if (!name.trim()) { setError('Enter your agent name first'); return }
    const code = joinCode.trim().toUpperCase().replace(/[^A-Z]/g, '')
    if (code.length < 4) { setError('Enter a valid room code'); return }
    localStorage.setItem(LS_NAME_KEY, name.trim())
    localStorage.setItem(LS_ROOM_KEY, code)
    router.push(`/room/${code}`)
  }

  function handleCreate() {
    if (!name.trim()) { setError('Enter your agent name first'); return }
    const code = randomCode()
    localStorage.setItem(LS_NAME_KEY, name.trim())
    localStorage.setItem(LS_ROOM_KEY, code)
    router.push(`/room/${code}`)
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-6 flex items-center">
        <Link href="/" className="text-xl px-2" style={{ color: 'var(--fg-muted)' }}>←</Link>
      </header>

      {wasKicked && (
        <div className="mb-6 rounded-xl border px-4 py-3" style={{ background: dangerSubtle, borderColor: dangerBorder }}>
          <p className="text-sm font-semibold" style={{ color: danger }}>You were removed from the game.</p>
        </div>
      )}

      <div className="flex flex-col gap-8" style={{ marginTop: '8vh' }}>
        <div>
          <h1 className="text-3xl font-bold font-title mb-1" style={{ color: 'var(--fg)' }}>Online Play</h1>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Each player uses their own device</p>
        </div>

        {/* Agent name — shared by both actions */}
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="Agent name"
            maxLength={20}
            autoFocus
            className="w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }}
          />
        </div>

        {/* Join — primary action */}
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
            Room code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="e.g. ABCD"
              maxLength={6}
              className="flex-1 rounded-xl border px-4 py-3 text-base font-mono uppercase outline-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }}
            />
            <Button size="lg" onClick={handleJoin}>Join</Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 -mt-4">{error}</p>}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Create — secondary action */}
        <button
          onClick={handleCreate}
          className="w-full rounded-xl border px-4 py-3 text-base font-semibold transition-all active:scale-95"
          style={{ background: 'var(--bg-card)', borderColor: brandBorder, color: brand }}
        >
          Create New Room
        </button>
      </div>
    </div>
  )
}

export default function RoomEntryPage() {
  return (
    <Suspense>
      <RoomEntryInner />
    </Suspense>
  )
}
