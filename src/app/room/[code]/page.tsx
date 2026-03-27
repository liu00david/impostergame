'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import usePartySocket from 'partysocket/react'
import type { OnlineGameState, OnlinePlayer, ClientMessage, ServerMessage } from '@/lib/partyTypes'
import { Button } from '@/components/ui/Button'
import { CATEGORY_LABELS } from '@/lib/gameLogic'
import { formatTime } from '@/lib/formatTime'
import { Search, Speech, Menu, ArrowRight } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { tallyVotes, checkImpostorsCaught } from '@/lib/gameLogic'
import {
  brand, brandBorder, brandBorderStrong, brandDim, brandSubtle,
  brandDark, brandDarkSubtle, brandDarkBorder, brandDarkFaint,
  danger, dangerSubtle, dangerBorder, dangerLight,
  success, statusOffline,
  successBorder, successSubtle,
  dangerFaint,
  frameDark, frameLight,
  outcomeWinBgDark, outcomeWinBgLight, outcomeWinBorder, outcomeWinGlow,
  outcomeLossBgDark, outcomeLossBgLight, outcomeLossBorder, outcomeLossGlow, outcomeLossBorderLight,
  overlay, overlayHeavy,
  toggleOn, toggleOff,
  toastBg,
  spyBadgeBg,
  voteCardDark, voteCardAccentDark, voteCardLight, voteCardBorderLight, voteCardFlapLight,
  brandPink,
} from '@/lib/colors'

const HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999'

