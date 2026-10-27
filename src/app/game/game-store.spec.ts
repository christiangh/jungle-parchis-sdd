import { TestBed } from '@angular/core/testing';
import { COLORS, createGame, GameState } from '@engine';
import { DICE_SPIN_MS, GameStore, INITIAL_FACE, waitsForRoll } from './game-store';
import { provideRolls } from './game-test-utils';

/** Makes `prefers-reduced-motion: reduce` match, or not, for the rest of the test. */
function stubReducedMotion(reduce: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
  }));
}

function storeWith(...rolls: number[]): GameStore {
  TestBed.configureTestingModule({ providers: [provideRolls(...rolls)] });
  return TestBed.inject(GameStore);
}

/** Rolls `count` times, letting each spin finish. */
function rollTimes(store: GameStore, count: number): void {
  for (let i = 0; i < count; i++) {
    store.roll();
    vi.advanceTimersByTime(DICE_SPIN_MS);
  }
}

describe('GameStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('RF-021: empieza con una partida nueva de 4 jugadores creada por el motor', () => {
    const store = storeWith();
    const game = createGame({ players: COLORS });
    expect(game.ok).toBe(true);
    expect(store.state()).toEqual((game as { value: GameState }).value);
    expect(store.legalMoves()).toEqual([]);
    expect(store.lastEvents()).toEqual([]);
  });

  it('RF-007: muestra una cara fija antes de la primera tirada', () => {
    const store = storeWith();
    expect(store.face()).toBe(INITIAL_FACE);
    expect(store.rolling()).toBe(false);
    expect(store.canRoll()).toBe(true);
  });

  it('RF-009: muestra la cara al tocar y aplica la tirada al terminar el giro', () => {
    const store = storeWith(3);
    store.roll();

    expect(store.face()).toBe(3);
    expect(store.rolling()).toBe(true);
    expect(store.canRoll()).toBe(false);
    expect(store.state().initialRoll?.rolls).toEqual([]);

    vi.advanceTimersByTime(DICE_SPIN_MS - 1);
    expect(store.state().initialRoll?.rolls).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(store.rolling()).toBe(false);
    expect(store.state().initialRoll?.rolls).toEqual([3]);
    expect(store.state().turn).toBe('blue');
    expect(store.lastEvents()).toEqual([{ type: 'initial-roll', player: 'yellow', value: 3 }]);
    expect(store.canRoll()).toBe(true);
  });

  it('RNF-003: aplica la tirada a los 500 ms, sin esperas añadidas', () => {
    expect(DICE_SPIN_MS).toBe(500);
  });

  it('RNF-002: con movimiento reducido aplica la tirada sin girar', () => {
    stubReducedMotion(true);
    const store = storeWith(4);
    store.roll();

    expect(store.rolling()).toBe(false);
    expect(store.face()).toBe(4);
    expect(store.state().initialRoll?.rolls).toEqual([4]);
  });

  it('RF-009: ignora los toques mientras el dado gira', () => {
    const store = storeWith(3, 5);
    store.roll();
    store.roll();
    vi.advanceTimersByTime(DICE_SPIN_MS);

    expect(store.face()).toBe(3);
    expect(store.state().initialRoll?.rolls).toEqual([3]);
  });

  it('HU-02.2: con 3, 5, 2 y 1 empieza azul, que debe tirar', () => {
    const store = storeWith(3, 5, 2, 1);
    rollTimes(store, 4);

    expect(store.state().initialRoll).toBeNull();
    expect(store.state().turn).toBe('blue');
    expect(store.lastEvents()).toContainEqual({ type: 'first-player', player: 'blue' });
    expect(store.canRoll()).toBe(true);
  });

  it('RF-011: un empate entre amarillo y rojo se resuelve con una ronda solo entre ellos', () => {
    const store = storeWith(6, 2, 6, 1, 4, 5);
    rollTimes(store, 4);

    expect(store.state().initialRoll?.contenders).toEqual(['yellow', 'red']);
    expect(store.state().turn).toBe('yellow');
    expect(store.lastEvents()).toContainEqual({
      type: 'initial-roll-tie',
      players: ['yellow', 'red'],
    });

    rollTimes(store, 1);
    expect(store.state().turn).toBe('red');

    rollTimes(store, 1);
    expect(store.state().initialRoll).toBeNull();
    expect(store.state().turn).toBe('red');
  });

  it('HU-03.4: el dado no responde con una tirada pendiente', () => {
    // Blue starts and rolls a 5, with a piece to take out of home.
    const store = storeWith(3, 5, 2, 1, 5, 6);
    rollTimes(store, 5);

    expect(store.state().pendingRoll).toBe(5);
    expect(store.legalMoves()).toHaveLength(1);
    expect(store.canRoll()).toBe(false);

    store.roll();
    expect(store.rolling()).toBe(false);
    expect(store.face()).toBe(5);
  });

  it('HU-03.4: solo se espera tirada sin tirada ni premio pendientes y sin ganador', () => {
    const store = storeWith(3, 5, 2, 1);
    rollTimes(store, 4);
    const playing = store.state();

    expect(waitsForRoll(playing)).toBe(true);
    expect(waitsForRoll({ ...playing, pendingRoll: 4 })).toBe(false);
    expect(waitsForRoll({ ...playing, pendingBonus: 20 })).toBe(false);
    expect(waitsForRoll({ ...playing, winner: 'blue' })).toBe(false);
  });

  describe('selección', () => {
    // Blue starts and takes a piece out of home with a 5: a single legal move.
    const EXIT = [3, 5, 2, 1, 5];
    // Blue gets two pieces out on its start square and then rolls a 6: both can move.
    const TWO_MOVES = [3, 5, 2, 1, 5, 4, 4, 1, 5, 5, 4, 3, 6];
    // Red captures a green piece and earns 20 squares with red-0 as its only legal move.
    const CAPTURE = [3, 5, 2, 1, 2, 5, 5, 4, 4, 6, 2, 3, 2, 5, 6, 6];

    /** Rolls each value and, while a roll is pending, selects and confirms its first legal move. */
    function play(store: GameStore, rolls: readonly number[]): void {
      rolls.forEach((_, i) => {
        rollTimes(store, 1);
        const last = i === rolls.length - 1;
        while (!last && store.state().pendingRoll !== null) {
          const before = store.state();
          store.select(store.legalMoves()[0].pieceId);
          store.confirm();
          if (store.state() === before) {
            throw new Error('the selected move was not applied');
          }
        }
      });
    }

    it('RF-016: tocar una ficha con movimiento legal la selecciona', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT);
      expect(store.selected()).toBeNull();

      store.select('blue-0');
      expect(store.selected()).toBe('blue-0');
    });

    it('RF-012: tocar una ficha sin movimiento legal no hace nada', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT);

      store.select('blue-1');
      expect(store.selected()).toBeNull();

      store.select('blue-0');
      store.select('red-0');
      expect(store.selected()).toBe('blue-0');
    });

    it('RF-016: tocar otra vez la ficha seleccionada cancela la selección sin cambiar los resaltados', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT);
      const moves = store.legalMoves();

      store.select('blue-0');
      store.select('blue-0');
      expect(store.selected()).toBeNull();
      expect(store.legalMoves()).toBe(moves);
      expect(store.state().pendingRoll).toBe(5);
    });

    it('RF-016: cancelar borra la selección sin cambiar el estado', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT);
      const state = store.state();

      store.select('blue-0');
      store.cancel();
      expect(store.selected()).toBeNull();
      expect(store.state()).toBe(state);
    });

    it('RF-016: tocar otra ficha resaltada pasa la selección a ella', () => {
      const store = storeWith(...TWO_MOVES);
      play(store, TWO_MOVES);
      expect(store.legalMoves().map((m) => m.pieceId)).toEqual(['blue-0', 'blue-1']);

      store.select('blue-0');
      store.select('blue-1');
      expect(store.selected()).toBe('blue-1');
    });

    it('RF-017: con un solo movimiento legal no se mueve hasta confirmar', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT);
      expect(store.legalMoves()).toHaveLength(1);

      store.confirm();
      expect(store.state().pendingRoll).toBe(5);

      store.select('blue-0');
      expect(store.state().pendingRoll).toBe(5);
    });

    it('RF-016: confirmar aplica el movimiento de la ficha seleccionada y borra la selección', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT);

      store.select('blue-0');
      store.confirm();

      const piece = store.state().pieces.find((p) => p.id === 'blue-0');
      expect(piece?.position).toEqual({ kind: 'track', square: 22 });
      expect(store.selected()).toBeNull();
      expect(store.legalMoves()).toEqual([]);
      expect(store.lastEvents()).toContainEqual(
        expect.objectContaining({ type: 'piece-left-home', pieceId: 'blue-0' }),
      );
      expect(store.state().turn).toBe('red');
    });

    it('RNF-003: seleccionar y confirmar se aplican al momento, sin temporizadores', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT);

      store.select('blue-0');
      store.confirm();
      expect(vi.getTimerCount()).toBe(0);
      expect(store.canRoll()).toBe(true);
    });

    it('RF-019: con un premio pendiente se selecciona y confirma igual, y el dado no responde', () => {
      const store = storeWith(...CAPTURE);
      play(store, CAPTURE);
      store.select('red-0');
      store.confirm();

      expect(store.state().pendingBonus).toBe(20);
      expect(store.legalMoves()).toEqual([{ pieceId: 'red-0', to: { kind: 'track', square: 11 } }]);
      expect(store.canRoll()).toBe(false);
      store.roll();
      expect(store.rolling()).toBe(false);

      store.select('red-0');
      store.confirm();
      const piece = store.state().pieces.find((p) => p.id === 'red-0');
      expect(piece?.position).toEqual({ kind: 'track', square: 11 });
      expect(store.state().pendingBonus).toBeNull();
      expect(store.canRoll()).toBe(true);
    });

    it('RF-020: sin tirada ni premio pendientes no hay nada que seleccionar', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT.slice(0, 4));

      store.select('blue-0');
      store.confirm();
      expect(store.selected()).toBeNull();
      expect(store.lastEvents()).toContainEqual({ type: 'first-player', player: 'blue' });
    });

    it('RF-020: tocar una ficha mientras el dado gira no la selecciona', () => {
      const store = storeWith(...EXIT);
      play(store, EXIT.slice(0, 4));
      store.roll();

      store.select('blue-0');
      vi.advanceTimersByTime(DICE_SPIN_MS);
      expect(store.selected()).toBeNull();
    });
  });

  it('RF-022: una tirada rechazada no cambia el estado ni la cara', () => {
    const store = storeWith(3, 7);
    rollTimes(store, 1);
    const before = store.state();
    const events = store.lastEvents();

    rollTimes(store, 1);

    expect(store.state()).toBe(before);
    expect(store.lastEvents()).toBe(events);
    expect(store.face()).toBe(3);
    expect(store.rolling()).toBe(false);
    expect(store.canRoll()).toBe(true);
  });
});
