import { TestBed } from '@angular/core/testing';
import { Color, COLORS } from '@engine';
import { MASCOTS } from '../shared/mascot';
import { Headline, LONGEST_ACTION } from './headline';
import { TEAM_BG, TEAM_DARK_BG, TEAM_DARK_BORDER, TurnBanner } from './turn-banner';

async function render(headline: Headline): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(TurnBanner);
  fixture.componentRef.setInput('headline', headline);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

function playing(color: Color): Headline {
  return { color, action: 'Toca el dado', turn: 'Turno de X.' };
}

/** Text a sighted player sees: everything but the screen reader only and invisible texts. */
function visibleText(banner: HTMLElement): string {
  const copy = banner.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('.sr-only, .invisible').forEach((hidden) => hidden.remove());
  return copy.textContent ?? '';
}

describe('TurnBanner', () => {
  it('RF-008: el tablón es del color del equipo en turno, con borde oscuro', async () => {
    for (const color of COLORS) {
      const plank = (await render(playing(color))).querySelector('[data-plank]')!;
      expect(plank.getAttribute('data-color'), color).toBe(color);
      expect(plank.classList, color).toContain(TEAM_BG[color]);
      expect(plank.classList, color).toContain(TEAM_DARK_BORDER[color]);
    }
  });

  it('RF-008: cada color usa sus tokens de la paleta', () => {
    expect(TEAM_BG).toEqual({
      yellow: 'bg-team-yellow',
      blue: 'bg-team-blue',
      red: 'bg-team-red',
      green: 'bg-team-green',
    });
    expect(TEAM_DARK_BG).toEqual({
      yellow: 'bg-team-yellow-dark',
      blue: 'bg-team-blue-dark',
      red: 'bg-team-red-dark',
      green: 'bg-team-green-dark',
    });
    expect(TEAM_DARK_BORDER).toEqual({
      yellow: 'border-team-yellow-dark',
      blue: 'border-team-blue-dark',
      red: 'border-team-red-dark',
      green: 'border-team-green-dark',
    });
  });

  it('RF-008: la placa lleva la mascota animada del equipo en turno, sobre su tono oscuro', async () => {
    for (const color of COLORS) {
      const badge = (await render(playing(color))).querySelector('[data-badge]')!;
      const mascots = badge.querySelectorAll('[data-mascot]');
      expect(badge.classList, color).toContain(TEAM_DARK_BG[color]);
      expect(mascots, color).toHaveLength(1);
      expect(mascots[0].getAttribute('data-mascot'), color).toBe(MASCOTS[color]);
      expect(mascots[0].hasAttribute('data-animated'), color).toBe(true);
    }
  });

  it('RF-008: con ganador lleva la mascota animada del ganador', async () => {
    const banner = await render({ color: 'green', action: '¡Gana Verde!', turn: null });
    const mascot = banner.querySelector('[data-badge] [data-mascot]')!;
    expect(mascot.getAttribute('data-mascot')).toBe('frog');
    expect(mascot.hasAttribute('data-animated')).toBe(true);
  });

  it('RF-008: muestra solo la acción, sin «Turno de»', async () => {
    const banner = await render({
      color: 'red',
      action: 'Elige una ficha',
      turn: 'Turno de Rojo.',
    });
    expect(banner.querySelector('[data-title]')?.textContent?.trim()).toBe('Elige una ficha');
    expect(visibleText(banner).trim()).toBe('Elige una ficha');
  });

  it('RF-008: con ganador muestra quién ha ganado', async () => {
    const banner = await render({ color: 'blue', action: '¡Gana Azul!', turn: null });
    expect(banner.querySelector('[data-title]')?.textContent?.trim()).toBe('¡Gana Azul!');
  });

  it('RF-010, HU-04.5: el turno es un texto para el lector antes de la acción', async () => {
    const banner = await render({ color: 'blue', action: 'Toca el dado', turn: 'Turno de Azul.' });
    const turn = banner.querySelector('[data-turn]')!;
    const title = banner.querySelector('[data-title]')!;
    expect(turn.textContent?.trim()).toBe('Turno de Azul.');
    expect(turn.classList).toContain('sr-only');
    expect(turn.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('RF-010: con ganador no hay texto de turno', async () => {
    const banner = await render({ color: 'blue', action: '¡Gana Azul!', turn: null });
    expect(banner.querySelector('[data-turn]')).toBeNull();
  });

  it('RNF-001: el texto es blanco con contorno de tinta en los cuatro colores', async () => {
    for (const color of COLORS) {
      const banner = await render(playing(color));
      const text = banner.querySelector('[data-text]')!;
      expect(text.classList, color).toContain('text-white');
      expect(text.classList, color).toContain('text-outline-ink');
      expect(text.classList, color).toContain('font-display');
    }
  });

  it('RF-013: el título reserva el sitio de la acción más larga con una copia invisible', async () => {
    const banner = await render(playing('red'));
    const copy = banner.querySelector<HTMLElement>('[data-longest-action]')!;
    const title = banner.querySelector<HTMLElement>('[data-title]')!;
    expect(copy.textContent?.trim()).toBe(LONGEST_ACTION);
    expect(copy.classList).toContain('invisible');
    expect(copy.getAttribute('aria-hidden')).toBe('true');
    expect(copy.parentElement).toBe(title.parentElement);
    expect(copy.parentElement!.classList).toContain('grid');
    for (const cell of [copy, title]) {
      expect(cell.classList).toContain('col-start-1');
      expect(cell.classList).toContain('row-start-1');
    }
    // Same text size, so the copy measures what the longest action would.
    for (const size of ['text-xl/tight', 'sm:text-3xl/tight']) {
      expect(copy.classList).toContain(size);
      expect(title.classList).toContain(size);
    }
  });

  it('RF-010: la mascota y los clavos son decorativos', async () => {
    const banner = await render(playing('green'));
    expect(banner.querySelector('[data-badge]')?.getAttribute('aria-hidden')).toBe('true');
    const nails = banner.querySelectorAll('[data-nail]');
    expect(nails).toHaveLength(2);
    for (const nail of nails) {
      expect(nail.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
