// Game state and game creation.

import { Color, COLORS, Position } from './board';

export type PieceId = `${Color}-${0 | 1 | 2 | 3}`;

export interface Piece {
  readonly id: PieceId;
  readonly color: Color;
  readonly position: Position;
}

/** Initial roll phase that decides who starts (R-010). */
export interface InitialRoll {
  /** Players still competing to start, in turn order. */
  readonly contenders: readonly Color[];
  /** Values rolled in the current round, in the order of `contenders`. */
  readonly rolls: readonly number[];
}

export interface GameState {
  /** Participating colors, in turn order (R-010). */
  readonly players: readonly Color[];
  readonly pieces: readonly Piece[];
  /** Player to move or, during the initial roll phase, to roll in the current round. */
  readonly turn: Color;
  readonly pendingRoll: number | null;
  /** Squares the player in turn must move with one piece before rolling again (R-051, R-072). */
  readonly pendingBonus: number | null;
  readonly winner: Color | null;
  /** Ids of all pieces, from the one that moved longest ago to the last one to move (R-023). */
  readonly arrivalOrder: readonly PieceId[];
  /** Sixes rolled one after another in the current turn, whether they moved or not (R-032). */
  readonly sixesInRow: number;
  /** Piece of the last move in the current turn, with a roll or a bonus (R-032). */
  readonly lastMovedPiece: PieceId | null;
  /** Initial roll phase, until a single player rolls the highest value of a round (R-010). */
  readonly initialRoll: InitialRoll | null;
}

export type Result<T, E> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export type CreateGameError = 'invalid-player-count' | 'duplicate-color';

export interface GameConfig {
  readonly players: readonly Color[];
}

const MIN_PLAYERS = 2;

const PIECE_INDEXES = [0, 1, 2, 3] as const;

export function createGame(config: GameConfig): Result<GameState, CreateGameError> {
  const { players } = config;
  if (players.length < MIN_PLAYERS || players.length > COLORS.length) {
    return { ok: false, error: 'invalid-player-count' };
  }
  if (new Set(players).size !== players.length) {
    return { ok: false, error: 'duplicate-color' };
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
      turn: turnOrder[0],
      pendingRoll: null,
      pendingBonus: null,
      winner: null,
      arrivalOrder: pieces.map((piece) => piece.id),
      sixesInRow: 0,
      lastMovedPiece: null,
      initialRoll: { contenders: turnOrder, rolls: [] },
    },
  };
}
