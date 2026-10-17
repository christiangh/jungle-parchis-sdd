import { Color } from './board';
import { createGame, GameConfig, GameState } from './game';

function createOk(config: GameConfig): GameState {
  const result = createGame(config);
  if (!result.ok) {
    return expect.unreachable(`game rejected: ${result.error}`);
  }
  return result.value;
}

describe('createGame', () => {
  it('HU-01: crea una partida de amarillo y rojo con turno de amarillo', () => {
    const game = createOk({ players: ['yellow', 'red'], firstPlayer: 'yellow' });

    expect(game.players).toEqual(['yellow', 'red']);
    expect(game.pieces.filter((piece) => piece.color === 'yellow')).toHaveLength(4);
    expect(game.pieces.filter((piece) => piece.color === 'red')).toHaveLength(4);
    expect(game.pieces).toHaveLength(8);
    expect(game.turn).toBe('yellow');
    expect(game.pendingRoll).toBeNull();
    expect(game.winner).toBeNull();
  });

  it('R-001: acepta partidas de 2, 3 y 4 colores distintos', () => {
    const configs: GameConfig[] = [
      { players: ['blue', 'green'], firstPlayer: 'green' },
      { players: ['yellow', 'blue', 'red'], firstPlayer: 'blue' },
      { players: ['yellow', 'blue', 'red', 'green'], firstPlayer: 'red' },
    ];
    for (const config of configs) {
      const game = createOk(config);
      expect(game.players).toHaveLength(config.players.length);
      expect(game.pieces).toHaveLength(config.players.length * 4);
    }
  });

  it('R-001: rechaza una partida con menos de 2 o más de 4 colores', () => {
    const configs: GameConfig[] = [
      { players: [], firstPlayer: 'yellow' },
      { players: ['yellow'], firstPlayer: 'yellow' },
      { players: ['yellow', 'blue', 'red', 'green', 'yellow'], firstPlayer: 'yellow' },
    ];
    for (const config of configs) {
      expect(createGame(config)).toEqual({ ok: false, error: 'invalid-player-count' });
    }
  });

  it('R-001: rechaza colores repetidos', () => {
    expect(createGame({ players: ['blue', 'blue'], firstPlayer: 'blue' })).toEqual({
      ok: false,
      error: 'duplicate-color',
    });
    expect(createGame({ players: ['yellow', 'red', 'yellow'], firstPlayer: 'red' })).toEqual({
      ok: false,
      error: 'duplicate-color',
    });
  });

  it('HU-01: rechaza un jugador inicial que no participa', () => {
    expect(createGame({ players: ['blue', 'green'], firstPlayer: 'red' })).toEqual({
      ok: false,
      error: 'first-player-not-playing',
    });
  });

  it('R-004: todas las fichas empiezan en casa, fuera del tablero', () => {
    const game = createOk({ players: ['yellow', 'blue', 'red', 'green'], firstPlayer: 'yellow' });

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
    const game = createOk({ players: ['green', 'red', 'yellow'], firstPlayer: 'red' });

    expect(game.players).toEqual(['yellow', 'red', 'green']);
  });

  it('createGame no modifica la lista de colores recibida', () => {
    const players: readonly Color[] = Object.freeze(['red', 'yellow']);

    const game = createOk({ players, firstPlayer: 'red' });

    expect(players).toEqual(['red', 'yellow']);
    expect(game.players).not.toBe(players);
  });
});
