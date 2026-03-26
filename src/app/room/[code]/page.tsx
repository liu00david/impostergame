'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import usePartySocket from 'partysocket/react'
import type { OnlineGameState, OnlinePlayer, ClientMessage, ServerMessage } from '@/lib/partyTypes'
import { Button } from '@/components/ui/Button'
import { CATEGORY_LABELS } from '@/lib/gameLogic'
import { formatTime } from '@/lib/formatTime'
import { Search, Speech, RotateCcw } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { tallyVotes, checkImpostorsCaught } from '@/lib/gameLogic'

const HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999'

const LS_NAME_KEY = 'spyhunt_name'
const LS_ROOM_KEY = 'spyhunt_room'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [myName, setMyName] = useState<string | null>(null)  // null = not yet resolved
  const [gameState, setGameState] = useState<OnlineGameState | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [roleRevealed, setRoleRevealed] = useState(false)
  const [wordRevealed, setWordRevealed] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [kickModalOpen, setKickModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState('')
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [blocked, setBlocked] = useState<string | null>(null)  // non-null = blocked from joining

  // On mount: check localStorage for saved name+room
  useEffect(() => {
    const savedName = localStorage.getItem(LS_NAME_KEY)
    const savedRoom = localStorage.getItem(LS_ROOM_KEY)
    if (savedName && savedRoom === code) {
      setMyName(savedName)
    } else {
      setMyName('')  // show name entry form
    }
  }, [code])

  // Block back navigation — always redirect to /room entry page
  useEffect(() => {
    history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      history.pushState(null, '', window.location.href)
      router.replace('/room')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [router])

  const socket = usePartySocket({
    host: HOST,
    room: code,
    // Only connect once we have a name
    query: myName ? undefined : { disabled: '1' },
    onOpen() {
      if (!myName) return
      setMyId(socket.id)
      send({ type: 'SET_NAME', name: myName })
    },
    onMessage(evt) {
      const msg = JSON.parse(evt.data) as ServerMessage
      if (msg.type === 'STATE') setGameState(msg.state)
      if (msg.type === 'KICKED') {
        localStorage.removeItem(LS_NAME_KEY)
        localStorage.removeItem(LS_ROOM_KEY)
        router.replace('/room?kicked=1')
      }
      if (msg.type === 'ERROR') {
        setNameError(msg.message)
        // Block entry if game is already in progress
        if (msg.message === 'Game in progress — new players cannot join') {
          setBlocked(msg.message)
        }
        // Also show as fade toast during game
        setToast(msg.message)
        setToastVisible(true)
        setTimeout(() => setToastVisible(false), 3000)
      }
    },
  })

  function send(msg: ClientMessage) {
    socket.send(JSON.stringify(msg))
  }

  function handleNameSubmit() {
    const name = nameInput.trim()
    if (!name) return
    localStorage.setItem(LS_NAME_KEY, name)
    localStorage.setItem(LS_ROOM_KEY, code)
    setMyName(name)
  }

  // When myName is set (either from localStorage or form), send SET_NAME
  useEffect(() => {
    if (!myName || !socket || socket.readyState !== WebSocket.OPEN) return
    setMyId(socket.id)
    send({ type: 'SET_NAME', name: myName })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myName])

  const me = gameState?.players.find(p => p.id === myId)
    ?? gameState?.players.find(p => p.name === myName && p.isConnected)
  const isHost = me?.isHost ?? false

  // Reset local state on phase changes
  useEffect(() => {
    setRoleRevealed(false)
    setSelected(new Set())
  }, [gameState?.phase])

  // Name entry screen (shown on refresh or first visit without saved name)
  if (myName === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--fg-muted)' }}>Loading…</p>
      </div>
    )
  }

  if (myName === '') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-6 gap-6">
        <div className="w-full space-y-2">
          <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>Room <span style={{ color: 'rgb(209,32,76)' }}>{code}</span></p>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Enter your agent name to join</p>
        </div>
        <input
          type="text"
          value={nameInput}
          onChange={e => { setNameInput(e.target.value); setNameError('') }}
          onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
          placeholder="Agent name"
          maxLength={20}
          autoFocus
          className="w-full rounded-xl border px-4 py-3 text-base outline-none"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }}
        />
        {nameError && <p className="text-sm text-red-400 w-full">{nameError}</p>}
        <Button fullWidth size="lg" onClick={handleNameSubmit} disabled={!nameInput.trim()}>
          Join Room
        </Button>
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-6 gap-6 text-center">
        <p className="text-4xl">🚫</p>
        <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>Game in progress</p>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>This room is mid-game. You can only rejoin if you were already a player.</p>
        <Button fullWidth onClick={() => router.replace('/room')}>Back to Lobby</Button>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--fg-muted)' }}>Connecting…</p>
      </div>
    )
  }

  const phase = gameState.phase
  const maxVotes = Math.max(...(gameState.selectedCounts.length ? gameState.selectedCounts : [1]))
  const spyPartners = me?.isImpostor
    ? gameState.players.filter(p => p.isImpostor && p.id !== myId).map(p => p.name)
    : []

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    const canStart = gameState.selectedCounts.length > 0
      && (gameState.selectedCategory !== null || gameState.useRandomCategory)
      && gameState.players.length >= 3

    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8 gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-subtle)' }}>Room</p>
          <h1 className="text-4xl font-bold font-mono tracking-widest" style={{ color: 'rgb(209,32,76)' }}>{code}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Share this code with other agents</p>
        </header>

        {/* Player list */}
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
            Agents ({gameState.players.length})
          </p>
          {gameState.players.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{ background: 'var(--bg-card)', borderColor: p.id === myId ? 'rgba(209,32,76,0.5)' : 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.isConnected ? '#22c55e' : '#6b7280' }} />
                <span className="font-medium">{p.name}{p.id === myId ? ' (you)' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                {p.isHost && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(209,32,76,0.15)', color: 'rgb(209,32,76)' }}>HOST</span>}
                {isHost && !p.isHost && (
                  <button
                    onClick={() => send({ type: 'KICK_PLAYER', playerId: p.id })}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                  >×</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isHost && (
          <>
            {/* Spy count */}
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
                Spies{gameState.selectedCounts.length > 1 && <span className="ml-2 text-xs font-normal" style={{ color: 'rgb(209,32,76)' }}>random</span>}
              </p>
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                {([1, 2, 3] as const).map(count => {
                  const minPlayers = count === 1 ? 3 : count === 2 ? 5 : 7
                  const isSelected = gameState.selectedCounts.includes(count)
                  const isDisabled = gameState.players.length < minPlayers
                  return (
                    <button key={count}
                      onClick={() => !isDisabled && send({ type: 'TOGGLE_SPY_COUNT', count })}
                      disabled={isDisabled}
                      className="flex-1 py-3 text-base font-semibold flex flex-col items-center gap-0.5"
                      style={isSelected && !isDisabled
                        ? { background: '#9b1c31', color: '#fff' }
                        : isDisabled
                        ? { color: 'var(--fg-subtle)', opacity: 0.4 }
                        : { color: 'var(--fg-muted)' }}
                    >
                      <span>{count}</span>
                      <span className="text-xs" style={{ color: isSelected && !isDisabled ? '#fecdd3' : 'var(--fg-subtle)' }}>{minPlayers}+</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>Domain</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <button key={key}
                    onClick={() => send({ type: 'SET_CATEGORY', category: key })}
                    className="rounded-xl border px-4 py-2 text-sm text-center"
                    style={!gameState.useRandomCategory && gameState.selectedCategory === key
                      ? { borderColor: '#9b1c31', background: 'rgba(155,28,49,0.15)', color: 'var(--fg)', fontWeight: 700 }
                      : { borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--fg-muted)' }}
                  >{label}</button>
                ))}
                <button
                  onClick={() => send({ type: 'SET_RANDOM_CATEGORY' })}
                  className="col-span-2 rounded-xl border px-4 py-2 text-sm text-center"
                  style={gameState.useRandomCategory
                    ? { borderColor: '#9b1c31', background: 'rgba(155,28,49,0.15)', color: 'var(--fg)', fontWeight: 700 }
                    : { borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--fg-muted)' }}
                >Random</button>
              </div>
            </div>

            <Button fullWidth size="lg" disabled={!canStart} onClick={() => send({ type: 'START_GAME' })}>
              Begin Assignment
            </Button>
          </>
        )}

        {!isHost && (
          <p className="text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
            Waiting for host to start the game…
          </p>
        )}

        <StatusLights players={gameState.players} myId={myId} code={code} />
      </div>
    )
  }

  // Fade toast for errors (e.g. game in progress, already online)
  const Toast = () => (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg pointer-events-none transition-opacity duration-500"
      style={{
        background: 'rgba(30,0,0,0.85)',
        zIndex: 200,
        opacity: toastVisible ? 1 : 0,
        border: '1px solid rgba(239,68,68,0.4)',
        whiteSpace: 'nowrap',
      }}
    >
      {toast}
    </div>
  )

  // ── REVEAL ─────────────────────────────────────────────────────────────────
  if (phase === 'reveal') {
    const allReady = gameState.players.every(p => p.hasSeenRole)
    return (
      <>
        <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8 gap-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(209,32,76)' }}>
              {gameState.selectedCategory ? (CATEGORY_LABELS[gameState.selectedCategory as keyof typeof CATEGORY_LABELS] ?? gameState.selectedCategory) : ''}
            </p>
            <h1 className="text-2xl font-bold">Assignment</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Tap to reveal your role privately</p>
          </header>

          {!me?.hasSeenRole ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              {!roleRevealed ? (
                <button
                  onClick={() => setRoleRevealed(true)}
                  className="w-full rounded-2xl border-2 p-8 text-center active:scale-95 transition-all"
                  style={{ borderColor: 'rgba(209,32,76,0.5)', background: 'var(--bg-card)' }}
                >
                  <p className="text-4xl mb-3">📨</p>
                  <p className="text-xl font-bold">Tap to open</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Make sure nobody is watching</p>
                </button>
              ) : (
                <div className="w-full rounded-2xl border-2 p-6 text-center space-y-4"
                  style={me?.isImpostor
                    ? { borderColor: 'rgba(209,32,76,0.6)', background: 'rgba(209,32,76,0.1)' }
                    : { borderColor: 'rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.08)' }}>
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
                    Domain: {gameState.selectedCategory ? (CATEGORY_LABELS[gameState.selectedCategory as keyof typeof CATEGORY_LABELS] ?? gameState.selectedCategory) : ''}
                  </p>
                  {me?.isImpostor ? (
                    <>
                      <p className="text-3xl font-bold" style={{ color: 'rgb(209,32,76)' }}>You are a Spy!</p>
                      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Blend in. Don&apos;t reveal yourself.</p>
                      {gameState.settings.spiesKnowEachOther && spyPartners.length > 0 && (
                        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                          Partner{spyPartners.length > 1 ? 's' : ''}: <span className="font-bold" style={{ color: 'var(--fg)' }}>{spyPartners.join(', ')}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Codeword</p>
                      <p className="text-4xl font-bold">{gameState.secretWord}</p>
                      <p className="text-sm" style={{ color: 'var(--fg-subtle)' }}>You are an Operative. Protect the codeword.</p>
                    </>
                  )}
                  <Button fullWidth onClick={() => send({ type: 'MARK_ROLE_SEEN' })}>Understood</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <p className="text-green-500 text-xl font-bold">✓ Ready</p>
              <p style={{ color: 'var(--fg-muted)' }}>
                {allReady ? 'All agents ready! Starting signal phase…' : `Waiting for others… (${gameState.players.filter(p => p.hasSeenRole).length}/${gameState.players.length})`}
              </p>
            </div>
          )}

          {isHost && !allReady && (
            <div className="flex justify-center">
              <button
                onClick={() => send({ type: 'FORCE_START' })}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--fg-subtle)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >Continue without waiting</button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {gameState.players.map(p => (
              <div key={p.id} className="rounded-lg border px-2 py-2 text-center text-sm"
                style={{ borderColor: p.hasSeenRole ? 'rgba(34,197,94,0.4)' : 'var(--border)', background: 'var(--bg-card)' }}>
                <span style={{ color: p.hasSeenRole ? '#22c55e' : 'var(--fg-muted)' }}>{p.hasSeenRole ? '✓ ' : ''}{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        <StatusLights players={gameState.players} myId={myId} code={code} />
        {isHost && <KickButton players={gameState.players} myId={myId} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} open={kickModalOpen} setOpen={setKickModalOpen} />}
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); socket.close(); router.replace('/room') }} />
        <Toast />
      </>
    )
  }

  // ── GAME (Signal) ───────────────────────────────────────────────────────────
  if (phase === 'game') {
    const startingPlayer = gameState.players.find(p => p.id === gameState.startingPlayerId)
    return (
      <>
        <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
          <header className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgb(209,32,76)' }}>
                {gameState.selectedCategory ? (CATEGORY_LABELS[gameState.selectedCategory as keyof typeof CATEGORY_LABELS] ?? gameState.selectedCategory) : ''}
              </p>
              <h1 className="text-2xl font-bold">Signal</h1>
            </div>
            <p className="text-3xl font-mono font-bold" style={{ color: 'rgb(209, 32, 76)' }}>{formatTime(gameState.elapsedSeconds)}</p>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-2">
            <Speech size={52} color="rgb(209,32,76)" strokeWidth={1.5} />
            <p className="text-xl font-medium" style={{ color: 'var(--fg)' }}>
              Go around in a circle. Each agent gives one signal, without revealing the codeword!
            </p>
            {me && !me.isImpostor && (
              <div className="rounded-xl border px-4 py-3 w-full" style={{ background: 'var(--bg-card)', borderColor: 'rgba(34,197,94,0.3)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--fg-subtle)' }}>Your codeword</p>
                <p className="text-2xl font-bold">{gameState.secretWord}</p>
              </div>
            )}
            <div className="space-y-2 w-full">
              <p className="text-lg font-semibold" style={{ color: 'var(--fg-subtle)' }}>Starting with</p>
              <div className="rounded-3xl border px-6 py-4" style={{ background: 'var(--bg-card)', borderColor: 'rgba(155,28,49,0.4)' }}>
                <p className="text-3xl font-bold">{startingPlayer?.name}</p>
              </div>
            </div>
          </div>

          {isHost && (
            <div className="mt-8">
              <Button fullWidth size="lg" onClick={() => send({ type: 'SIGNAL_COMPLETE' })}>
                Proceed to Debrief
              </Button>
            </div>
          )}
          {!isHost && (
            <p className="mt-8 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>Waiting for host to proceed…</p>
          )}
        </div>
        <StatusLights players={gameState.players} myId={myId} code={code} />
        {isHost && <KickButton players={gameState.players} myId={myId} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} open={kickModalOpen} setOpen={setKickModalOpen} />}
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); socket.close(); router.replace('/room') }} />
        <Toast />
      </>
    )
  }

  // ── DEBRIEF ─────────────────────────────────────────────────────────────────
  if (phase === 'debrief') {
    return (
      <>
        <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold">Debrief</h1>
          </header>
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-2" style={{ marginBottom: '80px' }}>
            <Search size={52} color="rgb(209,32,76)" strokeWidth={1.5} />
            <div className="space-y-3">
              <p className="text-xl" style={{ color: 'var(--fg)' }}>Discuss among each other</p>
              <p className="text-xl leading-relaxed" style={{ color: 'var(--fg-muted)' }}>Was anyone suspicious?</p>
              <p className="text-xl font-bold" style={{ color: 'var(--fg-subtle)' }}>When ready, proceed to voting.</p>
            </div>
          </div>
          {isHost && (
            <Button fullWidth size="lg" onClick={() => send({ type: 'DEBRIEF_COMPLETE' })}>
              Proceed to Voting
            </Button>
          )}
          {!isHost && (
            <p className="text-center text-sm" style={{ color: 'var(--fg-muted)' }}>Waiting for host to proceed…</p>
          )}
        </div>
        <StatusLights players={gameState.players} myId={myId} code={code} />
        {isHost && <KickButton players={gameState.players} myId={myId} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} open={kickModalOpen} setOpen={setKickModalOpen} />}
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); socket.close(); router.replace('/room') }} />
        <Toast />
      </>
    )
  }

  // ── VOTE ────────────────────────────────────────────────────────────────────
  if (phase === 'vote') {
    const hasVoted = me?.hasVoted ?? false

    function toggleSelect(id: string) {
      if (id === myId) return
      setSelected(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else if (next.size < maxVotes) next.add(id)
        return next
      })
    }

    function confirmVote() {
      send({ type: 'CAST_VOTE', suspects: Array.from(selected) })
    }

    return (
      <>
        <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">Voting</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
              Voted: {gameState.players.filter(p => p.hasVoted).length}/{gameState.players.length}
            </p>
          </header>

          {!hasVoted ? (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--fg-subtle)' }}>
                Identify up to {maxVotes} spy{maxVotes > 1 ? 's' : ''} (or abstain)
              </p>
              <div className="space-y-2 flex-1">
                {gameState.players.map(player => {
                  const isSelf = player.id === myId
                  const isSelected = selected.has(player.id)
                  return (
                    <button key={player.id}
                      onClick={() => toggleSelect(player.id)}
                      disabled={isSelf}
                      className="w-full flex items-center justify-between rounded-xl border px-4 py-3 min-h-[52px]"
                      style={isSelf
                        ? { borderColor: 'var(--border)', background: 'var(--bg-card)', opacity: 0.5 }
                        : isSelected
                        ? { borderColor: '#ef4444', background: 'rgba(239,68,68,0.15)', color: '#f87171' }
                        : { borderColor: 'var(--border)', background: 'var(--bg-elevated)', color: 'var(--fg)' }}
                    >
                      <span className="font-medium">{player.name}{isSelf ? ' (you)' : ''}</span>
                      {isSelected && <span className="text-red-400 text-lg">✓</span>}
                      {!isSelf && !isSelected && <div className="w-5 h-5 rounded border" style={{ borderColor: 'var(--border)' }} />}
                    </button>
                  )
                })}
              </div>
              <div className="mt-6">
                <Button fullWidth size="lg" onClick={confirmVote}>
                  {selected.size === 0 ? 'Abstain' : `Flag ${selected.size} as spy${selected.size > 1 ? 's' : ''}`}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <p className="text-green-500 text-xl font-bold">✓ Vote cast</p>
              <p style={{ color: 'var(--fg-muted)' }}>
                Waiting for others… ({gameState.players.filter(p => p.hasVoted).length}/{gameState.players.length})
              </p>
            </div>
          )}
        </div>
        <StatusLights players={gameState.players} myId={myId} code={code} />
        {isHost && <KickButton players={gameState.players} myId={myId} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} open={kickModalOpen} setOpen={setKickModalOpen} />}
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); socket.close(); router.replace('/room') }} />
        <Toast />
      </>
    )
  }

  // ── RESULTS ─────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    return (
      <>
        <ResultsView
          gameState={gameState}
          myId={myId}
          isHost={isHost}
          wordRevealed={wordRevealed}
          setWordRevealed={setWordRevealed}
          onReset={() => send({ type: 'RESET_GAME' })}
        />
        <StatusLights players={gameState.players} myId={myId} code={code} />
        <Toast />
      </>
    )
  }

  return null
}

