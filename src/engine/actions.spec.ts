import { Action, ActionError, ActionOutcome, applyAction } from './actions';
import { GameState } from './game';
import { buildGame, deepFreeze, track } from './test-utils';

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
