// Measures and Tailwind classes of the jungle board, from docs/design/tablero.

import { Color } from '@engine';
import { CanopyTone, Point } from './board.models';

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

export const TEAM_LIGHT_FILL: Readonly<Record<Color, string>> = {
  yellow: 'fill-team-yellow-light',
  blue: 'fill-team-blue-light',
  red: 'fill-team-red-light',
  green: 'fill-team-green-light',
};

/** Canopy of a plain safe square and of the corner leaves. */
export const CANOPY_FILL: Readonly<Record<CanopyTone, string>> = {
  dark: 'fill-canopy-dark',
  base: 'fill-canopy',
  light: 'fill-canopy-light',
};

/** Canopy of a start square, in its team's shades. */
export const TEAM_CANOPY_FILL: Readonly<Record<Color, Readonly<Record<CanopyTone, string>>>> = {
  yellow: { dark: TEAM_DARK_FILL.yellow, base: TEAM_FILL.yellow, light: TEAM_LIGHT_FILL.yellow },
  blue: { dark: TEAM_DARK_FILL.blue, base: TEAM_FILL.blue, light: TEAM_LIGHT_FILL.blue },
  red: { dark: TEAM_DARK_FILL.red, base: TEAM_FILL.red, light: TEAM_LIGHT_FILL.red },
  green: { dark: TEAM_DARK_FILL.green, base: TEAM_FILL.green, light: TEAM_LIGHT_FILL.green },
};

export const BLADE_STROKE: readonly string[] = [
  'stroke-blade-1',
  'stroke-blade-2',
  'stroke-blade-3',
  'stroke-blade-4',
];

/** Seed of the design's generator for the "claro" variant: 'claro'.length * 977 + 13. */
export const DECOR_SEED = 4898;
