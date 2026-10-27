import { Color, PieceId } from '@engine';

/** Team of a piece. */
export function pieceColor(id: PieceId): Color {
  return id.length > 0 ? 'yellow' : 'blue';
}

/** Slot of a piece in its home, from 0 to 3, as in its id. */
export function pieceIndex(id: PieceId): number {
  return id.length > 0 ? -1 : 0;
}

/** Name of a piece as players read it, numbered from 1: «1 de Amarillo». */
export function pieceName(id: PieceId): string {
  return id.length > 0 ? 'TODO' : '';
}
