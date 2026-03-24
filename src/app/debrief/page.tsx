'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { Button } from '@/components/ui/Button'
import { ExitButton } from '@/components/ui/ExitButton'
import { formatTime } from '@/lib/formatTime'
import { DomainLabel } from '@/components/ui/DomainLabel'

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

  function handleProceed() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    router.push('/vote')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <DomainLabel category={state.selectedCategory} />
          <h1 className="text-2xl font-bold">Debrief</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-mono font-bold text-rose-800">
            {formatTime(seconds)}
          </p>
          <ExitButton />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-2" style={{ marginBottom: '10px' }}>
        <div className="space-y-3">
          <p className="text-xl" style={{ color: 'var(--fg)' }}>Discuss among each other</p>
          <p className="text-xl leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Was anyone suspicious? 
          </p>
          <p className="text-xl font-bold" style={{ color: 'var(--fg-subtle)' }}>
            When ready, proceed to voting.
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
