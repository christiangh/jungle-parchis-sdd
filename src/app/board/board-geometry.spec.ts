import { COLORS, ENTRY_SQUARE, isSafe, LANE_LENGTH, START_SQUARE, TRACK_LENGTH } from '@engine';
import {
  BOARD_CENTER,
  BOARD_SIZE,
  goals,
  HOME_SIZE,
  homes,
  laneSquares,
  Point,
  SQUARE_WIDTH,
  trackSquares,
} from './board-geometry';

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
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
});
