import { Action, applyAction, GameEvent } from './actions';
import { Color } from './board';
import { GameState, Piece, PieceId } from './game';
import {
  barrierHits,
  buildGame,
  gameFacts,
  GameSetup,
  GOAL,
  invariantViolations,
  lane,
  leftGoal,
  mixedColorSquares,
  moveSteps,
  thirdSixMoves,
  track,
  unopenedBarrier,
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
  it('RNF-004 de SPEC 003: detecta barreras atravesadas de otro color, propias y mixtas', () => {
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

  it('RNF-004 de SPEC 003: detecta una barrera en la casilla de destino', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(10), 'red-0': track(14), 'red-1': track(14) },
    });

    expect(barrierHits(game, 'yellow-0', 4)).toEqual({ passed: [], end: 14 });
  });

  it('RNF-004 de SPEC 003: detecta barreras al pasar de la casilla 68 a la 1', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'red-0': track(66), 'yellow-0': track(1), 'yellow-1': track(1) },
    });

    expect(barrierHits(game, 'red-0', 4)).toEqual({ passed: [1], end: null });
  });

  it('RNF-004 de SPEC 003: no cuenta la barrera de la casilla de origen', () => {
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

  it('RNF-004 de SPEC 003: no detecta nada sin barreras en el camino', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      positions: { 'yellow-0': track(10), 'red-0': track(12), 'red-1': track(20) },
    });

    expect(barrierHits(game, 'yellow-0', 5)).toEqual({ passed: [], end: null });
  });
});

describe('moveSteps', () => {
  const allOut = {
    'yellow-0': track(10),
    'yellow-1': track(30),
    'yellow-2': lane(3),
    'yellow-3': track(40),
  };

  it('R-031: un 6 vale 7 si el jugador en turno no tiene fichas en casa', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 6,
      positions: allOut,
    });

    expect(moveSteps(game)).toBe(7);
  });

  it('R-031: las fichas en meta no cuentan como fichas en casa', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 6,
      positions: { ...allOut, 'yellow-3': GOAL },
    });

    expect(moveSteps(game)).toBe(7);
  });

  it('R-031: un 6 vale 6 si el jugador en turno tiene fichas en casa, aunque los rivales no', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'red',
      pendingRoll: 6,
      positions: { ...allOut, 'red-0': track(39) },
    });

    expect(moveSteps(game)).toBe(6);
  });

  it('R-031: otro valor y los premios dan sus casillas, aunque no haya fichas en casa', () => {
    expect(
      moveSteps(buildGame({ players: ['yellow', 'red'], pendingRoll: 4, positions: allOut })),
    ).toBe(4);
    expect(
      moveSteps(buildGame({ players: ['yellow', 'red'], pendingBonus: 20, positions: allOut })),
    ).toBe(20);
    expect(
      moveSteps(buildGame({ players: ['yellow', 'red'], pendingBonus: 10, positions: allOut })),
    ).toBe(10);
  });

  it('devuelve null sin tirada ni premio pendientes', () => {
    expect(moveSteps(yellowAndRed())).toBeNull();
  });
});

