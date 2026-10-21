import { barriers } from './barriers';
import { buildGame, deepFreeze, lane, track } from './test-utils';

describe('barriers', () => {
  it('R-060: dos fichas del mismo color en una casilla forman una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'red-0': track(14), 'red-1': track(14), 'yellow-0': track(20) },
    });

    expect(barriers(game)).toEqual([{ square: 14, pieces: ['red-0', 'red-1'] }]);
  });

  it('R-060: dos fichas del mismo color en un seguro forman una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(12), 'yellow-1': track(12) },
    });

    expect(barriers(game)).toEqual([{ square: 12, pieces: ['yellow-0', 'yellow-1'] }]);
  });

  it('R-060: dos fichas de distinto color en un seguro forman una barrera mixta', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(12), 'red-0': track(12) },
    });

    expect(barriers(game)).toEqual([{ square: 12, pieces: ['yellow-0', 'red-0'] }]);
  });

  it('R-060: una sola ficha no forma barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(12), 'red-0': track(14) },
    });

    expect(barriers(game)).toEqual([]);
  });

  it('R-060: devuelve todas las barreras en el orden de las casillas', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: {
        'red-0': track(40),
        'red-1': track(40),
        'yellow-0': track(12),
        'yellow-1': track(12),
      },
    });

    expect(barriers(game)).toEqual([
      { square: 12, pieces: ['yellow-0', 'yellow-1'] },
      { square: 40, pieces: ['red-0', 'red-1'] },
    ]);
  });

  it('R-063: dos fichas en la misma casilla del pasillo no forman barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': lane(3), 'yellow-1': lane(3) },
    });

    expect(barriers(game)).toEqual([]);
  });

  it('barriers no modifica el estado recibido', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'red-0': track(14), 'red-1': track(14) },
    });
    const snapshot = structuredClone(game);

    barriers(deepFreeze(game));

    expect(game).toEqual(snapshot);
  });
});
