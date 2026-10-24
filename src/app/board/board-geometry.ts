// Board geometry in SVG coordinates, ported from docs/design/tablero.
// What each square is (safe, start, entry, lane) comes only from the engine.

import { Color } from '@engine';

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Long side of a track or lane square. */
export const SQUARE_LENGTH = 120;

/** Short side of a track or lane square. */
export const SQUARE_WIDTH = 40;

export const BOARD_SIZE = 1000;

export const BOARD_CENTER: Point = { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 };

export const HOME_SIZE = 320;

export type TrackSquareKind = 'plain' | 'safe' | 'start';

/**
 * Squares are drawn in the bottom arm's local coordinates (`x`, `y`) and turned
 * `rotation` degrees around the board centre. `center` is already in board coordinates.
 */
export interface TrackSquare {
  readonly number: number;
  readonly kind: TrackSquareKind;
  /** Team color of a start square; null otherwise. */
  readonly color: Color | null;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly center: Point;
}

export interface LaneSquare {
  readonly color: Color;
  /** From 1, next to the entry square, to LANE_LENGTH, next to the goal. */
  readonly step: number;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly center: Point;
}

export interface Goal {
  readonly color: Color;
  /** Triangle path in local coordinates, turned `rotation` degrees. */
  readonly path: string;
  readonly rotation: number;
  /** Midpoint of the triangle's base, where the lane ends. */
  readonly entry: Point;
  readonly center: Point;
}

export interface Home {
  readonly color: Color;
  readonly x: number;
  readonly y: number;
  readonly slots: readonly Point[];
}

export function trackSquares(): readonly TrackSquare[] {
  return [];
}

export function laneSquares(): readonly LaneSquare[] {
  return [];
}

export function goals(): readonly Goal[] {
  return [];
}

export function homes(): readonly Home[] {
  return [];
}
