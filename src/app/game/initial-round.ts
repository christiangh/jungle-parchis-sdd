import { Color, GameEvent } from '@engine';

/** One roll of the initial roll: the team that rolled and its value. */
export interface InitialRoundRoll {
  readonly color: Color;
  readonly value: number;
}

/**
 * Rolls of the current initial roll round, or of the one that just ended, in the order they were
 * made (SPEC 008 RF-014, RF-015). `tie` holds the tied teams when the round ended in a tie, and
 * `closed` tells whether the round has ended, by a tie or by the first player.
 */
export interface InitialRound {
  readonly rolls: readonly InitialRoundRoll[];
  readonly tie: readonly Color[] | null;
  readonly closed: boolean;
}

/** Longest round the tab can show, used to reserve its space (SPEC 008 RF-015). */
export const LONGEST_ROUND: InitialRound = { rolls: [], tie: null, closed: false };

/** Round after the events of one accepted action, or `null` outside the initial roll (RF-015). */
export function nextInitialRound(
  round: InitialRound | null,
  events: readonly GameEvent[],
): InitialRound | null {
  void events;
  return round;
}

/** Accessible text of the round, naming each team with its value (SPEC 008 RF-015, HU-06.6). */
export function initialRoundText(round: InitialRound): string {
  void round;
  return '';
}
