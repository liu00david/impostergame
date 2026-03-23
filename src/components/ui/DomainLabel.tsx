'use client'
export function DomainLabel({ category }: { category: string | null }) {
  if (!category) return null
  return (
    <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>
      Domain: <span className="font-bold" style={{ color: '#e8385a' }}>{category}</span>
    </p>
  )
}