// ── Status lights ─────────────────────────────────────────────────────────────

function StatusLights({ players, myId, code }: { players: OnlinePlayer[]; myId: string | null; code: string }) {
  return (
    <div className="fixed bottom-4 left-4 flex flex-col gap-1.5" style={{ zIndex: 40 }}>
      <span className="text-xs font-mono font-bold mb-0.5" style={{ color: 'rgb(209,32,76)', letterSpacing: '0.1em' }}>{code}</span>
      {players.map(p => (
        <div key={p.id} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: p.isConnected ? '#22c55e' : '#6b7280' }}
          />
          <span className="text-xs" style={{ color: p.id === myId ? 'var(--fg)' : 'var(--fg-subtle)', fontWeight: p.id === myId ? 600 : 400 }}>
            {p.name}{p.isHost ? ' ★' : ''}{p.id === myId ? ' (me)' : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Results sub-component ────────────────────────────────────────────────────

function ResultsView({ gameState, myId, isHost, wordRevealed, setWordRevealed, onReset }: {
  gameState: OnlineGameState
  myId: string | null
  isHost: boolean
  wordRevealed: boolean
  setWordRevealed: (v: boolean) => void
  onReset: () => void
}) {
  const { theme } = useTheme()
  const spyIds = new Set(gameState.players.filter(p => p.isImpostor).map(p => p.id))
  const effectiveBallots = gameState.settings.spiesVoteCount
    ? gameState.ballots
    : gameState.ballots.filter(b => !spyIds.has(b.voterId))

  const players = gameState.players.map(p => ({ ...p, hasSeenRole: p.hasSeenRole, order: p.order }))
  const results = tallyVotes(effectiveBallots, players)
  const spiesCaught = checkImpostorsCaught(results, players, gameState.impostorCount)
  const spies = gameState.players.filter(p => p.isImpostor)
  const playerMap = new Map(gameState.players.map(p => [p.id, p]))

  const eliminatedIds = new Set<string>()
  let slotsUsed = 0, i = 0
  while (i < results.length && slotsUsed < gameState.impostorCount) {
    const groupVotes = results[i].votes
    const group: string[] = []
    while (i < results.length && results[i].votes === groupVotes) { group.push(results[i].playerId); i++ }
    if (slotsUsed + group.length <= gameState.impostorCount) { group.forEach(id => eliminatedIds.add(id)); slotsUsed += group.length }
    else break
  }

  const eliminatedNames = [...eliminatedIds].map(id => playerMap.get(id)?.name).filter(Boolean).join(', ') || '-'

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Outcome</h1>
      </header>

      <div className="text-center mb-4">
        <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-subtle)' }}>Codeword</p>
        <button onClick={() => setWordRevealed(!wordRevealed)}
          className="w-full rounded-xl border-2 flex items-center justify-center min-h-[60px]"
          style={wordRevealed
            ? { borderColor: 'rgba(155,28,49,0.4)', background: 'rgba(155,28,49,0.08)' }
            : { borderStyle: 'dashed', borderColor: 'rgba(155,28,49,0.5)', background: 'var(--bg-elevated)' }}>
          {wordRevealed
            ? <span className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{gameState.secretWord}</span>
            : <span className="text-lg font-semibold" style={{ color: 'var(--fg-muted)' }}>Tap to reveal</span>}
        </button>
      </div>

      {/* Laptop frame */}
      <div className="mb-6">
        <div className="rounded-t-xl rounded-b-md px-3 pt-3 pb-3" style={{
          background: theme === 'dark' ? '#222222' : '#d0d0d0',
          boxShadow: theme === 'dark'
            ? '0 2px 16px rgba(131,131,131,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 2px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}>
          <div className="flex justify-center mb-2"><div className="w-1 h-1 rounded-full" style={{ background: theme === 'dark' ? '#333333' : '#b0b0b0' }} /></div>
          {spiesCaught ? (
            <div className="rounded-lg p-5 text-center" style={{ background: theme === 'dark' ? 'rgb(17,45,28)' : 'rgb(235,255,243)', border: '3px solid rgba(0,147,54,0.68)', boxShadow: '0 0 0 1px rgba(0,147,54,0.15)' }}>
              <p className="font-title text-3xl font-bold mb-3" style={{ color: 'var(--fg)' }}>Spies Caught!</p>
              <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>One last chance for spies to guess the codeword!</p>
              <p className="text-lg mt-2" style={{ color: 'var(--fg-muted)' }}>Spies: <span className="font-bold" style={{ color: 'var(--fg)' }}>{spies.map(p => p.name).join(', ')}</span></p>
              <p className="text-lg mt-1" style={{ color: 'var(--fg-muted)' }}>Identified: <span className="font-bold" style={{ color: 'var(--fg)' }}>{eliminatedNames}</span></p>
            </div>
          ) : (
            <div className="rounded-lg p-5 text-center" style={{ background: theme === 'dark' ? 'rgb(76,24,33)' : 'rgb(255,224,232)', border: `3px solid ${theme === 'dark' ? 'rgba(200,60,80,0.65)' : 'rgba(180,60,80,0.55)'}`, boxShadow: `0 0 0 1px ${theme === 'dark' ? 'rgba(200,60,80,0.15)' : 'rgba(180,60,80,0.1)'}` }}>
              <p className="font-title text-3xl font-bold mb-3" style={{ color: 'var(--fg)' }}>Mission Sabotaged!</p>
              <p className="text-lg mb-1" style={{ color: 'var(--fg-muted)' }}>Spies: <span className="font-bold" style={{ color: 'var(--fg)' }}>{spies.map(p => p.name).join(', ')}</span></p>
              <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>Eliminated: <span className="font-bold" style={{ color: 'var(--fg)' }}>{eliminatedNames}</span></p>
            </div>
          )}
        </div>
        <div style={{ height: '1px', background: theme === 'dark' ? '#111' : '#b8b8b8' }} />
        <div className="rounded-b-2xl" style={{ height: '18px', background: theme === 'dark' ? '#333333' : '#c8c8c8', boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.15)' }}>
          <div className="mx-auto mt-1 rounded-sm" style={{ width: '28px', height: '6px', background: theme === 'dark' ? '#2a2a2a' : '#bcbcbc' }} />
        </div>
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-subtle)' }}>Vote Tally</h2>
      <div className="space-y-2 mb-8">
        {results.map((result, rank) => {
          const player = playerMap.get(result.playerId)
          if (!player) return null
          const isEliminated = eliminatedIds.has(result.playerId)
          const rowStyle = isEliminated
            ? player.isImpostor
              ? { borderColor: 'rgba(34,197,94,0.45)', background: 'rgba(34,197,94,0.10)' }
              : { borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)' }
            : { borderColor: 'var(--border)', background: 'var(--bg-card)' }
          return (
            <div key={result.playerId} className="flex items-center justify-between rounded-xl border px-4 py-3" style={rowStyle}>
              <div className="flex items-center gap-3">
                <span className="text-base w-5" style={{ color: 'var(--fg-subtle)' }}>{rank + 1}.</span>
                <span className="font-medium">{player.name}{player.id === myId ? ' (you)' : ''}</span>
                {player.isImpostor && <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(161,10,10,0.93)', color: 'rgba(255,255,255,0.9)' }}>SPY</span>}
              </div>
              <span className="font-bold" style={{ color: result.votes > 0 ? 'var(--fg)' : 'var(--fg-subtle)' }}>
                {result.votes} vote{result.votes !== 1 ? 's' : ''}
              </span>
            </div>
          )
        })}
      </div>

      {isHost && <Button fullWidth size="lg" onClick={onReset}>New Mission</Button>}
      {!isHost && <p className="text-center text-sm" style={{ color: 'var(--fg-muted)' }}>Waiting for host to start a new mission…</p>}
    </div>
  )
}

// ── Game menu button (leave / end game) ──────────────────────────────────────

function GameMenuButton({ isHost, onReset, onLeave }: { isHost: boolean; onReset: () => void; onLeave: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', zIndex: 50, color: 'var(--fg-muted)' }}
        title="Game menu"
      >
        <RotateCcw size={16} />
      </button>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 200 }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Game Menu</h2>
            <button
              onClick={() => { setOpen(false); onLeave() }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4"
              style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
            >Leave Game</button>
            {isHost && (
              <button
                onClick={() => { setOpen(false); onReset() }}
                className="w-full py-3 rounded-xl text-sm font-bold text-left px-4"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
              >End Game for All</button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'transparent', color: 'var(--fg-subtle)' }}
            >Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Kick button + modal ───────────────────────────────────────────────────────

function KickButton({ players, myId, onKick, open, setOpen }: {
  players: OnlinePlayer[]
  myId: string | null
  onKick: (id: string) => void
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const nonHostPlayers = players.filter(p => !p.isHost)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
        style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', zIndex: 50 }}
      >
        Kick
      </button>
      {open && (
        <div
          className="fixed inset-0 flex items-end justify-center pb-8"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 100 }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md mx-4 rounded-2xl p-6 space-y-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Kick a player</h2>
            {nonHostPlayers.length === 0 && (
              <p style={{ color: 'var(--fg-muted)' }}>No players to kick.</p>
            )}
            {nonHostPlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.isConnected ? '#22c55e' : '#6b7280' }} />
                  <span className="font-medium">{p.name}</span>
                </div>
                <button
                  onClick={() => { onKick(p.id); setOpen(false) }}
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                >
                  Kick
                </button>
              </div>
            ))}
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
