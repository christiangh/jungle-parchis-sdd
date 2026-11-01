import { TestBed } from '@angular/core/testing';
import { COLORS } from '@engine';
import { MASCOTS } from '../shared/mascot';
import { InitialRound, LONGEST_ROUND } from './initial-round';
import { InitialRoundTab } from './initial-round-tab';
import { TEAM_DARK_BG } from './turn-banner';

async function render(round: InitialRound): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(InitialRoundTab);
  fixture.componentRef.setInput('round', round);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

const YELLOW_5_BLUE_3: InitialRound = {
  rolls: [
    { color: 'yellow', value: 5 },
    { color: 'blue', value: 3 },
  ],
  tie: null,
  closed: false,
};

const TIE: InitialRound = {
  rolls: [
    { color: 'yellow', value: 6 },
    { color: 'blue', value: 2 },
    { color: 'red', value: 6 },
  ],
  tie: ['yellow', 'red'],
  closed: true,
};

describe('InitialRoundTab', () => {
  it('HU-06.2, RF-014: una mascota quieta con su valor por tirada, en orden', async () => {
    const tab = await render(YELLOW_5_BLUE_3);
    const rolls = [...tab.querySelectorAll('[data-roll]')];

    expect(
      rolls.map((roll) => roll.querySelector('[data-mascot]')?.getAttribute('data-mascot')),
    ).toEqual([MASCOTS.yellow, MASCOTS.blue]);
    expect(rolls.map((roll) => roll.querySelector('[data-value]')?.textContent?.trim())).toEqual([
      '5',
      '3',
    ]);
    for (const roll of rolls) {
      expect(roll.querySelector('[data-mascot]')?.hasAttribute('data-animated')).toBe(false);
      expect(roll.querySelector('[data-value]')?.classList).toContain('text-white');
    }
    expect(tab.querySelector('[data-tie]')).toBeNull();
  });

  it('HU-06.3, RF-014: con empate muestra las tiradas y el empate entre los equipos implicados', async () => {
    const tab = await render(TIE);

    expect(tab.querySelectorAll('[data-roll]')).toHaveLength(3);
    const tie = tab.querySelector('[data-tie]')!;
    expect(tie.textContent?.trim()).toBe('Empate entre Amarillo y Rojo.');
    expect(tie.classList).toContain('text-white');
  });

  it('RF-014: la pestaña es del tono oscuro del último equipo que ha tirado', async () => {
    for (const color of COLORS) {
      const round: InitialRound = {
        rolls: [...YELLOW_5_BLUE_3.rolls, { color, value: 1 }],
        tie: null,
        closed: false,
      };
      const tab = (await render(round)).querySelector('[data-tab]')!;
      expect(tab.getAttribute('data-color'), color).toBe(color);
      expect(tab.classList, color).toContain(TEAM_DARK_BG[color]);
    }
  });

  it('HU-06.6, RF-015: lo dibujado es decorativo y el lector oye cada equipo con su valor', async () => {
    const tab = await render(YELLOW_5_BLUE_3);
    const text = tab.querySelector('[data-text]')!;

    expect(text.textContent?.trim()).toBe('Amarillo saca 5, Azul saca 3.');
    expect(text.classList).toContain('sr-only');
    expect(tab.querySelector('[data-rolls]')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('HU-06.6, RF-015: con empate, el empate dibujado también es decorativo', async () => {
    const tab = await render(TIE);

    expect(tab.querySelector('[data-text]')?.textContent?.trim()).toBe(
      'Amarillo saca 6, Azul saca 2, Rojo saca 6, empate entre Amarillo y Rojo.',
    );
    expect(tab.querySelector('[data-tie]')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('RF-015: LONGEST_ROUND pinta las cuatro tiradas y el empate de los cuatro', async () => {
    const tab = await render(LONGEST_ROUND);

    expect(tab.querySelectorAll('[data-roll]')).toHaveLength(4);
    expect(tab.querySelector('[data-tie]')?.textContent?.trim()).toBe(
      'Empate entre Amarillo, Azul, Rojo y Verde.',
    );
  });
});
