// Helpers to build game states in engine tests. Pure TypeScript, not exported from index.ts.

import { Action, ActionError, applyAction, GameEvent } from './actions';
import {
  Color,
  DIE_FACES,
  GoalPosition,
  HomePosition,
  LanePosition,
  Position,
  TrackPosition,
} from './board';
import { createGame, GameState, PieceId } from './game';
import { legalMoves } from './moves';

export const HOME: HomePosition = { kind: 'home' };

export const GOAL: GoalPosition = { kind: 'goal' };

export const track = (square: number): TrackPosition => ({ kind: 'track', square });

export const lane = (square: number): LanePosition => ({ kind: 'lane', square });

export interface GameSetup {
  readonly players: readonly Color[];
  /** Defaults to the first color in `players`. */
  readonly turn?: Color;
  readonly pendingRoll?: number | null;
  /** Pieces not listed stay at home. */
  readonly positions?: Partial<Record<PieceId, Position>>;
}

export function buildGame(setup: GameSetup): GameState {
  const result = createGame({
    players: setup.players,
    firstPlayer: setup.turn ?? setup.players[0],
  });
  if (!result.ok) {
    throw new Error(`Invalid game setup: ${result.error}`);
  }
  const positions = setup.positions ?? {};
  return {
    ...result.value,
    pendingRoll: setup.pendingRoll ?? null,
    pieces: result.value.pieces.map((piece) => {
      const position = positions[piece.id];
      return position ? { ...piece, position } : piece;
    }),
  };
}

/** Reproducible die rolls from a seed (mulberry32), so random games can be replayed. */
export function seededRolls(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const random = ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
    return Math.floor(random * DIE_FACES) + 1;
  };
}

export interface PlayedGame {
  readonly actions: readonly Action[];
  /** The initial state followed by the state after each action. */
  readonly states: readonly GameState[];
  readonly events: readonly GameEvent[];
  /** Why the game stopped before having a winner, if it did. */
  readonly stopped: ActionError | 'too-many-actions' | null;
}

const MAX_ACTIONS = 20_000;

/**
 * Plays from `initial` until there is a winner, always choosing the first legal move. Stops early
 * on a rejected action or after MAX_ACTIONS, so a broken engine makes tests fail instead of hang.
 */
export function playRandomGame(initial: GameState, nextRoll: () => number): PlayedGame {
  const actions: Action[] = [];
  const states: GameState[] = [initial];
  const events: GameEvent[] = [];
  let state = initial;
  while (state.winner === null) {
    if (actions.length >= MAX_ACTIONS) {
      return { actions, states, events, stopped: 'too-many-actions' };
    }
    const action: Action =
      state.pendingRoll === null
        ? { type: 'roll', player: state.turn, value: nextRoll() }
        : { type: 'move', player: state.turn, pieceId: legalMoves(state)[0].pieceId };
    const result = applyAction(state, action);
    if (!result.ok) {
      return { actions, states, events, stopped: result.error };
    }
    actions.push(action);
    states.push(result.value.state);
    events.push(...result.value.events);
    state = result.value.state;
  }
  return { actions, states, events, stopped: null };
}

/** Freezes a value and everything reachable from it, so any mutation throws (P-03). */
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}
