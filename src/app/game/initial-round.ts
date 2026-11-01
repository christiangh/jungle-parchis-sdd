import { Color, COLORS, GameEvent } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { names } from './last-play';

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

const EMPTY_ROUND: InitialRound = { rolls: [], tie: null, closed: false };

/**
 * Longest round the tab can show, used to reserve its space (SPEC 008 RF-015): the four teams roll
 * the same value and tie.
 */
export const LONGEST_ROUND: InitialRound = {
  rolls: COLORS.map((color) => ({ color, value: 6 })),
  tie: COLORS,
  closed: true,
};

/**
 * Round after the events of one accepted action, or `null` outside the initial roll (RF-015). The
 * engine forgets the rolls of a round once it ends, so they are folded from its events: a roll on a
 * closed round starts a new one, and a tie or the first player closes it.
 */
export function nextInitialRound(
  round: InitialRound | null,
  events: readonly GameEvent[],
): InitialRound | null {
  if (!events.some(({ type }) => type === 'initial-roll')) {
    return null;
  }
  let next = round === null || round.closed ? EMPTY_ROUND : round;
  for (const event of events) {
    switch (event.type) {
      case 'initial-roll':
        next = { ...next, rolls: [...next.rolls, { color: event.player, value: event.value }] };
        break;
      case 'initial-roll-tie':
        next = { ...next, tie: event.players, closed: true };
        break;
      case 'first-player':
        next = { ...next, closed: true };
        break;
    }
  }
  return next;
}

/** Accessible text of the round, naming each team with its value (SPEC 008 RF-015, HU-06.6). */
export function initialRoundText(round: InitialRound): string {
  const rolls = round.rolls.map(({ color, value }) => `${COLOR_NAMES[color]} saca ${value}`);
  const tie = round.tie === null ? [] : [`empate entre ${names(round.tie)}`];
  return `${[...rolls, ...tie].join(', ')}.`;
}
