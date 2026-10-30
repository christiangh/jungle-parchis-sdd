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
  yellow: [],
  red: [],
  blue: [],
  green: [],
};

/** Pieces of the winner's confetti, always the same for each team. */
export function confettiPieces(color: Color): readonly ConfettiPiece[] {
  void color;
  return [];
}
