import { COLORS, START_SQUARE } from './board';
import { legalMoves } from './moves';
import { buildGame, deepFreeze, GOAL, lane, track } from './test-utils';

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

describe('legalMoves: salida bloqueada', () => {
  it('R-022: con 2 fichas propias en la salida no se sale y se mueve otra ficha', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'yellow-0': track(5), 'yellow-1': track(5) },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-0', to: track(10) },
      { pieceId: 'yellow-1', to: track(10) },
    ]);
  });

  it('R-022 (provisional RF-008): no se sale con una ficha propia y una rival en la salida', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'yellow-0': track(5), 'red-0': track(5), 'yellow-2': track(30) },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-0', to: track(10) },
      { pieceId: 'yellow-2', to: track(35) },
    ]);
  });
});

describe('legalMoves: avance', () => {
  it('R-013: verde en la 66 con un 5 termina en la 3', () => {
    const game = buildGame({
      players: ['yellow', 'green'],
      turn: 'green',
      pendingRoll: 5,
      positions: { 'green-0': track(66), 'green-1': GOAL, 'green-2': GOAL, 'green-3': GOAL },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'green-0', to: track(3) }]);
  });

  it('R-008: amarillo en la 66 con un 4 termina en la segunda casilla de su pasillo', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(66) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: lane(2) }]);
  });

  it('R-008: azul en la 66 con un 4 sigue por el recorrido común hasta la 2', () => {
    const game = buildGame({
      players: ['blue', 'red'],
      turn: 'blue',
      pendingRoll: 4,
      positions: { 'blue-0': track(66) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'blue-0', to: track(2) }]);
  });

  it('R-040: avanza siempre hacia delante el número exacto de casillas', () => {
    for (const roll of [1, 2, 3, 4, 5, 6]) {
      const game = buildGame({
        players: ['yellow', 'red'],
        turn: 'yellow',
        pendingRoll: roll,
        positions: { 'yellow-0': track(10), 'yellow-1': GOAL, 'yellow-2': GOAL, 'yellow-3': GOAL },
      });

      expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(10 + roll) }]);
    }
  });

  it('R-041: no se termina en una casilla del recorrido con 2 fichas', () => {
    const rivals = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(20),
        'red-0': track(13),
        'red-1': track(13),
      },
    });
    const own = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10), 'yellow-1': track(13), 'yellow-2': track(13) },
    });

    expect(legalMoves(rivals)).toEqual([{ pieceId: 'yellow-1', to: track(23) }]);
    expect(legalMoves(own)).toEqual([
      { pieceId: 'yellow-1', to: track(16) },
      { pieceId: 'yellow-2', to: track(16) },
    ]);
  });

  it('R-041: no se termina en una casilla del pasillo con 2 fichas', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(66), 'yellow-1': lane(2), 'yellow-2': lane(2) },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-1', to: lane(6) },
      { pieceId: 'yellow-2', to: lane(6) },
    ]);
  });

  it('R-041: las fichas del pasillo de otro color no ocupan el propio', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(66), 'red-0': lane(2), 'red-1': lane(2) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: lane(2) }]);
  });

  it('R-041: sin movimientos si la única ficha en juego tiene el destino lleno', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10), 'red-0': track(13), 'red-1': track(13) },
    });

    expect(legalMoves(game)).toEqual([]);
  });

  it('RF-012 (provisional): atraviesa una casilla con 2 fichas', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'red-0': track(12), 'red-1': track(12) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(14) }]);
  });

  it('RF-013 (provisional): termina junto a una sola ficha rival fuera de un seguro', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'red-0': track(14) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(14) }]);
  });
});

describe('legalMoves: consulta', () => {
  it('HU-06: devuelve cada ficha movible con su casilla de destino', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 2,
      positions: { 'yellow-0': track(10), 'yellow-1': lane(3), 'yellow-3': GOAL },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-0', to: track(12) },
      { pieceId: 'yellow-1', to: lane(5) },
    ]);
  });

  it('HU-06: una ficha en meta nunca aparece entre los movimientos legales', () => {
    for (const roll of [1, 2, 3, 4, 5, 6]) {
      const game = buildGame({
        players: ['yellow', 'red'],
        turn: 'yellow',
        pendingRoll: roll,
        positions: { 'yellow-0': GOAL, 'yellow-1': track(20), 'yellow-2': GOAL, 'yellow-3': GOAL },
      });

      expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-1', to: track(20 + roll) }]);
    }
  });

  it('HU-06: sin tirada pendiente no hay movimientos legales', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: null,
      positions: { 'yellow-0': track(20) },
    });

    expect(legalMoves(game)).toEqual([]);
  });

  it('legalMoves no modifica el estado recibido', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'yellow-0': track(5), 'yellow-1': track(5), 'red-0': track(8) },
    });
    const snapshot = structuredClone(game);

    legalMoves(deepFreeze(game));

    expect(game).toEqual(snapshot);
  });
});
