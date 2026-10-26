import { TestBed } from '@angular/core/testing';
import {
  Color,
  COLORS,
  GameState,
  isSafe,
  LANE_LENGTH,
  legalMoves,
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
import { NEW_GAME, newGame, rolled, stateWith } from './board-test-utils';
import { movePreview } from './move-preview';

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

interface Choosing {
  readonly root: HTMLElement;
  readonly pieceTouches: PieceId[];
  readonly ghostTouches: number[];
}

/** Renders a state with the engine's legal moves and records what the board emits. */
async function renderChoosing(
  state: GameState,
  selected: PieceId | null = null,
): Promise<Choosing> {
  const fixture = TestBed.createComponent(Board);
  fixture.componentRef.setInput('state', state);
  fixture.componentRef.setInput('moves', legalMoves(state));
  fixture.componentRef.setInput('selected', selected);
  const pieceTouches: PieceId[] = [];
  const ghostTouches: number[] = [];
  fixture.componentInstance.pieceTouch.subscribe((id) => pieceTouches.push(id));
  fixture.componentInstance.ghostTouch.subscribe(() => ghostTouches.push(ghostTouches.length));
  await fixture.whenStable();
  return { root: fixture.nativeElement as HTMLElement, pieceTouches, ghostTouches };
}

function ghostIn(root: HTMLElement): Element {
  const ghost = root.querySelector('[data-layer="game"] [data-ghost]');
  expect(ghost).not.toBeNull();
  return ghost!;
}

function ghostPiece(root: HTMLElement): Element {
  const piece = ghostIn(root).querySelector('[data-part="ghost-piece"]');
  expect(piece).not.toBeNull();
  return piece!;
}

function touchArea(root: HTMLElement, target: PieceId | 'ghost'): Element {
  const area = root.querySelector(`svg[data-layer="touch"] [data-touch="${target}"]`);
  expect(area, target).not.toBeNull();
  return area!;
}

function pointsOf(area: Element): Point[] {
  return area
    .getAttribute('points')!
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    });
}

/** Two yellow pieces that can move a 3 and a blue one that cannot, with the rest at home. */
const TWO_MOVES = rolled(
  [
    ['yellow-0', { kind: 'track', square: 10 }],
    ['yellow-1', { kind: 'track', square: 30 }],
    ['blue-0', { kind: 'track', square: 40 }],
  ],
  'yellow',
  3,
);

/** yellow-0 can join yellow-1 on square 13. */
const OWN_PAIR = rolled(
  [
    ['yellow-1', { kind: 'track', square: 13 }],
    ['yellow-0', { kind: 'track', square: 10 }],
  ],
  'yellow',
  3,
);

