import { TestBed } from '@angular/core/testing';
import { Color, COLORS } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { MASCOTS } from '../shared/mascot';
import { Champion } from './champion';
import { CONFETTI_COLORS, CONFETTI_COUNT } from './confetti';
import { TEAM_BG, TEAM_DARK_BORDER } from './turn-banner';

/** Makes `prefers-reduced-motion: reduce` match, or not, for the rest of the test. */
function stubReducedMotion(reduce: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
  }));
}

interface Rendered {
  readonly screen: HTMLElement;
  readonly newGame: ReturnType<typeof vi.fn>;
}

async function render(winner: Color): Promise<Rendered> {
  const fixture = TestBed.createComponent(Champion);
  fixture.componentRef.setInput('winner', winner);
  const newGame = vi.fn();
  fixture.componentInstance.newGame.subscribe(newGame);
  await fixture.whenStable();
  return { screen: fixture.nativeElement as HTMLElement, newGame };
}

function button(screen: HTMLElement): HTMLButtonElement {
  return screen.querySelector<HTMLButtonElement>('[data-new-game]')!;
}

/** Text a sighted player sees: everything but the screen reader only texts. */
function visibleText(screen: HTMLElement): string {
  const copy = screen.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('.sr-only').forEach((hidden) => hidden.remove());
  return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Accessible name of the dialog, from the element it is labelled by. */
function accessibleName(screen: HTMLElement): string {
  const title = document.getElementById(screen.getAttribute('aria-labelledby')!);
  return (title?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('Champion', () => {
  beforeEach(() => stubReducedMotion(false));

  afterEach(() => vi.unstubAllGlobals());

  it('HU-01.1: la pantalla de verde muestra su tablón con la rana, el trofeo, los rayos y el confeti', async () => {
    const { screen } = await render('green');
    const plank = screen.querySelector('[data-plank]')!;

    expect(plank.classList).toContain(TEAM_BG.green);
    expect(plank.classList).toContain(TEAM_DARK_BORDER.green);
    expect(plank.querySelector('[data-mascot]')?.getAttribute('data-mascot')).toBe('frog');
    expect(plank.querySelector('[jp-trophy]')).not.toBeNull();
    expect(screen.querySelector('[jp-sun-rays]')).not.toBeNull();
    expect(screen.querySelector('[data-title]')?.textContent).toContain('¡Campeón!');
    expect(screen.querySelectorAll('[data-piece]')).toHaveLength(CONFETTI_COUNT);
  });

  it.each(COLORS)('HU-01.1: el tablón, la mascota y el confeti son los de %s', async (color) => {
    const { screen } = await render(color);
    const plank = screen.querySelector('[data-plank]')!;
    const pieces = [...screen.querySelectorAll('[data-piece]')];

    expect(screen.getAttribute('data-color')).toBe(color);
    expect(plank.classList).toContain(TEAM_BG[color]);
    expect(plank.classList).toContain(TEAM_DARK_BORDER[color]);
    expect(plank.querySelector('[data-mascot]')?.getAttribute('data-mascot')).toBe(MASCOTS[color]);
    expect(pieces).toHaveLength(CONFETTI_COUNT);
    for (const piece of pieces) {
      expect(CONFETTI_COLORS[color].some((token) => piece.classList.contains(token))).toBe(true);
    }
  });

  it.each(COLORS)(
    'HU-01.4: con %s solo aparece el ganador, sin otros equipos ni puestos',
    async (color) => {
      const { screen } = await render(color);

      expect(screen.querySelectorAll('[data-mascot]')).toHaveLength(1);
      expect(visibleText(screen)).toBe('¡Campeón! Nueva partida');
      const others = COLORS.filter((other) => other !== color).map((other) => COLOR_NAMES[other]);
      for (const name of others) {
        expect(screen.textContent).not.toContain(name);
      }
    },
  );

  it('RF-003: es un diálogo modal con nombre «¡Campeón! Gana Verde»', async () => {
    const { screen } = await render('green');

    expect(screen.getAttribute('role')).toBe('dialog');
    expect(screen.getAttribute('aria-modal')).toBe('true');
    expect(accessibleName(screen)).toBe('¡Campeón! Gana Verde');
  });

  it('HU-01.2: al abrirse el foco pasa a «Nueva partida»', async () => {
    const { screen } = await render('green');

    expect(button(screen).textContent?.trim()).toBe('Nueva partida');
    expect(document.activeElement).toBe(button(screen));
  });

  it('HU-01.3: Escape no la cierra ni empieza otra partida', async () => {
    const { screen, newGame } = await render('green');

    button(screen).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(newGame).not.toHaveBeenCalled();
    expect(screen.isConnected).toBe(true);
  });

  it('HU-01.3: tocar la capa fuera del tablón no empieza otra partida', async () => {
    const { screen, newGame } = await render('green');

    screen.click();

    expect(newGame).not.toHaveBeenCalled();
  });

  it('RF-002: pulsar «Nueva partida» pide otra partida una vez', async () => {
    const { screen, newGame } = await render('green');

    button(screen).click();

    expect(newGame).toHaveBeenCalledTimes(1);
  });

  it('RNF-005: «Nueva partida» es un botón de al menos 56 px de alto', async () => {
    const { screen } = await render('green');

    expect(button(screen).type).toBe('button');
    expect(button(screen).classList).toContain('min-h-14');
  });

  it('RNF-002: con movimiento permitido la mascota se anima y flota, y el trofeo y los rayos se mueven', async () => {
    const { screen } = await render('green');

    expect(screen.querySelector('[data-mascot]')?.hasAttribute('data-animated')).toBe(true);
    expect(screen.querySelector('[data-badge]')?.classList).toContain(
      'motion-safe:animate-mascot-bob',
    );
    expect(screen.querySelector('[jp-trophy]')?.hasAttribute('data-animated')).toBe(true);
    expect(screen.querySelector('[jp-sun-rays]')?.hasAttribute('data-animated')).toBe(true);
  });

  it('CE-02: con movimiento reducido no hay confeti, la mascota no se anima y nada lleva animación', async () => {
    stubReducedMotion(true);
    const { screen } = await render('green');

    expect(screen.querySelector('jp-confetti')).toBeNull();
    expect(screen.querySelectorAll('[data-piece]')).toHaveLength(0);
    expect(screen.querySelector('[data-mascot]')?.hasAttribute('data-animated')).toBe(false);
    expect(screen.querySelector('[jp-trophy]')?.hasAttribute('data-animated')).toBe(false);
    expect(screen.querySelector('[jp-sun-rays]')?.hasAttribute('data-animated')).toBe(false);
    const animated = [...screen.querySelectorAll('*')].filter((element) =>
      [...element.classList].some((name) => name.includes('animate-')),
    );
    expect(animated).toEqual([]);
    expect(accessibleName(screen)).toBe('¡Campeón! Gana Verde');
    expect(document.activeElement).toBe(button(screen));
  });
});
