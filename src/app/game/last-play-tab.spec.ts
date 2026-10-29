import { TestBed } from '@angular/core/testing';
import { COLORS } from '@engine';
import { MASCOTS } from '../shared/mascot';
import { LastPlay } from './last-play';
import { LastPlayTab } from './last-play-tab';
import { TEAM_DARK_BG } from './turn-banner';

async function render(play: LastPlay): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(LastPlayTab);
  fixture.componentRef.setInput('play', play);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('LastPlayTab', () => {
  it('RF-011: la pestaña es del tono oscuro del equipo que actúa', async () => {
    for (const color of COLORS) {
      const tab = (await render({ color, text: 'Repite.' })).querySelector('[data-tab]')!;
      expect(tab.getAttribute('data-color'), color).toBe(color);
      expect(tab.classList, color).toContain(TEAM_DARK_BG[color]);
    }
  });

  it('RF-011: lleva la mascota sin animar del equipo que actúa', async () => {
    for (const color of COLORS) {
      const tab = await render({ color, text: 'Repite.' });
      const mascots = tab.querySelectorAll('[data-badge] [data-mascot]');
      expect(mascots, color).toHaveLength(1);
      expect(mascots[0].getAttribute('data-mascot'), color).toBe(MASCOTS[color]);
      expect(mascots[0].hasAttribute('data-animated'), color).toBe(false);
    }
  });

  it('RF-012: muestra la frase en blanco y en seminegrita', async () => {
    const tab = await render({ color: 'red', text: 'Saca una ficha de casa.' });
    const text = tab.querySelector('[data-text]')!;
    expect(tab.textContent?.trim()).toBe('Saca una ficha de casa.');
    expect(text.classList).toContain('text-white');
    expect(text.classList).toContain('font-semibold');
  });

  it('RF-010: la mascota es decorativa', async () => {
    const tab = await render({ color: 'green', text: 'Repite.' });
    expect(tab.querySelector('[data-badge]')?.getAttribute('aria-hidden')).toBe('true');
  });
});
