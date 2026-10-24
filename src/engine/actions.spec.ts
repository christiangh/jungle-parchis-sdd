import { Action, ActionError, ActionOutcome, applyAction, GameEvent } from './actions';
import { Color, COLORS } from './board';
import { createGame, GameState, PieceId } from './game';
import { legalMoves } from './moves';
import {
  buildGame,
  deepFreeze,
  GOAL,
  HOME,
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

  it('R-061: si la única tirada atraviesa una barrera, se pierde la tirada', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': track(10), 'red-0': track(12), 'red-1': track(12) },
    });

    const { state, events } = applyOk(game, { type: 'roll', player: 'yellow', value: 4 });

    expect(events).toEqual([
      { type: 'roll-lost', player: 'yellow', value: 4 },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.turn).toBe('red');
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

  it('R-030: con un 6 se mueve 6 y se vuelve a tirar', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': track(10) },
    });
    const rolled = applyOk(game, { type: 'roll', player: 'yellow', value: 6 }).state;

    const { state, events } = applyOk(rolled, {
      type: 'move',
      player: 'yellow',
      pieceId: 'yellow-0',
    });

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(16) },
      { type: 'roll-again', player: 'yellow' },
    ]);
    expect(state.turn).toBe('yellow');
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

  it('R-072: llegar a meta produce los eventos de avance, llegada y premio', () => {
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
      { type: 'bonus-earned', player: 'yellow', amount: 10 },
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

describe('applyAction: comer', () => {
  const position = (state: GameState, id: string) =>
    state.pieces.find((piece) => piece.id === id)?.position;

  it('R-050: la ficha comida vuelve a casa', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'red-0': track(14) },
    });

    const { state } = applyOk(game, { type: 'move', player: 'yellow', pieceId: 'yellow-0' });

    expect(position(state, 'yellow-0')).toEqual(track(14));
    expect(position(state, 'red-0')).toEqual(HOME);
  });

  it('RF-014: comer produce el evento de ficha comida tras el de movimiento', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'red-0': track(14) },
    });

    const { events } = applyOk(game, { type: 'move', player: 'yellow', pieceId: 'yellow-0' });

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(14) },
      { type: 'piece-captured', pieceId: 'red-0', at: track(14) },
      { type: 'bonus-earned', player: 'yellow', amount: 20 },
    ]);
  });

  it('R-023: al salir de casa come la rival de la salida y produce el evento', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'red-0': track(5) },
    });

    const { state, events } = applyOk(game, {
      type: 'move',
      player: 'yellow',
      pieceId: 'yellow-0',
    });

    expect(position(state, 'yellow-0')).toEqual(track(5));
    expect(position(state, 'red-0')).toEqual(HOME);
    expect(events).toEqual([
      { type: 'piece-left-home', pieceId: 'yellow-0', to: track(5) },
      { type: 'piece-captured', pieceId: 'red-0', at: track(5) },
      { type: 'bonus-earned', player: 'yellow', amount: 20 },
    ]);
  });

  it('R-052: en un seguro conviven sin evento de ficha comida', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 2,
      positions: { 'yellow-0': track(10), 'red-0': track(12) },
    });

    const { state, events } = applyOk(game, {
      type: 'move',
      player: 'yellow',
      pieceId: 'yellow-0',
    });

    expect(position(state, 'yellow-0')).toEqual(track(12));
    expect(position(state, 'red-0')).toEqual(track(12));
    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(12) },
      { type: 'turn-changed', player: 'red' },
    ]);
  });
});

