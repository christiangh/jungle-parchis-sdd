import { COLORS, createGame, GameState } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { headline, LONGEST_ACTION } from './headline';

function newGame(): GameState {
  const game = createGame({ players: COLORS });
  if (!game.ok) {
    throw new Error(game.error);
  }
  return game.value;
}

/** Game already started, with red in turn and nothing pending. */
const PLAYING: GameState = { ...newGame(), initialRoll: null, turn: 'red' };

describe('headline', () => {
  it('RF-013: en la tirada inicial pide la tirada inicial, en el color de quien tira', () => {
    expect(headline(newGame())).toEqual({
      color: 'yellow',
      action: 'Tirada inicial: Toca el dado',
      turn: 'Turno de Amarillo.',
    });
  });

  it('HU-06.1, RF-013: en un desempate pide la tirada inicial a quien le toca', () => {
    const tie: GameState = {
      ...newGame(),
      turn: 'red',
      initialRoll: { contenders: ['yellow', 'red'], rolls: [6] },
    };
    expect(headline(tie)).toEqual({
      color: 'red',
      action: 'Tirada inicial: Toca el dado',
      turn: 'Turno de Rojo.',
    });
  });

  it('RF-009: sin tirada pendiente pide tirar al jugador en turno', () => {
    expect(headline(PLAYING)).toEqual({
      color: 'red',
      action: 'Toca el dado',
      turn: 'Turno de Rojo.',
    });
  });

  it('RF-009: con tirada pendiente pide elegir ficha, sin el valor', () => {
    expect(headline({ ...PLAYING, pendingRoll: 4 })).toEqual({
      color: 'red',
      action: 'Elige una ficha',
      turn: 'Turno de Rojo.',
    });
  });

  it('RF-009: con premio pendiente pide usarlo con su valor', () => {
    expect(headline({ ...PLAYING, pendingBonus: 20 })).toEqual({
      color: 'red',
      action: 'Usa tu +20',
      turn: 'Turno de Rojo.',
    });
    expect(headline({ ...PLAYING, pendingBonus: 10 }).action).toBe('Usa tu +10');
  });

  it('RF-009, RF-010: con ganador dice quién ha ganado, en su color y sin turno', () => {
    expect(headline({ ...PLAYING, winner: 'green' })).toEqual({
      color: 'green',
      action: '¡Gana Verde!',
      turn: null,
    });
  });

  it('RF-010: el turno nombra a cada equipo en castellano', () => {
    for (const color of COLORS) {
      expect(headline({ ...PLAYING, turn: color }).turn, color).toBe(
        `Turno de ${COLOR_NAMES[color]}.`,
      );
    }
  });

  it('RF-013: LONGEST_ACTION es la acción más larga del cartel', () => {
    const actions = [
      headline(newGame()),
      headline(PLAYING),
      headline({ ...PLAYING, pendingRoll: 4 }),
      headline({ ...PLAYING, pendingBonus: 20 }),
      ...COLORS.map((color) => headline({ ...PLAYING, winner: color })),
    ].map(({ action }) => action);
    expect(actions).toContain(LONGEST_ACTION);
    for (const action of actions) {
      expect(LONGEST_ACTION.length, action).toBeGreaterThanOrEqual(action.length);
    }
  });

  it('RF-010: cada color tiene su nombre en castellano', () => {
    expect(COLOR_NAMES).toEqual({
      yellow: 'Amarillo',
      blue: 'Azul',
      red: 'Rojo',
      green: 'Verde',
    });
  });
});
