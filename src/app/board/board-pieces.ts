// Where each piece of an engine state is drawn on the board.
// Pure: the same state always gives the same points.

import { Color, GameState, PieceId, Position } from '@engine';
import { Point } from './board-geometry';

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

export const pieceCenter: (
  color: Color,
  position: Position,
  place: PlaceInPosition,
) => Point = () => ({ x: 0, y: 0 });

export const piecePlaces: (state: GameState) => readonly PiecePlace[] = () => [];