describe('applyAction: premios', () => {
  const move = (pieceId: PieceId): Action => ({ type: 'move', player: 'yellow', pieceId });

  it('R-051: comer da un premio de 20 y el turno no pasa', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'red-0': track(14), 'yellow-1': track(30) },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(14) },
      { type: 'piece-captured', pieceId: 'red-0', at: track(14) },
      { type: 'bonus-earned', player: 'yellow', amount: 20 },
    ]);
    expect(state.turn).toBe('yellow');
    expect(state.pendingRoll).toBeNull();
    expect(state.pendingBonus).toBe(20);
  });

  it('R-051: salir comiendo da un premio de 20', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 5,
      positions: { 'red-0': track(5) },
    });

    const { state } = applyOk(game, move('yellow-0'));

    expect(state.turn).toBe('yellow');
    expect(state.pendingBonus).toBe(20);
  });

  it('R-051: con un premio pendiente se rechaza tirar', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': track(10) },
    });

    expectRejected(game, { type: 'roll', player: 'yellow', value: 3 }, 'bonus-pending');
  });

  it('R-080: el premio no se aplica solo aunque haya un único movimiento', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: { 'yellow-0': track(10), 'red-0': track(14) },
    });

    const { state } = applyOk(game, move('yellow-0'));

    expect(legalMoves(state)).toEqual([{ pieceId: 'yellow-0', to: track(34) }]);
    expect(state.pieces.find((piece) => piece.id === 'yellow-0')?.position).toEqual(track(14));
    expect(state.pendingBonus).toBe(20);
  });

  it('R-051: usar el premio sin ganar otro pasa el turno', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': track(10) },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(30) },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.turn).toBe('red');
    expect(state.pendingBonus).toBeNull();
  });

  it('R-072: llegar a meta da un premio de 10 para otra ficha', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': lane(5), 'yellow-1': track(30) },
    });

    const { state } = applyOk(game, move('yellow-0'));

    expect(state.turn).toBe('yellow');
    expect(state.pendingBonus).toBe(10);
    expect(legalMoves(state)).toEqual([{ pieceId: 'yellow-1', to: track(40) }]);
  });

  it('R-090: meter la cuarta ficha con un premio termina la partida sin premio de 10', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 10,
      positions: { 'yellow-0': track(66), 'yellow-1': GOAL, 'yellow-2': GOAL, 'yellow-3': GOAL },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(66), to: GOAL },
      { type: 'piece-reached-goal', pieceId: 'yellow-0' },
      { type: 'game-over', winner: 'yellow' },
    ]);
    expect(state.winner).toBe('yellow');
    expect(state.pendingBonus).toBeNull();
  });

  it('R-080: un premio de 10 sin movimientos se pierde y el turno pasa', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 3,
      positions: { 'yellow-0': lane(5) },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: lane(5), to: GOAL },
      { type: 'piece-reached-goal', pieceId: 'yellow-0' },
      { type: 'bonus-earned', player: 'yellow', amount: 10 },
      { type: 'bonus-lost', player: 'yellow', amount: 10 },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.turn).toBe('red');
    expect(state.pendingBonus).toBeNull();
  });

  it('R-080: si el único destino del premio está lleno, se pierde', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: {
        'yellow-0': track(10),
        'red-0': track(14),
        'red-1': track(34),
        'red-2': track(34),
      },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(14) },
      { type: 'piece-captured', pieceId: 'red-0', at: track(14) },
      { type: 'bonus-earned', player: 'yellow', amount: 20 },
      { type: 'bonus-lost', player: 'yellow', amount: 20 },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.turn).toBe('red');
    expect(state.pendingBonus).toBeNull();
  });

  it('R-080: un premio cuyo único movimiento atraviesa una barrera se pierde', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingRoll: 4,
      positions: {
        'yellow-0': track(10),
        'red-0': track(14),
        'red-1': track(20),
        'red-2': track(20),
      },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(14) },
      { type: 'piece-captured', pieceId: 'red-0', at: track(14) },
      { type: 'bonus-earned', player: 'yellow', amount: 20 },
      { type: 'bonus-lost', player: 'yellow', amount: 20 },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.turn).toBe('red');
    expect(state.pendingBonus).toBeNull();
  });

  it('R-081: comer con un premio da otro premio de 20', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': track(10), 'red-0': track(30) },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(10), to: track(30) },
      { type: 'piece-captured', pieceId: 'red-0', at: track(30) },
      { type: 'bonus-earned', player: 'yellow', amount: 20 },
    ]);
    expect(state.turn).toBe('yellow');
    expect(state.pendingBonus).toBe(20);
  });

  it('R-081: llegar a meta con un premio da un premio de 10', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': track(56), 'yellow-1': track(30) },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(56), to: GOAL },
      { type: 'piece-reached-goal', pieceId: 'yellow-0' },
      { type: 'bonus-earned', player: 'yellow', amount: 10 },
    ]);
    expect(state.turn).toBe('yellow');
    expect(state.pendingBonus).toBe(10);
  });

  it('R-071: un rebote que pasa por la meta no da premio', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      pendingBonus: 20,
      positions: { 'yellow-0': lane(5) },
    });

    const { state, events } = applyOk(game, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: lane(5), to: lane(5) },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.pendingBonus).toBeNull();
  });
});

