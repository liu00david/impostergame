import Link from 'next/link'

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
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

        <Section title="The Goal">
          <p>One or more players are <strong>impostors</strong> — they don't know the secret word. Everyone else does. Civilians give clues to prove they know the word. Impostors try to blend in.</p>
        </Section>

        <Section title="1 · Setup">
          <ul>
            <li>Add all player names (3–12 players).</li>
            <li>Choose how many impostors (1, 2, or 3).</li>
            <li>Pick a category or tap <strong>Random</strong>.</li>
            <li>Tap <strong>Start Game</strong>.</li>
          </ul>
        </Section>

        <Section title="2 · Role Reveal">
          <ul>
            <li>Pass the phone around. Each player taps their name <em>privately</em>.</li>
            <li><strong>Civilians</strong> see the secret word.</li>
            <li><strong>Impostors</strong> only see the category — not the word.</li>
            <li>Tap <strong>Got it!</strong> and pass to the next person.</li>
          </ul>
        </Section>

        <Section title="3 · Give Clues">
          <ul>
            <li>Starting with the named player, go around in a circle.</li>
            <li>Each player says <strong>one word or short phrase</strong> as a clue about the secret word.</li>
            <li>Don't say the word itself! Impostors will try to fake a convincing clue.</li>
            <li>When everyone has gone, tap <strong>Complete, go to Voting</strong>.</li>
          </ul>
        </Section>

        <Section title="4 · Vote">
          <ul>
            <li>Each player taps their name and privately selects who they think the impostor(s) are.</li>
            <li>You can vote for up to as many suspects as there are impostors, or skip entirely.</li>
            <li>After everyone votes, tap <strong>See Results</strong>.</li>
          </ul>
        </Section>

        <Section title="5 · Results">
          <ul>
            <li>The player(s) with the most votes are revealed.</li>
            <li><strong>Civilians win</strong> if every impostor received strictly more votes than any civilian — no ties.</li>
            <li><strong>Impostors win</strong> if any impostor tied with or received fewer votes than a civilian.</li>
            <li>If impostors are caught, they get one last chance: <strong>guess the secret word</strong> out loud to steal the win.</li>
          </ul>
        </Section>

        <Section title="Tips">
          <ul>
            <li>Impostors: listen carefully to the first few clues before yours — then mirror the vibe.</li>
            <li>Civilians: don't make clues too obvious or the impostor learns the word and wins the guess.</li>
            <li>Watch for clues that are <em>too vague</em> — that's a tell.</li>
          </ul>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border px-5 py-4 space-y-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <h2 className="text-base font-bold text-violet-500">{title}</h2>
      <div className="text-sm leading-relaxed space-y-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1" style={{ color: 'var(--fg-muted)' }}>
        {children}
      </div>
    </div>
  )
}
