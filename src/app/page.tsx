'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'
import { brand, brandBorder, brandDark } from '@/lib/colors'

export default function LandingPage() {
  const { theme } = useTheme()
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-12">
<ThemeToggle />

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center gap-10">
        <div className="text-center" style={{ marginTop: '24px' }}>
          <div className="relative inline-block">
            <h1
              className="font-title"
              style={{
                fontSize: '4rem',
                fontWeight: 900,
                lineHeight: 1,
                color: brand,
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
        <div className="rounded-2xl border px-5 py-4 space-y-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', marginTop: '-12px' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>How it works</p>
          <div className="space-y-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
            <div className="flex gap-3">
              <span className="font-bold w-4 shrink-0" style={{ color: brandDark }}>1</span>
              <span><strong style={{ color: 'var(--fg)' }}>Assignment</strong>: Each agent secretly learns their role. Spies don&apos;t have the codeword.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold w-4 shrink-0" style={{ color: brandDark }}>2</span>
              <span><strong style={{ color: 'var(--fg)' }}>Signal</strong>: Everyone gives one clue. Operatives hint carefully. Spies bluff.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold w-4 shrink-0" style={{ color: brandDark }}>3</span>
              <span><strong style={{ color: 'var(--fg)' }}>Debrief</strong>: Discuss the signals openly. Who sounded suspicious? Debate.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold w-4 shrink-0" style={{ color: brandDark }}>4</span>
              <span><strong style={{ color: 'var(--fg)' }}>Vote</strong>: Cast your ballot. If any spy survives, the mission is lost.</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-0">
          <div className="relative flex items-center" style={{ marginTop: '-10px' }}>
            {/* Left lens — Pass & Play */}
            <Link
              href="/setup"
              className="flex flex-col items-center justify-center gap-2 font-semibold transition-all active:scale-95 aspect-square"
              style={{
                width: '44%',
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255, 251, 0, 0.2) 0%, rgba(255, 255, 255, 0.1) 20%, rgba(17, 17, 17, 0.2) 30%)'
                  : 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.15) 15%, rgba(233, 233, 233, 0.15) 30%)',
                border: `8px solid ${brand}`,
                color: theme === 'dark' ? '#fff' : '#111',
                borderRadius: '50%',
              }}
            >
              <div className="flex flex-col items-center gap-2" style={{ transform: 'translateY(-5px)' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="2" width="14" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
                  <line x1="9" y1="19" x2="15" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span className="text-base min-[400px]:text-lg" style={{ marginTop: '-5px' }}>Pass &amp; Play</span>
              </div>
            </Link>
            {/* Bridge — arched SVG */}
            <div className="flex-1 flex items-center justify-center" style={{ marginTop: '-30px' }}>
              <svg width="100%" height="28" viewBox="0 0 48 28" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 24 Q24 2 48 24" stroke={brand} strokeWidth="7" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            {/* Right lens — Online Play */}
            <Link
              href="/room"
              className="flex flex-col items-center justify-center gap-2 font-semibold transition-all active:scale-95 aspect-square"
              style={{
                width: '44%',
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255, 251, 0, 0.2) 0%, rgba(255, 255, 255, 0.1) 20%, rgba(17, 17, 17, 0.2) 30%)'
                  : 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.15) 15%, rgba(233, 233, 233, 0.15) 30%)',
                border: `8px solid ${brand}`,
                color: theme === 'dark' ? '#fff' : '#111',
                borderRadius: '50%',
              }}
            >
              <div className="flex flex-col items-center gap-2" style={{ transform: 'translateY(-5px)' }}>
                <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.8"/>
                  <ellipse cx="16" cy="16" rx="5" ry="11" stroke="currentColor" strokeWidth="1.8"/>
                  <line x1="5" y1="16" x2="27" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M7 10h18M7 22h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span className="text-base min-[400px]:text-lg" style={{ marginTop: '-5px' }}>Online Play</span>
              </div>
            </Link>
          </div>
          <Link
            href="/rules"
            className="w-full flex items-center justify-center rounded-xl text-base font-medium min-h-[48px] border transition-all active:scale-95 mt-6"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          >
            Full Rules
          </Link>
        </div>

        {/* Credits */}
        <p className="text-center text-xs" style={{ color: 'var(--fg-subtle)', marginTop: '-16px' }}>
          A pass-and-play party game for 3–12 agents
        </p>
      </div>
    </div>
  )
}
