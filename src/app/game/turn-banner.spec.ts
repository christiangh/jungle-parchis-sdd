import { TestBed } from '@angular/core/testing';
import { Color, COLORS } from '@engine';
import { Headline } from './headline';
import { TEAM_BG, TEAM_DARK_BORDER, TurnBanner } from './turn-banner';

async function render(headline: Headline): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(TurnBanner);
  fixture.componentRef.setInput('headline', headline);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

function playing(color: Color): Headline {
  return { color, action: 'Toca el dado', turn: 'Turno de X.' };
}

describe('TurnBanner', () => {
  it('RF-003: el cartel y su círculo se pintan del color del jugador, con borde oscuro', async () => {
    for (const color of COLORS) {
      const banner = await render(playing(color));
      const plank = banner.querySelector('[data-plank]')!;
      const dot = banner.querySelector('[data-dot]')!;
      expect(plank.getAttribute('data-color'), color).toBe(color);
      expect(plank.classList, color).toContain(TEAM_BG[color]);
      expect(plank.classList, color).toContain(TEAM_DARK_BORDER[color]);
      expect(dot.classList, color).toContain(TEAM_BG[color]);
    }
  });

  it('RF-003: cada color usa sus tokens de la paleta', () => {
    expect(TEAM_BG).toEqual({
      yellow: 'bg-team-yellow',
      blue: 'bg-team-blue',
      red: 'bg-team-red',
      green: 'bg-team-green',
    });
    expect(TEAM_DARK_BORDER).toEqual({
      yellow: 'border-team-yellow-dark',
      blue: 'border-team-blue-dark',
      red: 'border-team-red-dark',
      green: 'border-team-green-dark',
    });
  });

  it('RF-009: muestra la acción', async () => {
    const banner = await render({
      color: 'red',
      action: 'Elige una ficha',
      turn: 'Turno de Rojo.',
    });
    expect(banner.querySelector('[data-title]')?.textContent?.trim()).toBe('Elige una ficha');
  });

  it('RF-009: con ganador muestra quién ha ganado', async () => {
    const banner = await render({ color: 'blue', action: '¡Gana Azul!', turn: null });
    expect(banner.querySelector('[data-title]')?.textContent?.trim()).toBe('¡Gana Azul!');
  });

  it('RNF-001: el texto es blanco con contorno de tinta en los cuatro colores', async () => {
    for (const color of COLORS) {
      const banner = await render(playing(color));
      const text = banner.querySelector('[data-text]')!;
      expect(text.classList, color).toContain('text-white');
      expect(text.classList, color).toContain('text-outline-ink');
    }
  });

  it('RNF-001: el círculo y los clavos son decorativos', async () => {
    const banner = await render(playing('green'));
    for (const decoration of banner.querySelectorAll('[data-dot], [data-nail]')) {
      expect(decoration.getAttribute('aria-hidden')).toBe('true');
    }
    expect(banner.querySelectorAll('[data-nail]')).toHaveLength(2);
  });
});
