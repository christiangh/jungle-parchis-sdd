// Scenes of the homes, variant `e` of docs/design/mascotas: a background for each team and a
// decoration under each slot (RF-006). Pure: the same call always gives the same drawing.

import { Color } from '@engine';
import { Point } from './board-geometry';

/** A shape drawn in local coordinates, with its Tailwind paint classes. */
export interface HomeShape {
  readonly path: string;
  readonly paint: string;
  readonly width: number;
  readonly opacity: number;
}

/** A shape of a home's background, placed with its local origin at `at`. */
export interface SceneShape extends HomeShape {
  readonly at: Point;
  readonly transform: string;
}

/** Decoration under a slot, drawn around its centre. */
export interface SlotDecor {
  readonly center: Point;
  readonly transform: string;
  readonly shapes: readonly HomeShape[];
}

export interface HomeScene {
  readonly color: Color;
  /** Drawn clipped to the home's painted square. */
  readonly scene: readonly SceneShape[];
  /** One per slot, in the order of the home's slots. */
  readonly slots: readonly SlotDecor[];
}

export function homeScenes(): readonly HomeScene[] {
  return [];
}
