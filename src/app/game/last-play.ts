import { Color, GameEvent, PieceId } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';

/** Colour of a piece as an adjective, to agree with «ficha». */
const PIECE_COLORS: Readonly<Record<Color, string>> = {
  yellow: 'amarilla',
  blue: 'azul',
  red: 'roja',
  green: 'verde',
};

function colorOf(pieceId: PieceId): Color {
  return pieceId.split('-')[0] as Color;
}

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
      return `${COLOR_NAMES[colorOf(event.pieceId)]} saca una ficha de casa`;
    case 'piece-advanced':
      return `${COLOR_NAMES[colorOf(event.pieceId)]} mueve una ficha`;
    case 'piece-captured':
      return `come una ficha ${PIECE_COLORS[colorOf(event.pieceId)]}`;
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

/** Sentence of the last play line: every event of the last action, in order (RF-005, RF-006). */
export function lastPlay(events: readonly GameEvent[]): string {
  if (events.length === 0) {
    return '';
  }
  const sentence = events.map(fragment).join(', ');
  return `${sentence[0].toUpperCase()}${sentence.slice(1)}.`;
}
