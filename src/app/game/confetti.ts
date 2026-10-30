import { Color } from '@engine';

/** One piece of confetti falling over the champion screen (RF-001). */
export interface ConfettiPiece {
  /** Horizontal position, in percent of the screen width. */
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly round: boolean;
  /** Background class of one of the team colours. */
  readonly color: string;
  /** Seconds of one fall. */
  readonly duration: number;
  /** Negative, in seconds, so the piece is already falling when the screen opens. */
  readonly delay: number;
}

/** Number of pieces, as in docs/design/avisos-y-campeon. */
export const CONFETTI_COUNT = 46;

/** Confetti colours of each team, as background classes of its tokens. */
export const CONFETTI_COLORS: Readonly<Record<Color, readonly string[]>> = {
  yellow: [
    'bg-team-yellow',
    'bg-mascot-gold',
    'bg-confetti-cream',
    'bg-white',
    'bg-mascot-jaguar-ochre',
  ],
  red: ['bg-team-red', 'bg-mascot-blush', 'bg-mascot-gold', 'bg-white', 'bg-confetti-red-dark'],
  blue: ['bg-team-blue', 'bg-mascot-water', 'bg-mascot-buoy', 'bg-white', 'bg-mascot-gold'],
  green: ['bg-team-green', 'bg-mascot-frog', 'bg-mascot-gold', 'bg-white', 'bg-team-red'],
};

/** Seed of the design's generator, so every game shows the same confetti. */
const SEED = 7;

/** Linear congruential generator of the design: numbers in [0, 1) from a seed. */
function random(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 9301 + 49297) % 233280;
    return current / 233280;
  };
}

/** Pieces of the winner's confetti, always the same for each team. */
export function confettiPieces(color: Color): readonly ConfettiPiece[] {
  const colors = CONFETTI_COLORS[color];
  const next = random(SEED);
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const width = 6 + next() * 7;
    const height = next() < 0.4 ? width : width * 0.45;
    const duration = 3.6 + next() * 3;
    const delay = -next() * duration;
    const left = next() * 100;
    const round = next() < 0.3;
    return { left, width, height, round, color: colors[i % colors.length], duration, delay };
  });
}
