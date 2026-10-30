import { TestBed } from '@angular/core/testing';
import { Color, COLORS } from '@engine';
import { TEAM_BG, TEAM_DARK_BORDER } from '../game/turn-banner';
import { COLOR_NAMES } from '../shared/color-names';
import { MASCOTS } from '../shared/mascot';
import { Start } from './start';

/** Makes `prefers-reduced-motion: reduce` match, or not, for the rest of the test. */
function stubReducedMotion(reduce: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
  }));
}

interface Rendered {
  readonly screen: HTMLElement;
  readonly play: ReturnType<typeof vi.fn>;
  /** Touches the card of `color` and waits for the screen to update. */
  readonly touch: (color: Color) => Promise<void>;
}

async function render(teams: readonly Color[] = COLORS): Promise<Rendered> {
  const fixture = TestBed.createComponent(Start);
  fixture.componentRef.setInput('teams', teams);
  const play = vi.fn();
  fixture.componentInstance.startGame.subscribe(play);
  const screen = fixture.nativeElement as HTMLElement;
  // In the document, so the first card can take the focus.
  document.body.append(screen);
  await fixture.whenStable();
  const touch = async (color: Color) => {
    card(screen, color).click();
    await fixture.whenStable();
  };
  return { screen, play, touch };
}

function cards(screen: HTMLElement): HTMLButtonElement[] {
  return [...screen.querySelectorAll<HTMLButtonElement>('[data-team]')];
}

function card(screen: HTMLElement, color: Color): HTMLButtonElement {
  return screen.querySelector<HTMLButtonElement>(`[data-team="${color}"]`)!;
}

function playButton(screen: HTMLElement): HTMLButtonElement {
  return screen.querySelector<HTMLButtonElement>('[data-play]')!;
}

function status(screen: HTMLElement): string {
  return screen.querySelector('[data-status]')!.textContent!.trim();
}

function mascotOf(screen: HTMLElement, color: Color): Element {
  return card(screen, color).querySelector('[data-mascot]')!;
}

