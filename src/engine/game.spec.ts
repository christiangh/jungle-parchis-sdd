import { applyAction } from './actions';
import { Color } from './board';
import { createGame, GameConfig, GameState } from './game';
import { deepFreeze } from './test-utils';

function createOk(config: GameConfig): GameState {
  const result = createGame(config);
  if (!result.ok) {
    return expect.unreachable(`game rejected: ${result.error}`);
  }
  return result.value;
}

describe('createGame', () => {
  it('R-010: crea una partida de amarillo y rojo en fase de tirada inicial, empezando a tirar amarillo', () => {
    const game = createOk({ players: ['yellow', 'red'] });

    expect(game.players).toEqual(['yellow', 'red']);
    expect(game.pieces.filter((piece) => piece.color === 'yellow')).toHaveLength(4);
    expect(game.pieces.filter((piece) => piece.color === 'red')).toHaveLength(4);
    expect(game.pieces).toHaveLength(8);
    expect(game.initialRoll).toEqual({ contenders: ['yellow', 'red'], rolls: [] });
    expect(game.turn).toBe('yellow');
    expect(game.pendingRoll).toBeNull();
    expect(game.winner).toBeNull();
  });

  it('R-010: una partida nueva empieza en fase de tirada inicial con todos optando y tira primero el primero en el orden de turno', () => {
    const game = createOk({ players: ['blue', 'red', 'yellow'] });

    expect(game.initialRoll).toEqual({ contenders: ['yellow', 'blue', 'red'], rolls: [] });
    expect(game.turn).toBe('yellow');
  });

  it('R-001: acepta partidas de 2, 3 y 4 colores distintos', () => {
    const configs: GameConfig[] = [
      { players: ['blue', 'green'] },
      { players: ['yellow', 'blue', 'red'] },
      { players: ['yellow', 'blue', 'red', 'green'] },
    ];
    for (const config of configs) {
      const game = createOk(config);
      expect(game.players).toHaveLength(config.players.length);
      expect(game.pieces).toHaveLength(config.players.length * 4);
    }
  });

  it('R-001: rechaza una partida con menos de 2 o más de 4 colores', () => {
    const configs: GameConfig[] = [
      { players: [] },
      { players: ['yellow'] },
      { players: ['yellow', 'blue', 'red', 'green', 'yellow'] },
    ];
    for (const config of configs) {
      expect(createGame(config)).toEqual({ ok: false, error: 'invalid-player-count' });
    }
  });

  it('R-001: rechaza colores repetidos', () => {
    expect(createGame({ players: ['blue', 'blue'] })).toEqual({
      ok: false,
      error: 'duplicate-color',
    });
    expect(createGame({ players: ['yellow', 'red', 'yellow'] })).toEqual({
      ok: false,
      error: 'duplicate-color',
    });
  });

  it('R-010: rechaza la tirada inicial de un color que no participa', () => {
    const game = createOk({ players: ['blue', 'green'] });
    const snapshot = structuredClone(game);

    const result = applyAction(deepFreeze(game), { type: 'roll', player: 'red', value: 4 });

    expect(result).toEqual({ ok: false, error: 'not-your-turn' });
    expect(game).toEqual(snapshot);
  });

  it('R-004: todas las fichas empiezan en casa, fuera del tablero', () => {
    const game = createOk({ players: ['yellow', 'blue', 'red', 'green'] });

    expect(game.pieces).toHaveLength(16);
    for (const piece of game.pieces) {
      expect(piece.position).toEqual({ kind: 'home' });
    }
    expect(game.pieces.map((piece) => piece.id)).toEqual(
      (['yellow', 'blue', 'red', 'green'] as const).flatMap((color) =>
        [0, 1, 2, 3].map((index) => `${color}-${index}`),
      ),
    );
  });

  it('R-010: guarda los jugadores en el orden de turno amarillo, azul, rojo, verde', () => {
    const game = createOk({ players: ['green', 'red', 'yellow'] });

    expect(game.players).toEqual(['yellow', 'red', 'green']);
  });

  it('createGame no modifica la lista de colores recibida', () => {
    const players: readonly Color[] = Object.freeze(['red', 'yellow']);

    const game = createOk({ players });

    expect(players).toEqual(['red', 'yellow']);
    expect(game.players).not.toBe(players);
  });

  it('R-023: el orden de llegada empieza con todas las fichas en el orden de las fichas', () => {
    const game = createOk({ players: ['yellow', 'red'] });

    expect(game.arrivalOrder).toEqual(game.pieces.map((piece) => piece.id));
  });
});
