// Legal moves for the pending roll of the player in turn.

import { barriers } from './barriers';
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
const SIX = 6;
const SIX_WITHOUT_PIECES_AT_HOME = 7;

export function legalMoves(state: GameState): readonly Move[] {
  // R-080: a bonus is used whole by a single piece on the board; pieces at home cannot use it.
  if (state.pendingBonus !== null) {
    return advanceMoves(state, state.pendingBonus);
  }
  const roll = state.pendingRoll;
  if (roll === null) {
    return [];
  }
  const exit = exitMove(state, roll);
  // R-021: leaving home is mandatory whenever it is possible.
  if (exit) {
    return [exit];
  }
  const moves = advanceMoves(state, rollSteps(state, roll));
  return roll === SIX ? openBarrier(state, moves) : moves;
}

/**
 * R-062: with a 6, a player with a barrier of their own colour must move one of its pieces,
 * as long as any of them can move. Mixed barriers on a safe square do not count.
 */
function openBarrier(state: GameState, moves: Move[]): Move[] {
  const barrierPieces = new Set(
    barriers(state)
      .filter((barrier) => barrier.pieces.every((id) => colorOf(state, id) === state.turn))
      .flatMap((barrier) => barrier.pieces),
  );
  const barrierMoves = moves.filter((move) => barrierPieces.has(move.pieceId));
  return barrierMoves.length > 0 ? barrierMoves : moves;
}

function colorOf(state: GameState, id: PieceId): Color | undefined {
  return state.pieces.find((piece) => piece.id === id)?.color;
}

/** R-031: a 6 counts as 7 when the player has no pieces at home; pieces at the goal do not count. */
function rollSteps(state: GameState, roll: number): number {
  const pieceAtHome = state.pieces.some(
    (piece) => piece.color === state.turn && piece.position.kind === 'home',
  );
  return roll === SIX && !pieceAtHome ? SIX_WITHOUT_PIECES_AT_HOME : roll;
}

function advanceMoves(state: GameState, steps: number): Move[] {
  return state.pieces
    .filter((piece) => piece.color === state.turn)
    .flatMap((piece) => {
      const move = advanceMove(state, piece, steps);
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

/**
 * R-013, R-040, R-050: a piece on the board moves forward exactly `roll` squares.
 * R-061: it cannot pass through a barrier, not even one of its own color.
 */
function advanceMove(state: GameState, piece: Piece, roll: number): Move | null {
  const from = piece.position;
  if (from.kind !== 'track' && from.kind !== 'lane') {
    return null;
  }
  const { to, passed } = advance(piece.color, from, roll);
  const blocked = barriers(state).map((barrier) => barrier.square);
  if (passed.some((square) => blocked.includes(square))) {
    return null;
  }
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

interface Walk {
  readonly to: BoardPosition;
  /** Track squares passed through, without the origin and the destination (R-061, R-063). */
  readonly passed: readonly number[];
}

/**
 * Walks `steps` squares forward.
 * R-071: steps left over at the goal go back down the lane, and at the first lane square they go
 * forward again, as many times as needed. Only ending on the goal counts as reaching it.
 */
function advance(color: Color, from: TrackPosition | LanePosition, steps: number): Walk {
  let position: BoardPosition = from;
  let backwards = false;
  const passed: number[] = [];
  for (let step = 0; step < steps; step++) {
    if (step > 0 && position.kind === 'track') {
      passed.push(position.square);
    }
    if (position.kind === 'goal') {
      backwards = true;
      position = { kind: 'lane', square: LANE_LENGTH };
    } else if (backwards && position.kind === 'lane' && position.square > 1) {
      position = { kind: 'lane', square: position.square - 1 };
    } else {
      backwards = false;
      position = stepForward(color, position);
    }
  }
  return { to: position, passed };
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
