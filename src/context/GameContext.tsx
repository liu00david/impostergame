'use client'

import React, { createContext, useContext, useReducer } from 'react'
import { GameState, Phase, Category, VoteBallot } from '@/types/game'
import { assignRoles, pickWord, pickStartingPlayer } from '@/lib/gameLogic'


type Action =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'SET_IMPOSTOR_COUNT'; count: 1 | 2 | 3 }
  | { type: 'SET_CATEGORY'; category: Category }
  | { type: 'START_GAME' }
  | { type: 'MARK_ROLE_SEEN'; id: string }
  | { type: 'ADVANCE_REVEAL' }
  | { type: 'CAST_VOTE'; ballot: VoteBallot }
  | { type: 'TICK_TIMER' }
  | { type: 'SET_LOOP_COMPLETE' }
  | { type: 'ADVANCE_TURN' }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'RESET_GAME' }
  | { type: 'CLEAR_PLAYERS' }

const initialState: GameState = {
  phase: 'setup',
  players: [],
  impostorCount: 1,
  selectedCategory: null,
  secretWord: null,
  startingPlayerIndex: 0,
  currentRevealIndex: 0,
  currentVoterIndex: 0,
  ballots: [],
  elapsedSeconds: 0,
  loopComplete: false,
  turnIndex: 0,
}


function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      if (state.players.length >= 12) return state
      const maxOrder = state.players.reduce((m, p) => Math.max(m, p.order), -1)
      return {
        ...state,
        players: [
          ...state.players,
          {
            id: crypto.randomUUID(),
            name: action.name.trim(),
            isImpostor: false,
            hasSeenRole: false,
            order: maxOrder + 1,
          },
        ],
      }
    }
    case 'REMOVE_PLAYER': {
      const remaining = state.players.filter(p => p.id !== action.id)
      const minForCurrent =
        state.impostorCount === 3 ? 7 : state.impostorCount === 2 ? 5 : 3
      const impostorCount =
        remaining.length < minForCurrent ? 1 : state.impostorCount
      return { ...state, players: remaining, impostorCount }
    }
    case 'SET_IMPOSTOR_COUNT': {
      return { ...state, impostorCount: action.count }
    }
    case 'SET_CATEGORY': {
      return { ...state, selectedCategory: action.category }
    }
    case 'START_GAME': {
      if (!state.selectedCategory) return state
      const playersWithRoles = assignRoles(state.players, state.impostorCount)
      const secretWord = pickWord(state.selectedCategory)
      const startingPlayerIndex = pickStartingPlayer(state.players.length)
      return {
        ...state,
        players: playersWithRoles,
        secretWord,
        startingPlayerIndex,
        currentRevealIndex: 0,
        currentVoterIndex: 0,
        ballots: [],
        elapsedSeconds: 0,
        loopComplete: false,
        turnIndex: 0,
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
    case 'ADVANCE_TURN': {
      const next = state.turnIndex + 1
      return {
        ...state,
        turnIndex: next,
        loopComplete: state.loopComplete || next >= state.players.length,
      }
    }
    case 'SET_PHASE': {
      return { ...state, phase: action.phase }
    }
    case 'CLEAR_PLAYERS': {
      return { ...state, players: [], impostorCount: 1 }
    }
    case 'RESET_GAME': {
      // Keep player names and settings; clear all in-game state.
      // Re-sort by insertion order so assignRoles always shuffles from a consistent baseline.
      const resetPlayers = [...state.players]
        .sort((a, b) => a.order - b.order)
        .map(p => ({ ...p, isImpostor: false, hasSeenRole: false }))
      return {
        ...initialState,
        impostorCount: state.impostorCount,
        selectedCategory: state.selectedCategory,
        players: resetPlayers,
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
