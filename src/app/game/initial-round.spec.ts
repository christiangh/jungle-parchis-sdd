import { COLORS, GameEvent } from '@engine';
import { InitialRound, initialRoundText, LONGEST_ROUND, nextInitialRound } from './initial-round';

/** Round after each action, from no round, as the store will fold them. */
function fold(...actions: (readonly GameEvent[])[]): InitialRound | null {
  return actions.reduce<InitialRound | null>(
    (round, events) => nextInitialRound(round, events),
    null,
  );
}

const YELLOW_5: GameEvent = { type: 'initial-roll', player: 'yellow', value: 5 };
const BLUE_3: GameEvent = { type: 'initial-roll', player: 'blue', value: 3 };

describe('initial-round', () => {
  it('HU-06.2, RF-014: acumula las tiradas de la ronda en orden', () => {
    expect(fold([YELLOW_5], [BLUE_3])).toEqual({
      rolls: [
        { color: 'yellow', value: 5 },
        { color: 'blue', value: 3 },
      ],
      tie: null,
      closed: false,
    });
  });

  it('HU-06.3, RF-014: el empate cierra la ronda con todas sus tiradas y los equipos empatados', () => {
    const round = fold(
      [{ type: 'initial-roll', player: 'yellow', value: 6 }],
      [BLUE_3],
      [
        { type: 'initial-roll', player: 'red', value: 6 },
        { type: 'initial-roll-tie', players: ['yellow', 'red'] },
      ],
    );
    expect(round).toEqual({
      rolls: [
        { color: 'yellow', value: 6 },
        { color: 'blue', value: 3 },
        { color: 'red', value: 6 },
      ],
      tie: ['yellow', 'red'],
      closed: true,
    });
  });

  it('HU-06.3, RF-015: la primera tirada del desempate empieza una ronda nueva con solo esa tirada', () => {
    const round = fold(
      [{ type: 'initial-roll', player: 'yellow', value: 6 }],
      [
        { type: 'initial-roll', player: 'red', value: 6 },
        { type: 'initial-roll-tie', players: ['yellow', 'red'] },
      ],
      [{ type: 'initial-roll', player: 'yellow', value: 2 }],
    );
    expect(round).toEqual({ rolls: [{ color: 'yellow', value: 2 }], tie: null, closed: false });
  });

  it('HU-06.4, RF-014: first-player cierra la ronda y conserva sus tiradas, sin empate', () => {
    const round = fold(
      [YELLOW_5],
      [
        { type: 'initial-roll', player: 'blue', value: 6 },
        { type: 'first-player', player: 'blue' },
      ],
    );
    expect(round).toEqual({
      rolls: [
        { color: 'yellow', value: 5 },
        { color: 'blue', value: 6 },
      ],
      tie: null,
      closed: true,
    });
  });

  it('RF-015: una acción sin tirada inicial da null', () => {
    const closed = fold(
      [YELLOW_5],
      [
        { type: 'initial-roll', player: 'blue', value: 6 },
        { type: 'first-player', player: 'blue' },
      ],
    );
    expect(closed).not.toBeNull();
    expect(nextInitialRound(closed, [{ type: 'roll-lost', player: 'blue', value: 3 }])).toBeNull();
    expect(nextInitialRound(null, [{ type: 'turn-changed', player: 'red' }])).toBeNull();
  });

  it('HU-06.6, RF-015: el texto accesible nombra cada equipo con su valor', () => {
    expect(initialRoundText(fold([YELLOW_5], [BLUE_3])!)).toBe('Amarillo saca 5, Azul saca 3.');
  });

  it('HU-06.6, RF-015: con empate, el texto accesible lo añade al final', () => {
    const round = fold(
      [{ type: 'initial-roll', player: 'yellow', value: 6 }],
      [
        { type: 'initial-roll', player: 'red', value: 6 },
        { type: 'initial-roll-tie', players: ['yellow', 'red'] },
      ],
    );
    expect(initialRoundText(round!)).toBe(
      'Amarillo saca 6, Rojo saca 6, empate entre Amarillo y Rojo.',
    );
  });

  it('RF-015: LONGEST_ROUND tiene las cuatro tiradas y el empate de los cuatro', () => {
    expect(LONGEST_ROUND.rolls.map(({ color }) => color)).toEqual(COLORS);
    expect(LONGEST_ROUND.tie).toEqual(COLORS);
    expect(LONGEST_ROUND.closed).toBe(true);
  });
});
