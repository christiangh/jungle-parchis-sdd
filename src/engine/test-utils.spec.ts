import { Action, applyAction } from './actions';
import { GameState, Piece, PieceId } from './game';
import {
  barrierHits,
  buildGame,
  gameFacts,
  GOAL,
  invariantViolations,
  lane,
  leftGoal,
  mixedColorSquares,
  track,
} from './test-utils';

const yellowAndRed = (): GameState => buildGame({ players: ['yellow', 'red'], turn: 'yellow' });

describe('invariantViolations', () => {
  it('no detecta nada en una partida recién creada ni a mitad', () => {
    const midGame = buildGame({
      players: ['yellow', 'blue', 'red'],
      turn: 'blue',
      pendingRoll: 4,
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(10),
        'yellow-2': lane(7),
        'yellow-3': GOAL,
        'blue-0': lane(7),
        'blue-1': lane(7),
        'red-0': track(39),
        'red-1': GOAL,
        'red-2': GOAL,
      },
    });

    expect(invariantViolations(yellowAndRed())).toEqual([]);
    expect(invariantViolations(midGame)).toEqual([]);
  });

  it('I-01: detecta un jugador sin 4 fichas o fichas de un color que no juega', () => {
    const game = yellowAndRed();
    const blue: Piece = { id: 'blue-0', color: 'blue', position: track(30) };

    const missing = { ...game, pieces: game.pieces.slice(1) };
    const extra = { ...game, pieces: [...game.pieces, game.pieces[0]] };
    const notPlaying = { ...game, pieces: [...game.pieces, blue] };

    expect(invariantViolations(missing)).toEqual(['I-01']);
    expect(invariantViolations(extra)).toEqual(['I-01']);
    expect(invariantViolations(notPlaying)).toEqual(['I-01']);
  });

  it('I-02: detecta una casilla del recorrido o del pasillo con más de 2 fichas', () => {
    const onTrack = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(10), 'yellow-1': track(10), 'red-0': track(10) },
    });
    const onLane = buildGame({
      players: ['yellow', 'red'],
      positions: { 'red-0': lane(3), 'red-1': lane(3), 'red-2': lane(3) },
    });

    expect(invariantViolations(onTrack)).toEqual(['I-02']);
    expect(invariantViolations(onLane)).toEqual(['I-02']);
  });

  it('I-02: no suma fichas de pasillos de colores distintos', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': lane(3), 'yellow-1': lane(3), 'red-0': lane(3) },
    });

    expect(invariantViolations(game)).toEqual([]);
  });

  it('I-03: detecta una ficha fuera de las casillas de su pasillo', () => {
    for (const square of [0, 8]) {
      const game = buildGame({ players: ['yellow', 'red'], positions: { 'red-0': lane(square) } });

      expect(invariantViolations(game)).toEqual(['I-03']);
    }
  });

  it('I-05: detecta un turno o un ganador que no participan', () => {
    const game = yellowAndRed();

    expect(invariantViolations({ ...game, turn: 'blue' })).toEqual(['I-05']);
    expect(invariantViolations({ ...game, winner: 'green' })).toEqual(['I-05']);
  });

  it('devuelve cada invariante incumplido una vez y en orden', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'red-0': lane(3), 'red-1': lane(3), 'red-2': lane(3), 'red-3': lane(3) },
    });

    const broken = { ...game, turn: 'green' as const, pieces: game.pieces.slice(1) };

    expect(invariantViolations(broken)).toEqual(['I-01', 'I-02', 'I-05']);
  });
});

describe('leftGoal', () => {
  it('I-04: detecta una ficha que sale de meta', () => {
    const before = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': GOAL, 'yellow-1': GOAL },
    });
    const after = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': lane(5), 'yellow-1': GOAL },
    });

    expect(leftGoal(before, after)).toEqual(['yellow-0']);
  });

  it('I-04: no detecta nada si las fichas en meta siguen en ella', () => {
    const before = buildGame({ players: ['yellow', 'red'], positions: { 'yellow-0': GOAL } });
    const after = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': GOAL, 'yellow-1': GOAL, 'red-0': track(40) },
    });

    expect(leftGoal(before, after)).toEqual([]);
  });
});

