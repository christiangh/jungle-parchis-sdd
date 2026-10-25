import { ComponentFixture, TestBed } from '@angular/core/testing';
import { COLORS } from '@engine';
import { App } from './app';
import { homes } from './board/board-geometry';
import { DICE_GLOW } from './game/dice';
import { DICE_SPIN_MS } from './game/game-store';
import { provideRolls } from './game/game-test-utils';
import { TEAM_BG } from './game/turn-banner';

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
    expect(text(fixture, '[data-title]')).toBe('Tirada inicial · Amarillo');
    expect(text(fixture, '[data-instruction]')).toBe('Toca el dado');
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
    expect(text(fixture, '[data-title]')).toBe('Tirada inicial · Azul');
  });

  it('HU-03.1: el dado gira medio segundo con la cara ya visible y no responde mientras', async () => {
    const fixture = await render(3);
    dice(fixture).click();
    fixture.detectChanges();
    expect(dice(fixture).classList).toContain('motion-safe:animate-dice-spin');
    expect(dice(fixture).disabled).toBe(true);
    expect(dice(fixture).getAttribute('aria-label')).toBe('Dado, cara 3');
    expect(text(fixture, '[data-title]')).toBe('Tirada inicial · Amarillo');

    vi.advanceTimersByTime(DICE_SPIN_MS);
    fixture.detectChanges();
    expect(dice(fixture).classList).not.toContain('motion-safe:animate-dice-spin');
    expect(text(fixture, '[data-title]')).toBe('Tirada inicial · Azul');
  });

  it('HU-02.2: con 3, 5, 2 y 1 el cartel pasa a azul y pide tirar', async () => {
    const fixture = await render(3, 5, 2, 1);
    roll(fixture, 4);
    expect(element(fixture, '[data-plank]').classList).toContain(TEAM_BG.blue);
    expect(text(fixture, '[data-title]')).toBe('Turno de Azul');
    expect(text(fixture, '[data-instruction]')).toBe('Toca el dado');
    expect(dice(fixture).classList).toContain(DICE_GLOW.blue);
  });

  it('HU-02.3: con 6, 2, 6 y 1 desempatan Amarillo y Rojo, y solo tiran ellos', async () => {
    const fixture = await render(6, 2, 6, 1, 3, 4);
    roll(fixture, 4);
    expect(text(fixture, '[data-title]')).toBe('Tirada inicial · Amarillo');
    expect(dice(fixture).classList).toContain(DICE_GLOW.yellow);

    roll(fixture);
    expect(text(fixture, '[data-title]')).toBe('Tirada inicial · Rojo');

    roll(fixture);
    expect(text(fixture, '[data-title]')).toBe('Turno de Rojo');
  });

  it('HU-03.3: con una tirada pendiente el dado muestra su cara, no late y el cartel pide elegir ficha', async () => {
    const fixture = await render(3, 5, 2, 1, 5);
    roll(fixture, 5);
    expect(dice(fixture).getAttribute('aria-label')).toBe('Dado, cara 5');
    expect(dice(fixture).disabled).toBe(true);
    expect(dice(fixture).classList).not.toContain('motion-safe:animate-dice-pulse');
    expect(text(fixture, '[data-title]')).toBe('Turno de Azul · 5');
    expect(text(fixture, '[data-instruction]')).toBe('Elige una ficha iluminada');
  });
});
