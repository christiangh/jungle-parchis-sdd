// Helpers to build game states in engine tests. Pure TypeScript, not exported from index.ts.

import { Color, GoalPosition, HomePosition, LanePosition, Position, TrackPosition } from './board';
import { createGame, GameState, PieceId } from './game';

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
