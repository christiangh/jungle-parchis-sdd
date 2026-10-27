import { COLORS, createGame, GameState } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { headline } from './headline';

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
  it('RF-004: en la tirada inicial dice quién tira, en su color', () => {
    expect(headline(newGame())).toEqual({
      color: 'yellow',
      title: 'Tirada inicial · Amarillo',
      instruction: 'Toca el dado',
    });
  });

  it('RF-004: en un desempate dice a quién le toca tirar', () => {
    const tie: GameState = {
      ...newGame(),
      turn: 'red',
      initialRoll: { contenders: ['yellow', 'red'], rolls: [6] },
    };
    expect(headline(tie)).toEqual({
      color: 'red',
      title: 'Tirada inicial · Rojo',
      instruction: 'Toca el dado',
    });
  });

  it('RF-004: sin tirada pendiente pide tirar al jugador en turno', () => {
    expect(headline(PLAYING)).toEqual({
      color: 'red',
      title: 'Turno de Rojo',
      instruction: 'Toca el dado',
    });
  });

  it('RF-004: con tirada pendiente muestra su valor y pide elegir ficha', () => {
    expect(headline({ ...PLAYING, pendingRoll: 4 })).toEqual({
      color: 'red',
      title: 'Turno de Rojo · 4',
      instruction: 'Elige una ficha iluminada',
    });
  });

  it('RF-004: con premio pendiente pide usarlo con su valor', () => {
    expect(headline({ ...PLAYING, pendingBonus: 20 })).toEqual({
      color: 'red',
      title: 'Turno de Rojo',
      instruction: 'Usa tu +20',
    });
    expect(headline({ ...PLAYING, pendingBonus: 10 }).instruction).toBe('Usa tu +10');
  });

  it('RF-004: con ganador dice quién ha ganado, en su color y sin instrucción', () => {
    expect(headline({ ...PLAYING, winner: 'blue' })).toEqual({
      color: 'blue',
      title: 'Gana Azul',
      instruction: null,
    });
  });

  it('RF-004: cada color tiene su nombre en castellano', () => {
    expect(COLOR_NAMES).toEqual({
      yellow: 'Amarillo',
      blue: 'Azul',
      red: 'Rojo',
      green: 'Verde',
    });
  });
});
