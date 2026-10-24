// Measures and Tailwind classes of the jungle board, from docs/design/tablero.

import { Color } from '@engine';
import { Point } from './board.models';

/** Long side of a track or lane square. */
export const SQUARE_LENGTH = 120;

/** Short side of a track or lane square. */
export const SQUARE_WIDTH = 40;

export const BOARD_SIZE = 1000;

export const BOARD_CENTER: Point = { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 };

export const HOME_SIZE = 320;

/** Gap between a home's corner and its painted square. */
export const HOME_INSET = 30;

// Full class names, so Tailwind finds them in the source.
export const TEAM_FILL: Readonly<Record<Color, string>> = {
  yellow: 'fill-team-yellow',
  blue: 'fill-team-blue',
  red: 'fill-team-red',
  green: 'fill-team-green',
};

export const TEAM_DARK_FILL: Readonly<Record<Color, string>> = {
  yellow: 'fill-team-yellow-dark',
  blue: 'fill-team-blue-dark',
  red: 'fill-team-red-dark',
  green: 'fill-team-green-dark',
};

export const TEAM_DARK_STROKE: Readonly<Record<Color, string>> = {
  yellow: 'stroke-team-yellow-dark',
  blue: 'stroke-team-blue-dark',
  red: 'stroke-team-red-dark',
  green: 'stroke-team-green-dark',
};
