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

  it('R-023: sale con una sola ficha rival en la salida y la come', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'red-0': track(5) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(5), captures: 'red-0' }]);
  });

  it('R-023: con dos rivales en la salida come la que llegó en último lugar', () => {
    const redLast = buildGame({
      players: ['yellow', 'blue', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'blue-0': track(5), 'red-0': track(5) },
    });
    const blueLast = buildGame({
      players: ['yellow', 'blue', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'red-0': track(5), 'blue-0': track(5) },
    });

    expect(legalMoves(redLast)).toEqual([{ pieceId: 'yellow-0', to: track(5), captures: 'red-0' }]);
    expect(legalMoves(blueLast)).toEqual([
      { pieceId: 'yellow-0', to: track(5), captures: 'blue-0' },
    ]);
  });

  it('R-023: con dos rivales del mismo color en la salida come la que llegó en último lugar', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'red-1': track(5), 'red-0': track(5) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(5), captures: 'red-0' }]);
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

  it('R-023: con una ficha propia y una rival en la salida, sale comiendo la rival', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'yellow-0': track(5), 'red-0': track(5), 'yellow-2': track(30) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-1', to: track(5), captures: 'red-0' }]);
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

  it('R-061: no atraviesa una barrera de otro color', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'red-0': track(12), 'red-1': track(12) },
    });

    expect(legalMoves(game)).toEqual([]);
  });

  it('R-050: termina sobre una sola ficha rival fuera de un seguro y la come', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'red-0': track(14) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(14), captures: 'red-0' }]);
  });
});

describe('legalMoves: comer', () => {
  it('R-050: no come una ficha propia', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'yellow-1': track(14) },
    });

    expect(legalMoves(game)).toStrictEqual([
      { pieceId: 'yellow-0', to: track(14) },
      { pieceId: 'yellow-1', to: track(18) },
    ]);
  });

  it('R-052: en un seguro conviven con una sola rival sin comerse', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 2,
      positions: { 'yellow-0': track(10), 'red-0': track(12) },
    });

    expect(legalMoves(game)).toStrictEqual([{ pieceId: 'yellow-0', to: track(12) }]);
  });

  it('R-052: en la salida de otro color conviven si no se sale de casa', () => {
    const game = buildGame({
      players: ['yellow', 'blue', 'red'],
      turn: 'yellow',
      pendingRoll: 2,
      positions: { 'yellow-0': track(20), 'red-0': track(22) },
    });

    expect(legalMoves(game)).toStrictEqual([{ pieceId: 'yellow-0', to: track(22) }]);
  });

  it('R-052: en la propia salida conviven si no se sale de casa', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(1), 'red-0': track(5) },
    });

    expect(legalMoves(game)).toStrictEqual([{ pieceId: 'yellow-0', to: track(5) }]);
  });
});

describe('legalMoves: meta y rebote', () => {
  it('R-070: desde la quinta casilla del pasillo con un 3 llega a meta', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': lane(5), 'yellow-1': GOAL, 'yellow-2': GOAL, 'yellow-3': GOAL },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: GOAL }]);
  });

  it('R-070: desde la segunda casilla del pasillo con un 6 llega justo a meta', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 6,
      positions: { 'yellow-0': lane(2), 'yellow-1': GOAL, 'yellow-2': GOAL, 'yellow-3': GOAL },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: GOAL }]);
  });

  it('R-070: una ficha en meta no vuelve a moverse', () => {
    for (const roll of [1, 2, 3, 4, 5, 6]) {
      const game = buildGame({
        players: ['yellow', 'red'],
        turn: 'yellow',
        pendingRoll: roll,
        positions: { 'yellow-0': GOAL, 'yellow-1': GOAL, 'yellow-2': GOAL, 'yellow-3': GOAL },
      });

      expect(legalMoves(game)).toEqual([]);
    }
  });

  it('R-071: desde la quinta casilla del pasillo con un 6 rebota y termina en la quinta', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 6,
      positions: { 'yellow-0': lane(5), 'yellow-1': GOAL, 'yellow-2': GOAL, 'yellow-3': GOAL },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: lane(5) }]);
  });

  it('R-071: desde la séptima casilla del pasillo con un 6 rebota hasta la tercera, sin quedarse en meta', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 6,
      positions: { 'yellow-0': lane(7), 'yellow-1': GOAL, 'yellow-2': GOAL, 'yellow-3': GOAL },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: lane(3) }]);
  });

  it('R-071: un rebote que termina en una casilla del pasillo con 2 fichas no es legal', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 6,
      positions: {
        'yellow-0': lane(7),
        'yellow-1': lane(3),
        'yellow-2': lane(3),
        'yellow-3': GOAL,
      },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-1', to: lane(7) },
      { pieceId: 'yellow-2', to: lane(7) },
    ]);
  });
});

