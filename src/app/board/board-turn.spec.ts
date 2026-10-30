import { applyAction, GameState, legalMoves } from '@engine';
import { animatedPieces, homeInTurn, inactiveHomes } from './board-turn';
import { NEW_GAME, newGame, rolled, stateWith } from './board-test-utils';

/** Game already started, with blue in turn and nothing pending. */
const BLUE_TURN: GameState = { ...NEW_GAME, initialRoll: null, turn: 'blue' };

describe('homeInTurn', () => {
  it('RF-007: en un turno sin tirada es la casa del equipo en turno', () => {
    expect(homeInTurn(BLUE_TURN)).toBe('blue');
  });

  it('RF-007: en la tirada inicial es la casa de quien tira, también en un desempate', () => {
    expect(homeInTurn(NEW_GAME)).toBe('yellow');
    const tie: GameState = {
      ...NEW_GAME,
      turn: 'red',
      initialRoll: { contenders: ['yellow', 'red'], rolls: [6] },
    };
    expect(homeInTurn(tie)).toBe('red');
  });

  it('RF-007: con tirada o premio pendientes sigue siendo la casa del equipo en turno', () => {
    expect(homeInTurn({ ...BLUE_TURN, pendingRoll: 4 })).toBe('blue');
    expect(homeInTurn({ ...BLUE_TURN, pendingBonus: 20 })).toBe('blue');
  });

  it('RF-007: con la partida terminada no hay ninguna casa en turno', () => {
    expect(homeInTurn({ ...BLUE_TURN, winner: 'red' })).toBeNull();
  });
});

describe('animatedPieces', () => {
  it('RF-007: al empezar, solo las cuatro fichas amarillas, en casa y con la tirada inicial', () => {
    expect(animatedPieces(NEW_GAME)).toEqual(
      new Set(['yellow-0', 'yellow-1', 'yellow-2', 'yellow-3']),
    );
  });

  it('RF-007: solo las fichas en casa del equipo en turno, no las que han salido ni las de otros equipos', () => {
    const state = rolled(
      [
        ['blue-0', { kind: 'track', square: 30 }],
        ['blue-1', { kind: 'goal' }],
        ['red-0', { kind: 'track', square: 40 }],
      ],
      'blue',
      5,
    );
    expect(animatedPieces(state)).toEqual(new Set(['blue-2', 'blue-3']));
  });

  it('RF-007: con el equipo en turno sin fichas en casa, ninguna', () => {
    const state: GameState = {
      ...stateWith([
        ['yellow-0', { kind: 'track', square: 5 }],
        ['yellow-1', { kind: 'track', square: 12 }],
        ['yellow-2', { kind: 'lane', square: 3 }],
        ['yellow-3', { kind: 'goal' }],
      ]),
      initialRoll: null,
      turn: 'yellow',
    };
    expect(animatedPieces(state)).toEqual(new Set());
  });

  it('RF-007: con la partida terminada, ninguna', () => {
    expect(animatedPieces({ ...BLUE_TURN, winner: 'red' })).toEqual(new Set());
  });
});

describe('inactiveHomes', () => {
  it('RF-009: con amarillo, rojo y verde solo está inactiva la casa azul', () => {
    expect(inactiveHomes(newGame(['yellow', 'red', 'green']))).toEqual(new Set(['blue']));
  });

  it('HU-04.1: con amarillo y verde están inactivas las casas azul y roja', () => {
    expect(inactiveHomes(newGame(['yellow', 'green']))).toEqual(new Set(['blue', 'red']));
  });

  it('RF-009: con los cuatro equipos no hay ninguna casa inactiva', () => {
    expect(inactiveHomes(NEW_GAME)).toEqual(new Set());
  });

  it('HU-04.2: en una partida de amarillo y verde nunca está en turno una casa inactiva', () => {
    let state = newGame(['yellow', 'green']);
    const inactive = inactiveHomes(state);
    expect(inactive.size).toBe(2);
    // Fixed rolls, with a 6 to take pieces out and play some turns.
    const rolls = [2, 5, 5, 3, 6, 4, 1, 5, 2, 6, 3, 4, 5, 1, 2, 3, 4, 5, 6, 1];
    const homes = new Set<string>();
    for (const value of rolls) {
      const home = homeInTurn(state);
      expect(home).not.toBeNull();
      homes.add(home!);
      expect(inactive.has(home!)).toBe(false);
      const rolledState = applyAction(state, { type: 'roll', player: state.turn, value });
      if (!rolledState.ok) {
        throw new Error(rolledState.error);
      }
      state = rolledState.value.state;
      while (state.pendingRoll !== null || state.pendingBonus !== null) {
        const [move] = legalMoves(state);
        const moved = applyAction(state, {
          type: 'move',
          player: state.turn,
          pieceId: move.pieceId,
        });
        if (!moved.ok) {
          throw new Error(moved.error);
        }
        state = moved.value.state;
      }
    }
    expect(homes).toEqual(new Set(['yellow', 'green']));
  });
});