describe('applyAction: el seis', () => {
  const roll = (value: number): Action => ({ type: 'roll', player: 'yellow', value });
  const move = (pieceId: PieceId): Action => ({ type: 'move', player: 'yellow', pieceId });
  const positionOf = (state: GameState, pieceId: PieceId) =>
    state.pieces.find((piece) => piece.id === pieceId)?.position;
  /** Applies the actions in order and returns the outcome of the last one. */
  const play = (game: GameState, ...actions: Action[]): ActionOutcome =>
    actions.reduce<ActionOutcome>((outcome, action) => applyOk(outcome.state, action), {
      state: game,
      events: [],
    });

  it('R-030: un 6 sin movimiento legal se pierde y se vuelve a tirar', () => {
    const game = buildGame({ players: ['yellow', 'red'], turn: 'yellow' });

    const { state, events } = play(game, roll(6));

    expect(events).toEqual([
      { type: 'roll-lost', player: 'yellow', value: 6 },
      { type: 'roll-again', player: 'yellow' },
    ]);
    expect(state.turn).toBe('yellow');
    expect(state.pendingRoll).toBeNull();
  });

  it('R-030: un 6 que come vuelve a tirar después de usar el premio', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': track(10), 'red-0': track(16), 'yellow-1': track(30) },
    });
    const captured = play(game, roll(6), move('yellow-0')).state;

    expectRejected(captured, roll(3), 'bonus-pending');
    const { state, events } = play(captured, move('yellow-1'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-1', from: track(30), to: track(50) },
      { type: 'roll-again', player: 'yellow' },
    ]);
    expect(state.turn).toBe('yellow');
    expect(state.pendingBonus).toBeNull();
  });

  it('R-030: un 6 cuyo premio se pierde vuelve a tirar', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': lane(2) },
    });

    const { state, events } = play(game, roll(6), move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: lane(2), to: GOAL },
      { type: 'piece-reached-goal', pieceId: 'yellow-0' },
      { type: 'bonus-earned', player: 'yellow', amount: 10 },
      { type: 'bonus-lost', player: 'yellow', amount: 10 },
      { type: 'roll-again', player: 'yellow' },
    ]);
    expect(state.turn).toBe('yellow');
  });

  it('R-030, R-081: tras un 6 se usan todos los premios encadenados antes de repetir', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: {
        'yellow-0': track(10),
        'red-0': track(16),
        'yellow-1': track(30),
        'red-1': track(50),
      },
    });
    const chained = play(game, roll(6), move('yellow-0'), move('yellow-1'));

    expect(chained.events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-1', from: track(30), to: track(50) },
      { type: 'piece-captured', pieceId: 'red-1', at: track(50) },
      { type: 'bonus-earned', player: 'yellow', amount: 20 },
    ]);
    const { state, events } = play(chained.state, move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: track(16), to: track(36) },
      { type: 'roll-again', player: 'yellow' },
    ]);
    expect(state.turn).toBe('yellow');
  });

  it('R-090: un 6 que mete la cuarta ficha termina la partida sin repetir', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': lane(1), 'yellow-1': GOAL, 'yellow-2': GOAL, 'yellow-3': GOAL },
    });

    const { state, events } = play(game, roll(6), move('yellow-0'));

    expect(events).toEqual([
      { type: 'piece-advanced', pieceId: 'yellow-0', from: lane(1), to: GOAL },
      { type: 'piece-reached-goal', pieceId: 'yellow-0' },
      { type: 'game-over', winner: 'yellow' },
    ]);
    expect(state.winner).toBe('yellow');
  });

  it('R-021: tras repetir por un 6, un 5 obliga a salir de casa', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': track(10) },
    });

    const { state } = play(game, roll(6), move('yellow-0'), roll(5));

    expect(legalMoves(state)).toEqual([{ pieceId: 'yellow-1', to: track(5) }]);
  });

  it('R-032: el tercer 6 devuelve a casa la última ficha movida y pasa el turno', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      sixesInRow: 2,
      lastMovedPiece: 'yellow-0',
      positions: { 'yellow-0': track(30), 'yellow-1': track(10) },
    });

    const { state, events } = play(game, roll(6));

    expect(events).toEqual([
      { type: 'three-sixes', player: 'yellow', pieceId: 'yellow-0' },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(positionOf(state, 'yellow-0')).toEqual(HOME);
    expect(positionOf(state, 'yellow-1')).toEqual(track(10));
    expect(state.turn).toBe('red');
    expect(state.pendingRoll).toBeNull();
  });

  it('R-032: la última ficha movida puede ser la de un premio', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      sixesInRow: 1,
      positions: { 'yellow-0': track(10), 'red-0': track(16), 'yellow-1': track(30) },
    });

    const { state, events } = play(game, roll(6), move('yellow-0'), move('yellow-1'), roll(6));

    expect(events).toEqual([
      { type: 'three-sixes', player: 'yellow', pieceId: 'yellow-1' },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(positionOf(state, 'yellow-1')).toEqual(HOME);
    expect(positionOf(state, 'yellow-0')).toEqual(track(16));
  });

  it('R-032: la última ficha movida en el pasillo o en meta no vuelve a casa', () => {
    for (const position of [lane(3), GOAL]) {
      const game = buildGame({
        players: ['yellow', 'red'],
        turn: 'yellow',
        sixesInRow: 2,
        lastMovedPiece: 'yellow-0',
        positions: { 'yellow-0': position, 'yellow-1': track(10) },
      });

      const { state, events } = play(game, roll(6));

      expect(events).toEqual([
        { type: 'three-sixes', player: 'yellow', pieceId: null },
        { type: 'turn-changed', player: 'red' },
      ]);
      expect(positionOf(state, 'yellow-0')).toEqual(position);
      expect(state.turn).toBe('red');
    }
  });

  it('R-032: sin ficha movida en el turno, el tercer 6 solo pasa el turno', () => {
    const game = buildGame({ players: ['yellow', 'red'], turn: 'yellow' });

    const { state, events } = play(game, roll(6), roll(6), roll(6));

    expect(events).toEqual([
      { type: 'three-sixes', player: 'yellow', pieceId: null },
      { type: 'turn-changed', player: 'red' },
    ]);
    expect(state.turn).toBe('red');
  });

  it('R-032: los seises seguidos se reinician con otro valor y al cambiar el turno', () => {
    const game = buildGame({
      players: ['yellow', 'red'],
      turn: 'yellow',
      positions: { 'yellow-0': track(10) },
    });
    const sixes = play(game, roll(6), move('yellow-0'), roll(6), move('yellow-0')).state;

    expect(sixes.sixesInRow).toBe(2);
    expect(sixes.lastMovedPiece).toBe('yellow-0');
    const four = play(sixes, roll(4)).state;

    expect(four.sixesInRow).toBe(0);
    const { state, events } = play(four, move('yellow-0'));

    expect(events).toContainEqual({ type: 'turn-changed', player: 'red' });
    expect(state.sixesInRow).toBe(0);
    expect(state.lastMovedPiece).toBeNull();
  });
});