describe('unopenedBarrier', () => {
  const move = (pieceId: PieceId): Action => ({ type: 'move', player: 'yellow', pieceId });

  const withBarrier = (setup: Partial<GameSetup> = {}): GameState =>
    buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 6,
      ...setup,
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(10),
        'yellow-2': track(30),
        ...setup.positions,
      },
    });

  it('R-062: detecta un 6 que mueve otra ficha pudiendo abrir la barrera propia', () => {
    expect(unopenedBarrier(withBarrier(), move('yellow-2'))).toBe(true);
  });

  it('R-062: no detecta nada si el 6 mueve una ficha de la barrera', () => {
    expect(unopenedBarrier(withBarrier(), move('yellow-0'))).toBe(false);
  });

  it('R-062: no detecta nada si una barrera delante impide mover la barrera propia', () => {
    const game = withBarrier({ positions: { 'red-0': track(13), 'red-1': track(13) } });

    expect(unopenedBarrier(game, move('yellow-2'))).toBe(false);
  });

  it('R-031, R-062: mira si la barrera puede moverse con las casillas reales del 6', () => {
    const blockedAtSeven = { 'red-0': track(17), 'red-1': track(17) };
    const sixIsSeven = withBarrier({ positions: { ...blockedAtSeven, 'yellow-3': track(40) } });
    const sixIsSix = withBarrier({ positions: blockedAtSeven });

    expect(unopenedBarrier(sixIsSeven, move('yellow-2'))).toBe(false);
    expect(unopenedBarrier(sixIsSix, move('yellow-2'))).toBe(true);
  });

  it('R-062: no detecta nada si la casilla de destino del pasillo ya tiene 2 fichas', () => {
    const game = withBarrier({
      positions: {
        'yellow-0': track(64),
        'yellow-1': track(64),
        'yellow-2': lane(3),
        'yellow-3': lane(3),
      },
    });

    expect(unopenedBarrier(game, move('yellow-2'))).toBe(false);
  });

  it('R-062: las barreras mixtas no cuentan', () => {
    const game = withBarrier({
      positions: { 'yellow-0': track(12), 'yellow-1': track(40), 'red-0': track(12) },
    });

    expect(unopenedBarrier(game, move('yellow-1'))).toBe(false);
  });

  it('R-062: no detecta nada con otro valor ni con un premio', () => {
    expect(unopenedBarrier(withBarrier({ pendingRoll: 4 }), move('yellow-2'))).toBe(false);
    expect(
      unopenedBarrier(withBarrier({ pendingRoll: null, pendingBonus: 10 }), move('yellow-2')),
    ).toBe(false);
  });
});

