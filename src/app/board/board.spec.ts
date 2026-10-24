import { TestBed } from '@angular/core/testing';
import { COLORS, isSafe, LANE_LENGTH, START_SQUARE, TRACK_LENGTH } from '@engine';
import { Board } from './board';

async function render(): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(Board);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

function all(root: HTMLElement, selector: string): Element[] {
  return Array.from(root.querySelectorAll(selector));
}

/** True when the element or one of its shapes uses the given Tailwind class. */
function paintedWith(element: Element, className: string): boolean {
  return element.matches(`.${className}`) || element.querySelector(`.${className}`) !== null;
}

describe('Board', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Board] }).compileComponents();
  });

  it('RNF-002: el tablero se llama Tablero de parchís de la jungla', async () => {
    const svg = (await render()).querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Tablero de parchís de la jungla');
  });

  it('RNF-002: la capa decorativa está oculta para las tecnologías de apoyo', async () => {
    const root = await render();
    const decor = root.querySelector('svg > [data-layer="decor"]');
    expect(decor?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('svg > [data-layer="game"]')).not.toBeNull();
  });

  it('RF-001: hay 68 casillas numeradas del 1 al 68', async () => {
    const squares = all(await render(), '[data-layer="game"] [data-square]');
    expect(squares).toHaveLength(TRACK_LENGTH);
    const numbers = squares.map((s) => Number(s.getAttribute('data-square'))).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: TRACK_LENGTH }, (_, i) => i + 1));
    for (const square of squares) {
      expect(square.querySelector('text')?.textContent?.trim()).toBe(
        square.getAttribute('data-square'),
      );
    }
  });

  it('RF-002, R-006: los seguros son las casillas que el motor considera seguro', async () => {
    const squares = all(await render(), '[data-square]');
    const safes = squares.filter((s) => s.getAttribute('data-kind') !== 'plain');
    expect(safes).toHaveLength(12);
    for (const square of squares) {
      const number = Number(square.getAttribute('data-square'));
      expect(square.getAttribute('data-kind') !== 'plain', `casilla ${number}`).toBe(
        isSafe(number),
      );
    }
  });

  it('RF-002, R-005: las salidas 5, 22, 39 y 56 están en amarillo, azul, rojo y verde', async () => {
    const root = await render();
    expect(all(root, '[data-kind="start"]')).toHaveLength(COLORS.length);
    for (const color of COLORS) {
      const start = root.querySelector(`[data-square="${START_SQUARE[color]}"]`);
      expect(start?.getAttribute('data-kind'), color).toBe('start');
      expect(start?.getAttribute('data-color'), color).toBe(color);
      expect(paintedWith(start!, `fill-team-${color}-dark`), color).toBe(true);
    }
    for (const safe of all(root, '[data-kind="safe"]')) {
      expect(paintedWith(safe, 'fill-canopy-dark'), safe.getAttribute('data-square')!).toBe(true);
    }
  });

  it('RF-003: cada color tiene un pasillo de 7 casillas en su color', async () => {
    const root = await render();
    for (const color of COLORS) {
      const lane = all(root, `[data-layer="game"] [data-lane="${color}"]`);
      expect(lane, color).toHaveLength(LANE_LENGTH);
      const steps = lane.map((s) => Number(s.getAttribute('data-step'))).sort((a, b) => a - b);
      expect(steps, color).toEqual(Array.from({ length: LANE_LENGTH }, (_, i) => i + 1));
      for (const square of lane) {
        expect(paintedWith(square, `fill-team-${color}`), color).toBe(true);
      }
    }
  });

  it('RF-003: hay 4 triángulos de meta, cada uno en el color de su pasillo', async () => {
    const root = await render();
    const goals = all(root, '[data-layer="game"] [data-goal]');
    expect(goals).toHaveLength(COLORS.length);
    for (const color of COLORS) {
      const goal = root.querySelector(`[data-goal="${color}"]`);
      expect(goal, color).not.toBeNull();
      expect(paintedWith(goal!, `fill-team-${color}`), color).toBe(true);
    }
  });

  it('RF-004: hay 4 casas con 4 puestos', async () => {
    const root = await render();
    const homes = all(root, '[data-layer="game"] [data-home]');
    expect(homes).toHaveLength(COLORS.length);
    for (const color of COLORS) {
      const home = root.querySelector(`[data-home="${color}"]`);
      expect(home, color).not.toBeNull();
      expect(home!.querySelectorAll('[data-home-slot]'), color).toHaveLength(4);
      expect(paintedWith(home!, `fill-team-${color}`), color).toBe(true);
    }
  });

  it('RF-007: se pintan los 4 colores', async () => {
    const root = await render();
    for (const color of COLORS) {
      expect(root.querySelector(`.fill-team-${color}`), color).not.toBeNull();
    }
  });
});
