'use client'

import React, { useEffect } from 'react'

interface ModalProps {
  open: boolean
  children: React.ReactNode
}

export function Modal({ open, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }}
      >
        {children}
      </div>
    </div>
  )
}