describe('mixedColorSquares', () => {
  it('RNF-004: detecta fichas de dos colores en casillas del recorrido que no son seguro', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: {
        'red-0': track(40),
        'yellow-0': track(40),
        'yellow-1': track(10),
        'red-1': track(10),
      },
    });

    expect(mixedColorSquares(game)).toEqual([10, 40]);
  });

  it('RNF-004: no detecta dos colores en un seguro', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(12), 'red-0': track(12) },
    });

    expect(mixedColorSquares(game)).toEqual([]);
  });

  it('RNF-004: no detecta dos fichas del mismo color', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(10), 'yellow-1': track(10) },
    });

    expect(mixedColorSquares(game)).toEqual([]);
  });

  it('RNF-004: no detecta fichas en la misma casilla de pasillos distintos', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': lane(3), 'red-0': lane(3) },
    });

    expect(mixedColorSquares(game)).toEqual([]);
  });
});

describe('barrierHits', () => {
  it('RNF-004: detecta barreras atravesadas de otro color, propias y mixtas', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(12),
        'yellow-2': track(12),
        'red-0': track(14),
        'red-1': track(14),
        'yellow-3': track(17),
        'red-2': track(17),
      },
    });

    expect(barrierHits(game, 'yellow-0', 10)).toEqual({ passed: [12, 14, 17], end: null });
  });

  it('RNF-004: detecta una barrera en la casilla de destino', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(10), 'red-0': track(14), 'red-1': track(14) },
    });

    expect(barrierHits(game, 'yellow-0', 4)).toEqual({ passed: [], end: 14 });
  });

  it('RNF-004: detecta barreras al pasar de la casilla 68 a la 1', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'red-0': track(66), 'yellow-0': track(1), 'yellow-1': track(1) },
    });

    expect(barrierHits(game, 'red-0', 4)).toEqual({ passed: [1], end: null });
  });

  it('RNF-004: no cuenta la barrera de la casilla de origen', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(10), 'yellow-1': track(10) },
    });

    expect(barrierHits(game, 'yellow-0', 3)).toEqual({ passed: [], end: null });
  });

  it('R-063: no cuenta las barreras tras la casilla de entrada al pasillo', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(66), 'red-0': track(1), 'red-1': track(1) },
    });

    expect(barrierHits(game, 'yellow-0', 4)).toEqual({ passed: [], end: null });
  });

  it('RNF-004: no detecta nada sin barreras en el camino', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(10), 'red-0': track(12), 'red-1': track(20) },
    });

    expect(barrierHits(game, 'yellow-0', 5)).toEqual({ passed: [], end: null });
  });
});

