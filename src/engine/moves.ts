// Legal moves for the pending roll of the player in turn.

import { BoardPosition } from './board';
import { GameState, PieceId } from './game';

export interface Move {
  readonly pieceId: PieceId;
  readonly to: BoardPosition;
}

export function legalMoves(state: GameState): readonly Move[] {
  void state;
  return [];
}