describe('applyAction: tirada inicial', () => {
  function newGame(...players: Color[]): GameState {
    const result = createGame({ players });
    if (!result.ok) {
      return expect.unreachable(`game rejected: ${result.error}`);
    }
    return result.value;
  }

  const roll = (player: Color, value: number): Action => ({ type: 'roll', player, value });

  function play(game: GameState, ...actions: Action[]): ActionOutcome {
    return actions.reduce<ActionOutcome>((outcome, action) => applyOk(outcome.state, action), {
      state: game,
      events: [],
    });
  }

  it('R-010: empieza quien saca el valor más alto de la ronda', () => {
    const game = newGame('yellow', 'blue', 'red');

    const afterYellow = applyOk(game, roll('yellow', 3));
    expect(afterYellow.events).toEqual([{ type: 'initial-roll', player: 'yellow', value: 3 }]);
    expect(afterYellow.state.turn).toBe('blue');
    expect(afterYellow.state.initialRoll).toEqual({
      contenders: ['yellow', 'blue', 'red'],
      rolls: [3],
    });

    const { state, events } = play(afterYellow.state, roll('blue', 5), roll('red', 2));

    expect(events).toEqual([
      { type: 'initial-roll', player: 'red', value: 2 },
      { type: 'first-player', player: 'blue' },
    ]);
    expect(state.initialRoll).toBeNull();
    expect(state.turn).toBe('blue');
    expect(state.pendingRoll).toBeNull();
    expect(state.pieces).toEqual(game.pieces);
  });

  it('R-010: los empatados en el valor más alto repiten en una nueva ronda', () => {
    const game = newGame('yellow', 'blue', 'red');

    const { state, events } = play(game, roll('yellow', 6), roll('blue', 2), roll('red', 6));

    expect(events).toEqual([
      { type: 'initial-roll', player: 'red', value: 6 },
      { type: 'initial-roll-tie', players: ['yellow', 'red'] },
    ]);
    expect(state.initialRoll).toEqual({ contenders: ['yellow', 'red'], rolls: [] });
    expect(state.turn).toBe('yellow');
    expect(state.sixesInRow).toBe(0);
  });

  it('R-010: en la nueva ronda solo cuentan las tiradas de los empatados', () => {
    const tied = play(
      newGame('yellow', 'blue', 'red'),
      roll('yellow', 6),
      roll('blue', 2),
      roll('red', 6),
    );

    const afterYellow = applyOk(tied.state, roll('yellow', 1));
    expect(afterYellow.state.turn).toBe('red');

    const { state, events } = applyOk(afterYellow.state, roll('red', 4));

    expect(events).toEqual([
      { type: 'initial-roll', player: 'red', value: 4 },
      { type: 'first-player', player: 'red' },
    ]);
    expect(state.initialRoll).toBeNull();
    expect(state.turn).toBe('red');
  });

  it('R-010: en la tirada inicial solo se acepta la tirada del jugador al que le toca', () => {
    const { state } = applyOk(newGame('yellow', 'blue', 'red'), roll('yellow', 3));

    expectRejected(state, roll('yellow', 4), 'not-your-turn');
    expectRejected(state, { type: 'move', player: 'yellow', pieceId: 'yellow-0' }, 'not-your-turn');
    expectRejected(state, roll('green', 4), 'not-your-turn');
    expectRejected(
      state,
      { type: 'move', player: 'blue', pieceId: 'blue-0' },
      'initial-roll-pending',
    );
  });

  it('R-002, R-010: una tirada inicial fuera de 1 a 6 se rechaza', () => {
    const game = newGame('yellow', 'red');

    expectRejected(game, roll('yellow', 0), 'invalid-roll');
    expectRejected(game, roll('yellow', 7), 'invalid-roll');
  });

  it('R-010: si empatan todos, repiten todos', () => {
    const { state, events } = play(
      newGame('yellow', 'blue', 'red'),
      roll('yellow', 4),
      roll('blue', 4),
      roll('red', 4),
    );

    expect(events).toEqual([
      { type: 'initial-roll', player: 'red', value: 4 },
      { type: 'initial-roll-tie', players: ['yellow', 'blue', 'red'] },
    ]);
    expect(state.initialRoll).toEqual({ contenders: ['yellow', 'blue', 'red'], rolls: [] });
    expect(state.turn).toBe('yellow');
  });

  it('R-010: un empate que no es el valor más alto no cuenta', () => {
    const { state, events } = play(
      newGame('yellow', 'blue', 'red'),
      roll('yellow', 2),
      roll('blue', 2),
      roll('red', 5),
    );

    expect(events).toEqual([
      { type: 'initial-roll', player: 'red', value: 5 },
      { type: 'first-player', player: 'red' },
    ]);
    expect(state.initialRoll).toBeNull();
    expect(state.turn).toBe('red');
  });

  it('R-010: quien gana la tirada inicial empieza su turno tirando, con las fichas en casa', () => {
    const started = play(newGame('yellow', 'blue'), roll('yellow', 2), roll('blue', 5));

    const { state, events } = applyOk(started.state, roll('blue', 5));

    expect(events).toEqual([]);
    expect(state.pendingRoll).toBe(5);
    expect(legalMoves(state)).toEqual([{ pieceId: 'blue-0', to: track(22) }]);
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
