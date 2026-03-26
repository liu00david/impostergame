'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const LS_NAME_KEY = 'spyhunt_name'
const LS_ROOM_KEY = 'spyhunt_room'

function randomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

export default function RoomEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wasKicked = searchParams.get('kicked') === '1'
  const [joinCode, setJoinCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleCreate() {
    if (!name.trim()) { setError('Enter your name first'); return }
    const code = randomCode()
    localStorage.setItem(LS_NAME_KEY, name.trim())
    localStorage.setItem(LS_ROOM_KEY, code)
    router.push(`/room/${code}`)
  }

  function handleJoin() {
    if (!name.trim()) { setError('Enter your name first'); return }
    const code = joinCode.trim().toUpperCase()
    if (code.length < 4) { setError('Enter a valid room code'); return }
    localStorage.setItem(LS_NAME_KEY, name.trim())
    localStorage.setItem(LS_ROOM_KEY, code)
    router.push(`/room/${code}`)
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="text-xl px-2" style={{ color: 'var(--fg-muted)' }}>←</Link>
      </header>

      {wasKicked && (
        <div className="mb-6 rounded-xl border px-4 py-3" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)' }}>
          <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>You were removed from the game.</p>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center gap-8">
        <div>
          <h1 className="text-3xl font-bold font-title mb-1" style={{ color: 'var(--fg)' }}>Online Play</h1>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Each player uses their own device</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Agent name"
            maxLength={20}
            className="w-full rounded-xl border px-4 py-3 text-base outline-none"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="space-y-3">
          <Button fullWidth size="lg" onClick={handleCreate}>
            Create Room
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>or join existing</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError('') }}
              placeholder="Room code"
              maxLength={6}
              className="flex-1 rounded-xl border px-4 py-3 text-base font-mono uppercase outline-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }}
            />
            <Button size="lg" onClick={handleJoin}>Join</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
