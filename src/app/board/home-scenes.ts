// Scenes of the homes, variant `e` of docs/design/mascotas: a background for each team and a
// decoration under each slot (RF-006). Pure: the same call always gives the same drawing.

import { Color } from '@engine';
import { HOME_SIZE, homes, Point } from './board-geometry';

/** A shape drawn in local coordinates, with its Tailwind paint classes. */
export interface HomeShape {
  readonly path: string;
  readonly paint: string;
  /** Stroke width; 0 for shapes that are only filled. */
  readonly width: number;
  readonly opacity: number;
  /** Dash pattern of the stroke, drawn with butt caps; null for a solid stroke. */
  readonly dash: string | null;
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

const RED_LEAF = 'M0 0C10 -14 34 -14 44 0C34 14 10 14 0 0Z';

/** Leaves along the parrot's branch: offset from the home's centre and angle. */
const RED_LEAVES: readonly [number, number, number][] = [
  [-90, -38, -40],
  [-30, -30, 30],
  [40, 4, -30],
  [100, 4, 40],
  [-120, -10, 160],
];

const RED_TWIGS = [
  'fill-none stroke-home-red-twig-1',
  'fill-none stroke-home-red-twig-2',
  'fill-none stroke-home-red-twig-3',
  'fill-none stroke-home-red-twig-4',
] as const;

/** Stripes of the hippo's towel, left to right. */
const BLUE_STRIPES = [
  'fill-mascot-buoy',
  'fill-mascot-buoy-stripe',
  'fill-mascot-gold',
  'fill-mascot-buoy-stripe',
  'fill-mascot-buoy',
  'fill-mascot-buoy-stripe',
  'fill-home-blue-stripe',
  'fill-mascot-buoy-stripe',
] as const;

const YELLOW_STRAWS = [
  'fill-none stroke-home-yellow-straw-1',
  'fill-none stroke-home-yellow-straw-2',
  'fill-none stroke-home-yellow-straw-3',
  'fill-none stroke-home-yellow-straw-4',
  'fill-none stroke-home-yellow-straw-5',
] as const;

/** Rings of straws of the jaguar's nest, from the outside in. */
const YELLOW_STRAW_RINGS: readonly { count: number; radius: number }[] = [
  { count: 18, radius: 30 },
  { count: 14, radius: 21 },
  { count: 9, radius: 11 },
];

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function shape(path: string, paint: string, width = 0, opacity = 1, dash: string | null = null) {
  return { path, paint, width, opacity, dash };
}

function ellipse(cx: number, cy: number, rx: number, ry = rx): string {
  return `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
}

/** Rectangle with rounded corners: all of them, only the left ones or only the right ones. */
function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  corners: 'all' | 'left' | 'right' = 'all',
): string {
  const left = corners !== 'right' ? radius : 0;
  const right = corners !== 'left' ? radius : 0;
  const [x2, y2] = [x + width, y + height];
  return [
    `M${x + left} ${y}H${x2 - right}`,
    right ? `A${right} ${right} 0 0 1 ${x2} ${y + right}` : '',
    `V${y2 - right}`,
    right ? `A${right} ${right} 0 0 1 ${x2 - right} ${y2}` : '',
    `H${x + left}`,
    left ? `A${left} ${left} 0 0 1 ${x} ${y2 - left}` : '',
    `V${y + left}`,
    left ? `A${left} ${left} 0 0 1 ${x + left} ${y}` : '',
    'Z',
  ].join('');
}

/** A wave of `count` crests of 40 wide and `depth` high, from its left end. */
function wave(count: number, depth: number): string {
  return `M0 0q20 ${-depth} 40 0${' t40 0'.repeat(count - 1)}`;
}

function placed(at: Point, base: HomeShape, angle = 0): SceneShape {
  const transform = `translate(${at.x} ${at.y})` + (angle ? ` rotate(${angle})` : '');
  return { ...base, at, transform };
}

function scene(color: Color, center: Point): SceneShape[] {
  const { x: cx, y: cy } = center;
  switch (color) {
    case 'red':
      return [
        placed(
          { x: cx - 160, y: cy - 20 },
          shape('M0 0C100 -40 200 50 320 10', 'fill-none stroke-home-red-branch', 16, 0.55),
        ),
        ...RED_LEAVES.map(([x, y, angle]) =>
          placed({ x: cx + x, y: cy + y }, shape(RED_LEAF, 'fill-home-red-leaf', 0, 0.55), angle),
        ),
      ];
    case 'blue':
      return Array.from({ length: 7 }, (_, i) =>
        placed(
          { x: cx - 150, y: cy - 120 + i * 40 },
          shape(wave(8, 10), 'fill-none stroke-home-blue-wave', 3, 0.5),
        ),
      );
    case 'yellow':
      return Array.from({ length: 26 }, (_, i) => {
        const row = Math.floor(i / 6);
        const at = { x: cx - 130 + (i % 6) * 52 + (row % 2) * 26, y: cy - 120 + row * 56 };
        return [
          placed(at, shape(ellipse(0, 0, 9), 'fill-home-yellow-spot', 0, 0.45)),
          placed(
            at,
            shape(ellipse(0, 0, 9), 'fill-none stroke-home-yellow-nest-dark', 4, 0.45, '12 6'),
          ),
        ];
      }).flat();
    case 'green':
      return [
        ...[-30, 0, 30].map((x) =>
          placed(
            { x: cx + x, y: cy + 140 },
            shape(`M0 0q-4 -40 ${x / 3} -70`, 'fill-none stroke-home-green-reed', 4, 0.5),
          ),
        ),
        ...Array.from({ length: 5 }, (_, i) =>
          placed(
            { x: cx - 140, y: cy - 100 + i * 50 },
            shape(wave(7, 8), 'fill-none stroke-home-green-ripple', 2.4, 0.35),
          ),
        ),
      ];
  }
}

/** The parrot's nest of twigs, with a red feather. */
function redNest(): HomeShape[] {
  const twigs = [0, 1].flatMap((ring) =>
    Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + ring * 0.2;
      const [rx, ry] = ring ? [26, 23] : [32, 29];
      const [px, py] = [Math.cos(a) * rx, 2 + Math.sin(a) * ry];
      const ta = a + Math.PI / 2 + (i % 2 ? 0.35 : -0.35);
      const [dx, dy] = [Math.cos(ta) * 8, Math.sin(ta) * 8];
      return shape(
        `M${round(px - dx)} ${round(py - dy)}Q${round(px + 2)} ${round(py - 2)} ${round(px + dx)} ${round(py + dy)}`,
        RED_TWIGS[(i + ring) % RED_TWIGS.length],
        3,
      );
    }),
  );
  return [
    shape(ellipse(2, 6, 38, 34), 'fill-black', 0, 0.25),
    shape(ellipse(0, 2, 37, 33), 'fill-home-red-nest stroke-home-red-nest-dark', 2.5),
    shape(ellipse(0, 2, 24, 21), 'fill-home-red-nest-dark'),
    shape(ellipse(0, 4, 20, 16), 'fill-home-red-branch'),
    ...twigs,
    shape(
      'M22 -30C34 -40 44 -34 40 -26C34 -24 28 -26 22 -30Z',
      'fill-team-red stroke-home-red-nest-dark',
      1.6,
    ),
    shape('M22 -30L40 -30', 'fill-none stroke-home-red-nest-dark', 1),
  ];
}

/** The hippo's striped towel, with its fringe. */
function blueTowel(): HomeShape[] {
  const [x, y, width, height, radius] = [-36, -31, 72, 64, 8];
  const stripe = width / BLUE_STRIPES.length;
  const last = BLUE_STRIPES.length - 1;
  const fringe = Array.from({ length: 9 }, (_, i) => {
    const fx = -32 + i * 8;
    return `M${fx} ${y}v-5M${fx} ${y + height}v5`;
  }).join('');
  return [
    shape(rect(x + 2, y + 4, width, height, radius), 'fill-black', 0, 0.22),
    ...BLUE_STRIPES.map((paint, i) => {
      const corners = i === 0 ? 'left' : i === last ? 'right' : null;
      const sx = x + i * stripe;
      return shape(
        corners ? rect(sx, y, stripe, height, radius, corners) : rect(sx, y, stripe, height, 0),
        paint,
      );
    }),
    shape(
      rect(x + 1.5, y + 1.5, width - 3, height - 3, radius - 1.5),
      'fill-none stroke-black',
      3,
      0.08,
    ),
    shape(rect(x, y, width, height, radius), 'fill-none stroke-home-blue-towel-edge', 2.2),
    shape(fringe, 'fill-none stroke-mascot-buoy-stripe', 2),
  ];
}

/** The jaguar's straw nest; its straws turn a little with the slot's `x`. */
function yellowNest(slotX: number): HomeShape[] {
  const straws = YELLOW_STRAW_RINGS.flatMap(({ count, radius }, ring) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + ring * 0.4 + (slotX % 7) * 0.1;
      const half = (12 - ring * 2) / 2;
      const [px, py] = [Math.cos(a) * radius, Math.sin(a) * radius];
      const ta = a + Math.PI / 2 + 0.5;
      const [dx, dy] = [Math.cos(ta) * half, Math.sin(ta) * half];
      return shape(
        `M${round(px - dx)} ${round(py - dy)}L${round(px + dx)} ${round(py + dy)}`,
        YELLOW_STRAWS[(i + ring) % YELLOW_STRAWS.length],
        2.6,
      );
    }),
  );
  return [
    shape(ellipse(2, 4, 34), 'fill-black', 0, 0.2),
    shape(ellipse(0, 0, 34), 'fill-home-yellow-nest stroke-home-yellow-nest-dark', 2.5),
    ...straws,
    shape(ellipse(0, 0, 7), 'fill-home-yellow-nest-hole', 0, 0.5),
  ];
}

/** The frog's lily pad, with its notch, veins and shine. */
function greenPad(): HomeShape[] {
  return [
    shape('M2 4L40 -2A39 39 0 1 0 40 8Z', 'fill-black', 0, 0.22),
    shape('M0 0L39 -6A39 39 0 1 0 39 6Z', 'fill-home-green-pad stroke-home-green-reed', 3),
    shape(
      'M0 0L-26 -16M0 0L-28 12M0 0L4 30M0 0L8 -30M0 0L28 22',
      'fill-none stroke-home-green-reed',
      1.8,
      0.55,
    ),
    shape('M-22 -22A31 31 0 0 1 14 -28', 'fill-none stroke-home-green-pad-shine', 3, 0.6),
  ];
}

function slotDecor(color: Color, center: Point): SlotDecor {
  const { x, y } = center;
  const translate = `translate(${x} ${y})`;
  switch (color) {
    case 'red':
      return { center, transform: translate, shapes: redNest() };
    case 'blue':
      return {
        center,
        transform: `${translate} rotate(${(((x + y) % 3) - 1) * 8})`,
        shapes: blueTowel(),
      };
    case 'yellow':
      return { center, transform: translate, shapes: yellowNest(x) };
    case 'green':
      return {
        center,
        transform: `${translate} rotate(${(x * 7 + y * 3) % 360})`,
        shapes: greenPad(),
      };
  }
}

export function homeScenes(): readonly HomeScene[] {
  return homes().map((home) => {
    const center = { x: home.x + HOME_SIZE / 2, y: home.y + HOME_SIZE / 2 };
    return {
      color: home.color,
      scene: scene(home.color, center),
      slots: home.slots.map((slot) => slotDecor(home.color, slot)),
    };
  });
}
