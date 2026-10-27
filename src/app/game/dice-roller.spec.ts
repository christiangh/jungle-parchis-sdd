import { TestBed } from '@angular/core/testing';
import { DiceRoller } from './dice-roller';

describe('DiceRoller', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('RF-010: da enteros del 1 al 6 con el generador aleatorio del navegador', () => {
    const roller = TestBed.inject(DiceRoller);
    const random = vi.spyOn(Math, 'random');

    random.mockReturnValue(0);
    expect(roller.roll()).toBe(1);
    random.mockReturnValue(0.5);
    expect(roller.roll()).toBe(4);
    random.mockReturnValue(0.999999);
    expect(roller.roll()).toBe(6);
  });

  it('RF-010: cada valor del 1 al 6 sale en un sexto del rango', () => {
    const roller = TestBed.inject(DiceRoller);
    const random = vi.spyOn(Math, 'random');
    const counts = new Map<number, number>();
    for (let i = 0; i < 600; i++) {
      random.mockReturnValue(i / 600);
      const value = roller.roll();
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    expect([...counts.entries()].sort(([a], [b]) => a - b)).toEqual([
      [1, 100],
      [2, 100],
      [3, 100],
      [4, 100],
      [5, 100],
      [6, 100],
    ]);
  });
});
