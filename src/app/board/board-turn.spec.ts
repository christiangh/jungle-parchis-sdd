import { GameState } from '@engine';
import { animatedPieces, homeInTurn } from './board-turn';
import { NEW_GAME, rolled, stateWith } from './board-test-utils';

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
