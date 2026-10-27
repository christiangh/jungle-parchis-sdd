import { lastPlay } from './last-play';

describe('lastPlay', () => {
  it('RF-005: sin eventos la línea está vacía', () => {
    expect(lastPlay([])).toBe('');
  });

  it('RF-006: tirada inicial', () => {
    expect(lastPlay([{ type: 'initial-roll', player: 'red', value: 5 }])).toBe('Rojo saca 5.');
  });

  it('RF-006: empate en la tirada inicial', () => {
    expect(lastPlay([{ type: 'initial-roll-tie', players: ['yellow', 'red'] }])).toBe(
      'Empate entre Amarillo y Rojo.',
    );
  });

  it('RF-006: empate de tres en la tirada inicial', () => {
    expect(lastPlay([{ type: 'initial-roll-tie', players: ['yellow', 'blue', 'red'] }])).toBe(
      'Empate entre Amarillo, Azul y Rojo.',
    );
  });

  it('RF-006: primer jugador', () => {
    expect(lastPlay([{ type: 'first-player', player: 'blue' }])).toBe('Empieza Azul.');
  });

  it('RF-006: salida de casa', () => {
    expect(
      lastPlay([{ type: 'piece-left-home', pieceId: 'red-0', to: { kind: 'track', square: 39 } }]),
    ).toBe('Rojo saca una ficha de casa.');
  });

  it('RF-006: avance', () => {
    expect(
      lastPlay([
        {
          type: 'piece-advanced',
          pieceId: 'green-2',
          from: { kind: 'track', square: 56 },
          to: { kind: 'track', square: 60 },
        },
      ]),
    ).toBe('Verde mueve una ficha.');
  });

  it('RF-006: comer', () => {
    expect(
      lastPlay([{ type: 'piece-captured', pieceId: 'blue-1', at: { kind: 'track', square: 39 } }]),
    ).toBe('Come una ficha azul.');
  });

  it('RF-006: llegada a meta', () => {
    expect(lastPlay([{ type: 'piece-reached-goal', pieceId: 'yellow-3' }])).toBe('Llega a meta.');
  });

  it('RF-006: premio ganado', () => {
    expect(lastPlay([{ type: 'bonus-earned', player: 'red', amount: 20 }])).toBe('Cuenta 20.');
  });

  it('RF-006: premio perdido', () => {
    expect(lastPlay([{ type: 'bonus-lost', player: 'red', amount: 10 }])).toBe('Pierde el +10.');
  });

  it('RF-006: tirada perdida', () => {
    expect(lastPlay([{ type: 'roll-lost', player: 'red', value: 4 }])).toBe(
      'Rojo saca 4 y pierde la tirada.',
    );
  });

  it('RF-006: repetir', () => {
    expect(lastPlay([{ type: 'roll-again', player: 'red' }])).toBe('Rojo repite.');
  });

  it('RF-006: tres seises sin ficha que vuelva', () => {
    expect(lastPlay([{ type: 'three-sixes', player: 'red', pieceId: null }])).toBe(
      'Tres seises de Rojo.',
    );
  });

  it('RF-006: tres seises con ficha que vuelve a casa', () => {
    expect(lastPlay([{ type: 'three-sixes', player: 'red', pieceId: 'red-2' }])).toBe(
      'Tres seises de Rojo y su ficha vuelve a casa.',
    );
  });

  it('RF-006: cambio de turno', () => {
    expect(lastPlay([{ type: 'turn-changed', player: 'green' }])).toBe('Turno de Verde.');
  });

  it('RF-006: fin de la partida', () => {
    expect(lastPlay([{ type: 'game-over', winner: 'red' }])).toBe('Gana Rojo.');
  });

  it('RF-005: varios eventos en una sola frase, en el orden del motor', () => {
    expect(
      lastPlay([
        { type: 'piece-left-home', pieceId: 'red-0', to: { kind: 'track', square: 39 } },
        { type: 'piece-captured', pieceId: 'blue-1', at: { kind: 'track', square: 39 } },
        { type: 'bonus-earned', player: 'red', amount: 20 },
      ]),
    ).toBe('Rojo saca una ficha de casa, come una ficha azul, cuenta 20.');
  });

  it('HU-07.1: tirada perdida y turno del siguiente', () => {
    expect(
      lastPlay([
        { type: 'roll-lost', player: 'red', value: 4 },
        { type: 'turn-changed', player: 'green' },
      ]),
    ).toBe('Rojo saca 4 y pierde la tirada, turno de Verde.');
  });

  it('HU-07.3: tres seises en una frase con la ficha que vuelve y el turno', () => {
    expect(
      lastPlay([
        { type: 'three-sixes', player: 'red', pieceId: 'red-2' },
        { type: 'turn-changed', player: 'green' },
      ]),
    ).toBe('Tres seises de Rojo y su ficha vuelve a casa, turno de Verde.');
  });

  it('RF-005: la tirada inicial que decide quién empieza', () => {
    expect(
      lastPlay([
        { type: 'initial-roll', player: 'green', value: 1 },
        { type: 'first-player', player: 'blue' },
      ]),
    ).toBe('Verde saca 1, empieza Azul.');
  });
});
