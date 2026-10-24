// Types of the jungle board geometry.

import { Color } from '@engine';

export interface Point {
  readonly x: number;
  readonly y: number;
}

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
