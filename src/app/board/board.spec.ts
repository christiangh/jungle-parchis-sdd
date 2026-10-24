import { TestBed } from '@angular/core/testing';
import {
  Color,
  COLORS,
  GameState,
  isSafe,
  LANE_LENGTH,
  PieceId,
  Position,
  START_SQUARE,
  TRACK_LENGTH,
} from '@engine';
import { Board } from './board';
import {
  goals,
  homes,
  laneSquares,
  PIECE_RADIUS,
  Point,
  SQUARE_LENGTH,
  SQUARE_WIDTH,
  trackSquares,
} from './board-geometry';
import { NEW_GAME, newGame, stateWith } from './board-test-utils';

async function render(state: GameState = NEW_GAME): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(Board);
  fixture.componentRef.setInput('state', state);
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

function pieceOf(root: HTMLElement, id: PieceId): Element {
  const piece = root.querySelector(`[data-layer="game"] [data-pieces] [data-piece="${id}"]`);
  expect(piece, id).not.toBeNull();
  return piece!;
}

/** Centre shared by all the circles of a piece. */
function centerOf(piece: Element): Point {
  const circles = Array.from(piece.querySelectorAll('circle'));
  expect(circles.length, piece.getAttribute('data-piece')!).toBeGreaterThan(0);
  const [center] = circles.map((c) => ({
    x: Number(c.getAttribute('cx')),
    y: Number(c.getAttribute('cy')),
  }));
  for (const circle of circles) {
    expect(Number(circle.getAttribute('cx'))).toBe(center.x);
    expect(Number(circle.getAttribute('cy'))).toBe(center.y);
  }
  return center;
}

function radiusOf(piece: Element, part: 'rim' | 'disc'): number {
  return Number(piece.querySelector(`[data-part="${part}"]`)?.getAttribute('r'));
}

function trackPlank(square: number) {
  return trackSquares().find((s) => s.number === square)!;
}

function lanePlank(color: Color, step: number) {
  return laneSquares().find((s) => s.color === color && s.step === step)!;
}