describe('Start', () => {
  beforeEach(() => stubReducedMotion(false));

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.querySelectorAll('jp-start').forEach((screen) => screen.remove());
  });

  it('HU-03.5: es un diálogo modal con el nombre «¿Quién juega?»', async () => {
    const { screen } = await render();
    expect(screen.getAttribute('role')).toBe('dialog');
    expect(screen.getAttribute('aria-modal')).toBe('true');
    const title = document.getElementById(screen.getAttribute('aria-labelledby')!);
    expect(title?.textContent?.trim()).toBe('¿Quién juega?');
  });

  it('HU-03.1: muestra los cuatro equipos en la posición de su casa: rojo y azul arriba, verde y amarillo abajo', async () => {
    const { screen } = await render();
    expect(cards(screen).map((c) => c.getAttribute('data-team'))).toEqual([
      'red',
      'blue',
      'green',
      'yellow',
    ]);
    expect(screen.querySelector('[data-cards]')?.classList).toContain('grid-cols-2');
  });

  it.each(COLORS)('HU-03.1: la tarjeta de %s lleva su mascota y su nombre', async (color) => {
    const { screen } = await render();
    expect(mascotOf(screen, color).getAttribute('data-mascot')).toBe(MASCOTS[color]);
    expect(card(screen, color).querySelector('[data-name]')?.textContent?.trim()).toBe(
      COLOR_NAMES[color],
    );
    expect(card(screen, color).textContent?.trim()).toBe(COLOR_NAMES[color]);
  });

  it('RF-004: con los cuatro equipos todas las tarjetas están activadas, con su color y una marca ✓', async () => {
    const { screen } = await render();
    for (const color of COLORS) {
      const button = card(screen, color);
      expect(button.getAttribute('aria-pressed'), color).toBe('true');
      expect(button.classList, color).toContain(TEAM_BG[color]);
      expect(button.classList, color).toContain(TEAM_DARK_BORDER[color]);
      expect(button.querySelector('[data-mark]')?.getAttribute('data-mark'), color).toBe('check');
    }
  });

  it('RF-008: solo salen activados los equipos recibidos', async () => {
    const { screen } = await render(['yellow', 'green']);
    expect(cards(screen).map((c) => c.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'true',
      'true',
    ]);
  });

  it('HU-03.5: el foco empieza en la primera tarjeta', async () => {
    const { screen } = await render();
    expect(document.activeElement).toBe(card(screen, 'red'));
  });

  it('RF-005, RNF-001: tocar una tarjeta la desactiva, punteada, apagada y con un «+», sin depender solo del color', async () => {
    const { screen, touch } = await render();
    await touch('blue');
    const blue = card(screen, 'blue');
    expect(blue.getAttribute('aria-pressed')).toBe('false');
    expect(blue.classList).toContain('border-dashed');
    expect(blue.classList).toContain('bg-start-card-off');
    expect(blue.classList).not.toContain(TEAM_BG.blue);
    expect(blue.querySelector('[data-mark]')?.getAttribute('data-mark')).toBe('plus');
    expect(blue.querySelector('[data-badge]')?.classList).toContain('grayscale-70');
    expect(blue.querySelector('[data-name]')?.classList).toContain('text-start-muted');
    expect(status(screen)).toBe('3 equipos listos');
  });

  it('HU-03.2: activar un equipo anima su mascota una vez', async () => {
    const { screen, touch } = await render(['yellow', 'green']);
    await touch('blue');
    const mascot = mascotOf(screen, 'blue');
    expect(card(screen, 'blue').getAttribute('aria-pressed')).toBe('true');
    expect(mascot.hasAttribute('data-animated')).toBe(true);
    expect(mascot.hasAttribute('data-once')).toBe(true);
  });

  it('RF-006: las mascotas de los equipos que ya estaban activados no se animan', async () => {
    const { screen, touch } = await render(['yellow', 'green']);
    await touch('blue');
    for (const color of ['red', 'green', 'yellow'] as const) {
      expect(mascotOf(screen, color).hasAttribute('data-animated'), color).toBe(false);
    }
  });

  it('RF-006: desactivar quita la animación y volver a activar la repite', async () => {
    const { screen, touch } = await render(['yellow', 'green']);
    await touch('blue');
    await touch('blue');
    expect(mascotOf(screen, 'blue').hasAttribute('data-animated')).toBe(false);
    await touch('blue');
    expect(mascotOf(screen, 'blue').hasAttribute('data-animated')).toBe(true);
  });

  it('HU-03.2, RNF-002: con movimiento reducido activar un equipo no anima su mascota', async () => {
    stubReducedMotion(true);
    const { screen, touch } = await render(['yellow', 'green']);
    await touch('blue');
    expect(card(screen, 'blue').getAttribute('aria-pressed')).toBe('true');
    expect(mascotOf(screen, 'blue').hasAttribute('data-animated')).toBe(false);
  });

  it('HU-03.4: con un solo equipo «¡A jugar!» está desactivado, no responde y el estado lo indica', async () => {
    const { screen, play, touch } = await render(['yellow', 'green']);
    await touch('green');
    expect(playButton(screen).disabled).toBe(true);
    expect(status(screen)).toBe('Elige al menos 2 equipos');
    playButton(screen).click();
    expect(play).not.toHaveBeenCalled();
  });

  it('HU-03.5: el estado está en una región que el lector anuncia', async () => {
    const { screen } = await render();
    expect(screen.querySelector('[data-status]')?.getAttribute('aria-live')).toBe('polite');
    expect(status(screen)).toBe('4 equipos listos');
  });

  it('HU-03.3: con amarillo y verde, «¡A jugar!» empieza con esos dos en el orden de los colores', async () => {
    const { screen, play, touch } = await render();
    await touch('red');
    await touch('blue');
    expect(playButton(screen).disabled).toBe(false);
    expect(status(screen)).toBe('2 equipos listos');
    playButton(screen).click();
    expect(play).toHaveBeenCalledExactlyOnceWith(['yellow', 'green']);
  });

  it('RF-005: activar en otro orden emite igualmente en el orden de los colores', async () => {
    const { screen, play, touch } = await render(['green']);
    await touch('blue');
    await touch('yellow');
    playButton(screen).click();
    expect(play).toHaveBeenCalledExactlyOnceWith(['yellow', 'blue', 'green']);
  });

  it('HU-03.5: tarjetas y «¡A jugar!» son botones nativos, alcanzables con el tabulador y Enter o espacio', async () => {
    const { screen } = await render();
    for (const button of [...cards(screen), playButton(screen)]) {
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.tabIndex).toBe(0);
    }
  });

  it('RNF-005: tarjetas y «¡A jugar!» miden al menos 24 × 24 px', async () => {
    const { screen } = await render();
    for (const button of cards(screen)) {
      expect(button.classList).toContain('h-33');
      expect(button.classList).toContain(
        '[@media(orientation:landscape)_and_(max-height:480px)]:h-[118px]',
      );
    }
    expect(playButton(screen).classList).toContain('min-h-14');
    expect(playButton(screen).classList).toContain('w-full');
  });
});
