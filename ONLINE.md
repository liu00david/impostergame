# Online Multiplayer — Architecture & Mechanics

## Stack

- **PartyKit** (Cloudflare Workers WebSocket): runs `party/index.ts` as the authoritative server
- **partysocket/react** `usePartySocket`: client-side WebSocket hook in `src/app/room/[code]/page.tsx`
- **Next.js** frontend renders all phases; server holds all state

---

## Room Identity

Each room is identified by a 4-character alphanumeric code (e.g. `AB3X`). The code is both the URL path (`/room/AB3X`) and the PartyKit room ID — PartyKit uses it to route every WebSocket connection to the correct server instance.

---

## Connection Flow

1. Player visits `/room` and enters a name → stored in `localStorage` (`spyhunt_name`, `spyhunt_room`)
2. Browser navigates to `/room/[code]`
3. On mount, client reads `localStorage`: if name+code match → auto-join; else → show name entry form
4. `usePartySocket` opens a WebSocket to `{HOST}/party/{code}`
5. `onOpen` fires → client sends `SET_NAME` with their name
6. Server `onConnect` fires first → sends current `STATE` to the new connection
7. Server `SET_NAME` handler registers the player and broadcasts updated state to everyone

---

## State

All game state lives exclusively on the server in `party/index.ts` as `OnlineGameState`. The client is stateless — it only renders whatever the server broadcasts. Every meaningful action sends a `ClientMessage` to the server, the server mutates state, then broadcasts `STATE` to all connections.

### Key fields
| Field | Purpose |
|---|---|
| `phase` | Current game phase: `lobby` → `reveal` → `game` → `debrief` → `vote` → `results` |
| `players[]` | All players with connection status, role, vote status |
| `secretWord` | The codeword (sent to all but only civiliand render it client-side) |
| `impostorCount` | Chosen randomly from `selectedCounts` at game start |
| `ballots[]` | Vote records (voterId + suspects[]) |
| `elapsedSeconds` | Timer ticked by server `setInterval` |

---

## Phase Lifecycle

```
lobby → reveal → game → debrief → vote → results → lobby (reset)
```

### lobby
- Players join by sending `SET_NAME`
- Host configures spy count, category, settings
- Host sends `START_GAME` → server assigns roles (Fisher-Yates shuffle), picks word, sets `phase: 'reveal'`

### reveal
- Each player taps to reveal their role privately on their own device
- Player sends `MARK_ROLE_SEEN` → server sets `hasSeenRole = true`
- When **all** players have seen their role → server advances to `phase: 'game'` and starts the timer
- Host can send `FORCE_START` to skip waiting and advance immediately (for stragglers)

### game (Signal)
- Timer runs server-side (`setInterval`, 1s), broadcast every tick
- Players discuss and give one-word signals in person (no server interaction needed)
- Host sends `SIGNAL_COMPLETE` → `phase: 'debrief'`, timer stops

### debrief
- Players discuss in person
- Host sends `DEBRIEF_COMPLETE` → `phase: 'vote'`

### vote
- Each player sends `CAST_VOTE` with a list of suspect player IDs
- Server marks `hasVoted = true` and appends ballot
- When **all** players have voted → server advances to `phase: 'results'`

### results
- Votes tallied client-side from `ballots[]` in state
- If `settings.spiesVoteCount = false`, spy ballots are excluded from tally
- Impostors are "caught" if all of them appear in the top-N vote-getters
- Host sends `RESET_GAME` → back to `lobby`, players preserved

---

## Host

- The first player to join becomes host (`isHost: true`, `order: 0`)
- Host has exclusive rights to: start game, kick players, advance phases, force-start reveal, end game
- **Host transfer**: on disconnect (`onClose`), if the disconnected player was host, the next connected player sorted by `order` is promoted to host automatically

---

## Reconnection

- During a game (non-lobby phase), connections are not removed on disconnect — the player is marked `isConnected: false`
- On reconnect, the player sends `SET_NAME` with their original name
- Server matches by name (case-insensitive) → reassigns the new `connection.id` to that player slot and marks them connected
- If the name matches a player who is already connected, the server rejects with an error
- During lobby phase, disconnecting removes the player entirely (no slot to reclaim)

---

## New Player Blocking

Once the game has started (phase ≠ `lobby`):
- A `SET_NAME` from an unknown name is rejected with `ERROR "Game in progress — new players cannot join"`
- The client receives this error and renders a hard block screen (not the game UI)
- Only reconnecting players (name matches a disconnected slot) are allowed through

---

## Kick

- Host sends `KICK_PLAYER { playerId }` at any phase
- Server removes the player from state, sends `KICKED` to their connection, then closes it
- Client receiving `KICKED` clears `localStorage` and redirects to `/room?kicked=1`

---

## Timer

- Runs server-side only — not client-side
- Started when `phase` transitions to `game`, stopped on `SIGNAL_COMPLETE` or `RESET_GAME`
- `elapsedSeconds` is incremented by the server every second and broadcast in `STATE`
- Client renders it from state — no drift possible since there's one source of truth

---

## Message Types

### Client → Server (`ClientMessage`)
| Type | Who | When |
|---|---|---|
| `SET_NAME` | Any | On connect / rejoin |
| `TOGGLE_SPY_COUNT` | Host | Lobby |
| `SET_CATEGORY` | Host | Lobby |
| `SET_RANDOM_CATEGORY` | Host | Lobby |
| `UPDATE_SETTINGS` | Host | Lobby |
| `START_GAME` | Host | Lobby |
| `MARK_ROLE_SEEN` | Any | Reveal phase |
| `FORCE_START` | Host | Reveal phase — skip waiting |
| `SIGNAL_COMPLETE` | Host | Game phase |
| `DEBRIEF_COMPLETE` | Host | Debrief phase |
| `CAST_VOTE` | Any | Vote phase |
| `RESET_GAME` | Host | Any phase |
| `KICK_PLAYER` | Host | Any phase |

### Server → Client (`ServerMessage`)
| Type | When |
|---|---|
| `STATE` | After every mutation + on connect |
| `ERROR` | Name taken, game in progress, already online |
| `KICKED` | Sent to the kicked player before closing |

---

## Environment

| Variable | Dev | Production |
|---|---|---|
| `NEXT_PUBLIC_PARTYKIT_HOST` | `localhost:1999` | `spyhunt.{username}.partykit.dev` |

Set in `.env.local`. PartyKit dev server runs on port 1999 alongside Next.js (`npm run dev` uses `concurrently`).
