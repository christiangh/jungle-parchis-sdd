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

/** Roll of the initial roll phase and its tie-breaks, told apart from a normal roll (SPEC 008 RF-013). */
const INITIAL_ROLL = `Tirada inicial: ${ROLL}`;

/** Longest action the banner can show, used to reserve its space (SPEC 008 RF-013). */
export const LONGEST_ACTION = INITIAL_ROLL;

/** Banner text, derived only from the engine state (RF-009, RF-010, RNF-007; SPEC 008 RF-013). */
export function headline(state: GameState): Headline {
  if (state.winner !== null) {
    return { color: state.winner, action: `¡Gana ${COLOR_NAMES[state.winner]}!`, turn: null };
  }
  const color = state.turn;
  const turn = `Turno de ${COLOR_NAMES[color]}.`;
  if (state.initialRoll !== null) {
    return { color, action: INITIAL_ROLL, turn };
  }
  if (state.pendingBonus !== null) {
    return { color, action: `Usa tu +${state.pendingBonus}`, turn };
  }
  if (state.pendingRoll !== null) {
    return { color, action: CHOOSE_PIECE, turn };
  }
  return { color, action: ROLL, turn };
}
