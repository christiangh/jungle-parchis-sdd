import {
  Action,
  applyAction,
  Color,
  COLORS,
  createGame,
  DIE_FACES,
  GameEvent,
  GameState,
  legalMoves,
} from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { LONGEST_PLAY, lastPlay } from './last-play';

/** Sentence for the events of one action of red. */
function text(...events: GameEvent[]): string | undefined {
  return lastPlay('red', events)?.text;
}

/** Reproducible numbers in [0, 1) from a seed (mulberry32), so the random games can be replayed. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

/** The 200 random games take about 3 s alone, close to the default 5 s with the whole suite. */
const RANDOM_GAMES_TIMEOUT_MS = 30_000;

/** Plays a whole random game and returns each accepted action with its events. */
function randomGame(seed: number): { player: Color; events: readonly GameEvent[] }[] {
  const random = seededRandom(seed);
  const created = createGame({ players: COLORS });
  if (!created.ok) {
    throw new Error(created.error);
  }
  let state: GameState = created.value;
  const plays: { player: Color; events: readonly GameEvent[] }[] = [];
  while (state.winner === null) {
    const moves = legalMoves(state);
    const action: Action =
      moves.length > 0
        ? {
            type: 'move',
            player: state.turn,
            pieceId: moves[Math.floor(random() * moves.length)].pieceId,
          }
        : { type: 'roll', player: state.turn, value: Math.floor(random() * DIE_FACES) + 1 };
    const result = applyAction(state, action);
    if (!result.ok) {
      throw new Error(result.error);
    }
    plays.push({ player: action.player, events: result.value.events });
    state = result.value.state;
  }
  return plays;
}

describe('lastPlay', () => {
  it('RF-011: sin jugador o sin eventos no hay pestaña', () => {
    expect(lastPlay(null, [])).toBeNull();
    expect(lastPlay('red', [])).toBeNull();
  });

  it('RF-012: con solo el cambio de turno no hay pestaña', () => {
    expect(lastPlay('red', [{ type: 'turn-changed', player: 'green' }])).toBeNull();
  });

  it('RF-011: el color es el del equipo que actúa', () => {
    expect(lastPlay('green', [{ type: 'roll-again', player: 'green' }])).toEqual({
      color: 'green',
      text: 'Repite.',
    });
  });

  it('RF-012: tirada inicial', () => {
    expect(text({ type: 'initial-roll', player: 'red', value: 5 })).toBe('Saca 5.');
  });

  it('RF-012: empate en la tirada inicial, nombrando a los equipos', () => {
    expect(
      text(
        { type: 'initial-roll', player: 'red', value: 6 },
        { type: 'initial-roll-tie', players: ['yellow', 'red'] },
      ),
    ).toBe('Saca 6, empate entre Amarillo y Rojo.');
  });

  it('RF-012: empate de cuatro en la tirada inicial', () => {
    expect(text({ type: 'initial-roll-tie', players: COLORS })).toBe(
      'Empate entre Amarillo, Azul, Rojo y Verde.',
    );
  });

  it('RF-012: la tirada inicial que decide quién empieza no dice el turno', () => {
    expect(
      text(
        { type: 'initial-roll', player: 'red', value: 1 },
        { type: 'first-player', player: 'blue' },
      ),
    ).toBe('Saca 1.');
  });

  it('RF-012: salida de casa', () => {
    expect(
      text({ type: 'piece-left-home', pieceId: 'red-0', to: { kind: 'track', square: 39 } }),
    ).toBe('Saca una ficha de casa.');
  });

  it('RF-012: avance', () => {
    expect(
      text({
        type: 'piece-advanced',
        pieceId: 'red-2',
        from: { kind: 'track', square: 56 },
        to: { kind: 'track', square: 60 },
      }),
    ).toBe('Mueve una ficha.');
  });

  it('RF-012: comer, nombrando al equipo de la ficha comida', () => {
    expect(
      text({ type: 'piece-captured', pieceId: 'blue-1', at: { kind: 'track', square: 39 } }),
    ).toBe('Se come una ficha de Azul.');
  });

  it('RF-012: llegada a meta', () => {
    expect(text({ type: 'piece-reached-goal', pieceId: 'red-3' })).toBe('Llega a la meta.');
  });

  it('RF-012: premio ganado', () => {
    expect(text({ type: 'bonus-earned', player: 'red', amount: 20 })).toBe('Cuenta 20.');
  });

  it('RF-012: premio perdido', () => {
    expect(text({ type: 'bonus-lost', player: 'red', amount: 10 })).toBe('Pierde el +10.');
  });

  it('RF-012: tirada perdida, sin el turno siguiente', () => {
    expect(
      text(
        { type: 'roll-lost', player: 'red', value: 4 },
        { type: 'turn-changed', player: 'green' },
      ),
    ).toBe('Saca 4 y pierde la tirada.');
  });

  it('RF-012: repetir', () => {
    expect(text({ type: 'roll-again', player: 'red' })).toBe('Repite.');
  });

  it('RF-012: fin de la partida', () => {
    expect(
      text({ type: 'piece-reached-goal', pieceId: 'red-3' }, { type: 'game-over', winner: 'red' }),
    ).toBe('Llega a la meta, gana la partida.');
  });

  it('RF-012: varios eventos en una sola frase, en el orden del motor', () => {
    expect(
      text(
        { type: 'piece-left-home', pieceId: 'red-0', to: { kind: 'track', square: 39 } },
        { type: 'piece-captured', pieceId: 'green-1', at: { kind: 'track', square: 39 } },
        { type: 'bonus-earned', player: 'red', amount: 20 },
      ),
    ).toBe('Saca una ficha de casa, se come una ficha de Verde, cuenta 20.');
  });

  it('HU-05.4: tres seises sin ficha que vuelva, en una frase y sin el turno', () => {
    expect(
      text(
        { type: 'three-sixes', player: 'red', pieceId: null },
        { type: 'turn-changed', player: 'green' },
      ),
    ).toBe('Tres seises.');
  });

  it('HU-05.4: tres seises con la ficha que vuelve a casa, en una frase y sin el turno', () => {
    expect(
      text(
        { type: 'three-sixes', player: 'red', pieceId: 'red-2' },
        { type: 'turn-changed', player: 'green' },
      ),
    ).toBe('Tres seises y su ficha vuelve a casa.');
  });

  it(
    'RNF-010, CE-01: en 200 partidas aleatorias ninguna frase nombra a quien actúa ni pasa de LONGEST_PLAY',
    () => {
      // Collected and checked once: an assertion per play is too slow for so many games.
      let tabs = 0;
      const wrong = new Set<string>();
      for (let seed = 1; seed <= 200; seed++) {
        for (const { player, events } of randomGame(seed)) {
          const play = lastPlay(player, events);
          if (play === null) {
            continue;
          }
          tabs++;
          const tie = events.some((event) => event.type === 'initial-roll-tie');
          if (
            play.color !== player ||
            play.text.length === 0 ||
            play.text.length > LONGEST_PLAY.length ||
            /turno/i.test(play.text) ||
            (!tie && play.text.includes(COLOR_NAMES[player]))
          ) {
            wrong.add(`${player}: ${play.text}`);
          }
        }
      }
      expect([...wrong]).toEqual([]);
      expect(tabs).toBeGreaterThan(0);
    },
    RANDOM_GAMES_TIMEOUT_MS,
  );
});
