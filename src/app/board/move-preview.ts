// What the board shows while the player chooses a move: highlights, the ghost of the
// selected piece at its destination and the touch areas. Built only from the engine's
// legal moves and state, so no rule is decided here (RNF-005).

import { Color, GameState, Move, Piece, PieceId, Position } from '@engine';
import {
  goals,
  LaneSquare,
  laneSquares,
  plankCorners,
  Point,
  SQUARE_LENGTH,
  SQUARE_WIDTH,
  TrackSquare,
  trackSquares,
} from './board-geometry';
import { pieceCenter, PiecePlace, piecePlaces } from './board-pieces';

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

type Plank = TrackSquare | LaneSquare;

const ALONE = { index: 0, count: 1 };

/** Places in a pair, in order of arrival: the piece already there goes first. */
const FIRST_OF_PAIR = { index: 0, count: 2 };
const SECOND_OF_PAIR = { index: 1, count: 2 };

const TRACK = new Map(trackSquares().map((s) => [s.number, s]));

const LANES = new Map(laneSquares().map((s) => [`${s.color}-${s.step}`, s]));

const GOALS = new Map(goals().map((g) => [g.color, g]));

export function movePreview(
  state: GameState,
  moves: readonly Move[],
  selected: PieceId | null,
): MovePreview {
  const movable = new Set(moves.map((move) => move.pieceId));
  const move = moves.find((m) => m.pieceId === selected);
  const partner = move && partnerAt(state, move);
  const pieces = piecePlaces(state).map((place) => {
    const piece = pieceOf(state, place.id);
    const center =
      place.id === partner?.id
        ? pieceCenter(piece.color, piece.position, FIRST_OF_PAIR)
        : place.center;
    return {
      ...place,
      center,
      mode: modeOf(place.id, movable, move),
      touchArea: movable.has(place.id) ? touchArea(piece, center) : null,
    };
  });
  return { pieces, ghost: move ? ghostOf(state, move, partner) : null };
}

function modeOf(id: PieceId, movable: ReadonlySet<PieceId>, move: Move | undefined): PieceMode {
  if (movable.size === 0) {
    return 'idle';
  }
  if (id === move?.pieceId) {
    return 'selected';
  }
  return movable.has(id) ? 'highlighted' : 'dimmed';
}

/** Piece that stays on the destination square of a move, next to the moving piece. */
function partnerAt(state: GameState, move: Move): Piece | undefined {
  const { to } = move;
  if (to.kind === 'goal') {
    return undefined;
  }
  const mover = pieceOf(state, move.pieceId);
  return state.pieces.find(
    (piece) =>
      piece.id !== mover.id &&
      piece.id !== move.captures &&
      piece.position.kind === to.kind &&
      piece.position.square === to.square &&
      (to.kind === 'track' || piece.color === mover.color),
  );
}

function ghostOf(state: GameState, move: Move, partner: Piece | undefined): Ghost {
  const { color } = pieceOf(state, move.pieceId);
  const captures = move.captures !== undefined;
  if (move.to.kind === 'goal') {
    const arrived = state.pieces.filter(
      (piece) => piece.color === color && piece.position.kind === 'goal',
    ).length;
    return {
      pieceId: move.pieceId,
      color,
      center: pieceCenter(color, move.to, { index: arrived, count: arrived + 1 }),
      touchArea: GOALS.get(color)!.corners,
      captures,
      reachesGoal: true,
      pair: null,
    };
  }
  const plank = plankAt(color, move.to)!;
  const center = pieceCenter(color, move.to, partner ? SECOND_OF_PAIR : ALONE);
  return {
    pieceId: move.pieceId,
    color,
    center,
    touchArea: plankArea(plank, center),
    captures,
    reachesGoal: false,
    pair: partner
      ? {
          kind: partner.color === color ? 'bridge' : 'leaf',
          center: plank.center,
          rotation: plank.rotation,
        }
      : null,
  };
}

/** Only pieces at home or on a plank have legal moves. */
function touchArea(piece: Piece, center: Point): readonly Point[] {
  const plank = plankAt(piece.color, piece.position);
  return plank ? plankArea(plank, center) : homeArea(center);
}

/** The whole plank for a piece on its own, or the half of its side in a pair. */
function plankArea(plank: Plank, center: Point): readonly Point[] {
  const corners = plankCorners(plank);
  if (center.x === plank.center.x && center.y === plank.center.y) {
    return corners;
  }
  const [a, b, c, d] = corners;
  const top = midpoint(a, b);
  const bottom = midpoint(d, c);
  const halves = [
    [a, top, bottom, d],
    [top, b, c, bottom],
  ];
  const gap = (half: readonly Point[]): number => {
    const middle = midpoint(half[0], half[2]);
    return Math.hypot(middle.x - center.x, middle.y - center.y);
  };
  return gap(halves[0]) < gap(halves[1]) ? halves[0] : halves[1];
}

/** A plank-sized area around a home slot. */
function homeArea(center: Point): readonly Point[] {
  const left = center.x - SQUARE_LENGTH / 2;
  const right = center.x + SQUARE_LENGTH / 2;
  const top = center.y - SQUARE_WIDTH / 2;
  const bottom = center.y + SQUARE_WIDTH / 2;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}

function plankAt(color: Color, position: Position): Plank | undefined {
  if (position.kind === 'track') {
    return TRACK.get(position.square);
  }
  return position.kind === 'lane' ? LANES.get(`${color}-${position.square}`) : undefined;
}

function pieceOf(state: GameState, id: PieceId): Piece {
  return state.pieces.find((piece) => piece.id === id)!;
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
