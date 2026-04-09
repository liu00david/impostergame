'use client'

import { useState } from 'react'
import Link from 'next/link'
import { brand, outcomeWinBgLight, outcomeWinBorder, outcomeLossBgLight, outcomeLossBorderLight } from '@/lib/colors'

type Tab = 'passplay' | 'online'

export default function RulesPage() {
  const [tab, setTab] = useState<Tab>('passplay')

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">How to Play</h1>
        <Link href="/" className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>← Back</Link>
      </header>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
        {(['passplay', 'online'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-sm font-semibold transition-colors"
            style={tab === t
              ? { background: brand, color: '#fff' }
              : { background: 'transparent', color: 'var(--fg-muted)' }}
          >
            {t === 'passplay' ? 'Pass & Play' : 'Online'}
          </button>
        ))}
      </div>

      {tab === 'passplay' ? <PassPlayRules /> : <OnlineRules />}
    </div>
  )
}

function PassPlayRules() {
  return (
    <div className="space-y-4">
      <Section title="Overview">
        <p>Everyone shares one device. One or more <strong>Spies</strong> have infiltrated the team — they know the domain but not the codeword. <strong>Operatives</strong> know both. Everyone gives a signal; then the team votes to root out the spies.</p>
      </Section>

      <Section title="1 · Setup">
        <ul>
          <li>Add all agent names (3–12 players).</li>
          <li>Choose spy count (1, 2, or 3) and pick a domain.</li>
          <li>Tap <strong>Begin Assignment</strong>.</li>
        </ul>
      </Section>

      <Section title="2 · Assignment">
        <ul>
          <li>Pass the phone to each agent privately, one at a time.</li>
          <li><strong>Operatives</strong> see the domain and the secret codeword.</li>
          <li><strong>Spies</strong> see the domain only — no codeword.</li>
          <li>Tap <strong>Understood</strong>, then pass to the next agent.</li>
        </ul>
      </Section>

      <Section title="3 · Signal / Interrogation">
        <p>Choose a mode in Advanced Settings. Both end with <strong>Proceed to Debrief</strong>.</p>
        <p><strong>Signal</strong> — Starting with the named agent, go around the circle. Each agent gives <strong>one word or short phrase</strong> hinting at the codeword. Don&apos;t say the codeword directly — spies bluff based on what they hear.</p>
        <p><strong>Interrogation</strong> — A randomized list of pairs is shown. Each agent asks their assigned partner one question relating to the domain. Spies must answer convincingly without knowing the codeword.</p>
      </Section>

      <Section title="4 · Debrief">
        <ul>
          <li>Discuss the signals openly as a group.</li>
          <li>Who sounded off? Too vague? Too confident?</li>
          <li>Tap <strong>Proceed to Voting</strong> when ready.</li>
        </ul>
      </Section>

      <Section title="5 · Voting">
        <ul>
          <li>Pass the phone to each agent privately to cast their vote.</li>
          <li>Vote for up to as many suspects as there are spies, or abstain.</li>
          <li>After all agents vote, results are revealed.</li>
        </ul>
      </Section>

      <Section title="6 · Outcome">
        <div className="flex gap-2 mt-1">
          <div className="flex-1 rounded-xl p-3 space-y-1" style={{ background: outcomeWinBgLight, border: `2px solid ${outcomeWinBorder}` }}>
            <p className="font-bold text-sm" style={{ color: '#166534' }}>Spies Caught!</p>
            <p>Operatives win — unless the spies can correctly guess the codeword out loud to steal the win.</p>
          </div>
          <div className="flex-1 rounded-xl p-3 space-y-1" style={{ background: outcomeLossBgLight, border: `2px solid ${outcomeLossBorderLight}` }}>
            <p className="font-bold text-sm" style={{ color: '#9f1239' }}>Mission Sabotaged!</p>
            <p>Spies win — any spy tied or received fewer votes than an operative.</p>
          </div>
        </div>
      </Section>

      <Section title="Tips">
        <ul>
          <li>Spies: let early signals guide you, then give something plausible but noncommittal.</li>
          <li>Operatives: don&apos;t be too specific — if spies learn the codeword, they win the final guess.</li>
        </ul>
      </Section>
    </div>
  )
}

function OnlineRules() {
  return (
    <div className="space-y-4">
      <Section title="Overview">
        <p>Every player uses their own device. <strong>Voice communication is required</strong> — use a call, voice chat, or be in the same room. The host controls game flow; all other rules are the same.</p>
      </Section>

      <Section title="1 · Setup">
        <ul>
          <li>One player creates a room and shares the <strong>4-letter code</strong> with everyone.</li>
          <li>Each player joins on their own device using that code.</li>
          <li>The host chooses spy count and domain, then taps <strong>Begin Mission</strong>.</li>
        </ul>
      </Section>

      <Section title="2 · Assignment">
        <ul>
          <li>Each player sees their own role privately on their device — no passing needed.</li>
          <li><strong>Operatives</strong> see the domain and secret codeword.</li>
          <li><strong>Spies</strong> see the domain only.</li>
          <li>Tap <strong>Understood</strong> when ready. The host can force-start if needed.</li>
        </ul>
      </Section>

      <Section title="3 · Signal / Interrogation">
        <p>The host chooses a mode in Advanced Settings. Both are done verbally — over call or in person.</p>
        <p><strong>Signal</strong> — Starting with the named agent, each player gives <strong>one signal</strong> out loud hinting at the codeword. Spies bluff based on what they hear.</p>
        <p><strong>Interrogation</strong> — A randomized list of pairs is shown on everyone&apos;s screen. Each agent asks their assigned partner one question relating to the domain. Spies must answer convincingly without knowing the codeword.</p>
      </Section>

      <Section title="4 · Debrief">
        <ul>
          <li>Discuss verbally. Who sounded suspicious?</li>
          <li>The host taps <strong>Proceed to Voting</strong> when the group is ready.</li>
        </ul>
      </Section>

      <Section title="5 · Voting">
        <ul>
          <li>Each player votes privately on their own device.</li>
          <li>Vote for up to as many suspects as there are spies, or abstain.</li>
          <li>Results are shown once everyone has voted (or the host forces results).</li>
        </ul>
      </Section>

      <Section title="6 · Outcome">
        <div className="flex gap-2 mt-1">
          <div className="flex-1 rounded-xl p-3 space-y-1" style={{ background: outcomeWinBgLight, border: `2px solid ${outcomeWinBorder}` }}>
            <p className="font-bold text-sm" style={{ color: '#166534' }}>Spies Caught!</p>
            <p>Operatives win — unless the spies can correctly guess the codeword out loud to steal the win.</p>
          </div>
          <div className="flex-1 rounded-xl p-3 space-y-1" style={{ background: outcomeLossBgLight, border: `2px solid ${outcomeLossBorderLight}` }}>
            <p className="font-bold text-sm" style={{ color: '#9f1239' }}>Mission Sabotaged!</p>
            <p>Spies win — any spy tied or received fewer votes than an operative.</p>
          </div>
        </div>
      </Section>

      <Section title="Tips">
        <ul>
          <li>Make sure everyone is on a call before starting — the game is entirely verbal during signal and debrief.</li>
          <li>Spies: blend in. Operatives: don&apos;t be too specific with your signal.</li>
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border px-5 py-4 space-y-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <h2 className="text-base font-bold" style={{ color: brand }}>{title}</h2>
      <div className="text-sm leading-relaxed space-y-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1" style={{ color: 'var(--fg-muted)' }}>
        {children}
      </div>
    </div>
  )
}
