import { Color, GameEvent } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { pieceColor } from '../shared/piece-id';

/** Colour of a piece as an adjective, to agree with «ficha». */
const PIECE_COLORS: Readonly<Record<Color, string>> = {
  yellow: 'amarilla',
  blue: 'azul',
  red: 'roja',
  green: 'verde',
};

function names(colors: readonly Color[]): string {
  const all = colors.map((color) => COLOR_NAMES[color]);
  return all.length > 1 ? `${all.slice(0, -1).join(', ')} y ${all.at(-1)}` : all.join('');
}

/** Text of each kind of event, read only from the event itself (RF-006, RNF-005). */
function fragment(event: GameEvent): string {
  switch (event.type) {
    case 'initial-roll':
      return `${COLOR_NAMES[event.player]} saca ${event.value}`;
    case 'initial-roll-tie':
      return `empate entre ${names(event.players)}`;
    case 'first-player':
      return `empieza ${COLOR_NAMES[event.player]}`;
    case 'piece-left-home':
      return `${COLOR_NAMES[pieceColor(event.pieceId)]} saca una ficha de casa`;
    case 'piece-advanced':
      return `${COLOR_NAMES[pieceColor(event.pieceId)]} mueve una ficha`;
    case 'piece-captured':
      return `come una ficha ${PIECE_COLORS[pieceColor(event.pieceId)]}`;
    case 'piece-reached-goal':
      return 'llega a meta';
    case 'bonus-earned':
      return `cuenta ${event.amount}`;
    case 'bonus-lost':
      return `pierde el +${event.amount}`;
    case 'roll-lost':
      return `${COLOR_NAMES[event.player]} saca ${event.value} y pierde la tirada`;
    case 'roll-again':
      return `${COLOR_NAMES[event.player]} repite`;
    case 'three-sixes': {
      const sixes = `tres seises de ${COLOR_NAMES[event.player]}`;
      return event.pieceId === null ? sixes : `${sixes} y su ficha vuelve a casa`;
    }
    case 'turn-changed':
      return `turno de ${COLOR_NAMES[event.player]}`;
    case 'game-over':
      return `gana ${COLOR_NAMES[event.winner]}`;
  }
}

/** What the last play tab says: the team that acted and what happened, without naming it. */
export interface LastPlay {
  readonly color: Color;
  readonly text: string;
}

/** Longest sentence the tab can show, used to reserve its space (RNF-010). */
export const LONGEST_PLAY = '';

/**
 * Sentence of the last play tab: every event of the last action, in order, without the team that
 * acted nor the turn change (RF-011, RF-012).
 */
export function lastPlay(player: Color | null, events: readonly GameEvent[]): LastPlay | null {
  if (player === null || events.length === 0) {
    return null;
  }
  const sentence = events.map(fragment).join(', ');
  return { color: player, text: `${sentence[0].toUpperCase()}${sentence.slice(1)}.` };
}