const LS_NAME_KEY = 'spyhunt_name'
const LS_ROOM_KEY = 'spyhunt_room'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()
  const { theme, toggle: toggleTheme } = useTheme()

  const [myName, setMyName] = useState<string | null>(null)  // null = not yet resolved, '' = show form
  const [pendingName, setPendingName] = useState<string | null>(null)  // submitted but not confirmed
  const [gameState, setGameState] = useState<OnlineGameState | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [roleRevealed, setRoleRevealed] = useState(false)
  const [wordRevealed, setWordRevealed] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState('')
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [blocked, setBlocked] = useState<string | null>(null)  // non-null = blocked from joining
  const [duplicateTab, setDuplicateTab] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // On mount: check localStorage for saved name+room
  useEffect(() => {
    const savedName = localStorage.getItem(LS_NAME_KEY)
    const savedRoom = localStorage.getItem(LS_ROOM_KEY)
    if (savedName && savedRoom === code) {
      // Treat as pending — hold on loading screen until server confirms
      setPendingName(savedName)
      setMyName('')
    } else {
      setMyName('')  // show name entry form
    }
  }, [code])

  // Detect duplicate tab via BroadcastChannel
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return
    const ch = new BroadcastChannel(`spyhunt_room_${code}`)
    let claimedByMe = false

    ch.onmessage = (e) => {
      if (e.data === 'claim') {
        // Another tab just opened — tell it we're already here
        if (claimedByMe) ch.postMessage('taken')
      }
      if (e.data === 'taken') {
        // Someone told us this room is already open in another tab
        setDuplicateTab(true)
      }
    }

    // Announce ourselves and wait briefly for a response
    ch.postMessage('claim')
    const t = setTimeout(() => { claimedByMe = true }, 200)

    return () => {
      clearTimeout(t)
      ch.close()
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
    onOpen() {
      setMyId(socket.id)
      const nameToSend = myName || pendingName
      if (nameToSend) send({ type: 'SET_NAME', name: nameToSend })
    },
    onMessage(evt) {
      const msg = JSON.parse(evt.data) as ServerMessage
      if (msg.type === 'STATE') {
        setGameState(msg.state)
        // Confirm pending name once server accepts us (our id appears in state)
        if (pendingName && msg.state.players.some(p => p.id === socket.id)) {
          localStorage.setItem(LS_NAME_KEY, pendingName)
          localStorage.setItem(LS_ROOM_KEY, code)
          setMyName(pendingName)
          setPendingName(null)
        }
      }
      if (msg.type === 'KICKED') {
        localStorage.removeItem(LS_NAME_KEY)
        localStorage.removeItem(LS_ROOM_KEY)
        router.replace('/room?kicked=1')
      }
      if (msg.type === 'ERROR') {
        // Block entry if game is already in progress or name active in-game
        if (msg.message === 'Game in progress — new players cannot join' || msg.message.includes('is already online')) {
          setPendingName(null)
          setBlocked(msg.message)
        } else {
          // Stay on name entry screen — show error inline, clear pending
          setPendingName(null)
          setNameError(msg.message)
        }
        // Show as fade toast
        setToast(msg.message)
        setToastVisible(true)
        setTimeout(() => setToastVisible(false), 3000)
      }
      if (msg.type === 'HOST_CHANGED') {
        setToast(`${msg.newHostName} is now host`)
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
    setNameError('')
    setPendingName(name)
    send({ type: 'SET_NAME', name })
  }

  // When myName is set from localStorage on load, send SET_NAME once socket is ready
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
    setWordRevealed(false)
  }, [gameState?.phase])

  if (duplicateTab) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-6 gap-6 text-center">
        <p className="text-4xl">📵</p>
        <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>Already open in another tab</p>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>This game is running in a different tab or window. Close this one to avoid conflicts.</p>
      </div>
    )
  }

  // Still resolving from localStorage
  if (myName === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--fg-muted)' }}>Loading…</p>
      </div>
    )
  }

  // Pending name sent to server — hold here until confirmed or rejected
  // (blocked check must come first so errors break out of this screen)
  if (pendingName && myName === '' && !blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--fg-muted)' }}>Connecting…</p>
      </div>
    )
  }

  if (blocked) {
    const isNameTaken = blocked.includes('is already online')
    return (
      <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-6 gap-6 text-center">
        <p className="text-4xl">🚫</p>
        <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>
          {isNameTaken ? 'Name already taken' : 'Game in progress'}
        </p>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          {isNameTaken
            ? 'That name is already active in this game. Use a different name to join.'
            : 'This room is mid-game. You can only rejoin if you were already a player.'}
        </p>
        <Button fullWidth onClick={() => router.replace('/room')}>Back to Lobby</Button>
      </div>
    )
  }

  if (myName === '') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center max-w-md mx-auto px-6 gap-6">
        <div className="w-full space-y-2">
          <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>Room <span style={{ color: brand }}>{code}</span></p>
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
        <Button fullWidth size="lg" onClick={handleNameSubmit} disabled={!nameInput.trim() || !!pendingName}>
          {pendingName ? 'Joining…' : 'Join Room'}
        </Button>
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
      <div className="relative min-h-screen flex flex-col max-w-md mx-auto px-6 py-8 gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--fg-subtle)' }}>Room</p>
          <h1 className="text-4xl font-bold font-mono tracking-widest" style={{ color: brand }}>{code}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Share this code with other agents</p>
        </header>

        {/* Player list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-subtle)' }}>
              Agents ({gameState.players.length})
            </p>
            <button
              onClick={() => setShowAdvanced(true)}
              className="text-sm font-medium"
              style={{ color: 'var(--fg-subtle)' }}
            >⚙ Advanced</button>
          </div>
          {gameState.players.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{ background: 'var(--bg-card)', borderColor: p.id === myId ? brandBorderStrong : 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.isConnected ? success : statusOffline }} />
                <span className="font-medium">{p.name}{p.id === myId ? ' (you)' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                {p.isHost && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: brand, color: '#fff' }}>HOST</span>}
                {isHost && !p.isHost && (
                  <button
                    onClick={() => send({ type: 'KICK_PLAYER', playerId: p.id })}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: dangerSubtle, color: danger }}
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
                Spies{gameState.selectedCounts.length > 1 && <span className="ml-2 text-xs font-normal" style={{ color: brand }}>random</span>}
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
                        ? { background: brandDark, color: '#fff' }
                        : isDisabled
                        ? { color: 'var(--fg-subtle)', opacity: 0.4 }
                        : { color: 'var(--fg-muted)' }}
                    >
                      <span>{count}</span>
                      <span className="text-xs" style={{ color: isSelected && !isDisabled ? brandPink : 'var(--fg-subtle)' }}>{minPlayers}+ players</span>
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
                      ? { borderColor: brandDark, background: brandDarkSubtle, color: 'var(--fg)', fontWeight: 700 }
                      : { borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--fg-muted)' }}
                  >{label}</button>
                ))}
                <button
                  onClick={() => send({ type: 'SET_RANDOM_CATEGORY' })}
                  className="col-span-2 rounded-xl border px-4 py-2 text-sm text-center"
                  style={gameState.useRandomCategory
                    ? { borderColor: brandDark, background: brandDarkSubtle, color: 'var(--fg)', fontWeight: 700 }
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

        <GameMenuButton
          isHost={isHost}
          onLeave={() => { send({ type: 'LEAVE_GAME' }); localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); router.replace('/room') }}
          onDisband={() => { send({ type: 'DISBAND_ROOM' }); localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); router.replace('/room') }}
          players={gameState.players}
          onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })}
          onMakeHost={(id) => send({ type: 'MAKE_HOST', playerId: id })}
        />

        {showAdvanced && (
          <div
            className="fixed inset-0 flex items-center justify-center px-6"
            style={{ background: overlay, zIndex: 200 }}
            onClick={() => setShowAdvanced(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 space-y-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold">Advanced Settings</h2>
              <div className="space-y-3">
                <OnlineSettingRow
                  label="Spies know each other"
                  description="Spies are told who their fellow spies are"
                  value={gameState.settings.spiesKnowEachOther}
                  onChange={v => send({ type: 'UPDATE_SETTINGS', settings: { spiesKnowEachOther: v } })}
                  disabled={!isHost}
                />
                <OnlineSettingRow
                  label="Spy votes count"
                  description="Spies' votes affect the tally outcome"
                  value={gameState.settings.spiesVoteCount}
                  onChange={v => send({ type: 'UPDATE_SETTINGS', settings: { spiesVoteCount: v } })}
                  disabled={!isHost}
                />
              </div>
              {!isHost && <p className="text-xs text-center" style={{ color: 'var(--fg-subtle)' }}>Only the host can change settings</p>}
              <Button fullWidth onClick={() => setShowAdvanced(false)}>Done</Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Fade toast for errors (e.g. game in progress, already online)
  const Toast = () => (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg pointer-events-none transition-opacity duration-500"
      style={{
        background: toastBg,
        zIndex: 200,
        opacity: toastVisible ? 1 : 0,
        border: `1px solid ${dangerBorder}`,
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
        <div className="relative min-h-screen flex flex-col max-w-md mx-auto px-6 py-8 gap-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: brand }}>
              Domain: {gameState.selectedCategory ? (CATEGORY_LABELS[gameState.selectedCategory as keyof typeof CATEGORY_LABELS] ?? gameState.selectedCategory) : ''}
            </p>
            <h1 className="text-2xl font-bold">Assignment</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Tap to reveal your role privately</p>
          </header>

          {!me?.hasSeenRole ? (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ marginTop: '-10vh' }}>
              {!roleRevealed ? (
                <button
                  onClick={() => setRoleRevealed(true)}
                  className="w-full rounded-2xl border-2 p-8 text-center active:scale-95 transition-all"
                  style={{ borderColor: brandBorderStrong, background: 'var(--bg-card)' }}
                >
                  <p className="text-4xl mb-3">📨</p>
                  <p className="text-xl font-bold">Tap to open</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Make sure nobody is watching</p>
                </button>
              ) : (
                <div className="w-full rounded-2xl border-2 p-6 text-center space-y-4"
                  style={me?.isImpostor
                    ? { borderColor: brandDarkBorder, background: brandSubtle }
                    : { borderColor: successBorder, background: successSubtle }}>
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>
                    Domain: {gameState.selectedCategory ? (CATEGORY_LABELS[gameState.selectedCategory as keyof typeof CATEGORY_LABELS] ?? gameState.selectedCategory) : ''}
                  </p>
                  {me?.isImpostor ? (
                    <>
                      <p className="text-3xl font-bold" style={{ color: brand }}>You are a Spy!</p>
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
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4" style={{ marginTop: '-20vh' }}>
              <p className="text-green-500 text-xl font-bold">✓ Ready</p>
              <p style={{ color: 'var(--fg-muted)' }}>
                {allReady ? 'All agents ready! Starting signal phase…' : `Waiting for others… (${gameState.players.filter(p => p.hasSeenRole).length}/${gameState.players.length})`}
              </p>
            </div>
          )}

          {isHost && (
            <button
              onClick={() => send({ type: 'FORCE_START' })}
              className="fixed flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-semibold"
              style={allReady
                ? { bottom: '1.5rem', right: '1rem', zIndex: 50, background: brand, border: `1px solid ${brand}`, color: '#fff' }
                : { bottom: '1.5rem', right: '1rem', zIndex: 50, background: 'transparent', border: '1.5px dashed var(--fg-subtle)', color: 'var(--fg-subtle)', opacity: 0.75 }}
            >{allReady ? 'Signal' : 'Continue anyways'} <ArrowRight size={14} /></button>
          )}
        </div>
        <StatusLights players={gameState.players} myId={myId} code={code}
          playerStatus={p => p.hasSeenRole ? 'done' : 'pending'} />
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { send({ type: 'LEAVE_GAME' }); localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); router.replace('/room') }} players={gameState.players} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} onMakeHost={(id) => send({ type: 'MAKE_HOST', playerId: id })} />
        <Toast />
      </>
    )
  }

  // ── GAME (Signal) ───────────────────────────────────────────────────────────
  if (phase === 'game') {
    const activePlayers = gameState.players.filter(p => !p.hasLeft)
    const startingPlayer = activePlayers.find(p => p.id === gameState.startingPlayerId)
      ?? activePlayers[0]
    return (
      <>
        <div className="relative min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
          <header className="mb-8 flex items-start justify-between pr-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: brand }}>
                Domain: {gameState.selectedCategory ? (CATEGORY_LABELS[gameState.selectedCategory as keyof typeof CATEGORY_LABELS] ?? gameState.selectedCategory) : ''}
              </p>
              <h1 className="text-2xl font-bold">Signal</h1>
            </div>
            <p className="text-3xl font-mono font-bold" style={{ color: brand }}>{formatTime(gameState.elapsedSeconds)}</p>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-2" style={{ marginTop: '-10vh' }}>
            <Speech size={52} color={brand} strokeWidth={1.5} />
            <p className="text-xl font-medium" style={{ color: 'var(--fg)' }}>
              Go around in a circle. Each agent gives one signal, without revealing the codeword!
            </p>
            <p className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              Starting with: {startingPlayer?.name}
            </p>
          </div>

          {isHost && (
            <button
              onClick={() => send({ type: 'SIGNAL_COMPLETE' })}
              className="fixed flex items-center gap-1.5 px-4 py-3 rounded-2xl text-lg font-semibold"
              style={{ bottom: '1.5rem', right: '1rem', zIndex: 50, background: brand, border: `1px solid ${brand}`, color: '#fff' }}
            >Debrief <ArrowRight size={18} /></button>
          )}
        </div>
        <StatusLights players={gameState.players} myId={myId} code={code} />
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { send({ type: 'LEAVE_GAME' }); localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); router.replace('/room') }} players={gameState.players} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} onMakeHost={(id) => send({ type: 'MAKE_HOST', playerId: id })} />
        <Toast />
      </>
    )
  }

  // ── DEBRIEF ─────────────────────────────────────────────────────────────────
  if (phase === 'debrief') {
    return (
      <>
        <div className="relative min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
          <header className="mb-8 flex items-start justify-between pr-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: brand }}>
                Domain: {gameState.selectedCategory ? (CATEGORY_LABELS[gameState.selectedCategory as keyof typeof CATEGORY_LABELS] ?? gameState.selectedCategory) : ''}
              </p>
              <h1 className="text-2xl font-bold">Debrief</h1>
            </div>
            <p className="text-3xl font-mono font-bold" style={{ color: brand }}>{formatTime(gameState.elapsedSeconds)}</p>
          </header>
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-2" style={{ marginTop: '-10vh' }}>
            <Search size={52} color={brand} strokeWidth={1.5} />
            <div className="space-y-3">
              <p className="text-xl" style={{ color: 'var(--fg)' }}>Discuss among each other</p>
              <p className="text-xl leading-relaxed" style={{ color: 'var(--fg-muted)' }}>Was anyone suspicious?</p>
              <p className="text-xl font-bold" style={{ color: 'var(--fg)' }}>When ready, proceed to voting.</p>
            </div>
          </div>
          {isHost && (
            <button
              onClick={() => send({ type: 'DEBRIEF_COMPLETE' })}
              className="fixed flex items-center gap-1.5 px-4 py-3 rounded-2xl text-lg font-semibold"
              style={{ bottom: '1.5rem', right: '1rem', zIndex: 50, background: brand, border: `1px solid ${brand}`, color: '#fff' }}
            >Voting <ArrowRight size={18} /></button>
          )}
        </div>
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { send({ type: 'LEAVE_GAME' }); localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); router.replace('/room') }} players={gameState.players} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} onMakeHost={(id) => send({ type: 'MAKE_HOST', playerId: id })} />
        <Toast />
      </>
    )
  }

  // ── VOTE ────────────────────────────────────────────────────────────────────
  if (phase === 'vote') {
    const hasVoted = me?.hasVoted ?? false

    function toggleSelect(id: string) {
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
        <div className="relative min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: brand }}>
              Domain: {gameState.selectedCategory ? (CATEGORY_LABELS[gameState.selectedCategory as keyof typeof CATEGORY_LABELS] ?? gameState.selectedCategory) : ''}
            </p>
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
              <div className="space-y-2">
                {gameState.players.map(player => {
                  const isSelected = selected.has(player.id)
                  return (
                    <button key={player.id}
                      onClick={() => toggleSelect(player.id)}
                      className="w-full flex items-center justify-between rounded-xl border px-4 py-3 min-h-[52px]"
                      style={isSelected
                        ? { borderColor: danger, background: dangerSubtle, color: dangerLight }
                        : { borderColor: 'var(--border)', background: 'var(--bg-elevated)', color: 'var(--fg)' }}
                    >
                      <span className="font-medium">{player.name}{player.id === myId ? ' (you)' : ''}</span>
                      {isSelected && <span className="text-red-400 text-lg">✓</span>}
                      {!isSelected && <div className="w-5 h-5 rounded border-2" style={{ borderColor: 'var(--fg-muted)' }} />}
                    </button>
                  )
                })}
                <button
                  onClick={confirmVote}
                  className="w-full rounded-xl px-4 py-3 min-h-[52px] text-sm font-semibold"
                  style={selected.size === 0
                    ? { background: brandDim, border: `1px solid ${brand}`, color: '#fff' }
                    : { background: brand, border: `1px solid ${brand}`, color: '#fff' }}
                >
                  {selected.size === 0 ? 'Abstain (no vote)' : `Flag ${selected.size} as spy${selected.size > 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4" style={{ marginTop: '-20vh' }}>
              <p className="text-green-500 text-xl font-bold">✓ Vote cast</p>
              <p style={{ color: 'var(--fg-muted)' }}>
                Waiting for others… ({gameState.players.filter(p => p.hasVoted).length}/{gameState.players.length})
              </p>
              {isHost && (() => {
                const allVoted = gameState.players.every(p => p.hasVoted)
                return (
                  <button
                    onClick={() => send({ type: 'FORCE_RESULTS' })}
                    className="fixed flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-semibold"
                    style={allVoted
                      ? { bottom: '1.5rem', right: '1rem', zIndex: 50, background: brand, border: `1px solid ${brand}`, color: '#fff' }
                      : { bottom: '1.5rem', right: '1rem', zIndex: 50, background: 'transparent', border: '1.5px dashed var(--fg-subtle)', color: 'var(--fg-subtle)', opacity: 0.75 }}
                  >{allVoted ? 'Results' : 'Continue anyways'} <ArrowRight size={14} /></button>
                )
              })()}
            </div>
          )}
        </div>
        <StatusLights players={gameState.players} myId={myId} code={code}
          playerStatus={p => p.hasVoted ? 'done' : 'pending'} />
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { send({ type: 'LEAVE_GAME' }); localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); router.replace('/room') }} players={gameState.players} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} onMakeHost={(id) => send({ type: 'MAKE_HOST', playerId: id })} />
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
        <GameMenuButton isHost={isHost} onReset={() => send({ type: 'RESET_GAME' })} onLeave={() => { send({ type: 'LEAVE_GAME' }); localStorage.removeItem(LS_NAME_KEY); localStorage.removeItem(LS_ROOM_KEY); router.replace('/room') }} players={gameState.players} onKick={(id) => send({ type: 'KICK_PLAYER', playerId: id })} onMakeHost={(id) => send({ type: 'MAKE_HOST', playerId: id })} />
        <Toast />
      </>
    )
  }

  return null
}

// ── Status lights ─────────────────────────────────────────────────────────────

function StatusLights({ players, myId, code, playerStatus }: {
  players: OnlinePlayer[]
  myId: string | null
  code: string
  playerStatus?: (p: OnlinePlayer) => 'done' | 'pending' | null
}) {
  return (
    <div className="fixed left-4 bottom-4 flex flex-col gap-1.5" style={{ zIndex: 40 }}>
      <span className="text-xs font-mono font-bold mb-0.5" style={{ color: brand, letterSpacing: '0.1em' }}>ROOM: {code}</span>
      {players.filter(p => !p.hasLeft).map(p => {
        const status = playerStatus?.(p) ?? null
        return (
          <div key={p.id} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.isConnected ? success : statusOffline }} />
            <span className="text-xs" style={{ color: p.id === myId ? 'var(--fg)' : 'var(--fg-subtle)', fontWeight: p.id === myId ? 600 : 400 }}>
              {p.name}{p.isHost ? ' ★' : ''}{p.id === myId ? ' (me)' : ''}
            </span>
            {status === 'done' && <span className="text-xs" style={{ color: success }}>✓</span>}
            {status === 'pending' && <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ background: 'var(--fg-subtle)', opacity: 0.4 }} />}
          </div>
        )
      })}
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
  const spiesSelfEliminated = spies.length > 0 && spies.every(p => p.hasLeft) && gameState.ballots.length === 0
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
    <div className="relative min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Outcome</h1>
      </header>

      <div className="text-center mb-4">
        <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-subtle)' }}>Codeword</p>
        <button onClick={() => setWordRevealed(!wordRevealed)}
          className="w-full rounded-xl border-2 flex items-center justify-center min-h-[60px]"
          style={wordRevealed
            ? { borderColor: brandDarkBorder, background: brandDarkFaint }
            : { borderStyle: 'dashed', borderColor: brandBorderStrong, background: 'var(--bg-elevated)' }}>
          {wordRevealed
            ? <span className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>{gameState.secretWord}</span>
            : <span className="text-lg font-semibold" style={{ color: 'var(--fg-muted)' }}>Tap to reveal</span>}
        </button>
      </div>

      {/* Laptop frame */}
      <div className="mb-6">
        <div className="rounded-t-xl rounded-b-md px-3 pt-3 pb-3" style={{
          background: theme === 'dark' ? frameDark : frameLight,
          boxShadow: theme === 'dark'
            ? '0 2px 16px rgba(131,131,131,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 2px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}>
          <div className="flex justify-center mb-2"><div className="w-1 h-1 rounded-full" style={{ background: theme === 'dark' ? '#333333' : '#b0b0b0' }} /></div>
          {spiesSelfEliminated ? (
            <div className="rounded-lg p-5 text-center" style={{ background: theme === 'dark' ? outcomeWinBgDark : outcomeWinBgLight, border: `3px solid ${outcomeWinBorder}`, boxShadow: `0 0 0 1px ${outcomeWinGlow}` }}>
              <p className="font-title text-3xl font-bold mb-3" style={{ color: 'var(--fg)' }}>Spies Self-Eliminated!</p>
              <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>The spies removed themselves from the game.</p>
              <p className="text-lg mt-2" style={{ color: 'var(--fg-muted)' }}>Spies: <span className="font-bold" style={{ color: 'var(--fg)' }}>{spies.map(p => p.name).join(', ')}</span></p>
            </div>
          ) : spiesCaught ? (
            <div className="rounded-lg p-5 text-center" style={{ background: theme === 'dark' ? outcomeWinBgDark : outcomeWinBgLight, border: `3px solid ${outcomeWinBorder}`, boxShadow: `0 0 0 1px ${outcomeWinGlow}` }}>
              <p className="font-title text-3xl font-bold mb-3" style={{ color: 'var(--fg)' }}>Spies Caught!</p>
              <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>One last chance for spies to guess the codeword!</p>
              <p className="text-lg mt-2" style={{ color: 'var(--fg-muted)' }}>Spies: <span className="font-bold" style={{ color: 'var(--fg)' }}>{spies.map(p => p.name).join(', ')}</span></p>
              <p className="text-lg mt-1" style={{ color: 'var(--fg-muted)' }}>Identified: <span className="font-bold" style={{ color: 'var(--fg)' }}>{eliminatedNames}</span></p>
            </div>
          ) : (
            <div className="rounded-lg p-5 text-center" style={{ background: theme === 'dark' ? outcomeLossBgDark : outcomeLossBgLight, border: `3px solid ${theme === 'dark' ? outcomeLossBorder : outcomeLossBorderLight}`, boxShadow: `0 0 0 1px ${theme === 'dark' ? outcomeLossGlow : outcomeLossGlow}` }}>
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
              ? { borderColor: successBorder, background: successSubtle }
              : { borderColor: dangerBorder, background: dangerFaint }
            : { borderColor: 'var(--border)', background: 'var(--bg-card)' }
          return (
            <div key={result.playerId} className="flex items-center justify-between rounded-xl border px-4 py-3" style={rowStyle}>
              <div className="flex items-center gap-3">
                <span className="text-base w-5" style={{ color: 'var(--fg-subtle)' }}>{rank + 1}.</span>
                <span className="font-medium">{player.name}{player.id === myId ? ' (you)' : ''}</span>
                {player.isImpostor && <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: spyBadgeBg, color: 'rgba(255,255,255,0.9)' }}>SPY</span>}
              </div>
              <span className="font-bold" style={{ color: result.votes > 0 ? 'var(--fg)' : 'var(--fg-subtle)' }}>
                {result.votes} vote{result.votes !== 1 ? 's' : ''}
              </span>
            </div>
          )
        })}
      </div>

      {isHost && (
        <button
          onClick={onReset}
          className="w-full py-4 rounded-xl text-base font-bold"
          style={{ background: brand, color: '#fff' }}
        >
          New Mission
        </button>
      )}
      {!isHost && <p className="text-center text-sm" style={{ color: 'var(--fg-muted)' }}>Waiting for host to start a new mission…</p>}
    </div>
  )
}

