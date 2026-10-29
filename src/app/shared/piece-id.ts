import { Color, PieceId } from '@engine';
import { COLOR_NAMES } from './color-names';

// The only place that splits a piece id (`yellow-0`) into its team and its slot (RF-003).

/** Team of a piece. */
export function pieceColor(id: PieceId): Color {
  return id.slice(0, id.indexOf('-')) as Color;
}

/** Slot of a piece in its home, from 0 to 3, as in its id. */
export function pieceIndex(id: PieceId): number {
  return Number(id.slice(id.indexOf('-') + 1));
}

/** Name of a piece as players read it, numbered from 1: «1 de Amarillo». */
export function pieceName(id: PieceId): string {
  return `${pieceIndex(id) + 1} de ${COLOR_NAMES[pieceColor(id)]}`;
}
