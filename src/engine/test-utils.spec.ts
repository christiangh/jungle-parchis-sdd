import { GameState, Piece } from './game';
import { buildGame, GOAL, invariantViolations, lane, leftGoal, track } from './test-utils';

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
