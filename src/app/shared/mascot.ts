import { Component, computed, input } from '@angular/core';
import { Color } from '@engine';

export type Animal = 'jaguar' | 'parrot' | 'hippo' | 'frog';

/** Mascot of each team (RF-004). */
export const MASCOTS: Readonly<Record<Color, Animal>> = {
  yellow: 'jaguar',
  red: 'parrot',
  blue: 'hippo',
  green: 'frog',
};

// The mascots are drawn in the units of docs/design/mascotas, inside a circle of this radius
// centred on (0, 3), the centre of the design's badge.
const DESIGN_RADIUS = 44;
const DESIGN_CENTER_Y = 3;

// Spotted rosette of the jaguar, with its dashed ring.
const JAGUAR_ROSETTES = (
  [
    [0, -22, 2.8],
    [-12, -19, 2.4],
    [12, -19, 2.4],
    [-27, 6, 2.2],
    [27, 6, 2.2],
  ] as const
).map(([x, y, r]) => ({ x, y, r, width: r * 0.42, dash: `${r * 1.6} ${r * 0.8}` }));

const HIPPO_EYES = [-11, 11].map((x) => ({
  lid: `M${x - 4.6} -15 Q${x} -9.5 ${x + 4.6} -15Z`,
  pupil: x + 0.6,
  line: `M${x - 5.4} -15.3 H${x + 5.4}`,
}));

const HIPPO_HANDS = [-15, 15].map((x) => ({
  x,
  fingers: `M${x - 2.6} 37.5 v2.6 M${x + 2.6} 37.5 v2.6`,
}));

const HIPPO_BUBBLES = [
  { x: -6, y: 36, r: 2.6, part: 'bubble-1' },
  { x: 6, y: 37, r: 2, part: 'bubble-2' },
  { x: 0, y: 38, r: 3.2, part: 'bubble-3' },
];

const FROG_SPOTS = [
  [-8, -2, 2.2],
  [9, -4, 1.8],
  [-24, 4, 1.6],
  [24, 6, 2],
  [2, -9, 1.4],
].map(([x, y, r]) => ({ x, y, r }));

// The right eye is the one that winks.
const FROG_EYES = [-16, 16].map((x) => ({
  x,
  winks: x > 0,
  pupil: x + 0.6,
  glint: x + 1.8,
  lid: `M${x - 8} -15 A8 8 0 0 1 ${x + 8} -15Z`,
  line: `M${x - 8.6} -15 H${x + 8.6}`,
}));

const FROG_HANDS = [-18, 18].map((x) => `translate(${x} 34)`);

let nextId = 0;

/**
 * Mascot of a team, drawn inside an SVG and clipped to a circle of `radius` centred on the origin.
 * Decorative: the piece or the text next to it says what it is. With `animated`, it plays its
 * loop only when the system allows motion (RF-004, RNF-002, RNF-003).
 */
@Component({
  selector: 'g[jp-mascot]',
  templateUrl: './mascot.html',
  styleUrl: './mascot.css',
  host: {
    'aria-hidden': 'true',
    '[attr.data-mascot]': 'animal()',
    '[attr.data-animated]': 'animated() || null',
  },
})
export class Mascot {
  readonly color = input.required<Color>();
  readonly radius = input.required<number>();
  readonly animated = input(false);

  protected readonly animal = computed(() => MASCOTS[this.color()]);
  protected readonly transform = computed(
    () => `scale(${this.radius() / DESIGN_RADIUS}) translate(0 ${-DESIGN_CENTER_Y})`,
  );

  // Unique ids: the board shows up to 17 mascots at once.
  private readonly id = `jp-mascot-${nextId++}`;
  protected readonly circleId = `${this.id}-circle`;
  protected readonly lensId = `${this.id}-lens`;
  protected readonly circleClip = `url(#${this.circleId})`;
  protected readonly lensClip = `url(#${this.lensId})`;

  protected readonly designRadius = DESIGN_RADIUS;
  protected readonly designCenterY = DESIGN_CENTER_Y;
  protected readonly jaguarRosettes = JAGUAR_ROSETTES;
  protected readonly hippoEyes = HIPPO_EYES;
  protected readonly hippoHands = HIPPO_HANDS;
  protected readonly hippoBubbles = HIPPO_BUBBLES;
  protected readonly frogSpots = FROG_SPOTS;
  protected readonly frogEyes = FROG_EYES;
  protected readonly frogHands = FROG_HANDS;
}
