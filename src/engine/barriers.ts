// Barriers on the common track (specs/reglamento.md, section 7).

import { isSafe } from './board';
import { GameState, Piece, PieceId } from './game';

export interface Barrier {
  /** Square of the common track, from 1 to TRACK_LENGTH. */
  readonly square: number;
  readonly pieces: readonly [PieceId, PieceId];
}

/** R-060: track squares with a barrier, in square order. */
export function barriers(state: GameState): readonly Barrier[] {
  const bySquare = new Map<number, Piece[]>();
  for (const piece of state.pieces) {
    if (piece.position.kind === 'track') {
      const square = piece.position.square;
      bySquare.set(square, [...(bySquare.get(square) ?? []), piece]);
    }
  }
  return [...bySquare]
    .filter(([square, pieces]) => isBarrier(square, pieces))
    .sort(([a], [b]) => a - b)
    .map(([square, [first, second]]) => ({ square, pieces: [first.id, second.id] }));
}

// R-063: lane squares never reach this check, only track squares do.
function isBarrier(square: number, pieces: readonly Piece[]): boolean {
  return pieces.length === 2 && (pieces[0].color === pieces[1].color || isSafe(square));
}
