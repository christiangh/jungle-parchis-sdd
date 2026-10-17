// Legal moves for the pending roll of the player in turn.

import { BoardPosition, capacity, Color, START_SQUARE } from './board';
import { GameState, Piece, PieceId } from './game';

export interface Move {
  readonly pieceId: PieceId;
  readonly to: BoardPosition;
}

const EXIT_ROLL = 5;

export function legalMoves(state: GameState): readonly Move[] {
  const roll = state.pendingRoll;
  if (roll === null) {
    return [];
  }
  const exit = exitMove(state, roll);
  // R-021: leaving home is mandatory whenever it is possible.
  return exit ? [exit] : [];
}

/** R-020, R-022: one piece leaves home to its start square with a 5. */
function exitMove(state: GameState, roll: number): Move | null {
  const color = state.turn;
  const pieceAtHome = state.pieces.find(
    (piece) => piece.color === color && piece.position.kind === 'home',
  );
  const start: BoardPosition = { kind: 'track', square: START_SQUARE[color] };
  if (roll !== EXIT_ROLL || !pieceAtHome || !hasRoom(state.pieces, color, start)) {
    return null;
  }
  return { pieceId: pieceAtHome.id, to: start };
}

/** R-009, R-041: whether a piece of `color` may end its move on `position`. */
function hasRoom(pieces: readonly Piece[], color: Color, position: BoardPosition): boolean {
  const occupants = pieces.filter((piece) => isAt(piece, color, position)).length;
  return occupants < capacity(position);
}

/** Lane and goal squares are per color (R-007), so only pieces of `color` share them. */
function isAt(piece: Piece, color: Color, position: BoardPosition): boolean {
  const current = piece.position;
  switch (position.kind) {
    case 'track':
      return current.kind === 'track' && current.square === position.square;
    case 'lane':
      return piece.color === color && current.kind === 'lane' && current.square === position.square;
    case 'goal':
      return piece.color === color && current.kind === 'goal';
  }
}
