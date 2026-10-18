import { Action, ActionError, ActionOutcome, applyAction, GameEvent } from './actions';
import { Color, COLORS } from './board';
import { GameState } from './game';
import {
  buildGame,
  deepFreeze,
  GOAL,
  lane,
  playRandomGame,
  seededRolls,
  track,
} from './test-utils';

function applyOk(state: GameState, action: Action): ActionOutcome {
  const result = applyAction(state, action);
  if (!result.ok) {
    expect.unreachable(`action rejected: ${result.error}`);
  }
  return result.value;
}

/** RF-020: the action is rejected with `error` and the received state does not change. */
function expectRejected(state: GameState, action: Action, error: ActionError): void {
  const snapshot = structuredClone(state);

  const result = applyAction(deepFreeze(state), action);

  expect(result).toEqual({ ok: false, error });
  expect(state).toEqual(snapshot);
}

describe('applyAction: tirar', () => {
  it('R-012: sin movimientos legales se pierde la tirada y pasa el turno', () => {
    const game = buildGame({ players: ['yellow', 'red'], turn: 'yellow' });

    const { state, events } = applyOk(game, { type: 'roll', player: 'yellow', value: 3 });

    expect(events).toEqual([
      { type: 'roll-lost', player: 'yellow', value: 3 },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.turn).toBe('red');
    expect(state.pendingRoll).toBeNull();
    expect(state.pieces).toEqual(game.pieces);
  });

  it('R-011: con movimientos legales la tirada queda pendiente y el turno no cambia', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': track(10) },
    });

    const { state, events } = applyOk(game, { type: 'roll', player: 'yellow', value: 3 });

    expect(events).toEqual([]);
    expect(state.turn).toBe('yellow');
    expect(state.pendingRoll).toBe(3);
    expect(state.pieces).toEqual(game.pieces);
  });

  it('RF-016: rechaza la tirada de un jugador sin turno', () => {
    const game = buildGame({ players: ['yellow', 'blue'], turn: 'yellow' });

    expectRejected(game, { type: 'roll', player: 'blue', value: 3 }, 'not-your-turn');
  });

  it('RF-016: rechaza tirar con una tirada pendiente', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10) },
    });

    expectRejected(game, { type: 'roll', player: 'yellow', value: 4 }, 'roll-pending');
  });

  it('R-002: rechaza tiradas fuera de 1 a 6 o no enteras', () => {
    for (const value of [0, 7, -1, 2.5, Number.NaN]) {
      const game = buildGame({ players: ['yellow', 'red'], turn: 'yellow' });

      expectRejected(game, { type: 'roll', player: 'yellow', value }, 'invalid-roll');
    }
  });
});

describe('applyAction: mover', () => {
  it('R-013: mover aplica a la ficha el destino de su movimiento legal', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 2,
      positions: { 'yellow-0': track(10), 'yellow-1': lane(3) },
    });

    const { state } = applyOk(game, { type: 'move', player: 'yellow', pieceId: 'yellow-1' });

    expect(state.pieces).toEqual(
      game.pieces.map((piece) =>
        piece.id === 'yellow-1' ? { ...piece, position: lane(5) } : piece,
      ),
    );
    expect(state.pendingRoll).toBeNull();
  });

  it('R-023: la ficha movida pasa a ser la última en llegar', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 2,
      positions: { 'yellow-0': track(10), 'red-0': track(30) },
    });

    const { state } = applyOk(game, { type: 'move', player: 'yellow', pieceId: 'yellow-0' });

    expect(state.arrivalOrder).toEqual([
      ...game.arrivalOrder.filter((id) => id !== 'yellow-0'),
      'yellow-0',
    ]);
  });

  it('R-011: tras mover, el turno pasa al siguiente color participante', () => {
    const game = buildGame({
      players: ['yellow', 'blue', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10) },
    });

    const { state } = applyOk(game, { type: 'move', player: 'yellow', pieceId: 'yellow-0' });

    expect(state.turn).toBe('blue');
  });

  it('R-011: con un 6 se mueve 6 y el turno pasa como con cualquier valor', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 6,
      positions: { 'yellow-0': track(10) },
    });

    const { state } = applyOk(game, { type: 'move', player: 'yellow', pieceId: 'yellow-0' });

    expect(state.pieces.find((piece) => piece.id === 'yellow-0')?.position).toEqual(track(16));
    expect(state.turn).toBe('red');
    expect(state.pendingRoll).toBeNull();
  });

  it('RF-019: después del último color vuelve el primero', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'red',
      pendingRoll: 2,
      positions: { 'red-0': track(40) },
    });

    const { state } = applyOk(game, { type: 'move', player: 'red', pieceId: 'red-0' });

    expect(state.turn).toBe('yellow');
  });

  it('RF-019: con azul y verde el turno alterna entre ellos', () => {
    const game = buildGame({
      players: ['blue', 'green'],
      turn: 'blue',
      positions: { 'green-0': track(60) },
    });

    const lost = applyOk(game, { type: 'roll', player: 'blue', value: 3 }).state;
    const rolled = applyOk(lost, { type: 'roll', player: 'green', value: 3 }).state;
    const moved = applyOk(rolled, { type: 'move', player: 'green', pieceId: 'green-0' }).state;

    expect([lost.turn, rolled.turn, moved.turn]).toEqual(['green', 'green', 'blue']);
  });

  it('RF-021: sacar ficha produce los eventos de salida y cambio de turno', () => {
    const game = buildGame({ players: ['yellow', 'red'], turn: 'yellow', pendingRoll: 5 });

    const { events } = applyOk(game, { type: 'move', player: 'yellow', pieceId: 'yellow-0' });

    expect(events).toEqual([
      { type: 'piece-left-home', pieceId: 'yellow-0', to: track(5) },
      { type: 'turn-changed', player: 'red' },
    ]);
  });

  it('RF-021: avanzar produce los eventos de avance y cambio de turno', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10) },
    });

    const { events } = applyOk(game, { type: 'move', player: 'yellow', pieceId: 'yellow-0' });

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(13) },
      { type: 'turn-changed', player: 'red' },
    ]);
  });

  it('RF-021: llegar a meta produce los eventos de avance y llegada', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': lane(5), 'yellow-1': track(10) },
    });

    const { state, events } = applyOk(game, {
      type: 'move',
      player: 'yellow',
      pieceId: 'yellow-0',
    });

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: lane(5), to: GOAL },
      { type: 'piece-reached-goal', pieceId: 'yellow-0' },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.winner).toBeNull();
  });

  it('RF-018: rechaza el movimiento de un jugador sin turno', () => {
    const game = buildGame({
      players: ['yellow', 'blue'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10), 'blue-0': track(30) },
    });

    expectRejected(game, { type: 'move', player: 'blue', pieceId: 'blue-0' }, 'not-your-turn');
  });

  it('RF-018: rechaza mover una ficha sin movimiento legal', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': track(10), 'red-0': track(30) },
    });

    expectRejected(game, { type: 'move', player: 'yellow', pieceId: 'yellow-1' }, 'illegal-move');
    expectRejected(game, { type: 'move', player: 'yellow', pieceId: 'red-0' }, 'illegal-move');
  });

  it('RF-018: rechaza mover sin tirada pendiente', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': track(10) },
    });

    expectRejected(
      game,
      { type: 'move', player: 'yellow', pieceId: 'yellow-0' },
      'no-pending-roll',
    );
  });
});

