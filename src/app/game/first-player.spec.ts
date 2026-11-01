import { TestBed } from '@angular/core/testing';
import { Color, COLORS } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { MASCOTS } from '../shared/mascot';
import { FirstPlayer } from './first-player';
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
  readonly go: ReturnType<typeof vi.fn>;
}

async function render(player: Color): Promise<Rendered> {
  const fixture = TestBed.createComponent(FirstPlayer);
  fixture.componentRef.setInput('player', player);
  const go = vi.fn();
  fixture.componentInstance.go.subscribe(go);
  await fixture.whenStable();
  return { screen: fixture.nativeElement as HTMLElement, go };
}

function button(screen: HTMLElement): HTMLButtonElement {
  return screen.querySelector<HTMLButtonElement>('[data-go]')!;
}

/** Accessible name of the dialog, from the element it is labelled by. */
function accessibleName(screen: HTMLElement): string {
  const title = document.getElementById(screen.getAttribute('aria-labelledby')!);
  return (title?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('FirstPlayer', () => {
  beforeEach(() => stubReducedMotion(false));

  afterEach(() => vi.unstubAllGlobals());

  it.each(COLORS)(
    'HU-06.4, RF-016: con %s, el tablón es de su color con su mascota animada',
    async (color) => {
      const { screen } = await render(color);
      const plank = screen.querySelector('[data-plank]')!;
      const mascots = screen.querySelectorAll('[data-mascot]');

      expect(screen.getAttribute('data-color')).toBe(color);
      expect(screen.classList).toContain('bg-champion-overlay');
      expect(plank.classList).toContain(TEAM_BG[color]);
      expect(plank.classList).toContain(TEAM_DARK_BORDER[color]);
      expect(mascots).toHaveLength(1);
      expect(mascots[0].getAttribute('data-mascot')).toBe(MASCOTS[color]);
      expect(mascots[0].hasAttribute('data-animated')).toBe(true);
      expect(screen.querySelector('[data-badge]')?.classList).toContain(
        'motion-safe:animate-mascot-bob',
      );
    },
  );

  it.each(COLORS)(
    'HU-06.4, RF-016: con %s, el título nombra al equipo, sin trofeo, confeti ni rayos',
    async (color) => {
      const { screen } = await render(color);
      const title = screen.querySelector('[data-title]')?.textContent?.replace(/\s+/g, ' ').trim();

      expect(title).toBe(`Empieza el equipo ${COLOR_NAMES[color]}`);
      expect(screen.querySelector('[jp-trophy]')).toBeNull();
      expect(screen.querySelector('jp-confetti')).toBeNull();
      expect(screen.querySelector('[jp-sun-rays]')).toBeNull();
    },
  );

  it('RF-016, RNF-001: es un diálogo modal con nombre «Empieza el equipo Azul»', async () => {
    const { screen } = await render('blue');

    expect(screen.getAttribute('role')).toBe('dialog');
    expect(screen.getAttribute('aria-modal')).toBe('true');
    expect(accessibleName(screen)).toBe('Empieza el equipo Azul');
  });

  it('RF-016, RNF-001: al abrirse el foco pasa a «¡Vamos!»', async () => {
    const { screen } = await render('blue');

    expect(button(screen).textContent?.trim()).toBe('¡Vamos!');
    expect(document.activeElement).toBe(button(screen));
  });

  it('RF-016: ni Escape ni tocar la capa la cierran', async () => {
    const { screen, go } = await render('blue');

    button(screen).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    screen.click();

    expect(go).not.toHaveBeenCalled();
  });

  it('HU-06.5, RF-016: pulsar «¡Vamos!» la cierra una vez', async () => {
    const { screen, go } = await render('blue');

    button(screen).click();

    expect(go).toHaveBeenCalledTimes(1);
  });

  it('RF-016, RNF-001: «¡Vamos!» es un botón con el estilo de «Nueva partida» y al menos 44 px de alto', async () => {
    const { screen } = await render('blue');

    expect(button(screen).type).toBe('button');
    for (const name of ['min-h-14', 'bg-champion-button', 'bg-plank', 'font-display', 'text-ink']) {
      expect(button(screen).classList).toContain(name);
    }
  });

  it('RNF-002: con movimiento reducido la mascota está quieta y nada lleva animación', async () => {
    stubReducedMotion(true);
    const { screen } = await render('blue');

    expect(screen.querySelector('[data-mascot]')?.hasAttribute('data-animated')).toBe(false);
    const animated = [...screen.querySelectorAll('*')].filter((element) =>
      [...element.classList].some((name) => name.includes('animate-')),
    );
    expect(animated).toEqual([]);
    expect(accessibleName(screen)).toBe('Empieza el equipo Azul');
    expect(document.activeElement).toBe(button(screen));
  });
});
