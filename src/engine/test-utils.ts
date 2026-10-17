// Helpers to build game states in engine tests. Pure TypeScript, not exported from index.ts.

import { Action, ActionError, applyAction, GameEvent } from './actions';
import {
  Color,
  DIE_FACES,
  GoalPosition,
  HomePosition,
  LANE_LENGTH,
  LanePosition,
  MAX_PIECES_PER_SQUARE,
  PIECES_PER_PLAYER,
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

/** Reproducible numbers in [0, 1) from a seed (mulberry32), so random games can be replayed. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

/** Reproducible die rolls from a seed. */
export function seededRolls(seed: number): () => number {
  const random = seededRandom(seed);
  return () => Math.floor(random() * DIE_FACES) + 1;
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
 * Plays from `initial` until there is a winner. `pickMove` receives how many legal moves there are
 * and returns the index of the one to make; by default, the first. Stops early on a rejected action
 * or after MAX_ACTIONS, so a broken engine makes tests fail instead of hang.
 */
export function playRandomGame(
  initial: GameState,
  nextRoll: () => number,
  pickMove: (count: number) => number = () => 0,
): PlayedGame {
  const actions: Action[] = [];
  const states: GameState[] = [initial];
  const events: GameEvent[] = [];
  let state = initial;
  while (state.winner === null) {
    if (actions.length >= MAX_ACTIONS) {
      return { actions, states, events, stopped: 'too-many-actions' };
    }
    const moves = legalMoves(state);
    const action: Action =
      state.pendingRoll === null
        ? { type: 'roll', player: state.turn, value: nextRoll() }
        : { type: 'move', player: state.turn, pieceId: moves[pickMove(moves.length)].pieceId };
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

/** Invariants that can be checked on a single state; I-04 needs two states and I-06 an action. */
export type StateInvariant = 'I-01' | 'I-02' | 'I-03' | 'I-05';

/** Returns the invariants that `state` breaks, without repeats and in identifier order. */
export function invariantViolations(state: GameState): StateInvariant[] {
  const violations: StateInvariant[] = [];
  if (!hasAllPieces(state)) {
    violations.push('I-01');
  }
  if (hasOvercrowdedSquare(state)) {
    violations.push('I-02');
  }
  if (hasPieceOutsideLane(state)) {
    violations.push('I-03');
  }
  if (!hasPlayingTurnAndWinner(state)) {
    violations.push('I-05');
  }
  return violations;
}

/** I-04: returns the pieces at the goal in `before` that are no longer there in `after`. */
export function leftGoal(before: GameState, after: GameState): PieceId[] {
  return before.pieces
    .filter((piece) => piece.position.kind === 'goal')
    .filter(
      (piece) => after.pieces.find((other) => other.id === piece.id)?.position.kind !== 'goal',
    )
    .map((piece) => piece.id);
}

/** I-01: every player has exactly 4 pieces and no other color has any. */
function hasAllPieces(state: GameState): boolean {
  return (
    state.pieces.every((piece) => state.players.includes(piece.color)) &&
    state.players.every(
      (color) => state.pieces.filter((piece) => piece.color === color).length === PIECES_PER_PLAYER,
    )
  );
}

/** I-02: no track square, nor lane square of a color, holds more than 2 pieces. */
function hasOvercrowdedSquare(state: GameState): boolean {
  const counts = new Map<string, number>();
  for (const { color, position } of state.pieces) {
    const key =
      position.kind === 'track'
        ? `track-${position.square}`
        : position.kind === 'lane'
          ? `lane-${color}-${position.square}`
          : null;
    if (key !== null) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.values()].some((count) => count > MAX_PIECES_PER_SQUARE);
}

/** I-03: lane positions carry no color, so a piece is in its own lane if the square exists. */
function hasPieceOutsideLane(state: GameState): boolean {
  return state.pieces.some(
    ({ position }) =>
      position.kind === 'lane' &&
      !(
        Number.isInteger(position.square) &&
        position.square >= 1 &&
        position.square <= LANE_LENGTH
      ),
  );
}

/** I-05: the turn, and the winner if any, belong to playing colors. */
function hasPlayingTurnAndWinner(state: GameState): boolean {
  return (
    state.players.includes(state.turn) &&
    (state.winner === null || state.players.includes(state.winner))
  );
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
