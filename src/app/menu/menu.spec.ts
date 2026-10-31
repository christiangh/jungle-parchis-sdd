import { TestBed } from '@angular/core/testing';
import { Menu } from './menu';

interface Rendered {
  readonly host: HTMLElement;
  readonly menu: Menu;
  readonly newGame: ReturnType<typeof vi.fn>;
  /** Clicks `element` and waits for the menu to update. */
  readonly click: (element: HTMLElement) => Promise<void>;
  /** Presses Escape on the focused element and waits for the menu to update. */
  readonly escape: () => Promise<void>;
}

async function render(): Promise<Rendered> {
  const fixture = TestBed.createComponent(Menu);
  const newGame = vi.fn();
  fixture.componentInstance.newGame.subscribe(newGame);
  const host = fixture.nativeElement as HTMLElement;
  // In the document, so the buttons can take the focus.
  document.body.append(host);
  await fixture.whenStable();
  const click = async (element: HTMLElement) => {
    element.click();
    await fixture.whenStable();
  };
  const escape = async () => {
    (document.activeElement ?? host).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();
  };
  return { host, menu: fixture.componentInstance, newGame, click, escape };
}

/** The element of `selector` inside `host`, failing the test when it is missing. */
function get(host: HTMLElement, selector: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(selector);
  expect(element, selector).not.toBeNull();
  return element!;
}

const gear = (host: HTMLElement) => get(host, '[data-gear]');
const panel = (host: HTMLElement) => get(host, '[data-panel]');

/** Opens the menu with the gear. */
async function openMenu({ host, click }: Rendered): Promise<void> {
  await click(gear(host));
}

/** Opens the menu and asks for «Nueva partida». */
async function openConfirmation(rendered: Rendered): Promise<void> {
  await openMenu(rendered);
  await rendered.click(get(rendered.host, '[data-option="new-game"]'));
}

function isOpen(host: HTMLElement): boolean {
  return !panel(host).classList.contains('invisible');
}

/** Minimum height in px of `element`, from its Tailwind `min-h-N` or `size-N` class. */
function minHeight(element: HTMLElement): number {
  const match = [...element.classList]
    .map((name) => /^(?:min-h|size)-(\d+)$/.exec(name))
    .find((found) => found !== null);
  return match ? Number(match[1]) * 4 : 0;
}

