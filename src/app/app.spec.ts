import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Color, COLORS, GameEvent, GameState, legalMoves, PieceId } from '@engine';
import { App } from './app';
import { homes } from './board/board-geometry';
import { stateWith } from './board/board-test-utils';
import { DICE_GLOW } from './game/dice';
import { DICE_SPIN_MS, GameStore } from './game/game-store';
import { provideRolls } from './game/game-test-utils';
import { LONGEST_PLAY } from './game/last-play';
import { TEAM_BG, TEAM_DARK_BG } from './game/turn-banner';
import { MASCOTS } from './shared/mascot';

async function render(...rolls: number[]): Promise<ComponentFixture<App>> {
  TestBed.configureTestingModule({ providers: [provideRolls(...rolls)] });
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  // Fake timers only from here: `whenStable` waits on real ones.
  vi.useFakeTimers();
  return fixture;
}

function element(fixture: ComponentFixture<App>, selector: string): HTMLElement {
  return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector)!;
}

function text(fixture: ComponentFixture<App>, selector: string): string | undefined {
  return element(fixture, selector)?.textContent?.trim();
}

function dice(fixture: ComponentFixture<App>): HTMLButtonElement {
  return element(fixture, 'jp-dice button') as HTMLButtonElement;
}

/** Touches the dice `count` times, letting each spin finish. */
function roll(fixture: ComponentFixture<App>, count = 1): void {
  for (let i = 0; i < count; i++) {
    dice(fixture).click();
    vi.advanceTimersByTime(DICE_SPIN_MS);
    fixture.detectChanges();
  }
}

function touchAreas(fixture: ComponentFixture<App>): Element[] {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('jp-board [data-touch]'),
  );
}

/** Touches the area of a piece or of the ghost, as a pointer would. */
function touch(fixture: ComponentFixture<App>, target: PieceId | 'ghost'): void {
  const area = (fixture.nativeElement as HTMLElement).querySelector(
    `jp-board [data-touch="${target}"]`,
  );
  if (area === null) {
    throw new Error(`no touch area for ${target}`);
  }
  area.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  fixture.detectChanges();
}

/** Mascot drawn inside `selector`, and whether it is animated. */
function mascot(
  fixture: ComponentFixture<App>,
  selector: string,
): { animal: string | null; animated: boolean } {
  const drawn = element(fixture, `${selector} [data-mascot]`);
  return {
    animal: drawn.getAttribute('data-mascot'),
    animated: drawn.hasAttribute('data-animated'),
  };
}

/** Last play tab: its team colour, its tone, its mascot and its sentence. */
function tab(fixture: ComponentFixture<App>) {
  const tab = element(fixture, '[data-last-play] [data-tab]');
  return {
    color: tab.getAttribute('data-color'),
    tone: tab.classList,
    mascot: mascot(fixture, '[data-last-play]'),
    text: text(fixture, '[data-last-play]'),
  };
}

async function renderShowing(store: Partial<GameStore>): Promise<ComponentFixture<App>> {
  TestBed.configureTestingModule({ providers: [{ provide: GameStore, useValue: store }] });
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture;
}

function ghost(fixture: ComponentFixture<App>): Element | null {
  return (fixture.nativeElement as HTMLElement).querySelector('jp-board [data-ghost]');
}

function halos(fixture: ComponentFixture<App>): string[] {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('jp-board [data-piece]'),
  )
    .filter((piece) => piece.querySelector('[data-part="halo"]') !== null)
    .map((piece) => piece.getAttribute('data-piece')!);
}

/**
 * Rolls each value and, while a roll is pending, touches the piece of the first legal move
 * and then its ghost. The last roll is left pending.
 */
function play(fixture: ComponentFixture<App>, rolls: readonly number[]): void {
  const store = TestBed.inject(GameStore);
  rolls.forEach((_, i) => {
    roll(fixture);
    const last = i === rolls.length - 1;
    while (!last && store.state().pendingRoll !== null) {
      const before = store.state();
      touch(fixture, store.legalMoves()[0].pieceId);
      touch(fixture, 'ghost');
      if (store.state() === before) {
        throw new Error('the touched move was not applied');
      }
    }
  });
}

