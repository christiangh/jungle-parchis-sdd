// Game state and game creation.

import { Color, COLORS, Position } from './board';

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
  /** Ids of all pieces, from the one that moved longest ago to the last one to move (R-023). */
  readonly arrivalOrder: readonly PieceId[];
}

export type Result<T, E> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export type CreateGameError =
  'invalid-player-count' | 'duplicate-color' | 'first-player-not-playing';

export interface GameConfig {
  readonly players: readonly Color[];
  readonly firstPlayer: Color;
}

const MIN_PLAYERS = 2;

const PIECE_INDEXES = [0, 1, 2, 3] as const;

export function createGame(config: GameConfig): Result<GameState, CreateGameError> {
  const { players, firstPlayer } = config;
  if (players.length < MIN_PLAYERS || players.length > COLORS.length) {
    return { ok: false, error: 'invalid-player-count' };
  }
  if (new Set(players).size !== players.length) {
    return { ok: false, error: 'duplicate-color' };
  }
  if (!players.includes(firstPlayer)) {
    return { ok: false, error: 'first-player-not-playing' };
  }

  const turnOrder = COLORS.filter((color) => players.includes(color));
  const pieces = turnOrder.flatMap((color) =>
    PIECE_INDEXES.map((index): Piece => ({
      id: `${color}-${index}`,
      color,
      position: { kind: 'home' },
    })),
  );
  return {
    ok: true,
    value: {
      players: turnOrder,
      pieces,
      turn: firstPlayer,
      pendingRoll: null,
      winner: null,
      arrivalOrder: pieces.map((piece) => piece.id),
    },
  };
}
