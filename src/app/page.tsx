'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-12">
      <ThemeToggle />

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center gap-10">
        <div className="text-center">
          <div className="relative inline-block">
            <h1
              className="font-title"
              style={{
                fontSize: '4rem',
                fontWeight: 900,
                lineHeight: 1,
                color: 'rgba(196, 7, 38, 0.93)',
                textShadow: '0 1px 8px rgba(88, 88, 88, 0.25)',
                letterSpacing: '-0.03em',
              }}
            >
              Spyhunt
            </h1>
            {/* Spy hat over the "t" — positioned at ~82% across the title */}
            <img
              src="/icon.svg"
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: '70px',
                height: '50px',
                top: '-22px',
                right: '10%',
                pointerEvents: 'none',
              }}
            />
          </div>
          <p className="mt-3 text-base" style={{ color: 'var(--fg-muted)' }}>
            Intel is in. There&apos;s a spy among us.
          </p>
        </div>

        {/* Overview */}
        <div className="rounded-2xl border px-5 py-4 space-y-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>How it works</p>
          <div className="space-y-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
            <div className="flex gap-3">
              <span className="font-bold w-4 shrink-0" style={{ color: '#9b1c31' }}>1</span>
              <span><strong style={{ color: 'var(--fg)' }}>Assignment</strong> — Each agent secretly learns their role. Operatives see the codeword. Spies don&apos;t.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold w-4 shrink-0" style={{ color: '#9b1c31' }}>2</span>
              <span><strong style={{ color: 'var(--fg)' }}>Signal</strong> — Everyone gives one clue about the codeword. Spies bluff. Operatives prove themselves without giving too much away.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold w-4 shrink-0" style={{ color: '#9b1c31' }}>3</span>
              <span><strong style={{ color: 'var(--fg)' }}>Debrief</strong> — Time for discussion, whose signals seemed off? Debate. Deceive.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold w-4 shrink-0" style={{ color: '#9b1c31' }}>4</span>
              <span><strong style={{ color: 'var(--fg)' }}>Vote</strong> — Eliminate the spies. If any survive, the mission is sabotaged.</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link
            href="/setup"
            className="w-full flex items-center justify-center rounded-xl text-xl font-semibold min-h-[52px] transition-all active:scale-95"
            style={{ background: 'rgb(171, 27, 51)', color: '#fff' }}
          >
            Pass & Play
          </Link>
          <Link
            href="/room"
            className="w-full flex items-center justify-center rounded-xl text-xl font-semibold min-h-[52px] transition-all active:scale-95 border"
            style={{ background: 'var(--bg-card)', borderColor: 'rgba(209,32,76,0.4)', color: 'rgb(209,32,76)' }}
          >
            Online Play (local only - in development)
          </Link>
          <Link
            href="/rules"
            className="w-full flex items-center justify-center rounded-xl text-base font-medium min-h-[48px] border transition-all active:scale-95"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            Full Rules
          </Link>
        </div>

        {/* Credits */}
        <p className="text-center text-xs" style={{ color: 'var(--fg-subtle)' }}>
          A pass-and-play party game for 3–12 agents
        </p>
      </div>
    </div>
  )
}