/** Checks a pair drawn inside its plank, whole and apart, the first to arrive towards the axis. */
function expectPair(
  plank: { center: Point; pairAxis: Point },
  first: Element,
  second: Element,
): void {
  const across = { x: plank.pairAxis.y, y: -plank.pairAxis.x };
  const [a, b] = [centerOf(first), centerOf(second)];
  for (const center of [a, b]) {
    const offset = { x: center.x - plank.center.x, y: center.y - plank.center.y };
    const along = offset.x * plank.pairAxis.x + offset.y * plank.pairAxis.y;
    const side = offset.x * across.x + offset.y * across.y;
    expect(Math.abs(along) + PIECE_RADIUS).toBeLessThanOrEqual(SQUARE_LENGTH / 2);
    expect(Math.abs(side) + PIECE_RADIUS).toBeLessThanOrEqual(SQUARE_WIDTH / 2);
  }
  expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(2 * PIECE_RADIUS);
  expect((a.x - b.x) * plank.pairAxis.x + (a.y - b.y) * plank.pairAxis.y).toBeGreaterThan(0);
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

  it('RF-005: la decoración tiene hierba, hojas y tronco, y no tapa la capa de juego', async () => {
    const root = await render();
    const decor = root.querySelector('[data-layer="decor"]')!;
    expect(decor.querySelector('[fill="url(#jp-board-grass)"]')).not.toBeNull();
    expect(decor.querySelectorAll('[data-decor="leaves"] > g')).toHaveLength(12);
    const layers = Array.from(root.querySelectorAll('svg > [data-layer]'));
    expect(layers.map((l) => l.getAttribute('data-layer'))).toEqual(['decor', 'game']);
    const log = root.querySelector('[data-layer="game"] [data-decor="log"]');
    expect(log?.getAttribute('aria-hidden')).toBe('true');
    expect(log?.nextElementSibling?.hasAttribute('data-square')).toBe(true);
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

  it('RF-007: con 2 jugadores, las casas de los ausentes quedan vacías', async () => {
    const root = await render(newGame(['yellow', 'red']));
    expect(all(root, '[data-piece]')).toHaveLength(8);
    for (const color of ['blue', 'green'] as const) {
      expect(all(root, `[data-piece][data-color="${color}"]`), color).toHaveLength(0);
      expect(root.querySelector(`[data-home="${color}"]`), color).not.toBeNull();
    }
  });

  it('RF-005: las fichas se pintan encima de la capa de juego', async () => {
    const root = await render();
    const pieces = root.querySelector('[data-layer="game"] > [data-pieces]');
    expect(pieces).not.toBeNull();
    expect(pieces?.nextElementSibling).toBeNull();
  });

  it('RF-009: cada ficha es un disco de su color con borde oscuro y reborde claro', async () => {
    const root = await render();
    const pieces = all(root, '[data-piece]');
    expect(pieces).toHaveLength(NEW_GAME.pieces.length);
    for (const piece of pieces) {
      const color = piece.getAttribute('data-color');
      const disc = piece.querySelector('[data-part="disc"]');
      const rim = piece.querySelector('[data-part="rim"]');
      expect(disc?.classList.contains(`fill-team-${color}`), color!).toBe(true);
      expect(Number(disc?.getAttribute('stroke-width')), color!).toBeGreaterThan(0);
      expect(disc?.classList.contains('stroke-ink'), color!).toBe(true);
      expect(rim?.classList.contains('fill-white'), color!).toBe(true);
      expect(radiusOf(piece, 'rim'), color!).toBe(PIECE_RADIUS);
      expect(radiusOf(piece, 'disc'), color!).toBeLessThan(PIECE_RADIUS);
    }
  });

  it('RF-010: en una partida nueva hay 4 fichas en cada casa, en puestos distintos', async () => {
    const root = await render();
    for (const home of homes()) {
      const pieces = all(root, `[data-piece][data-color="${home.color}"]`);
      expect(pieces, home.color).toHaveLength(4);
      expect(pieces.map(centerOf), home.color).toEqual(home.slots);
    }
  });

  it('RF-011: una ficha roja sola en la casilla 30 está en su centro', async () => {
    const root = await render(stateWith([['red-0', { kind: 'track', square: 30 }]]));
    expect(centerOf(pieceOf(root, 'red-0'))).toEqual(trackPlank(30).center);
  });

  it('RF-011: una ficha azul en la casilla 3 de su pasillo está en su centro', async () => {
    const root = await render(stateWith([['blue-0', { kind: 'lane', square: 3 }]]));
    expect(centerOf(pieceOf(root, 'blue-0'))).toEqual(lanePlank('blue', 3).center);
  });

  it('RF-009: una ficha amarilla en su salida se distingue por su borde', async () => {
    const root = await render(stateWith([['yellow-0', { kind: 'track', square: 5 }]]));
    const piece = pieceOf(root, 'yellow-0');
    expect(centerOf(piece)).toEqual(trackPlank(5).center);
    expect(paintedWith(piece, 'fill-team-yellow')).toBe(true);
    expect(piece.querySelector('[data-part="disc"]')?.classList.contains('stroke-ink')).toBe(true);
    expect(piece.querySelector('[data-part="rim"]')?.classList.contains('fill-white')).toBe(true);
  });

  it('RF-015: al recibir un estado nuevo la ficha aparece en su nueva posición, sin animación', async () => {
    const fixture = TestBed.createComponent(Board);
    fixture.componentRef.setInput('state', stateWith([['green-2', { kind: 'track', square: 56 }]]));
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(centerOf(pieceOf(root, 'green-2'))).toEqual(trackPlank(56).center);

    fixture.componentRef.setInput('state', stateWith([['green-2', { kind: 'track', square: 60 }]]));
    await fixture.whenStable();
    expect(centerOf(pieceOf(root, 'green-2'))).toEqual(trackPlank(60).center);
    expect(root.querySelector('animate, animateMotion, animateTransform')).toBeNull();
    const pieceClasses = all(root, '[data-pieces], [data-pieces] *').flatMap((e) =>
      Array.from(e.classList),
    );
    expect(pieceClasses.filter((c) => /transition|animate/.test(c))).toEqual([]);
  });

  it('RF-012: dos fichas verdes en la casilla 40 están una al lado de la otra', async () => {
    const position: Position = { kind: 'track', square: 40 };
    const root = await render(
      stateWith([
        ['green-0', position],
        ['green-1', position],
      ]),
    );
    expectPair(trackPlank(40), pieceOf(root, 'green-0'), pieceOf(root, 'green-1'));
  });

  it('RF-012: en el seguro 29, la ficha que llegó antes está a la izquierda', async () => {
    const position: Position = { kind: 'track', square: 29 };
    const root = await render(
      stateWith([
        ['blue-0', position],
        ['red-0', position],
      ]),
    );
    expectPair(trackPlank(29), pieceOf(root, 'blue-0'), pieceOf(root, 'red-0'));
  });

  it('RF-012: dos fichas amarillas en su pasillo están una al lado de la otra', async () => {
    const position: Position = { kind: 'lane', square: 2 };
    const root = await render(
      stateWith([
        ['yellow-3', position],
        ['yellow-1', position],
      ]),
    );
    expectPair(lanePlank('yellow', 2), pieceOf(root, 'yellow-3'), pieceOf(root, 'yellow-1'));
  });

  it('RF-013: 4 fichas azules en meta ocupan los 4 puestos del triángulo azul', async () => {
    const ids: PieceId[] = ['blue-1', 'blue-3', 'blue-0', 'blue-2'];
    const root = await render(stateWith(ids.map((id) => [id, { kind: 'goal' }] as const)));
    const goal = goals().find((g) => g.color === 'blue')!;
    expect(ids.map((id) => centerOf(pieceOf(root, id)))).toEqual(goal.slots);
  });

  it('RF-013: 1 ficha roja en meta ocupa el primer puesto del triángulo rojo', async () => {
    const root = await render(stateWith([['red-2', { kind: 'goal' }]]));
    const goal = goals().find((g) => g.color === 'red')!;
    expect(centerOf(pieceOf(root, 'red-2'))).toEqual(goal.slots[0]);
  });
});
