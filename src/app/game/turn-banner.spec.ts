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
  return { color, title: 'Turno de X', instruction: 'Toca el dado' };
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

  it('RF-003: muestra el título y la instrucción', async () => {
    const banner = await render({
      color: 'red',
      title: 'Turno de Rojo · 4',
      instruction: 'Elige una ficha iluminada',
    });
    expect(banner.querySelector('[data-title]')?.textContent?.trim()).toBe('Turno de Rojo · 4');
    expect(banner.querySelector('[data-instruction]')?.textContent?.trim()).toBe(
      'Elige una ficha iluminada',
    );
  });

  it('RF-003: sin instrucción solo muestra el título', async () => {
    const banner = await render({ color: 'blue', title: 'Gana Azul', instruction: null });
    expect(banner.querySelector('[data-title]')?.textContent?.trim()).toBe('Gana Azul');
    expect(banner.querySelector('[data-instruction]')).toBeNull();
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
