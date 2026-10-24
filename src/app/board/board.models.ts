// Types of the jungle board geometry and of its view.

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

/** A wooden or painted plank: plain track squares and lane squares. */
export interface PlankView {
  readonly key: string;
  readonly square: number | null;
  readonly lane: Color | null;
  readonly step: number | null;
  readonly x: number;
  readonly y: number;
  readonly transform: string;
  readonly fill: string;
  readonly edge: string;
  readonly nail: string;
  /** Wash over the plank: a light or dark tint on wood, painted grain on lanes. */
  readonly overlay: string;
  readonly overlayOpacity: number;
}

/** Canopy of a safe square, painted in the team's dark tone on start squares. */
export interface SafeView {
  readonly square: number;
  readonly kind: 'safe' | 'start';
  readonly color: Color | null;
  readonly x: number;
  readonly y: number;
  readonly transform: string;
  readonly fill: string;
  readonly halo: string;
  readonly tufts: readonly TuftView[];
}

export interface GoalView extends Goal {
  readonly transform: string;
  readonly fill: string;
}

export interface HomeView extends Home {
  readonly fill: string;
}

/** Tones of a canopy, also used by leaves: the colour's dark, base and light shades. */
export type CanopyTone = 'dark' | 'base' | 'light';

/** A blade of the grass pattern; `tone` indexes the four blade colours. */
export interface GrassBlade {
  readonly path: string;
  readonly tone: number;
  readonly width: number;
}

/** A grain line of the wood pattern or of the grain painted over coloured wood. */
export interface GrainLine {
  readonly path: string;
  readonly width: number;
  readonly opacity: number;
  /** Only for painted grain: white instead of black. */
  readonly light: boolean;
}

/** Light or dark wash that makes each plank of the track slightly different. */
export interface PlankTint {
  readonly light: boolean;
  readonly opacity: number;
}

/** A blade of a safe square's canopy, in the square's local coordinates. */
export interface TuftBlade {
  readonly path: string;
  readonly tone: CanopyTone;
}

/** A corner leaf: `path` and `veins` are drawn at the origin and placed by `transform`. */
export interface Leaf {
  readonly length: number;
  readonly transform: string;
  readonly path: string;
  readonly veins: string;
  readonly tone: CanopyTone;
}

/** Random textures of the "claro" variant, drawn from one seed. */
export interface BoardDecor {
  readonly blades: readonly GrassBlade[];
  readonly grain: readonly GrainLine[];
  readonly paintGrain: readonly GrainLine[];
  readonly knots: readonly Point[];
  /** By plain track square number. */
  readonly tints: ReadonlyMap<number, PlankTint>;
  /** By safe or start square number. */
  readonly tufts: ReadonlyMap<number, readonly TuftBlade[]>;
  readonly leaves: readonly Leaf[];
}

export interface TuftView {
  readonly path: string;
  readonly fill: string;
}
