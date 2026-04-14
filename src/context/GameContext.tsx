'use client'

import React, { createContext, useContext, useReducer } from 'react'
import { GameState, Phase, Category, VoteBallot, GameSettings } from '@/types/game'
import { assignRoles, pickWord, pickStartingPlayer, CATEGORIES } from '@/lib/gameLogic'
import { IMPOSTOR_MIN_PLAYERS } from '@/lib/constants'


type Action =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'TOGGLE_SPY_COUNT'; count: 1 | 2 | 3 }
  | { type: 'SET_CATEGORY'; category: Category }
  | { type: 'SET_RANDOM_CATEGORY' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'START_GAME' }
  | { type: 'MARK_ROLE_SEEN'; id: string }
  | { type: 'ADVANCE_REVEAL' }
  | { type: 'CAST_VOTE'; ballot: VoteBallot }
  | { type: 'TICK_TIMER' }
  | { type: 'SET_LOOP_COMPLETE' }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'RESET_GAME' }
  | { type: 'CLEAR_PLAYERS' }

const initialState: GameState = {
  phase: 'setup',
  players: [],
  impostorCount: 1,
  selectedCounts: [],
  selectedCategory: null,
  useRandomCategory: false,
  secretWord: null,
  startingPlayerIndex: 0,
  currentRevealIndex: 0,
  currentVoterIndex: 0,
  ballots: [],
  elapsedSeconds: 0,
  loopComplete: false,
  settings: {
    spiesKnowEachOther: true,
    spiesVoteCount: true,
    signalMode: 'interrogation',
  },
  interrogationPairs: [],
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeInterrogationPairs(names: string[]): [string, string][] {
  // Each person asks one question and answers one question.
  // Shuffle names, then pair i → i+1 (with wrap). This ensures every person
  // appears exactly once as asker and once as answerer.
  const shuffled = shuffle(names)
  return shuffled.map((name, i) => [name, shuffled[(i + 1) % shuffled.length]] as [string, string])
}


function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      if (state.players.length >= 12) return state
      const maxOrder = state.players.reduce((m, p) => Math.max(m, p.order), -1)
      const newPlayers = [
        ...state.players,
        {
          id: crypto.randomUUID(),
          name: action.name.trim(),
          isImpostor: false,
          hasSeenRole: false,
          order: maxOrder + 1,
        },
      ]
      // Auto-select 1 spy when player count first reaches 3 and nothing is selected yet
      const selectedCounts = state.selectedCounts.length === 0 && newPlayers.length === 3
        ? [1 as const]
        : state.selectedCounts
      return { ...state, players: newPlayers, selectedCounts }
    }
    case 'REMOVE_PLAYER': {
      const remaining = state.players.filter(p => p.id !== action.id)
      // Remove any selected counts that now require more players than we have
      const selectedCounts = state.selectedCounts.filter(
        c => remaining.length >= IMPOSTOR_MIN_PLAYERS[c]
      ) as (1 | 2 | 3)[]
      return { ...state, players: remaining, selectedCounts }
    }
    case 'TOGGLE_SPY_COUNT': {
      const { count } = action
      const already = state.selectedCounts.includes(count)
      const selectedCounts = already
        ? state.selectedCounts.filter(c => c !== count)
        : [...state.selectedCounts, count].sort() as (1 | 2 | 3)[]
      return { ...state, selectedCounts }
    }
    case 'SET_CATEGORY': {
      return { ...state, selectedCategory: action.category, useRandomCategory: false }
    }
    case 'SET_RANDOM_CATEGORY': {
      return { ...state, selectedCategory: 'Food', useRandomCategory: true } // placeholder; real pick at START_GAME
    }
    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.settings } }
    }
    case 'START_GAME': {
      if (!state.selectedCategory && !state.useRandomCategory) return state
      if (state.selectedCounts.length === 0) return state
      const category = state.useRandomCategory
        ? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
        : state.selectedCategory!
      // Pick actual spy count randomly from the selected options
      const impostorCount = state.selectedCounts[
        Math.floor(Math.random() * state.selectedCounts.length)
      ] as 1 | 2 | 3
      const playersWithRoles = assignRoles(state.players, impostorCount)
      const secretWord = pickWord(category)
      const startingPlayerIndex = pickStartingPlayer(state.players.length)
      const playerNames = state.players.map(p => p.name)
      const interrogationPairs = state.settings.signalMode === 'interrogation'
        ? makeInterrogationPairs(playerNames)
        : []
      return {
        ...state,
        impostorCount,
        players: playersWithRoles,
        secretWord,
        selectedCategory: category,
        startingPlayerIndex,
        currentRevealIndex: 0,
        currentVoterIndex: 0,
        ballots: [],
        elapsedSeconds: 0,
        loopComplete: false,
        interrogationPairs,
        phase: 'reveal',
      }
    }
    case 'MARK_ROLE_SEEN': {
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.id ? { ...p, hasSeenRole: true } : p
        ),
      }
    }
    case 'ADVANCE_REVEAL': {
      const nextIndex = state.currentRevealIndex + 1
      if (nextIndex >= state.players.length) {
        return { ...state, currentRevealIndex: nextIndex, phase: 'game' }
      }
      return { ...state, currentRevealIndex: nextIndex }
    }
    case 'CAST_VOTE': {
      const newBallots = [...state.ballots, action.ballot]
      const nextVoterIndex = state.currentVoterIndex + 1
      if (nextVoterIndex >= state.players.length) {
        return {
          ...state,
          ballots: newBallots,
          currentVoterIndex: nextVoterIndex,
          phase: 'results',
        }
      }
      return {
        ...state,
        ballots: newBallots,
        currentVoterIndex: nextVoterIndex,
      }
    }
    case 'TICK_TIMER': {
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 }
    }
    case 'SET_LOOP_COMPLETE': {
      return { ...state, loopComplete: true }
    }
    case 'SET_PHASE': {
      return { ...state, phase: action.phase }
    }
    case 'CLEAR_PLAYERS': {
      return { ...state, players: [], selectedCounts: [] }
    }
    case 'RESET_GAME': {
      // Keep player names and settings; clear all in-game state.
      // Re-sort by insertion order so assignRoles always shuffles from a consistent baseline.
      const resetPlayers = [...state.players]
        .sort((a, b) => a.order - b.order)
        .map(p => ({ ...p, isImpostor: false, hasSeenRole: false }))
      return {
        ...initialState,
        selectedCounts: state.selectedCounts,
        selectedCategory: state.useRandomCategory ? null : state.selectedCategory,
        useRandomCategory: state.useRandomCategory,
        players: resetPlayers,
        settings: state.settings,
      }
    }
    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<Action>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
