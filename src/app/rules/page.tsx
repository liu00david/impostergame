import Link from 'next/link'

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">How to Play</h1>
        <Link
          href="/"
          className="text-sm font-medium transition-colors"
          style={{ color: 'var(--fg-muted)' }}
        >
          ← Back
        </Link>
      </header>

      <div className="space-y-6 flex-1">

        <Section title="The Mission">
          <p>A covert operation has been compromised. One or more <strong>Spies</strong> have infiltrated the team — and they don&apos;t know the codeword. The <strong>Operatives</strong> do. All agents must give a signal; operatives prove their loyalty while spies bluff. A vote is held to eliminate the spies. If any spy survives, the mission is sabotaged.</p>
        </Section>

        <Section title="1 · Setup">
          <ul>
            <li>Add all agent names (3–12 agents).</li>
            <li>Choose how many spies (1, 2, or 3).</li>
            <li>Pick a domain or tap <strong>Random</strong>.</li>
            <li>Tap <strong>Start Mission</strong>.</li>
          </ul>
        </Section>

        <Section title="2 · Assignment">
          <ul>
            <li>Pass the phone around. Each agent taps their name <em>privately</em>.</li>
            <li><strong>Operatives</strong> receive the secret codeword.</li>
            <li><strong>Spies</strong> only see the domain — the codeword is classified.</li>
            <li>Tap <strong>Understood</strong> and pass to the next agent.</li>
          </ul>
        </Section>

        <Section title="3 · Signal">
          <ul>
            <li>Starting with the named agent, go around in a circle.</li>
            <li>Each agent gives <strong>one signal</strong> — a word or short phrase that hints at the codeword.</li>
            <li>Don&apos;t say the codeword directly. Spies will listen carefully and fake their signal.</li>
            <li>When everyone has given a signal, tap <strong>Signals complete</strong>.</li>
          </ul>
        </Section>

        <Section title="4 · Debrief">
          <ul>
            <li>Discuss the signals openly as a group.</li>
            <li>Who sounded off? Who was suspiciously vague — or oddly too confident?</li>
            <li>When the team is ready, tap <strong>Proceed to Voting</strong>.</li>
          </ul>
        </Section>

        <Section title="5 · Voting">
          <ul>
            <li>Each agent taps their name and privately votes on who they believe is a spy.</li>
            <li>You can flag up to as many suspects as there are spies, or abstain.</li>
            <li>After all agents have voted, tap <strong>See Verdict</strong>.</li>
          </ul>
        </Section>

        <Section title="6 · Outcome">
          <ul>
            <li><strong>Spies Identified</strong> — operatives win if every spy received strictly more votes than any operative. Ties don&apos;t count.</li>
            <li><strong>Sabotaged</strong> — spies win if any spy tied with or received fewer votes than any operative.</li>
            <li>If caught, spies get one final chance: <strong>guess the codeword</strong> out loud to steal the win.</li>
          </ul>
        </Section>

        <Section title="Tips">
          <ul>
            <li>Spies: let the early signals guide you, then give something plausible but noncommittal.</li>
            <li>Operatives: don&apos;t make signals too specific or the spy will learn the codeword and win the final guess.</li>
          </ul>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border px-5 py-4 space-y-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <h2 className="text-base font-bold text-rose-800">{title}</h2>
      <div className="text-sm leading-relaxed space-y-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1" style={{ color: 'var(--fg-muted)' }}>
        {children}
      </div>
    </div>
  )
}