describe('legalMoves: premios', () => {
  it('R-051: con un premio de 20 se mueve 20 cualquier ficha que pueda, también la que ha comido', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': track(14), 'yellow-1': track(30) },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-0', to: track(34) },
      { pieceId: 'yellow-1', to: track(50) },
    ]);
  });

  it('R-080: con una sola ficha que pueda usar el premio, es el único movimiento legal', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(20),
        'red-0': track(40),
        'red-1': track(40),
      },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(30) }]);
  });

  it('R-080: las fichas en casa no pueden usar un premio', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': track(10) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(30) }]);
  });

  it('R-080: un movimiento de premio come como uno de tirada', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': track(10), 'red-0': track(30) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(30), captures: 'red-0' }]);
  });

  it('R-080: un movimiento de premio a una casilla con 2 fichas no es legal', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: {
        'yellow-0': lane(5),
        'yellow-1': lane(5),
        'yellow-2': lane(5),
        'yellow-3': track(10),
      },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-3', to: track(30) }]);
  });

  it('R-071: desde la quinta casilla del pasillo con un premio de 20 rebota dos veces y termina en la quinta', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': lane(5) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: lane(5) }]);
  });

  it('R-071: desde la casilla 66 con un premio de 10 llega a meta', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 10,
      positions: { 'yellow-0': track(66) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: GOAL }]);
  });

  it('R-071: al llegar a la primera casilla del pasillo rebotando vuelve a avanzar', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 10,
      positions: { 'yellow-0': lane(7) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: lane(3) }]);
  });
});

describe('legalMoves: barreras', () => {
  it('R-061: no atraviesa una barrera propia, pero sus fichas sí salen de ella', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'yellow-1': track(12), 'yellow-2': track(12) },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-1', to: track(16) },
      { pieceId: 'yellow-2', to: track(16) },
    ]);
  });

  it('R-061: no atraviesa una barrera mixta en un seguro', () => {
    const game = buildGame({
      players: ['yellow', 'blue', 'red'],
      turn: 'blue',
      pendingRoll: 4,
      positions: { 'blue-0': track(10), 'yellow-0': track(12), 'red-0': track(12) },
    });

    expect(legalMoves(game)).toEqual([]);
  });

  it('R-061: una barrera en la casilla de entrada impide entrar en el pasillo', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(66), 'red-0': track(68), 'red-1': track(68) },
    });

    expect(legalMoves(game)).toEqual([]);
  });

  it('R-042: no se termina en una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10), 'red-0': track(13), 'red-1': track(13) },
    });

    expect(legalMoves(game)).toEqual([]);
  });

  it('R-061: se puede terminar justo antes de una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10), 'red-0': track(14), 'red-1': track(14) },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-0', to: track(13) }]);
  });

  it('R-061: la barrera mixta de una salida solo se puede ocupar saliendo de casa', () => {
    const game = buildGame({
      players: ['yellow', 'blue', 'red'],
      turn: 'blue',
      pendingRoll: 4,
      positions: { 'blue-0': track(3), 'yellow-0': track(5), 'red-0': track(5) },
    });

    expect(legalMoves(game)).toEqual([]);
  });

  it('R-061: un movimiento de premio de 20 no atraviesa una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(40),
        'red-0': track(20),
        'red-1': track(20),
      },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-1', to: track(60) }]);
  });

  it('R-061: un movimiento de premio de 10 no atraviesa una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 10,
      positions: {
        'yellow-0': track(30),
        'yellow-1': track(50),
        'red-0': track(35),
        'red-1': track(35),
      },
    });

    expect(legalMoves(game)).toEqual([{ pieceId: 'yellow-1', to: track(60) }]);
  });

  it('R-063: en el pasillo se adelanta a dos fichas propias', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': lane(1), 'yellow-1': lane(3), 'yellow-2': lane(3) },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-0', to: lane(5) },
      { pieceId: 'yellow-1', to: lane(7) },
      { pieceId: 'yellow-2', to: lane(7) },
    ]);
  });

  it('R-063: un rebote pasa por una casilla del pasillo con 2 fichas', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 6,
      positions: { 'yellow-0': lane(7), 'yellow-1': lane(6), 'yellow-2': lane(6) },
    });

    expect(legalMoves(game)).toEqual([
      { pieceId: 'yellow-0', to: lane(3) },
      { pieceId: 'yellow-1', to: lane(4) },
      { pieceId: 'yellow-2', to: lane(4) },
    ]);
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