describe('gameFacts', () => {
  const move = (pieceId: PieceId): Action => ({ type: 'move', player: 'yellow', pieceId });

  /** Each action is applied to the state at its index, as gameFacts reads them. */
  const replayed = (states: GameState[], actions: Action[]) => ({
    states,
    actions,
    outcomes: actions.map((action, index) => {
      const result = applyAction(states[index], action);
      if (!result.ok) {
        throw new Error(`Action ${index} was rejected: ${result.error}`);
      }
      return result.value;
    }),
  });

  const factsOf = (state: GameState, action: Action) => gameFacts(replayed([state], [action]));

  const captureOnTrack = (): GameState =>
    buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 3,
      positions: { 'yellow-0': track(10), 'red-0': track(13) },
    });

  const multipleBounce = (): GameState =>
    buildGame({ players: ['yellow', 'red'], pendingBonus: 20, positions: { 'yellow-0': lane(5) } });

  it('CE-03: comer en el recorrido da un premio de 20', () => {
    expect(factsOf(captureOnTrack(), move('yellow-0'))).toEqual(['capture-on-track', 'bonus-20']);
  });

  it('CE-03: salir comiendo da un premio de 20, sin barrera en la salida si solo hay un rival', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 5,
      positions: { 'red-0': track(5) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual(['capture-on-exit', 'bonus-20']);
  });

  it('CE-03: llegar a meta da un premio de 10', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 3,
      positions: { 'yellow-0': lane(5), 'yellow-1': track(10) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual(['bonus-10']);
  });

  it('CE-03: un premio sin movimientos se pierde', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 3,
      positions: { 'yellow-0': lane(5) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual(['bonus-10', 'bonus-lost']);
  });

  it('CE-03: comer con un premio encadena otro', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingBonus: 20,
      positions: { 'yellow-0': track(10), 'red-0': track(30) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual([
      'capture-on-track',
      'bonus-20',
      'chained-bonus',
    ]);
  });

  it('CE-03: un premio de 20 desde el pasillo rebota varias veces', () => {
    expect(factsOf(multipleBounce(), move('yellow-0'))).toEqual(['multiple-bounce']);
  });

  it('CE-03: no detecta nada en un movimiento sin comer, premio ni rebote', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 3,
      positions: { 'yellow-0': track(10) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual([]);
  });

  it('CE-03: reconoce una barrera de un color', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 3,
      positions: { 'yellow-0': track(10), 'yellow-1': track(10) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual(['single-color-barrier']);
  });

  it('CE-03: reconoce una barrera mixta en un seguro', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 3,
      positions: { 'yellow-0': track(12), 'red-0': track(12) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual(['mixed-barrier']);
  });

  it('CE-03: reconoce un movimiento descartado por atravesar una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 4,
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(20),
        'red-0': track(12),
        'red-1': track(12),
      },
    });

    expect(factsOf(game, move('yellow-1'))).toEqual([
      'single-color-barrier',
      'move-blocked-by-barrier',
    ]);
  });

  it('CE-03: reconoce una salida comiendo con barrera en la salida', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 5,
      positions: { 'red-0': track(5), 'red-1': track(5) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual([
      'capture-on-exit',
      'bonus-20',
      'single-color-barrier',
      'capture-on-exit-with-barrier',
    ]);
  });

  it('CE-03: reconoce un premio perdido por una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 3,
      positions: {
        'yellow-0': lane(5),
        'yellow-1': track(10),
        'red-0': track(14),
        'red-1': track(14),
      },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual([
      'bonus-10',
      'bonus-lost',
      'single-color-barrier',
      'bonus-lost-to-barrier',
    ]);
  });

  it('CE-03: reconoce un premio perdido por terminar en una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 3,
      positions: {
        'yellow-0': lane(5),
        'yellow-1': track(10),
        'red-0': track(20),
        'red-1': track(20),
      },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual([
      'bonus-10',
      'bonus-lost',
      'single-color-barrier',
      'bonus-lost-to-barrier',
    ]);
  });

  it('CE-03: devuelve cada hecho de la partida una vez y en orden', () => {
    const played = replayed(
      [multipleBounce(), captureOnTrack(), captureOnTrack()],
      [move('yellow-0'), move('yellow-0'), move('yellow-0')],
    );

    expect(gameFacts(played)).toEqual(['capture-on-track', 'bonus-20', 'multiple-bounce']);
  });
});

describe('buildGame', () => {
  it('R-023: las fichas de positions llegan en el orden en que se listan, tras las no listadas', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'red-0': track(5), 'yellow-2': track(20), 'yellow-0': track(5) },
    });

    expect(game.arrivalOrder).toEqual([
      'yellow-1',
      'yellow-3',
      'red-1',
      'red-2',
      'red-3',
      'red-0',
      'yellow-2',
      'yellow-0',
    ]);
  });
});
