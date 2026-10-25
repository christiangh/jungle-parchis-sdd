import { Color, GameState } from '@engine';

/** What the turn banner says: whose color it is, the current state and what to do. */
export interface Headline {
  readonly color: Color;
  readonly title: string;
  /** What the player has to do, or `null` when the game is over. */
  readonly instruction: string | null;
}

/** Banner text, derived only from the engine state (RF-004, RNF-005). */
export function headline(state: GameState): Headline {
  void state;
  return { color: 'yellow', title: '', instruction: null };
}