describe('Board, al elegir movimiento', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Board] }).compileComponents();
  });

  it('RF-012: las fichas de los movimientos legales llevan halo y las demás se atenúan', async () => {
    const { root } = await renderChoosing(TWO_MOVES);

    for (const id of ['yellow-0', 'yellow-1'] as const) {
      const piece = pieceOf(root, id);
      expect(piece.getAttribute('data-mode'), id).toBe('highlighted');
      const halo = piece.querySelector('[data-part="halo"]');
      expect(halo, id).not.toBeNull();
      expect(paintedWith(halo!, 'stroke-sun'), id).toBe(true);
      expect(piece.matches('.opacity-40'), id).toBe(false);
    }
    for (const id of ['yellow-2', 'blue-0', 'red-0'] as const) {
      const piece = pieceOf(root, id);
      expect(piece.getAttribute('data-mode'), id).toBe('dimmed');
      expect(piece.querySelector('[data-part="halo"]'), id).toBeNull();
      expect(piece.matches('.opacity-40'), id).toBe(true);
    }
  });

  it('RNF-002: el halo solo late sin movimiento reducido', async () => {
    const { root } = await renderChoosing(TWO_MOVES);
    const halo = pieceOf(root, 'yellow-0').querySelector('[data-part="halo"]');
    const classes = Array.from(halo?.classList ?? []);

    expect(classes).toContain('motion-safe:animate-piece-halo');
    expect(classes.filter((c) => c.startsWith('animate-'))).toEqual([]);
  });

  it('RF-020: sin movimientos legales no hay halos, atenuación, réplica ni áreas táctiles', async () => {
    const { root } = await renderChoosing(NEW_GAME, 'yellow-0');

    for (const piece of all(root, '[data-pieces] [data-piece]')) {
      expect(piece.getAttribute('data-mode')).toBe('idle');
      expect(piece.matches('.opacity-40')).toBe(false);
    }
    expect(root.querySelector('[data-part="halo"]')).toBeNull();
    expect(root.querySelector('[data-ghost]')).toBeNull();
    expect(root.querySelector('[data-touch]')).toBeNull();
  });

  it('RF-013: la ficha seleccionada crece y su réplica transparente está en el destino', async () => {
    const { root } = await renderChoosing(TWO_MOVES, 'yellow-0');
    const selected = pieceOf(root, 'yellow-0');

    expect(selected.getAttribute('data-mode')).toBe('selected');
    expect(radiusOf(selected, 'rim')).toBeGreaterThan(PIECE_RADIUS);
    expect(radiusOf(pieceOf(root, 'yellow-1'), 'rim')).toBe(PIECE_RADIUS);

    const ghost = ghostIn(root);
    expect(ghost.getAttribute('data-ghost')).toBe('yellow-0');
    expect(ghost.getAttribute('data-color')).toBe('yellow');
    expect(ghostPiece(root).matches('.opacity-60')).toBe(true);
    expect(ghost.matches('.opacity-60')).toBe(false);
    expect(centerOf(ghostPiece(root))).toEqual(trackPlank(13).center);
    expect(ghost.querySelector('[data-mark]')).toBeNull();
  });

  it('RF-014: la réplica de un movimiento que come lleva la diana +20', async () => {
    const state = rolled(
      [
        ['red-0', { kind: 'track', square: 13 }],
        ['yellow-0', { kind: 'track', square: 10 }],
      ],
      'yellow',
      3,
    );
    const ghost = ghostIn((await renderChoosing(state, 'yellow-0')).root);
    const target = ghost.querySelector('[data-mark="target"]');

    expect(target?.textContent?.trim()).toBe('+20');
    expect(paintedWith(target!, 'fill-team-red')).toBe(true);
    expect(ghost.querySelector('[data-mark="sun"]')).toBeNull();
  });

  it('RF-014: la réplica que llega a la meta lleva el sol +10', async () => {
    const state = rolled([['yellow-0', { kind: 'lane', square: 5 }]], 'yellow', 3);
    const ghost = ghostIn((await renderChoosing(state, 'yellow-0')).root);
    const sun = ghost.querySelector('[data-mark="sun"]');

    expect(sun?.textContent?.trim()).toBe('+10');
    expect(paintedWith(sun!, 'fill-team-yellow')).toBe(true);
    expect(ghost.querySelector('[data-mark="target"]')).toBeNull();
  });

  it('RF-014, RF-015: al formar pareja propia hay puente y cada ficha está en su lado', async () => {
    const { root } = await renderChoosing(OWN_PAIR, 'yellow-0');
    const preview = movePreview(OWN_PAIR, legalMoves(OWN_PAIR), 'yellow-0');
    const bridge = ghostIn(root).querySelector('[data-mark="bridge"]');

    expect(bridge).not.toBeNull();
    expect(paintedWith(bridge!, 'fill-wood')).toBe(true);
    expect(centerOf(pieceOf(root, 'yellow-1'))).toEqual(
      preview.pieces.find((p) => p.id === 'yellow-1')!.center,
    );
    expect(centerOf(ghostPiece(root))).toEqual(preview.ghost!.center);
    expectPair(trackPlank(13), pieceOf(root, 'yellow-1'), ghostPiece(root));
  });

  it('RF-014: al compartir seguro con una rival hay hoja', async () => {
    const state = rolled(
      [
        ['blue-0', { kind: 'track', square: 12 }],
        ['yellow-0', { kind: 'track', square: 9 }],
      ],
      'yellow',
      3,
    );
    const leaf = ghostIn((await renderChoosing(state, 'yellow-0')).root).querySelector(
      '[data-mark="leaf"]',
    );

    expect(leaf).not.toBeNull();
    expect(paintedWith(leaf!, 'fill-canopy')).toBe(true);
  });

  it('RF-018: las áreas táctiles van en un SVG aparte con los polígonos de la previsualización', async () => {
    const { root } = await renderChoosing(OWN_PAIR, 'yellow-0');
    const preview = movePreview(OWN_PAIR, legalMoves(OWN_PAIR), 'yellow-0');
    const layer = root.querySelector('svg[data-layer="touch"]');

    expect(layer).not.toBeNull();
    expect(layer?.getAttribute('viewBox')).toBe(root.querySelector('svg')?.getAttribute('viewBox'));
    expect(layer?.closest('[role="img"]')).toBeNull();
    expect(all(root, '[data-touch]').map((a) => a.getAttribute('data-touch'))).toEqual([
      'yellow-0',
      'yellow-1',
      'ghost',
    ]);
    for (const piece of preview.pieces.filter((p) => p.touchArea !== null)) {
      expect(pointsOf(touchArea(root, piece.id)), piece.id).toEqual(piece.touchArea);
    }
    expect(pointsOf(touchArea(root, 'ghost'))).toEqual(preview.ghost!.touchArea);
  });

  it('RF-018: cada área táctil es un botón con nombre', async () => {
    const { root } = await renderChoosing(TWO_MOVES, 'yellow-1');
    const labels: Record<string, string> = {
      'yellow-0': 'Ficha 1 de Amarillo',
      'yellow-1': 'Ficha 2 de Amarillo',
      ghost: 'Mover la ficha 2 de Amarillo aquí',
    };

    for (const [target, label] of Object.entries(labels)) {
      const area = touchArea(root, target as PieceId | 'ghost');
      expect(area.getAttribute('role'), target).toBe('button');
      expect(area.getAttribute('tabindex'), target).toBe('0');
      expect(area.getAttribute('aria-label'), target).toBe(label);
    }
  });

  it('RF-016: tocar un área emite la ficha o la réplica sin propagar el toque', async () => {
    const { root, pieceTouches, ghostTouches } = await renderChoosing(TWO_MOVES, 'yellow-0');
    const outside = vi.fn();
    root.addEventListener('click', outside);

    touchArea(root, 'yellow-1').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    touchArea(root, 'ghost').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(pieceTouches).toEqual(['yellow-1']);
    expect(ghostTouches).toHaveLength(1);
    expect(outside).not.toHaveBeenCalled();
  });

  it('RF-016: Intro y Espacio en un área hacen lo mismo que tocarla', async () => {
    const { root, pieceTouches, ghostTouches } = await renderChoosing(TWO_MOVES, 'yellow-0');
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

    touchArea(root, 'yellow-0').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    touchArea(root, 'ghost').dispatchEvent(space);

    expect(pieceTouches).toEqual(['yellow-0']);
    expect(ghostTouches).toHaveLength(1);
    expect(space.defaultPrevented).toBe(true);
  });
});
