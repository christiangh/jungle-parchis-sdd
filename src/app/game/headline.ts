import { Color, GameState } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';

/** What the turn banner says: whose color it is, the current state and what to do. */
export interface Headline {
  readonly color: Color;
  readonly title: string;
  /** What the player has to do, or `null` when the game is over. */
  readonly instruction: string | null;
}

const ROLL = 'Toca el dado';
const CHOOSE_PIECE = 'Elige una ficha iluminada';

/** Banner text, derived only from the engine state (RF-004, RNF-005). */
export function headline(state: GameState): Headline {
  if (state.winner !== null) {
    return { color: state.winner, title: `Gana ${COLOR_NAMES[state.winner]}`, instruction: null };
  }
  const color = state.turn;
  const name = COLOR_NAMES[color];
  if (state.initialRoll !== null) {
    return { color, title: `Tirada inicial · ${name}`, instruction: ROLL };
  }
  if (state.pendingBonus !== null) {
    return { color, title: `Turno de ${name}`, instruction: `Usa tu +${state.pendingBonus}` };
  }
  if (state.pendingRoll !== null) {
    return { color, title: `Turno de ${name} · ${state.pendingRoll}`, instruction: CHOOSE_PIECE };
  }
  return { color, title: `Turno de ${name}`, instruction: ROLL };
}
