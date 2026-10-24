// Board geometry in SVG coordinates, ported from docs/design/tablero.
// What each square is (safe, start, entry, lane) comes only from the engine.

import {
  Color,
  COLORS,
  ENTRY_SQUARE,
  isSafe,
  LANE_LENGTH,
  START_SQUARE,
  TRACK_LENGTH,
} from '@engine';

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

/** The board has four arms; arm 0 is the bottom one and each next arm is a quarter turn. */
const ARMS = [0, 1, 2, 3] as const;

const SQUARES_PER_ARM = TRACK_LENGTH / ARMS.length;

const HOME_SLOT_OFFSET = 62;

/** Track squares of the bottom arm in local coordinates, numbered as in the design. */
const LOCAL_TRACK: readonly { number: number; x: number; y: number }[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    number: i + 1,
    x: 560,
    y: 680 + (7 - i) * SQUARE_WIDTH,
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    number: 60 + i,
    x: 320,
    y: 680 + i * SQUARE_WIDTH,
  })),
  { number: 68, x: 440, y: 680 + 7 * SQUARE_WIDTH },
];

const LANE_X = 440;

const GOAL_PATH = 'M323 683 L677 683 L500 506Z';

/** SVG rotation of an arm around the board centre, in degrees. */
function rotationOf(arm: number): number {
  return ((ARMS.length - arm) % ARMS.length) * 90;
}

/** Turns a point of the bottom arm into board coordinates of the given arm. */
function rotate(point: Point, arm: number): Point {
  let { x, y } = point;
  for (let i = 0; i < arm; i++) {
    [x, y] = [BOARD_CENTER.x + (y - BOARD_CENTER.y), BOARD_CENTER.y - (x - BOARD_CENTER.x)];
  }
  return { x, y };
}

/** Arm that holds a track square; square 60 is the first one of arm 0. */
function armOf(square: number): number {
  return Math.floor(((square - 60 + TRACK_LENGTH) % TRACK_LENGTH) / SQUARES_PER_ARM);
}

function numberIn(localNumber: number, arm: number): number {
  return ((localNumber - 1 + SQUARES_PER_ARM * arm) % TRACK_LENGTH) + 1;
}

function squareCenter(x: number, y: number): Point {
  return { x: x + SQUARE_LENGTH / 2, y: y + SQUARE_WIDTH / 2 };
}

export function trackSquares(): readonly TrackSquare[] {
  return ARMS.flatMap((arm) =>
    LOCAL_TRACK.map(({ number: localNumber, x, y }) => {
      const number = numberIn(localNumber, arm);
      const color = COLORS.find((c) => START_SQUARE[c] === number) ?? null;
      const kind: TrackSquareKind = color ? 'start' : isSafe(number) ? 'safe' : 'plain';
      return {
        number,
        kind,
        color,
        x,
        y,
        rotation: rotationOf(arm),
        center: rotate(squareCenter(x, y), arm),
      };
    }),
  );
}

export function laneSquares(): readonly LaneSquare[] {
  return COLORS.flatMap((color) => {
    const arm = armOf(ENTRY_SQUARE[color]);
    return Array.from({ length: LANE_LENGTH }, (_, i) => {
      const step = i + 1;
      const y = 680 + (LANE_LENGTH - step) * SQUARE_WIDTH;
      return {
        color,
        step,
        x: LANE_X,
        y,
        rotation: rotationOf(arm),
        center: rotate(squareCenter(LANE_X, y), arm),
      };
    });
  });
}

export function goals(): readonly Goal[] {
  return COLORS.map((color) => {
    const arm = armOf(ENTRY_SQUARE[color]);
    return {
      color,
      path: GOAL_PATH,
      rotation: rotationOf(arm),
      entry: rotate({ x: 500, y: 683 }, arm),
      center: rotate({ x: 500, y: 620 }, arm),
    };
  });
}

/** Each home sits in the corner next to its start square. */
export function homes(): readonly Home[] {
  const far = BOARD_SIZE - HOME_SIZE;
  return COLORS.map((color) => {
    const arm = armOf(START_SQUARE[color]);
    const corners = [
      { x: far, y: far },
      { x: BOARD_SIZE, y: BOARD_SIZE },
    ].map((corner) => rotate(corner, arm));
    const x = Math.min(...corners.map((c) => c.x));
    const y = Math.min(...corners.map((c) => c.y));
    const cx = x + HOME_SIZE / 2;
    const cy = y + HOME_SIZE / 2;
    const slots = [
      { x: cx - HOME_SLOT_OFFSET, y: cy - HOME_SLOT_OFFSET },
      { x: cx + HOME_SLOT_OFFSET, y: cy - HOME_SLOT_OFFSET },
      { x: cx - HOME_SLOT_OFFSET, y: cy + HOME_SLOT_OFFSET },
      { x: cx + HOME_SLOT_OFFSET, y: cy + HOME_SLOT_OFFSET },
    ];
    return { color, x, y, slots };
  });
}