describe('Menu', () => {
  afterEach(() => {
    document.body.querySelectorAll('jp-menu').forEach((menu) => menu.remove());
  });

  it('RF-010, RNF-001: el engranaje es un botón nativo con el nombre «Menú» y el menú cerrado', async () => {
    const { host } = await render();
    expect(gear(host).tagName).toBe('BUTTON');
    expect(gear(host).getAttribute('type')).toBe('button');
    expect(gear(host).getAttribute('aria-label')).toBe('Menú');
    expect(gear(host).getAttribute('aria-haspopup')).toBe('dialog');
    expect(gear(host).getAttribute('aria-expanded')).toBe('false');
    expect(isOpen(host)).toBe(false);
  });

  it('HU-05.1, RNF-001: tocar el engranaje abre el diálogo modal «Menú» con el foco en cerrar', async () => {
    const rendered = await render();
    const { host, menu } = rendered;
    await openMenu(rendered);
    expect(isOpen(host)).toBe(true);
    expect(menu.open()).toBe(true);
    expect(gear(host).getAttribute('aria-expanded')).toBe('true');
    expect(panel(host).getAttribute('role')).toBe('dialog');
    expect(panel(host).getAttribute('aria-modal')).toBe('true');
    const title = document.getElementById(panel(host).getAttribute('aria-labelledby')!);
    expect(title?.textContent?.trim()).toBe('Menú');
    expect(document.activeElement).toBe(get(host, '[data-close]'));
    expect(get(host, '[data-close]').getAttribute('aria-label')).toBe('Cerrar');
  });

  it('HU-05.1, RF-010: la única opción del menú es «Nueva partida»', async () => {
    const rendered = await render();
    await openMenu(rendered);
    const options = [...rendered.host.querySelectorAll<HTMLElement>('[data-option]')];
    expect(options.map((option) => option.textContent?.trim())).toEqual(['Nueva partida']);
    expect(options[0].tagName).toBe('BUTTON');
  });

  it('HU-05.2, RF-011: Escape cierra el menú y devuelve el foco al engranaje', async () => {
    const rendered = await render();
    await openMenu(rendered);
    await rendered.escape();
    expect(isOpen(rendered.host)).toBe(false);
    expect(rendered.menu.open()).toBe(false);
    expect(gear(rendered.host).getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(gear(rendered.host));
  });

  it('HU-05.2, RF-011: tocar la capa de fuera cierra el menú y devuelve el foco al engranaje', async () => {
    const rendered = await render();
    await openMenu(rendered);
    await rendered.click(get(rendered.host, '[data-scrim]'));
    expect(isOpen(rendered.host)).toBe(false);
    expect(document.activeElement).toBe(gear(rendered.host));
  });

  it('HU-05.2, RF-011: cerrar cierra el menú y devuelve el foco al engranaje', async () => {
    const rendered = await render();
    await openMenu(rendered);
    await rendered.click(get(rendered.host, '[data-close]'));
    expect(isOpen(rendered.host)).toBe(false);
    expect(document.activeElement).toBe(gear(rendered.host));
  });

  it('HU-05.3, RF-012: «Nueva partida» pide confirmación con «Descartar partida» y «Seguir jugando», con el foco en seguir', async () => {
    const rendered = await render();
    await openConfirmation(rendered);
    const { host, newGame } = rendered;
    expect(isOpen(host)).toBe(true);
    expect(host.querySelector('[data-option]')).toBeNull();
    expect(get(host, '[data-confirm-title]').textContent?.trim()).toBe('¿Empezar otra partida?');
    expect(get(host, '[data-confirm-text]').textContent?.trim()).toBe(
      'Se perderá la partida en curso.',
    );
    expect(get(host, '[data-discard]').textContent?.trim()).toBe('Descartar partida');
    expect(get(host, '[data-keep]').textContent?.trim()).toBe('Seguir jugando');
    expect(document.activeElement).toBe(get(host, '[data-keep]'));
    expect(newGame).not.toHaveBeenCalled();
  });

  it('HU-05.5, RF-012: «Seguir jugando» cierra sin descartar y devuelve el foco al engranaje', async () => {
    const rendered = await render();
    await openConfirmation(rendered);
    await rendered.click(get(rendered.host, '[data-keep]'));
    expect(isOpen(rendered.host)).toBe(false);
    expect(rendered.newGame).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(gear(rendered.host));
  });

  it('HU-05.5, RF-012: Escape en la confirmación cierra sin descartar', async () => {
    const rendered = await render();
    await openConfirmation(rendered);
    await rendered.escape();
    expect(isOpen(rendered.host)).toBe(false);
    expect(rendered.newGame).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(gear(rendered.host));
  });

  it('HU-05.4, RF-012: «Descartar partida» pide la nueva partida una vez y cierra el menú', async () => {
    const rendered = await render();
    await openConfirmation(rendered);
    await rendered.click(get(rendered.host, '[data-discard]'));
    expect(rendered.newGame).toHaveBeenCalledOnce();
    expect(isOpen(rendered.host)).toBe(false);
    expect(rendered.menu.open()).toBe(false);
  });

  it('HU-05.1: al volver a abrir tras la confirmación se ve otra vez la lista', async () => {
    const rendered = await render();
    await openConfirmation(rendered);
    await rendered.click(get(rendered.host, '[data-keep]'));
    await openMenu(rendered);
    expect(rendered.host.querySelector('[data-option="new-game"]')).not.toBeNull();
    expect(rendered.host.querySelector('[data-discard]')).toBeNull();
  });

  it('HU-05.5: los clics en el engranaje, el panel y la capa no salen del menú', async () => {
    const rendered = await render();
    const outside = vi.fn();
    document.body.addEventListener('click', outside);
    try {
      await openMenu(rendered);
      await rendered.click(panel(rendered.host));
      await rendered.click(get(rendered.host, '[data-scrim]'));
      expect(outside).not.toHaveBeenCalled();
    } finally {
      document.body.removeEventListener('click', outside);
    }
  });

  it('RNF-002: el panel y la capa solo se animan sin movimiento reducido', async () => {
    const { host } = await render();
    for (const element of [panel(host), get(host, '[data-scrim]')]) {
      const transitions = [...element.classList].filter((name) => name.includes('transition'));
      expect(transitions.length, element.outerHTML).toBeGreaterThan(0);
      expect(transitions.every((name) => name.startsWith('motion-safe:'))).toBe(true);
    }
  });

  it('RNF-005: engranaje, cerrar, la opción y los botones de la confirmación miden al menos 44 px', async () => {
    const rendered = await render();
    const { host } = rendered;
    expect(gear(host).classList).toContain('size-12');
    await openMenu(rendered);
    expect(get(host, '[data-close]').classList).toContain('size-11');
    expect(minHeight(get(host, '[data-option="new-game"]'))).toBeGreaterThanOrEqual(44);
    await rendered.click(get(host, '[data-option="new-game"]'));
    for (const button of [get(host, '[data-discard]'), get(host, '[data-keep]')]) {
      expect(button.tagName).toBe('BUTTON');
      expect(minHeight(button), button.textContent!).toBeGreaterThanOrEqual(44);
    }
  });
});
