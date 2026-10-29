import { Color, GameEvent } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { pieceColor } from '../shared/piece-id';

function names(colors: readonly Color[]): string {
  const all = colors.map((color) => COLOR_NAMES[color]);
  return all.length > 1 ? `${all.slice(0, -1).join(', ')} y ${all.at(-1)}` : all.join('');
}

/**
 * Text of each kind of event, read only from the event itself, or `null` for the turn changes the
 * banner already shows (RF-012, RNF-007).
 */
function fragment(event: GameEvent): string | null {
  switch (event.type) {
    case 'initial-roll':
      return `saca ${event.value}`;
    case 'initial-roll-tie':
      return `empate entre ${names(event.players)}`;
    case 'first-player':
      return null;
    case 'piece-left-home':
      return 'saca una ficha de casa';
    case 'piece-advanced':
      return 'mueve una ficha';
    case 'piece-captured':
      return `se come una ficha de ${COLOR_NAMES[pieceColor(event.pieceId)]}`;
    case 'piece-reached-goal':
      return 'llega a la meta';
    case 'bonus-earned':
      return `cuenta ${event.amount}`;
    case 'bonus-lost':
      return `pierde el +${event.amount}`;
    case 'roll-lost':
      return `saca ${event.value} y pierde la tirada`;
    case 'roll-again':
      return 'repite';
    case 'three-sixes':
      return event.pieceId === null ? 'tres seises' : 'tres seises y su ficha vuelve a casa';
    case 'turn-changed':
      return null;
    case 'game-over':
      return 'gana la partida';
  }
}

/** What the last play tab says: the team that acted and what happened, without naming it. */
export interface LastPlay {
  readonly color: Color;
  readonly text: string;
}

/**
 * Longest sentence the tab can show, used to reserve its space (RNF-010): a capture with a 6 whose
 * bonus no piece can use, naming the longest team name.
 */
export const LONGEST_PLAY =
  'Mueve una ficha, se come una ficha de Amarillo, cuenta 20, pierde el +20, repite.';

/**
 * Sentence of the last play tab: every event of the last action, in order, without the team that
 * acted nor the turn change (RF-011, RF-012).
 */
export function lastPlay(player: Color | null, events: readonly GameEvent[]): LastPlay | null {
  const fragments = events.map(fragment).filter((text) => text !== null);
  if (player === null || fragments.length === 0) {
    return null;
  }
  const sentence = fragments.join(', ');
  return { color: player, text: `${sentence[0].toUpperCase()}${sentence.slice(1)}.` };
}