describe('thirdSixMoves', () => {
  /** An action with the state it is applied to and its events; only these matter here. */
  interface Step {
    readonly action: Action;
    readonly before: GameState;
    readonly events: readonly GameEvent[];
  }

  const played = (steps: Step[]) => ({
    actions: steps.map(({ action }) => action),
    states: steps.map(({ before }) => before),
    outcomes: steps.map(({ before, events }) => ({ state: before, events })),
  });

  const rolled = (player: Color, value: number, events: GameEvent[] = []): Step => ({
    action: { type: 'roll', player, value },
    before: buildGame({ players: ['yellow', 'red'], turn: player }),
    events,
  });

  const movedWith = (player: Color, value: number, events: GameEvent[] = []): Step => ({
    action: { type: 'move', player, pieceId: `${player}-0` },
    before: buildGame({ players: ['yellow', 'red'], turn: player, pendingRoll: value }),
    events,
  });

  /** A roll of 6 and the move made with it. */
  const six = (player: Color): Step[] => [
    rolled(player, 6),
    movedWith(player, 6, [{ type: 'roll-again', player }]),
  ];

  /** Three sixes in a row that end the turn. */
  const threeSixes = (player: Color, next: Color): Step[] => [
    ...six(player),
    ...six(player),
    rolled(player, 6, [
      { type: 'three-sixes', player, pieceId: `${player}-0` },
      { type: 'turn-changed', player: next },
    ]),
  ];

  it('R-032: detecta un movimiento hecho con el tercer 6 seguido', () => {
    expect(thirdSixMoves(played([...six('yellow'), ...six('yellow'), ...six('yellow')]))).toEqual([
      5,
    ]);
  });

  it('R-032: un 6 perdido también cuenta', () => {
    const lost = rolled('yellow', 6, [
      { type: 'roll-lost', player: 'yellow', value: 6 },
      { type: 'roll-again', player: 'yellow' },
    ]);

    expect(thirdSixMoves(played([lost, ...six('yellow'), ...six('yellow')]))).toEqual([4]);
  });

  it('R-032: no detecta nada con dos seises seguidos', () => {
    expect(thirdSixMoves(played([...six('yellow'), ...six('yellow')]))).toEqual([]);
  });

  it('R-032: un movimiento con premio no cuenta como hecho con el 6', () => {
    const bonus: Step = {
      action: { type: 'move', player: 'yellow', pieceId: 'yellow-0' },
      before: buildGame({ players: ['yellow', 'red'], pendingBonus: 20 }),
      events: [],
    };

    expect(thirdSixMoves(played([...six('yellow'), ...six('yellow'), bonus]))).toEqual([]);
  });

  it('R-032: una tirada de otro valor corta la cuenta', () => {
    const four = [rolled('yellow', 4), movedWith('yellow', 4)];

    expect(
      thirdSixMoves(played([...six('yellow'), ...four, ...six('yellow'), ...six('yellow')])),
    ).toEqual([]);
  });

  it('R-032: un cambio de turno corta la cuenta, también entre dos turnos del mismo jugador', () => {
    const steps = [
      ...threeSixes('yellow', 'red'),
      ...threeSixes('red', 'yellow'),
      ...six('yellow'),
    ];

    expect(thirdSixMoves(played(steps))).toEqual([]);
  });

  it('R-010, R-032: los seises de la tirada inicial no cuentan', () => {
    const steps = [
      rolled('yellow', 6, [{ type: 'initial-roll', player: 'yellow', value: 6 }]),
      rolled('red', 6, [
        { type: 'initial-roll', player: 'red', value: 6 },
        { type: 'initial-roll-tie', players: ['yellow', 'red'] },
      ]),
      rolled('yellow', 5, [{ type: 'initial-roll', player: 'yellow', value: 5 }]),
      rolled('red', 6, [
        { type: 'initial-roll', player: 'red', value: 6 },
        { type: 'first-player', player: 'red' },
      ]),
      ...six('red'),
      ...six('red'),
    ];

    expect(thirdSixMoves(played(steps))).toEqual([]);
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

  it('CE-03, R-031: un 6 que vale 7 descarta un movimiento que atravesaría una barrera', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 6,
      sixesInRow: 1,
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(30),
        'yellow-2': GOAL,
        'yellow-3': GOAL,
        'red-0': track(16),
        'red-1': track(16),
      },
    });

    expect(factsOf(game, move('yellow-1'))).toEqual([
      'single-color-barrier',
      'move-blocked-by-barrier',
      'roll-again',
      'six-counts-seven',
    ]);
  });

  it('CE-03 de SPEC 004: un 6 repite tirada y, con fichas en casa, no vale 7', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 6,
      sixesInRow: 1,
      positions: { 'yellow-0': track(10) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual(['roll-again']);
  });

  it('CE-03 de SPEC 004: reconoce un 6 que vale 7', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 6,
      sixesInRow: 1,
      positions: {
        'yellow-0': track(10),
        'yellow-1': track(30),
        'yellow-2': GOAL,
        'yellow-3': GOAL,
      },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual(['roll-again', 'six-counts-seven']);
  });

  it('CE-03 de SPEC 004: reconoce tres seises con la última ficha movida devuelta a casa', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      sixesInRow: 2,
      lastMovedPiece: 'yellow-0',
      positions: { 'yellow-0': track(10) },
    });

    expect(factsOf(game, { type: 'roll', player: 'yellow', value: 6 })).toEqual([
      'three-sixes-piece-home',
    ]);
  });

  it('CE-03 de SPEC 004: reconoce tres seises con la última ficha movida en el pasillo', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      sixesInRow: 2,
      lastMovedPiece: 'yellow-0',
      positions: { 'yellow-0': lane(3) },
    });

    expect(factsOf(game, { type: 'roll', player: 'yellow', value: 6 })).toEqual([
      'three-sixes-no-piece-home',
    ]);
  });

  it('CE-03 de SPEC 004: reconoce una barrera propia abierta con un 6', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      pendingRoll: 6,
      sixesInRow: 1,
      positions: { 'yellow-0': track(10), 'yellow-1': track(10), 'yellow-2': track(30) },
    });

    expect(factsOf(game, move('yellow-0'))).toEqual([
      'single-color-barrier',
      'roll-again',
      'barrier-opened-by-six',
    ]);
  });

  it('CE-03 de SPEC 004: reconoce un empate en la tirada inicial', () => {
    const game: GameState = {
      ...yellowAndRed(),
      turn: 'red',
      initialRoll: { contenders: ['yellow', 'red'], rolls: [4] },
    };

    expect(factsOf(game, { type: 'roll', player: 'red', value: 4 })).toEqual(['initial-roll-tie']);
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
