// Barriers on the common track (specs/reglamento.md, section 7).

import { GameState, PieceId } from './game';

export interface Barrier {
  /** Square of the common track, from 1 to TRACK_LENGTH. */
  readonly square: number;
  readonly pieces: readonly [PieceId, PieceId];
}

/** R-060: track squares with a barrier, in square order. */
export function barriers(state: GameState): readonly Barrier[] {
  return [];
}
