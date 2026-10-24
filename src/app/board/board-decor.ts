// Random textures of the "claro" variant, ported from docs/design/tablero.
// The generator and the order of its draws follow the design, so one seed always gives
// the same drawing.

import { Point, SQUARE_LENGTH, SQUARE_WIDTH, trackSquares } from './board-geometry';
import { CanopyTone } from './board-palette';

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

/** Seed of the design's generator for the "claro" variant: 'claro'.length * 977 + 13. */
export const DECOR_SEED = 4898;

const BLADE_COUNT = 90;
const BLADE_TONES = 4;
const GRASS_TILE = 110;

const GRAIN_LINES = 16;
const KNOT_COUNT = 4;

/** Horizontal offsets of the canopy tufts from the square's centre. */
const TUFTS = [-44, -27, -9, 9, 27, 44];
const BLADES_PER_TUFT = 5;
/** Back to front: tone and height factor of each row of tufts. */
const TUFT_ROWS: readonly (readonly [CanopyTone, number])[] = [
  ['dark', 1],
  ['base', 0.86],
  ['light', 0.62],
];

const LEAVES_PER_CORNER = 3;
const LEAF_TONES: readonly CanopyTone[] = ['dark', 'base', 'light'];
/** Corner and base angle of each group of leaves, clockwise from the top left. */
const LEAF_CORNERS: readonly (readonly [number, number, number])[] = [
  [-26, -26, 45],
  [1026, -26, 135],
  [1026, 1026, 225],
  [-26, 1026, 315],
];

/** Seeded generator of the design (mulberry32), with values in [0, 1). */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rounds to one decimal, as the design writes its coordinates. */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function grassBlades(next: () => number): GrassBlade[] {
  return Array.from({ length: BLADE_COUNT }, (_, i) => {
    const x = next() * GRASS_TILE;
    const y = next() * GRASS_TILE + 8;
    const height = 6 + next() * 9;
    const lean = (next() - 0.5) * 8;
    return {
      path: `M${round(x)} ${round(y)} q${round(lean / 2)} ${round(-height / 2)} ${round(lean)} ${round(-height)}`,
      tone: i % BLADE_TONES,
      width: round(1.3 + next() * 1.2),
    };
  });
}

function grainLines(next: () => number): { grain: GrainLine[]; paintGrain: GrainLine[] } {
  const grain: GrainLine[] = [];
  const paintGrain: GrainLine[] = [];
  for (let i = 0; i < GRAIN_LINES; i++) {
    const y = 3 + i * 7.4 + next() * 3;
    const wave = 1 + next() * 2.5;
    const path = `M0 ${round(y)} C90 ${round(y + wave)} 180 ${round(y - wave)} 270 ${round(y + wave * 0.5)} S360 ${round(y)} 360 ${round(y)}`;
    grain.push({
      path,
      width: round(0.6 + next() * 1.1),
      opacity: round(0.45 + next() * 0.45),
      light: false,
    });
    const light = next() >= 0.7;
    paintGrain.push({
      path,
      light,
      width: round(0.6 + next()),
      opacity: round(0.1 + next() * 0.12),
    });
  }
  return { grain, paintGrain };
}

function knots(next: () => number): Point[] {
  return Array.from({ length: KNOT_COUNT }, () => {
    const x = next() * 340 + 10;
    const y = next() * 110 + 5;
    return { x: round(x), y: round(y) };
  });
}

function plankTint(next: () => number): PlankTint {
  const light = next() >= 0.5;
  return { light, opacity: round(next() * 0.09) };
}

/** Canopy blades of the square whose top left corner is (x, y), back row first. */
function tuftBlades(next: () => number, x: number, y: number): TuftBlade[] {
  const centre = x + SQUARE_LENGTH / 2;
  const base = y + SQUARE_WIDTH - 5;
  const middle = (BLADES_PER_TUFT - 1) / 2;
  const half = 2;
  return TUFT_ROWS.flatMap(([tone, factor], row) =>
    TUFTS.flatMap((offset) =>
      Array.from({ length: BLADES_PER_TUFT }, (_, i) => {
        const bx = centre + offset + (i - middle) * 2.4 + (row - 1) * 3;
        const length = (SQUARE_WIDTH + 2 + next() * 10) * factor;
        const lean = (i - middle) * 4 + (next() - 0.5) * 6;
        const tipX = bx + lean;
        const tipY = base - length;
        return {
          path: `M${round(bx - half)} ${base} Q${round(bx + lean * 0.2)} ${round(base - length * 0.55)} ${round(tipX)} ${round(tipY)} Q${round(bx + lean * 0.35 + half)} ${round(base - length * 0.5)} ${round(bx + half)} ${base}Z`,
          tone,
        };
      }),
    ),
  );
}

function leaf(x: number, y: number, length: number, angle: number, tone: CanopyTone): Leaf {
  const width = length * 0.24;
  const ribs = [1, 2, 3, 4].map((i) => {
    const p = round(length * (0.18 + i * 0.16));
    const dx = round(length * 0.09);
    return `M${p} 0 l${dx} ${round(-width * 0.62)} M${p} 0 l${dx} ${round(width * 0.62)}`;
  });
  return {
    length,
    transform: `translate(${round(x)} ${round(y)}) rotate(${round(angle)})`,
    path: `M0 0 C${round(length * 0.22)} ${round(-width * 1.1)} ${round(length * 0.7)} ${round(-width * 1.05)} ${round(length)} 0 C${round(length * 0.7)} ${round(width * 1.05)} ${round(length * 0.22)} ${round(width * 1.1)} 0 0Z`,
    veins: [`M3 0 L${round(length * 0.94)} 0`, ...ribs].join(' '),
    tone,
  };
}

function cornerLeaves(next: () => number): Leaf[] {
  const middle = (LEAVES_PER_CORNER - 1) / 2;
  return LEAF_CORNERS.flatMap(([x, y, base], corner) =>
    Array.from({ length: LEAVES_PER_CORNER }, (_, i) => {
      const spread = (i - middle) * 24;
      const length = 120 + next() * 40 - Math.abs(spread) * 0.8;
      const tone = LEAF_TONES[(i + corner) % 3 === 2 ? 2 : i % 2];
      return leaf(x, y, length, base + spread, tone);
    }),
  );
}

export function boardDecor(seed = DECOR_SEED): BoardDecor {
  const next = random(seed);
  const blades = grassBlades(next);
  const { grain, paintGrain } = grainLines(next);
  const knotPoints = knots(next);
  const tints = new Map<number, PlankTint>();
  const tufts = new Map<number, readonly TuftBlade[]>();
  for (const square of trackSquares()) {
    if (square.kind === 'plain') {
      tints.set(square.number, plankTint(next));
    } else {
      tufts.set(square.number, tuftBlades(next, square.x, square.y));
    }
  }
  return {
    blades,
    grain,
    paintGrain,
    knots: knotPoints,
    tints,
    tufts,
    leaves: cornerLeaves(next),
  };
}
