'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { Button } from '@/components/ui/Button'
import { ExitButton } from '@/components/ui/ExitButton'

export default function DebriefPage() {
  const { state } = useGame()
  const router = useRouter()
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.players.length === 0) router.replace('/')
  }, [state.players.length, router])

  useEffect(() => {
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  if (state.players.length === 0) return null

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  function handleProceed() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    router.push('/vote')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>
            Domain: <span className="text-rose-800">{state.selectedCategory}</span>
          </p>
          <h1 className="text-2xl font-bold">Debrief</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-mono font-bold text-rose-800">
            {formatTime(seconds)}
          </p>
          <ExitButton />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-2">
        <div className="space-y-3">
          <p className="text-3xl font-bold" style={{ color: 'var(--fg)' }}>Time to debrief.</p>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Discuss the signals. Who seemed off? Who sounded too vague — or too confident?
          </p>
          <p className="text-lg" style={{ color: 'var(--fg-subtle)' }}>
            When you&apos;re ready, proceed to the vote.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Button fullWidth size="lg" onClick={handleProceed}>
          Proceed to Voting
        </Button>
      </div>
    </div>
  )
}
