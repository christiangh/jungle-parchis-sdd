import { COLORS, ENTRY_SQUARE, isSafe, LANE_LENGTH, START_SQUARE, TRACK_LENGTH } from '@engine';
import {
  BOARD_CENTER,
  BOARD_SIZE,
  goals,
  HOME_PIECE_RADIUS,
  HOME_SIZE,
  homeMedallions,
  homes,
  MEDALLION_GLOW_RADIUS,
  laneSquares,
  PIECE_RADIUS,
  plankCorners,
  Point,
  SQUARE_LENGTH,
  SQUARE_WIDTH,
  trackSquares,
} from './board-geometry';

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function minus(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

/** Left of a piece facing `direction`, with the SVG y axis pointing down. */
function leftOf(direction: Point): Point {
  return { x: direction.y, y: -direction.x };
}

/** Direction of a plank's long side for its SVG rotation. */
function longSide(rotation: number): Point {
  return rotation % 180 === 0 ? { x: 1, y: 0 } : { x: 0, y: 1 };
}

/** Distance from a point to the line through `a` and `b`, positive on the side of `inside`. */
function signedDistance(point: Point, a: Point, b: Point, inside: Point): number {
  const normal = leftOf(minus(b, a));
  const side = Math.sign(dot(minus(inside, a), normal));
  return (side * dot(minus(point, a), normal)) / Math.hypot(normal.x, normal.y);
}

function expectPairAxis(axis: Point, rotation: number, label: string): void {
  expect(Math.hypot(axis.x, axis.y), label).toBe(1);
  expect(Math.abs(dot(axis, longSide(rotation))), label).toBe(1);
}

function trackCenter(square: number): Point | undefined {
  return trackSquares().find((s) => s.number === square)?.center;
}

function homeCenter(color: string): Point | undefined {
  const home = homes().find((h) => h.color === color);
  return home && { x: home.x + HOME_SIZE / 2, y: home.y + HOME_SIZE / 2 };
}

describe('board geometry', () => {
  it('RF-001: hay 68 casillas numeradas del 1 al 68', () => {
    const numbers = trackSquares()
      .map((s) => s.number)
      .sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: TRACK_LENGTH }, (_, i) => i + 1));
  });

  it('RF-001: las casillas siguen el diseño de referencia', () => {
    expect(trackCenter(1)).toEqual({ x: 620, y: 980 });
    expect(trackCenter(5)).toEqual({ x: 620, y: 820 });
    expect(trackCenter(22)).toEqual({ x: 820, y: 380 });
    expect(trackCenter(39)).toEqual({ x: 380, y: 180 });
    expect(trackCenter(56)).toEqual({ x: 180, y: 620 });
    expect(trackCenter(68)).toEqual({ x: 500, y: 980 });
  });

  it('RF-001: dos casillas no ocupan el mismo sitio', () => {
    const centers = new Set(trackSquares().map((s) => `${s.center.x},${s.center.y}`));
    expect(centers.size).toBe(TRACK_LENGTH);
  });

  it('RF-002, R-006: los seguros son las casillas que el motor considera seguro', () => {
    expect(trackSquares()).toHaveLength(TRACK_LENGTH);
    for (const square of trackSquares()) {
      expect(square.kind !== 'plain', `casilla ${square.number}`).toBe(isSafe(square.number));
    }
  });

  it('RF-002, R-005: las salidas son las del motor, en el color de su equipo', () => {
    const starts = trackSquares().filter((s) => s.kind === 'start');
    expect(starts).toHaveLength(COLORS.length);
    for (const color of COLORS) {
      const start = starts.find((s) => s.number === START_SQUARE[color]);
      expect(start?.color, color).toBe(color);
    }
    for (const square of trackSquares().filter((s) => s.kind !== 'start')) {
      expect(square.color, `casilla ${square.number}`).toBeNull();
    }
  });

  it('RF-003: cada color tiene un pasillo de 7 casillas', () => {
    for (const color of COLORS) {
      const steps = laneSquares()
        .filter((s) => s.color === color)
        .map((s) => s.step)
        .sort((a, b) => a - b);
      expect(steps, color).toEqual(Array.from({ length: LANE_LENGTH }, (_, i) => i + 1));
    }
  });

  it('RF-003, R-008: el pasillo empieza junto a la casilla de entrada de su color', () => {
    for (const color of COLORS) {
      const first = laneSquares().find((s) => s.color === color && s.step === 1);
      const entry = trackCenter(ENTRY_SQUARE[color]);
      expect(first, color).toBeDefined();
      expect(entry, color).toBeDefined();
      expect(distance(first!.center, entry!), color).toBe(SQUARE_WIDTH);
    }
  });

  it('RF-003: las casillas del pasillo se suceden hacia el centro', () => {
    for (const color of COLORS) {
      const lane = laneSquares()
        .filter((s) => s.color === color)
        .sort((a, b) => a.step - b.step);
      expect(lane, color).toHaveLength(LANE_LENGTH);
      for (let i = 1; i < lane.length; i++) {
        expect(distance(lane[i].center, lane[i - 1].center), color).toBe(SQUARE_WIDTH);
        expect(distance(lane[i].center, BOARD_CENTER), color).toBeLessThan(
          distance(lane[i - 1].center, BOARD_CENTER),
        );
      }
    }
  });

  it('RF-003: la séptima casilla del pasillo da a la meta de su color', () => {
    expect(goals()).toHaveLength(COLORS.length);
    for (const goal of goals()) {
      const nearest = [...laneSquares()].sort(
        (a, b) => distance(a.center, goal.entry) - distance(b.center, goal.entry),
      )[0];
      expect(nearest?.color, goal.color).toBe(goal.color);
      expect(nearest?.step, goal.color).toBe(LANE_LENGTH);
      expect(distance(nearest.center, goal.entry), goal.color).toBeLessThan(SQUARE_WIDTH);
      expect(nearest.rotation, goal.color).toBe(goal.rotation);
    }
  });

  it('RF-012: en los tablones de columna, la pareja empieza a la izquierda según el avance', () => {
    const columns = trackSquares().filter((s) => !Object.values(ENTRY_SQUARE).includes(s.number));
    expect(columns).toHaveLength(TRACK_LENGTH - COLORS.length);
    for (const square of columns) {
      const previous = trackCenter(((square.number + TRACK_LENGTH - 2) % TRACK_LENGTH) + 1)!;
      const next = trackCenter((square.number % TRACK_LENGTH) + 1)!;
      const label = `casilla ${square.number}`;
      expectPairAxis(square.pairAxis, square.rotation, label);
      expect(dot(square.pairAxis, leftOf(minus(next, previous))), label).toBeGreaterThan(0);
    }
  });

  it('RF-012: en los tablones centrales se avanza a lo largo y la pareja empieza atrás', () => {
    const middles = trackSquares().filter((s) => Object.values(ENTRY_SQUARE).includes(s.number));
    expect(middles).toHaveLength(COLORS.length);
    for (const square of middles) {
      const previous = trackCenter(((square.number + TRACK_LENGTH - 2) % TRACK_LENGTH) + 1)!;
      const next = trackCenter((square.number % TRACK_LENGTH) + 1)!;
      const label = `casilla ${square.number}`;
      expect(Math.abs(dot(minus(next, previous), leftOf(longSide(square.rotation)))), label).toBe(
        0,
      );
      expectPairAxis(square.pairAxis, square.rotation, label);
      expect(dot(square.pairAxis, minus(previous, square.center)), label).toBeGreaterThan(0);
    }
  });

  it('RF-012: en el pasillo, la pareja empieza a la izquierda según el avance', () => {
    for (const color of COLORS) {
      const lane = laneSquares()
        .filter((s) => s.color === color)
        .sort((a, b) => a.step - b.step);
      const goal = goals().find((g) => g.color === color)!;
      const path = [trackCenter(ENTRY_SQUARE[color])!, ...lane.map((s) => s.center), goal.entry];
      lane.forEach((square, i) => {
        const label = `${color} ${square.step}`;
        expectPairAxis(square.pairAxis, square.rotation, label);
        expect(dot(square.pairAxis, leftOf(minus(path[i + 2], path[i]))), label).toBeGreaterThan(0);
      });
    }
  });

  it('RF-013: cada meta tiene 4 puestos dentro de su triángulo, sin solaparse', () => {
    for (const goal of goals()) {
      expect(goal.corners, goal.color).toHaveLength(3);
      const [left, right, apex] = goal.corners;
      expect(goal.entry, goal.color).toEqual({
        x: (left.x + right.x) / 2,
        y: (left.y + right.y) / 2,
      });
      expect(goal.slots, goal.color).toHaveLength(4);
      for (const slot of goal.slots) {
        for (const [a, b, inside] of [
          [left, right, apex],
          [right, apex, left],
          [apex, left, right],
        ]) {
          expect(signedDistance(slot, a, b, inside), goal.color).toBeGreaterThanOrEqual(
            PIECE_RADIUS,
          );
        }
      }
      for (let i = 0; i < goal.slots.length; i++) {
        for (let j = i + 1; j < goal.slots.length; j++) {
          expect(distance(goal.slots[i], goal.slots[j]), goal.color).toBeGreaterThanOrEqual(
            2 * PIECE_RADIUS,
          );
        }
      }
    }
  });

  it('RF-013: los puestos de meta van en fila junto a la base, el primero a la izquierda', () => {
    for (const goal of goals()) {
      expect(goal.corners, goal.color).toHaveLength(3);
      expect(goal.slots, goal.color).toHaveLength(4);
      const [left, right, apex] = goal.corners;
      const last = laneSquares().find((s) => s.color === goal.color && s.step === LANE_LENGTH)!;
      const toLeft = leftOf(minus(goal.entry, last.center));
      const heights = goal.slots.map((slot) => signedDistance(slot, left, right, apex));
      expect(new Set(heights).size, goal.color).toBe(1);
      expect(heights[0], goal.color).toBeLessThan(signedDistance(goal.center, left, right, apex));
      for (let i = 1; i < goal.slots.length; i++) {
        expect(dot(goal.slots[i - 1], toLeft), goal.color).toBeGreaterThan(
          dot(goal.slots[i], toLeft),
        );
      }
    }
  });

  it('RF-004: las casas están en las esquinas del diseño con 4 puestos', () => {
    const far = BOARD_SIZE - HOME_SIZE;
    const corner = (color: string) => {
      const home = homes().find((h) => h.color === color);
      return home && { x: home.x, y: home.y };
    };
    expect(homes()).toHaveLength(COLORS.length);
    expect(corner('red')).toEqual({ x: 0, y: 0 });
    expect(corner('blue')).toEqual({ x: far, y: 0 });
    expect(corner('yellow')).toEqual({ x: far, y: far });
    expect(corner('green')).toEqual({ x: 0, y: far });
    for (const home of homes()) {
      expect(home.slots, home.color).toHaveLength(4);
      for (const slot of home.slots) {
        expect(slot.x).toBeGreaterThan(home.x);
        expect(slot.x).toBeLessThan(home.x + HOME_SIZE);
        expect(slot.y).toBeGreaterThan(home.y);
        expect(slot.y).toBeLessThan(home.y + HOME_SIZE);
      }
    }
  });

  it('RF-014: cada casa tiene un medallón a 22 del vértice de la casa que es esquina del tablero', () => {
    expect(homeMedallions().map((m) => m.color)).toEqual(homes().map((h) => h.color));
    for (const home of homes()) {
      const corners = [home.x, home.x + HOME_SIZE].flatMap((x) =>
        [home.y, home.y + HOME_SIZE].map((y) => ({ x, y })),
      );
      const outer = corners.reduce((a, b) =>
        distance(b, BOARD_CENTER) > distance(a, BOARD_CENTER) ? b : a,
      );
      const inward = {
        x: Math.sign(BOARD_CENTER.x - outer.x),
        y: Math.sign(BOARD_CENTER.y - outer.y),
      };
      const medallion = homeMedallions().find((m) => m.color === home.color);
      expect(medallion?.center, home.color).toEqual({
        x: outer.x + 22 * inward.x,
        y: outer.y + 22 * inward.y,
      });
    }
  });

  it('RF-014: el brillo del medallón cabe en el tablero dibujado', () => {
    // Same margin as the board's viewBox, -40 -40 1080 1080.
    const margin = 40;
    for (const { color, center } of homeMedallions()) {
      expect(center.x - MEDALLION_GLOW_RADIUS, color).toBeGreaterThanOrEqual(-margin);
      expect(center.y - MEDALLION_GLOW_RADIUS, color).toBeGreaterThanOrEqual(-margin);
      expect(center.x + MEDALLION_GLOW_RADIUS, color).toBeLessThanOrEqual(BOARD_SIZE + margin);
      expect(center.y + MEDALLION_GLOW_RADIUS, color).toBeLessThanOrEqual(BOARD_SIZE + margin);
    }
  });

  it('RF-014, CE-12: el brillo del medallón no se solapa con ninguna ficha en su casa', () => {
    for (const home of homes()) {
      const medallion = homeMedallions().find((m) => m.color === home.color);
      for (const slot of home.slots) {
        expect(medallion && distance(medallion.center, slot), home.color).toBeGreaterThanOrEqual(
          MEDALLION_GLOW_RADIUS + HOME_PIECE_RADIUS,
        );
      }
    }
  });

  it('RF-014: los medallones son los mismos en cada llamada', () => {
    expect(homeMedallions()).toEqual(homeMedallions());
  });

  it('RF-004, R-005: la casilla de salida de cada color está junto a su casa', () => {
    for (const color of COLORS) {
      const start = trackCenter(START_SQUARE[color]);
      const own = homeCenter(color);
      expect(start, color).toBeDefined();
      expect(own, color).toBeDefined();
      for (const other of COLORS.filter((c) => c !== color)) {
        expect(distance(start!, own!), color).toBeLessThan(distance(start!, homeCenter(other)!));
      }
    }
  });

  it('RF-018: las esquinas de cada tablón rodean su casilla, con el lado largo en el eje de pareja', () => {
    for (const square of [...trackSquares(), ...laneSquares()]) {
      const label =
        'number' in square ? `casilla ${square.number}` : `${square.color} ${square.step}`;
      const corners = plankCorners(square);
      expect(corners, label).toHaveLength(4);
      const [a, b, c, d] = corners;
      expect({ x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }, label).toEqual(square.center);
      expect({ x: (b.x + d.x) / 2, y: (b.y + d.y) / 2 }, label).toEqual(square.center);
      expect(distance(a, b), label).toBe(SQUARE_LENGTH);
      expect(distance(b, c), label).toBe(SQUARE_WIDTH);
      expect(Math.abs(dot(minus(b, a), square.pairAxis)), label).toBe(SQUARE_LENGTH);
    }
  });
});
