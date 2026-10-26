// What the board shows while the player chooses a move: highlights, the ghost of the
// selected piece at its destination and the touch areas. Built only from the engine's
// legal moves and state, so no rule is decided here (RNF-005).

import { Color, GameState, Move, PieceId } from '@engine';
import { Point } from './board-geometry';
import { PiecePlace } from './board-pieces';

/** `idle` when there is nothing to choose; otherwise each piece is movable or dimmed. */
export type PieceMode = 'idle' | 'highlighted' | 'selected' | 'dimmed';

export interface PiecePreview extends PiecePlace {
  readonly mode: PieceMode;
  /** Polygon that selects the piece, in board coordinates; null when it has no legal move. */
  readonly touchArea: readonly Point[] | null;
}

/** Bridge for a pair of the same colour, leaf for a rival sharing a safe square. */
export type PairKind = 'bridge' | 'leaf';

export interface PairMark {
  readonly kind: PairKind;
  readonly center: Point;
  readonly rotation: number;
}

/** Translucent copy of the selected piece where its move ends. */
export interface Ghost {
  readonly pieceId: PieceId;
  readonly color: Color;
  readonly center: Point;
  readonly touchArea: readonly Point[];
  readonly captures: boolean;
  readonly reachesGoal: boolean;
  readonly pair: PairMark | null;
}

export interface MovePreview {
  readonly pieces: readonly PiecePreview[];
  readonly ghost: Ghost | null;
}

export function movePreview(
  state: GameState,
  moves: readonly Move[],
  selected: PieceId | null,
): MovePreview {
  throw new Error(`Not implemented: ${state.turn} ${moves.length} ${selected}`);
}
