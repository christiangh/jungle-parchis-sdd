import { Color, PieceId } from '@engine';
import { pieceColor, pieceIndex, pieceName } from './piece-id';

const PIECES: readonly [PieceId, Color, number, string][] = [
  ['yellow-0', 'yellow', 0, '1 de Amarillo'],
  ['yellow-1', 'yellow', 1, '2 de Amarillo'],
  ['yellow-2', 'yellow', 2, '3 de Amarillo'],
  ['yellow-3', 'yellow', 3, '4 de Amarillo'],
  ['blue-0', 'blue', 0, '1 de Azul'],
  ['blue-1', 'blue', 1, '2 de Azul'],
  ['blue-2', 'blue', 2, '3 de Azul'],
  ['blue-3', 'blue', 3, '4 de Azul'],
  ['red-0', 'red', 0, '1 de Rojo'],
  ['red-1', 'red', 1, '2 de Rojo'],
  ['red-2', 'red', 2, '3 de Rojo'],
  ['red-3', 'red', 3, '4 de Rojo'],
  ['green-0', 'green', 0, '1 de Verde'],
  ['green-1', 'green', 1, '2 de Verde'],
  ['green-2', 'green', 2, '3 de Verde'],
  ['green-3', 'green', 3, '4 de Verde'],
];

describe('piece-id', () => {
  it('RF-003: da el equipo de cada una de las 16 fichas', () => {
    expect(PIECES.map(([id]) => pieceColor(id))).toEqual(PIECES.map(([, color]) => color));
  });

  it('RF-003: da el hueco de cada ficha en su casa, de 0 a 3', () => {
    expect(PIECES.map(([id]) => pieceIndex(id))).toEqual(PIECES.map(([, , index]) => index));
  });

  it('RF-003: da el nombre de cada ficha, numerado desde 1 y con el nombre de su equipo', () => {
    expect(PIECES.map(([id]) => pieceName(id))).toEqual(PIECES.map(([, , , name]) => name));
  });
});
