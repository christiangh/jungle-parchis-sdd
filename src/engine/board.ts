// Board geometry and game material (specs/reglamento.md, section 1).

export type Color = 'yellow' | 'blue' | 'red' | 'green';

/** Turn order (R-010). */
export const COLORS: readonly Color[] = [];

export const PIECES_PER_PLAYER = 0;

export const DIE_FACES = 0;

export function isValidRoll(value: number): boolean {
  void value;
  return false;
}

export const TRACK_LENGTH = 0;

export const LANE_LENGTH = 0;

export const MAX_PIECES_PER_SQUARE = 0;

export const START_SQUARE: Readonly<Record<Color, number>> = {
  yellow: 0,
  blue: 0,
  red: 0,
  green: 0,
};

export const ENTRY_SQUARE: Readonly<Record<Color, number>> = {
  yellow: 0,
  blue: 0,
  red: 0,
  green: 0,
};

export const SAFE_SQUARES: readonly number[] = [];

export function isSafe(square: number): boolean {
  void square;
  return false;
}

export interface HomePosition {
  readonly kind: 'home';
}

/** Square of the common track, from 1 to TRACK_LENGTH. */
export interface TrackPosition {
  readonly kind: 'track';
  readonly square: number;
}

/** Square of the piece's own lane, from 1 to LANE_LENGTH. */
export interface LanePosition {
  readonly kind: 'lane';
  readonly square: number;
}

export interface GoalPosition {
  readonly kind: 'goal';
}

export type BoardPosition = TrackPosition | LanePosition | GoalPosition;

export type Position = HomePosition | BoardPosition;

export function capacity(position: BoardPosition): number {
  void position;
  return 0;
}

/** Next position one step ahead for a piece of the given color. */
export function stepForward(color: Color, position: TrackPosition | LanePosition): BoardPosition {
  void color;
  void position;
  return { kind: 'goal' };
}