// ── Game menu button (leave / end game) ──────────────────────────────────────

function GameMenuButton({ isHost, onReset, onLeave, onDisband, players, onKick, onMakeHost }: {
  isHost: boolean
  onReset?: () => void
  onLeave: () => void
  onDisband?: () => void
  players?: OnlinePlayer[]
  onKick?: (id: string) => void
  onMakeHost?: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [kickOpen, setKickOpen] = useState(false)
  const nonHostPlayers = (players ?? []).filter(p => !p.isHost && !p.hasLeft)
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-8 right-4 w-9 h-9 flex items-center justify-center rounded-full"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', zIndex: 50, color: 'var(--fg-muted)' }}
        title="Game menu"
      >
        <Menu size={16} />
      </button>

      {open && !kickOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{ background: overlay, zIndex: 200 }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Game Menu</h2>
            <button
              onClick={() => toggleTheme()}
              className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4"
              style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
            >{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
            {isHost && nonHostPlayers.length > 0 && (
              <button
                onClick={() => setKickOpen(true)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4"
                style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
              >Manage Players</button>
            )}
            <button
              onClick={() => { setOpen(false); onLeave() }}
              className="w-full py-3 rounded-xl text-sm font-bold text-left px-4"
              style={{ background: dangerSubtle, color: danger }}
            >Leave Game</button>
            {isHost && onReset && (
              <button
                onClick={() => { setOpen(false); onReset() }}
                className="w-full py-3 rounded-xl text-sm font-bold text-left px-4"
                style={{ background: dangerSubtle, color: danger }}
              >End Game for All</button>
            )}
            {isHost && onDisband && (
              <button
                onClick={() => { setOpen(false); onDisband() }}
                className="w-full py-3 rounded-xl text-sm font-bold text-left px-4"
                style={{ background: dangerSubtle, color: danger }}
              >Disband Room</button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'transparent', color: 'var(--fg-subtle)' }}
            >Cancel</button>
          </div>
        </div>
      )}

      {kickOpen && (
        <div
          className="fixed inset-0 flex items-end justify-center pb-8"
          style={{ background: overlay, zIndex: 200 }}
          onClick={() => { setKickOpen(false); setOpen(false) }}
        >
          <div
            className="w-full max-w-md mx-4 rounded-2xl p-6 space-y-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Manage Players</h2>
            {nonHostPlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.isConnected ? success : statusOffline }} />
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {onMakeHost && (
                    <button
                      onClick={() => { onMakeHost(p.id); setKickOpen(false); setOpen(false) }}
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ background: brandSubtle, color: brand }}
                    >Make Host</button>
                  )}
                  {onKick && (
                    <button
                      onClick={() => { onKick(p.id); setKickOpen(false); setOpen(false) }}
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ background: dangerSubtle, color: danger }}
                    >Kick</button>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={() => setKickOpen(false)}
              className="w-full mt-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
            >Back</button>
          </div>
        </div>
      )}
    </>
  )
}


// ── Online setting row ────────────────────────────────────────────────────────

function OnlineSettingRow({ label, description, value, onChange, disabled }: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-subtle)' }}>{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className="relative inline-flex items-center rounded-full transition-colors flex-shrink-0"
        style={{ width: '44px', height: '24px', background: value ? toggleOn : toggleOff, opacity: disabled ? 0.5 : 1 }}
        aria-checked={value}
        role="switch"
      >
        <span
          className="inline-block rounded-full bg-white transition-transform"
          style={{ width: '18px', height: '18px', transform: value ? 'translateX(23px)' : 'translateX(3px)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
        />
      </button>
    </div>
  )
}
