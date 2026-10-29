import { Color, GameState } from '@engine';

/** What the turn banner says: whose color it is, what to do and the turn for screen readers. */
export interface Headline {
  readonly color: Color;
  /** Only the action: what the player in turn has to do, or who has won. */
  readonly action: string;
  /** Turn read by screen readers before the action, or `null` when the game is over. */
  readonly turn: string | null;
}

/** Banner text, derived only from the engine state (RF-009, RF-010, RNF-007). */
export function headline(state: GameState): Headline {
  return { color: state.turn, action: '', turn: null };
}
