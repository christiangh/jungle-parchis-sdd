// Legal moves for the pending roll of the player in turn.

import {
  BoardPosition,
  capacity,
  Color,
  isSafe,
  LANE_LENGTH,
  LanePosition,
  MAX_PIECES_PER_SQUARE,
  START_SQUARE,
  stepForward,
  TrackPosition,
} from './board';
import { GameState, Piece, PieceId } from './game';

export interface Move {
  readonly pieceId: PieceId;
  readonly to: BoardPosition;
  /** Rival piece sent home by this move, if any (R-023, R-050). */
  readonly captures?: PieceId;
}

const EXIT_ROLL = 5;

export function legalMoves(state: GameState): readonly Move[] {
  const roll = state.pendingRoll;
  if (roll === null) {
    return [];
  }
  const exit = exitMove(state, roll);
  // R-021: leaving home is mandatory whenever it is possible.
  if (exit) {
    return [exit];
  }
  return state.pieces
    .filter((piece) => piece.color === state.turn)
    .flatMap((piece) => {
      const move = advanceMove(state, piece, roll);
      return move ? [move] : [];
    });
}

/**
 * R-020, R-022, R-023: one piece leaves home to its start square with a 5. Only two own pieces
 * block it; otherwise it captures the rival that arrived last, even on a safe square.
 */
function exitMove(state: GameState, roll: number): Move | null {
  const color = state.turn;
  const pieceAtHome = state.pieces.find(
    (piece) => piece.color === color && piece.position.kind === 'home',
  );
  if (roll !== EXIT_ROLL || !pieceAtHome) {
    return null;
  }
  const start: TrackPosition = { kind: 'track', square: START_SQUARE[color] };
  const occupants = state.pieces.filter((piece) => isAt(piece, color, start));
  const own = occupants.filter((piece) => piece.color === color);
  if (own.length >= MAX_PIECES_PER_SQUARE) {
    return null;
  }
  const rivals = occupants.filter((piece) => piece.color !== color);
  return withCapture(pieceAtHome, start, lastArrived(state, rivals));
}

/** R-013, R-040, R-050: a piece on the board moves forward exactly `roll` squares. */
function advanceMove(state: GameState, piece: Piece, roll: number): Move | null {
  const from = piece.position;
  if (from.kind !== 'track' && from.kind !== 'lane') {
    return null;
  }
  const to = advance(piece.color, from, roll);
  if (!hasRoom(state.pieces, piece, to)) {
    return null;
  }
  return withCapture(piece, to, capturedOnTrack(state.pieces, piece, to));
}

/** R-050, R-052: a single rival on a track square that is not safe is captured. */
function capturedOnTrack(
  pieces: readonly Piece[],
  mover: Piece,
  to: BoardPosition,
): Piece | undefined {
  if (to.kind !== 'track' || isSafe(to.square)) {
    return undefined;
  }
  const others = pieces.filter((piece) => piece.id !== mover.id && isAt(piece, mover.color, to));
  return others.length === 1 && others[0].color !== mover.color ? others[0] : undefined;
}

/** R-023: of several pieces, the one that moved last according to `arrivalOrder`. */
function lastArrived(state: GameState, pieces: readonly Piece[]): Piece | undefined {
  const order = (piece: Piece): number => state.arrivalOrder.indexOf(piece.id);
  return pieces.reduce<Piece | undefined>(
    (last, piece) => (last === undefined || order(piece) > order(last) ? piece : last),
    undefined,
  );
}

/** Leaves `captures` out when nothing is captured, so moves without a capture keep their shape. */
function withCapture(piece: Piece, to: BoardPosition, captured: Piece | undefined): Move {
  return captured ? { pieceId: piece.id, to, captures: captured.id } : { pieceId: piece.id, to };
}

/**
 * Walks `steps` squares forward. Squares passed through are not checked (RF-012, provisional).
 * R-071: steps left over at the goal go back down the lane. A single bounce is enough, since a
 * die roll leaves at most 5 steps over (from the last lane square with a 6).
 */
function advance(color: Color, from: TrackPosition | LanePosition, steps: number): BoardPosition {
  let position: BoardPosition = from;
  for (let step = 0; step < steps; step++) {
    if (position.kind === 'goal') {
      return { kind: 'lane', square: LANE_LENGTH + 1 - (steps - step) };
    }
    position = stepForward(color, position);
  }
  return position;
}

/**
 * R-009, R-041: whether `mover` may end its move on `position`. The mover itself is not counted,
 * and a single rival does not block it, since it is captured (R-050) or shares a safe square
 * (R-052). Leaving home has its own check (R-023).
 */
function hasRoom(pieces: readonly Piece[], mover: Piece, position: BoardPosition): boolean {
  const occupants = pieces.filter(
    (piece) => piece.id !== mover.id && isAt(piece, mover.color, position),
  ).length;
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
