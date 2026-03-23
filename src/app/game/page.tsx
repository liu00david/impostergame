'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { Button } from '@/components/ui/Button'
import { ExitButton } from '@/components/ui/ExitButton'
import { getPlayerForTurn } from '@/lib/turnOrder'

export default function GamePage() {
  const { state, dispatch } = useGame()
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.players.length === 0) router.replace('/')
  }, [state.players.length, router])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [dispatch])

  if (state.players.length === 0) return null

  const firstPlayerIndex = getPlayerForTurn(0, state.startingPlayerIndex, state.players.length)
  const firstPlayer = state.players[firstPlayerIndex]

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function handleEndRound() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    router.push('/debrief')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>
            Domain: <span className="text-rose-800">{state.selectedCategory}</span>
          </p>
          <h1 className="text-2xl font-bold">Signal</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-mono font-bold text-rose-800">
            {formatTime(state.elapsedSeconds)}
          </p>
          <ExitButton />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-2">
        <p className="text-lg leading-relaxed font-medium" style={{ color: 'var(--fg)' }}>
          Go around in a circle. Each operative gives one signal — without revealing the codeword!
        </p>
        <div className="space-y-2 w-full">
          <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>Starting with</p>
          <div className="rounded-2xl border px-8 py-6 w-full" style={{ background: 'var(--bg-card)', borderColor: 'rgba(155,28,49,0.4)' }}>
            <p className="text-5xl font-bold">{firstPlayer?.name}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button fullWidth size="lg" onClick={handleEndRound}>
          Signals complete — Debrief
        </Button>
      </div>
    </div>
  )
}
