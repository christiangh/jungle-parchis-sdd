// Game state and game creation.

import { Color, Position } from './board';

export type PieceId = `${Color}-${0 | 1 | 2 | 3}`;

export interface Piece {
  readonly id: PieceId;
  readonly color: Color;
  readonly position: Position;
}

export interface GameState {
  /** Participating colors, in turn order (R-010). */
  readonly players: readonly Color[];
  readonly pieces: readonly Piece[];
  readonly turn: Color;
  readonly pendingRoll: number | null;
  readonly winner: Color | null;
}

export type Result<T, E> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export type CreateGameError =
  'invalid-player-count' | 'duplicate-color' | 'first-player-not-playing';

export interface GameConfig {
  readonly players: readonly Color[];
  readonly firstPlayer: Color;
}

export function createGame(config: GameConfig): Result<GameState, CreateGameError> {
  return {
    ok: true,
    value: { players: [], pieces: [], turn: config.firstPlayer, pendingRoll: null, winner: null },
  };
}
