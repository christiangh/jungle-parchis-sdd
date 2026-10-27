// Where each piece of an engine state is drawn on the board.
// Pure: the same state always gives the same points.

import { Color, GameState, Piece, PieceId, Position } from '@engine';
import { goals, homes, laneSquares, Point, trackSquares } from './board-geometry';
import { pieceIndex } from '../shared/piece-id';

/** Where a piece goes inside its position: its index there and how many pieces share it. */
export interface PlaceInPosition {
  readonly index: number;
  readonly count: number;
}

export interface PiecePlace {
  readonly id: PieceId;
  readonly color: Color;
  readonly center: Point;
}

/** Distance from a plank's centre to each piece of a pair, along the pair axis. */
const PAIR_OFFSET = 24;

const TRACK = new Map(trackSquares().map((s) => [s.number, s]));

const LANES = new Map(laneSquares().map((s) => [`${s.color}-${s.step}`, s]));

const HOME_SLOTS = new Map(homes().map((h) => [h.color, h.slots]));

const GOAL_SLOTS = new Map(goals().map((g) => [g.color, g.slots]));

export function pieceCenter(color: Color, position: Position, place: PlaceInPosition): Point {
  if (position.kind === 'home') {
    return HOME_SLOTS.get(color)![place.index];
  }
  if (position.kind === 'goal') {
    return GOAL_SLOTS.get(color)![place.index];
  }
  const plank =
    position.kind === 'track'
      ? TRACK.get(position.square)!
      : LANES.get(`${color}-${position.square}`)!;
  if (place.count === 1) {
    return plank.center;
  }
  const side = place.index === 0 ? PAIR_OFFSET : -PAIR_OFFSET;
  return {
    x: plank.center.x + side * plank.pairAxis.x,
    y: plank.center.y + side * plank.pairAxis.y,
  };
}

export function piecePlaces(state: GameState): readonly PiecePlace[] {
  const arrival = new Map(state.arrivalOrder.map((id, i) => [id, i]));
  const together = new Map<string, Piece[]>();
  for (const piece of state.pieces) {
    const key = positionKey(piece);
    together.set(key, [...(together.get(key) ?? []), piece]);
  }
  return state.pieces.map((piece) => {
    const shared = together.get(positionKey(piece))!;
    const index =
      piece.position.kind === 'home'
        ? pieceIndex(piece.id)
        : shared.filter((other) => arrival.get(other.id)! < arrival.get(piece.id)!).length;
    return {
      id: piece.id,
      color: piece.color,
      center: pieceCenter(piece.color, piece.position, { index, count: shared.length }),
    };
  });
}

/** Pieces with the same key share a place on the board: a square, a lane square, a home or a goal. */
function positionKey(piece: Piece): string {
  const { position } = piece;
  return position.kind === 'track'
    ? `track-${position.square}`
    : position.kind === 'lane'
      ? `lane-${piece.color}-${position.square}`
      : `${position.kind}-${piece.color}`;
}
