# Spyhunt

A party word deduction game playable in **Pass & Play** (shared device) or **Online** (each player on their own device via real-time multiplayer).

---

## How the Game Works

One or more **Spies** have infiltrated a team of **Operatives**. Everyone is given a domain (e.g. "Food") but only Operatives see the secret codeword. Players exchange signals or questions to gather information, then vote to identify the spies. Spies win by blending in; Operatives win by rooting them out.

### Phases

1. **Setup** — Choose spy count, domain, and signal mode. Add players (pass & play) or join a room (online).
2. **Assignment** — Each player privately sees their role. Operatives see the codeword; spies only see the domain.
3. **Signal / Interrogation** — Players exchange information:
   - *Signal mode*: each agent gives one word or phrase hinting at the codeword.
   - *Interrogation mode*: randomized pairs — each agent asks one question and answers one question.
4. **Debrief** — Open group discussion. Who sounded suspicious?
5. **Vote** — Each player votes for who they think is a spy.
6. **Outcome** — If every spy received strictly more votes than any operative: **Spies Caught** (operatives win, unless spies correctly guess the codeword). Otherwise: **Mission Sabotaged** (spies win).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Realtime (online mode) | [PartyKit](https://partykit.io) — persistent WebSocket server |
| Client WebSocket | `partysocket/react` (`usePartySocket`) |
| State (pass & play) | React `useReducer` via `GameContext` |
| Deployment | Vercel (Next.js) + PartyKit cloud (party server) |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── setup/              # Pass & play setup
│   ├── reveal/             # Role reveal (pass & play)
│   ├── game/               # Signal phase (pass & play)
│   ├── debrief/            # Debrief (pass & play)
│   ├── vote/               # Voting (pass & play)
│   ├── results/            # Outcome (pass & play)
│   ├── room/               # Online lobby entry
│   ├── room/[code]/        # Online game (all phases in one page)
│   └── rules/              # How to play
├── context/
│   ├── GameContext.tsx     # Pass & play state (useReducer)
│   └── ThemeContext.tsx    # Light/dark theme
├── lib/
│   ├── wordData.ts         # Single source of truth for all word lists
│   ├── wordLists.ts        # Re-exports wordData for Next.js (typed)
│   ├── partyTypes.ts       # Shared types between client and party server
│   ├── gameLogic.ts        # Role assignment, voting tally, category labels
│   ├── colors.ts           # Design tokens (JS constants mirroring CSS vars)
│   └── constants.ts        # Shared constants (e.g. min players per spy count)
├── types/
│   └── game.ts             # Pass & play TypeScript types
└── components/             # Shared UI components

party/
└── index.ts                # PartyKit server (runs on Cloudflare Workers edge)
```

---

## Online Architecture

Online multiplayer is powered by **PartyKit**, which runs a persistent WebSocket server (`party/index.ts`) on Cloudflare's edge network. Each room is its own server instance with its own state.

### Message Flow

```
Client                          PartyKit Server (party/index.ts)
  |  -- SET_NAME -->                |  add/rejoin player
  |  -- TOGGLE_SPY_COUNT -->        |  update selectedCounts
  |  -- SET_CATEGORY -->            |  update selectedCategory
  |  -- START_GAME -->              |  assign roles, pick word,
  |                                 |  randomize signal order + pairs
  |  <-- STATE (broadcast) --       |  all clients receive full state
  |  -- MARK_ROLE_SEEN -->          |  once all seen → phase: 'game'
  |  -- SIGNAL_COMPLETE -->         |  host advances to debrief
  |  -- DEBRIEF_COMPLETE -->        |  host advances to vote
  |  -- CAST_VOTE -->               |  once all voted → phase: 'results'
  |  -- RESET_GAME -->              |  back to lobby, preserve players
```

### Key Server Behaviors

- **Full state broadcast** — the server always sends the complete `OnlineGameState` to all clients; no partial updates.
- **Signal order** — randomized at `START_GAME` and stored as a snapshot of player **names** (not IDs) so reconnects don't break it.
- **Interrogation pairs** — generated server-side at `START_GAME` when `signalMode === 'interrogation'`; each player appears exactly once as asker and once as answerer.
- **Disconnect grace** — on WebSocket close, host is immediately reassigned and a 120s grace timer starts. If the player reconnects within the window (by entering their name), their slot is reclaimed. If not, the slot is cleaned up (lobby only; in-game slots are preserved).
- **In-game departures** — players who leave mid-game keep their slot with `hasLeft: true` so the signal order and results display remain intact.
- **Word lists** — `src/lib/wordData.ts` is the single source of truth. The party server imports directly from it (PartyKit bundles relative imports at deploy time).

---

## Development

```bash
# Install dependencies
npm install

# Run Next.js + PartyKit dev servers together
npm run dev

# Run only Next.js
npm run dev:next

# Run only PartyKit locally
npm run dev:party
```

The local PartyKit server runs at `ws://localhost:1999`.

## Deployment

```bash
# Deploy Next.js to Vercel (standard)
vercel

# Deploy PartyKit server (required after any changes to party/index.ts or src/lib/wordData.ts)
npm run deploy:party
```

> **Note:** The Next.js frontend and PartyKit server are deployed independently. Any changes to `party/index.ts` or `src/lib/wordData.ts` require `npm run deploy:party` to take effect in production.

---

## Word Lists

All word lists live in `src/lib/wordData.ts`. Categories:

| Category | Description |
|---|---|
| Animals | Common animals |
| Asian Food | Asian dishes and foods |
| Celebrities | Well-known public figures |
| Cities | Major world cities |
| Fictional Person | Famous fictional characters |
| Food | Common foods |
| Hobbies | Popular hobbies and activities |
| Jobs | Common occupations |
| Movies | Well-known films |
| Sports | Popular sports |

To add or edit words, update `src/lib/wordData.ts` only — both the Next.js app and party server use it as the source of truth.
