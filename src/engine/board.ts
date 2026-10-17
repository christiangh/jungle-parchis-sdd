// Board geometry and game material (specs/reglamento.md, section 1).

export type Color = 'yellow' | 'blue' | 'red' | 'green';

/** Turn order (R-010). */
export const COLORS: readonly Color[] = ['yellow', 'blue', 'red', 'green'];

export const PIECES_PER_PLAYER = 4;

export const DIE_FACES = 6;

export function isValidRoll(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= DIE_FACES;
}

export const TRACK_LENGTH = 68;

export const LANE_LENGTH = 7;

export const MAX_PIECES_PER_SQUARE = 2;

export const START_SQUARE: Readonly<Record<Color, number>> = {
  yellow: 5,
  blue: 22,
  red: 39,
  green: 56,
};

export const ENTRY_SQUARE: Readonly<Record<Color, number>> = {
  yellow: 68,
  blue: 17,
  red: 34,
  green: 51,
};

export const SAFE_SQUARES: readonly number[] = [5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68];

export function isSafe(square: number): boolean {
  return SAFE_SQUARES.includes(square);
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
  return position.kind === 'goal' ? Number.POSITIVE_INFINITY : MAX_PIECES_PER_SQUARE;
}

/** Next position one step ahead for a piece of the given color. */
export function stepForward(color: Color, position: TrackPosition | LanePosition): BoardPosition {
  if (position.kind === 'lane') {
    return position.square < LANE_LENGTH
      ? { kind: 'lane', square: position.square + 1 }
      : { kind: 'goal' };
  }
  if (position.square === ENTRY_SQUARE[color]) {
    return { kind: 'lane', square: 1 };
  }
  return { kind: 'track', square: (position.square % TRACK_LENGTH) + 1 };
}
