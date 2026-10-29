import { Color, GameState } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';

/** What the turn banner says: whose color it is, what to do and the turn for screen readers. */
export interface Headline {
  readonly color: Color;
  /** Only the action: what the player in turn has to do, or who has won. */
  readonly action: string;
  /** Turn read by screen readers before the action, or `null` when the game is over. */
  readonly turn: string | null;
}

const ROLL = 'Toca el dado';
const CHOOSE_PIECE = 'Elige una ficha';

/** Banner text, derived only from the engine state (RF-009, RF-010, RNF-007). */
export function headline(state: GameState): Headline {
  if (state.winner !== null) {
    return { color: state.winner, action: `¡Gana ${COLOR_NAMES[state.winner]}!`, turn: null };
  }
  const color = state.turn;
  const name = COLOR_NAMES[color];
  if (state.initialRoll !== null) {
    return { color, action: ROLL, turn: `Tirada inicial, turno de ${name}.` };
  }
  const turn = `Turno de ${name}.`;
  if (state.pendingBonus !== null) {
    return { color, action: `Usa tu +${state.pendingBonus}`, turn };
  }
  if (state.pendingRoll !== null) {
    return { color, action: CHOOSE_PIECE, turn };
  }
  return { color, action: ROLL, turn };
}
