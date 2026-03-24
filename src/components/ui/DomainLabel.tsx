'use client'
import { CATEGORY_LABELS } from '@/lib/gameLogic'
import { Category } from '@/types/game'

export function DomainLabel({ category }: { category: string | null }) {
  if (!category) return null
  const label = CATEGORY_LABELS[category as Category] ?? category
  return (
    <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>
      Domain: <span className="font-bold" style={{ color: '#e8385a' }}>{label}</span>
    </p>
  )
}
