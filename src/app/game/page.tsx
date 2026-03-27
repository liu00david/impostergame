'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { Button } from '@/components/ui/Button'
import { ExitButton } from '@/components/ui/ExitButton'
import { Speech } from 'lucide-react'
import { getPlayerForTurn } from '@/lib/turnOrder'
import { formatTime } from '@/lib/formatTime'
import { DomainLabel } from '@/components/ui/DomainLabel'
import { brand, brandDarkBorder } from '@/lib/colors'

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

  function handleEndRound() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    router.push('/debrief')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <DomainLabel category={state.selectedCategory} />
          <h1 className="text-2xl font-bold">Signal</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-mono font-bold" style={{ color: brand }}>
            {formatTime(state.elapsedSeconds)}
          </p>
          <ExitButton />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-2">
        <Speech size={52} color={brand} strokeWidth={1.5} />
        <p className="text-xl leading-relaxed font-medium" style={{ color: 'var(--fg)' }}>
          Go around in a circle. Each agent gives one signal, without revealing the codeword!
        </p>
        <div className="space-y-2 w-full">
          <p className="text-xl font-semibold" style={{ color: 'var(--fg-subtle)' }}>Starting with agent</p>
          <div className="rounded-3xl border px-6 py-4" style={{ background: 'var(--bg-card)', borderColor: brandDarkBorder }}>
            <p className="text-3xl font-bold">{firstPlayer?.name}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button fullWidth size="lg" onClick={handleEndRound}>
          Proceed to Debrief
        </Button>
      </div>
    </div>
  )
}
