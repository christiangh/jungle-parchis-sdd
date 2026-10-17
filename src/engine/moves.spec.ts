import { COLORS, START_SQUARE } from './board';
import { legalMoves } from './moves';
import { buildGame, track } from './test-utils';

describe('legalMoves: salida de casa', () => {
  it('R-020: con un 5 y todas en casa, el único movimiento es sacar una ficha a su salida', () => {
    const game = buildGame({ players: ['yellow', 'red'], turn: 'yellow', pendingRoll: 5 });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(5) }]);
  });

  it('R-020: sin un 5 no sale ninguna ficha de casa', () => {
    for (const roll of [1, 2, 3, 4, 6]) {
      const game = buildGame({ players: ['yellow', 'red'], turn: 'yellow', pendingRoll: roll });

      expect(legalMoves(game)).toEqual([]);
    }
  });

  it('R-020: cada color sale a su casilla de salida', () => {
    for (const color of COLORS) {
      const game = buildGame({ players: COLORS, turn: color, pendingRoll: 5 });

      expect(legalMoves(game)).toEqual([{ pieceId: `${color}-0`, to: track(START_SQUARE[color]) }]);
    }
  });

  it('R-021: con un 5, fichas en casa y salida libre, sacar ficha es obligatorio', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'yellow-0': track(20) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-1', to: track(5) }]);
  });

  it('RF-013 (provisional): sale con una sola ficha rival en la salida, sin comerla', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'red-0': track(5) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(5) }]);
  });
});