describe('applyAction: fin de partida', () => {
  const almostWon = (): GameState =>
    buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: {
        'yellow-0': lane(5),
        'yellow-1': GOAL,
        'yellow-2': GOAL,
        'yellow-3': GOAL,
        'red-0': track(20),
      },
    });

  it('R-090: gana quien mete su cuarta ficha en meta y la partida termina', () => {
    const { state, events } = applyOk(almostWon(), {
      type: 'move',
      player: 'yellow',
      pieceId: 'yellow-0',
    });

    expect(state.winner).toBe('yellow');
    expect(state.turn).toBe('yellow');
    expect(state.pendingRoll).toBeNull();
    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: lane(5), to: GOAL },
      { type: 'piece-reached-goal', pieceId: 'yellow-0' },
      { type: 'game-over', winner: 'yellow' },
    ]);
  });

  it('RF-023: rechaza tirar o mover en una partida terminada', () => {
    const finished = applyOk(almostWon(), {
      type: 'move',
      player: 'yellow',
      pieceId: 'yellow-0',
    }).state;

    expectRejected(finished, { type: 'roll', player: 'yellow', value: 3 }, 'game-over');
    expectRejected(finished, { type: 'roll', player: 'red', value: 3 }, 'game-over');
    expectRejected(finished, { type: 'move', player: 'red', pieceId: 'red-0' }, 'game-over');
  });
});

describe('applyAction: partidas completas', () => {
  const lineups: readonly (readonly Color[])[] = [
    ['yellow', 'red'],
    ['blue', 'red', 'green'],
    COLORS,
  ];

  it('CE-03: la misma secuencia de acciones produce el mismo estado final y los mismos eventos', () => {
    for (const [index, players] of lineups.entries()) {
      const initial = buildGame({ players });
      const played = playRandomGame(initial, seededRolls(2026 + index));

      expect(played.stopped).toBeNull();

      let state = initial;
      const events: GameEvent[] = [];
      for (const action of played.actions) {
        const outcome = applyOk(state, action);
        state = outcome.state;
        events.push(...outcome.events);
      }

      expect(state).toEqual(played.states.at(-1));
      expect(events).toEqual(played.events);
      expect(state.winner).not.toBeNull();
    }
  });

  it('CE-04: ninguna acción modifica el estado recibido', () => {
    for (const [index, players] of lineups.entries()) {
      const played = playRandomGame(buildGame({ players }), seededRolls(7 + index));

      expect(played.stopped).toBeNull();
      for (const [step, action] of played.actions.entries()) {
        const before = played.states[step];
        const snapshot = structuredClone(before);

        applyAction(deepFreeze(before), action);

        expect(before).toEqual(snapshot);
      }
    }
  });
});