/** Store stub that only shows a fixed state; the legal moves still come from the engine. */
function storeShowing(
  state: GameState,
  lastPlayer: Color | null = null,
  lastEvents: readonly GameEvent[] = [],
): Partial<GameStore> {
  return {
    state: signal(state).asReadonly(),
    lastEvents: signal(lastEvents).asReadonly(),
    lastPlayer: signal(lastPlayer).asReadonly(),
    legalMoves: computed(() => legalMoves(state)),
    face: signal(6).asReadonly(),
    rolling: signal(false).asReadonly(),
    canRoll: computed(() => false),
    selected: signal<PieceId | null>(null).asReadonly(),
    roll: vi.fn(),
    select: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
  };
}

// Blue starts and takes a piece out of home with a 5: a single legal move.
const EXIT = [3, 5, 2, 1, 5];
// Red captures a green piece and earns 20 squares with red-0 as its only legal move.
const CAPTURE = [3, 5, 2, 1, 2, 5, 5, 4, 4, 6, 2, 3, 2, 5, 6, 6];

describe('App', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('crea la aplicación', async () => {
    const fixture = await render();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('RNF-001: el tablero está dentro del landmark main', async () => {
    const fixture = await render();
    expect(element(fixture, 'main [data-board-slot] jp-board svg')).not.toBeNull();
    expect(element(fixture, 'h1')).toBeNull();
  });

  it('RF-001: la página pinta el fondo de jungla sobre su color de carga', async () => {
    const main = element(await render(), 'main');
    expect(main.classList).toContain('bg-jungle');
    expect(main.classList).toContain('bg-jungle-tile');
  });

  it('RF-002: la cabecera con el cartel va encima del tablero', async () => {
    const fixture = await render();
    const header = element(fixture, 'main header');
    const slot = element(fixture, 'main [data-board-slot]');
    expect(header.querySelector('jp-turn-banner')).not.toBeNull();
    expect(header.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('RF-007: el dado está sobre el tablero, en el centro', async () => {
    const fixture = await render();
    const dice = element(fixture, '[data-board-slot] > jp-dice');
    expect(dice).not.toBeNull();
    expect(dice.classList).toContain('top-1/2');
    expect(dice.classList).toContain('left-1/2');
  });

  it('RF-008: la aplicación muestra una partida nueva de 4 jugadores', async () => {
    const fixture = await render();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('jp-board [data-piece]')).toHaveLength(16);
    for (const color of COLORS) {
      const home = homes().find((h) => h.color === color)!;
      const centers = Array.from(
        compiled.querySelectorAll(
          `jp-board [data-piece][data-color="${color}"] [data-part="disc"]`,
        ),
      ).map((disc) => ({ x: Number(disc.getAttribute('cx')), y: Number(disc.getAttribute('cy')) }));
      expect(centers, color).toEqual(home.slots);
    }
  });

  it('HU-01.3: una partida nueva muestra el cartel amarillo que pide tirar a Amarillo', async () => {
    const fixture = await render();
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.yellow);
    expect(text(fixture, '[data-title]')).toBe('Toca el dado');
    expect(dice(fixture).disabled).toBe(false);
    expect(dice(fixture).classList).toContain(DICE_GLOW.yellow);
    expect(dice(fixture).getAttribute('aria-label')).toBe('Dado, cara 6');
  });

  it('HU-02.1: tras la tirada de Amarillo, el dado late en azul y el cartel es azul', async () => {
    const fixture = await render(3);
    roll(fixture);
    expect(dice(fixture).classList).toContain(DICE_GLOW.blue);
    expect(dice(fixture).getAttribute('aria-label')).toBe('Dado, cara 3');
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.blue);
    expect(text(fixture, '[data-title]')).toBe('Toca el dado');
  });

  it('HU-03.1: el dado gira medio segundo con la cara ya visible y no responde mientras', async () => {
    const fixture = await render(3);
    dice(fixture).click();
    fixture.detectChanges();
    expect(dice(fixture).classList).toContain('motion-safe:animate-dice-spin');
    expect(dice(fixture).disabled).toBe(true);
    expect(dice(fixture).getAttribute('aria-label')).toBe('Dado, cara 3');
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.yellow);

    vi.advanceTimersByTime(DICE_SPIN_MS);
    fixture.detectChanges();
    expect(dice(fixture).classList).not.toContain('motion-safe:animate-dice-spin');
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.blue);
  });

  it('HU-02.2: con 3, 5, 2 y 1 el cartel pasa a azul y pide tirar', async () => {
    const fixture = await render(3, 5, 2, 1);
    roll(fixture, 4);
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.blue);
    expect(text(fixture, '[data-title]')).toBe('Toca el dado');
    expect(dice(fixture).classList).toContain(DICE_GLOW.blue);
  });

  it('HU-02.3: con 6, 2, 6 y 1 desempatan Amarillo y Rojo, y solo tiran ellos', async () => {
    const fixture = await render(6, 2, 6, 1, 3, 4);
    roll(fixture, 4);
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.yellow);
    expect(dice(fixture).classList).toContain(DICE_GLOW.yellow);

    roll(fixture);
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.red);

    roll(fixture);
    expect(text(fixture, '[data-title]')).toBe('Toca el dado');
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.red);
  });

  it('HU-03.3: con una tirada pendiente el dado muestra su cara, no late y el cartel pide elegir ficha', async () => {
    const fixture = await render(3, 5, 2, 1, 5);
    roll(fixture, 5);
    expect(dice(fixture).getAttribute('aria-label')).toBe('Dado, cara 5');
    expect(dice(fixture).disabled).toBe(true);
    expect(dice(fixture).classList).not.toContain('motion-safe:animate-dice-pulse');
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.blue);
    expect(text(fixture, '[data-title]')).toBe('Elige una ficha');
  });

  it('HU-04.6: con un solo movimiento la ficha no se mueve hasta confirmar en la réplica', async () => {
    const fixture = await render(...EXIT);
    play(fixture, EXIT);
    const store = TestBed.inject(GameStore);
    const [move] = store.legalMoves();

    expect(halos(fixture)).toEqual([move.pieceId]);
    expect(ghost(fixture)).toBeNull();

    touch(fixture, move.pieceId);
    expect(ghost(fixture)).not.toBeNull();
    expect(store.state().pendingRoll).toBe(5);
  });

  it('HU-04.5: tocar fuera cancela la selección y los halos siguen', async () => {
    const fixture = await render(...EXIT);
    play(fixture, EXIT);
    const [move] = TestBed.inject(GameStore).legalMoves();
    touch(fixture, move.pieceId);

    element(fixture, 'main').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(ghost(fixture)).toBeNull();
    expect(halos(fixture)).toEqual([move.pieceId]);
  });

  it('HU-04.3: tocar la réplica mueve la ficha y quita halos, réplica y atenuación', async () => {
    const fixture = await render(...EXIT);
    play(fixture, EXIT);
    const store = TestBed.inject(GameStore);
    const [move] = store.legalMoves();
    touch(fixture, move.pieceId);
    element(fixture, 'main').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    touch(fixture, move.pieceId);

    touch(fixture, 'ghost');

    const piece = store.state().pieces.find((p) => p.id === move.pieceId);
    expect(piece?.position).toEqual(move.to);
    expect(halos(fixture)).toEqual([]);
    expect(ghost(fixture)).toBeNull();
    expect(touchAreas(fixture)).toEqual([]);
    expect(element(fixture, 'jp-board [data-piece].opacity-40')).toBeNull();
    expect(text(fixture, '[data-title]')).toBe('Toca el dado');
  });

  it('HU-06.1: tras comer, el cartel pide usar el +20, la ficha brilla y el dado no responde', async () => {
    // The sequence leaves red with a capture as its only legal move (checked in the store tests).
    const fixture = await render(...CAPTURE);
    play(fixture, CAPTURE);
    touch(fixture, 'red-0');
    touch(fixture, 'ghost');

    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.red);
    expect(text(fixture, '[data-title]')).toBe('Usa tu +20');
    expect(halos(fixture)).toEqual(['red-0']);
    expect(dice(fixture).disabled).toBe(true);

    dice(fixture).click();
    fixture.detectChanges();
    expect(dice(fixture).classList).not.toContain('motion-safe:animate-dice-spin');
  });

  it('HU-06.2: confirmar el +20 avanza 20 casillas y el cartel vuelve a pedir tirar', async () => {
    const fixture = await render(...CAPTURE);
    play(fixture, CAPTURE);
    touch(fixture, 'red-0');
    touch(fixture, 'ghost');

    touch(fixture, 'red-0');
    touch(fixture, 'ghost');

    const store = TestBed.inject(GameStore);
    const piece = store.state().pieces.find((p) => p.id === 'red-0');
    expect(piece?.position).toEqual({ kind: 'track', square: 11 });
    expect(text(fixture, '[data-title]')).toBe('Toca el dado');
    expect(dice(fixture).disabled).toBe(false);
  });

  it('HU-04.1: una partida nueva muestra el cartel amarillo con el jaguar animado que pide tirar', async () => {
    const fixture = await render();
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.yellow);
    expect(mascot(fixture, 'jp-turn-banner')).toEqual({ animal: 'jaguar', animated: true });
    expect(text(fixture, '[data-title]')).toBe('Toca el dado');
  });

  it('HU-04.2: tras una tirada de Rojo con movimientos, el cartel es rojo, con el loro, y pide elegir ficha', async () => {
    // The sequence leaves red with a roll to move (checked in the store tests).
    const fixture = await render(...CAPTURE);
    play(fixture, CAPTURE);
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.red);
    expect(mascot(fixture, 'jp-turn-banner')).toEqual({ animal: 'parrot', animated: true });
    expect(text(fixture, '[data-title]')).toBe('Elige una ficha');
  });

  it('HU-04.3: tras comer, el cartel pide usar el +20', async () => {
    const fixture = await render(...CAPTURE);
    play(fixture, CAPTURE);
    touch(fixture, 'red-0');
    touch(fixture, 'ghost');
    expect(text(fixture, '[data-title]')).toBe('Usa tu +20');
  });

  it('HU-04.4: con la cuarta ficha verde en meta, el cartel es verde, con la rana, y dice «¡Gana Verde!»', async () => {
    const won: GameState = {
      ...stateWith([
        ['green-0', { kind: 'goal' }],
        ['green-1', { kind: 'goal' }],
        ['green-2', { kind: 'goal' }],
        ['green-3', { kind: 'goal' }],
      ]),
      initialRoll: null,
      turn: 'green',
      winner: 'green',
    };
    const fixture = await renderShowing(
      storeShowing(won, 'green', [
        { type: 'piece-reached-goal', pieceId: 'green-3' },
        { type: 'game-over', winner: 'green' },
      ]),
    );
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.green);
    expect(mascot(fixture, 'jp-turn-banner')).toEqual({ animal: 'frog', animated: true });
    expect(text(fixture, '[data-title]')).toBe('¡Gana Verde!');
    expect(tab(fixture).text).toBe('Llega a la meta, gana la partida.');
  });

  it('HU-05.1: antes de la primera acción no hay pestaña, pero su hueco está reservado bajo el cartel', async () => {
    const fixture = await render();
    const slot = element(fixture, 'main header [data-last-play-slot]');
    const banner = element(fixture, 'main header jp-turn-banner');
    const copy = element(fixture, '[data-last-play-slot] [data-longest-play]');
    expect(element(fixture, '[data-last-play]')).toBeNull();
    expect(banner.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(copy.textContent?.trim()).toBe(LONGEST_PLAY);
    expect(copy.classList).toContain('invisible');
    expect(copy.getAttribute('aria-hidden')).toBe('true');
  });

  it('RF-011: la pestaña y su copia invisible ocupan la misma celda del hueco', async () => {
    const fixture = await render(3);
    roll(fixture);
    for (const selector of ['[data-longest-play]', '[data-last-play]']) {
      const cell = element(fixture, `[data-last-play-slot] > ${selector}`);
      expect(cell.classList, selector).toContain('col-start-1');
      expect(cell.classList, selector).toContain('row-start-1');
    }
    expect(element(fixture, '[data-last-play-slot]').classList).toContain('grid');
  });

  it('RF-011: la región que se anuncia es el hueco fijo, antes y después de cada acción', async () => {
    const fixture = await render(3);
    const slot = element(fixture, '[data-last-play-slot]');
    expect(slot.getAttribute('aria-live')).toBe('polite');

    roll(fixture);
    expect(element(fixture, '[data-last-play-slot]')).toBe(slot);
    expect(slot.getAttribute('aria-live')).toBe('polite');
    expect(element(fixture, '[data-last-play-slot] [data-last-play]')).not.toBeNull();
  });

  it('HU-05.2: Rojo saca una ficha de casa, el cartel pasa a verde y la pestaña es de Rojo', async () => {
    // Red starts with the 6 of the initial roll and takes a piece out with a 5.
    const fixture = await render(1, 2, 6, 3, 5);
    roll(fixture, 5);
    touch(fixture, TestBed.inject(GameStore).legalMoves()[0].pieceId);
    touch(fixture, 'ghost');

    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.green);
    expect(mascot(fixture, 'jp-turn-banner').animal).toBe('frog');
    const { color, tone, mascot: drawn, text } = tab(fixture);
    expect(color).toBe('red');
    expect(tone).toContain(TEAM_DARK_BG.red);
    expect(drawn).toEqual({ animal: MASCOTS.red, animated: false });
    expect(text).toBe('Saca una ficha de casa.');
  });

  it('HU-05.3: Verde se come una ficha azul y la pestaña, en verde oscurecido, lo cuenta', async () => {
    const state: GameState = { ...stateWith([]), initialRoll: null, turn: 'green' };
    const fixture = await renderShowing(
      storeShowing(state, 'green', [
        {
          type: 'piece-advanced',
          pieceId: 'green-0',
          from: { kind: 'track', square: 50 },
          to: { kind: 'track', square: 54 },
        },
        { type: 'piece-captured', pieceId: 'blue-1', at: { kind: 'track', square: 54 } },
        { type: 'bonus-earned', player: 'green', amount: 20 },
      ]),
    );
    const { color, tone, mascot: drawn, text } = tab(fixture);
    expect(color).toBe('green');
    expect(tone).toContain(TEAM_DARK_BG.green);
    expect(drawn).toEqual({ animal: 'frog', animated: false });
    expect(text).toBe('Mueve una ficha, se come una ficha de Azul, cuenta 20.');
  });

  it('HU-07.1: una tirada sin movimientos se pierde y el turno pasa al siguiente', async () => {
    const fixture = await render(3, 5, 2, 1, 4);
    roll(fixture, 5);
    expect(text(fixture, '[data-last-play]')).toBe('Saca 4 y pierde la tirada.');
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.red);
  });

  it('HU-07.5: cada acción sustituye la frase de la anterior', async () => {
    const fixture = await render(3, 5);
    roll(fixture);
    expect(text(fixture, '[data-last-play]')).toBe('Saca 3.');

    roll(fixture);
    expect(text(fixture, '[data-last-play]')).toBe('Saca 5.');
  });

  it('CE-05: con un ganador, el cartel dice «¡Gana Rojo!» en rojo y nada responde', async () => {
    const won: GameState = {
      ...stateWith([
        ['red-0', { kind: 'goal' }],
        ['red-1', { kind: 'goal' }],
        ['red-2', { kind: 'goal' }],
        ['red-3', { kind: 'goal' }],
      ]),
      initialRoll: null,
      turn: 'red',
      winner: 'red',
    };
    const store = storeShowing(won);
    const fixture = await renderShowing(store);

    expect(text(fixture, '[data-title]')).toBe('¡Gana Rojo!');
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.red);
    expect(dice(fixture).disabled).toBe(true);
    expect(halos(fixture)).toEqual([]);
    expect(touchAreas(fixture)).toEqual([]);
    expect(element(fixture, 'jp-board [data-piece].opacity-40')).toBeNull();

    element(fixture, 'jp-board [data-piece="red-0"]').dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(store.select).not.toHaveBeenCalled();
    expect(store.confirm).not.toHaveBeenCalled();
  });
});
