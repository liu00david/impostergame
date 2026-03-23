'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import { Modal } from './Modal'
import { Button } from './Button'

export function ExitButton() {
  const [confirming, setConfirming] = useState(false)
  const { dispatch } = useGame()
  const router = useRouter()

  function handleConfirm() {
    router.replace('/setup')
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="text-xl font-medium transition-colors min-h-[36px] px-2"
        style={{ color: 'var(--fg-muted)' }}
        aria-label="Restart"
      >
        ↺
      </button>

      <Modal open={confirming}>
        <div className="text-center space-y-4">
          <p className="text-lg font-bold">Abort Mission?</p>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Your current mission will be lost.</p>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleConfirm}>
              Abort
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
