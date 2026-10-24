import {
  Color,
  COLORS,
  LANE_LENGTH,
  PieceId,
  PIECES_PER_PLAYER,
  Position,
  TRACK_LENGTH,
} from '@engine';
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
import { pieceCenter, PiecePlace, piecePlaces } from './board-pieces';
import { NEW_GAME, stateWith } from './board-test-utils';

function centerOf(places: readonly PiecePlace[], id: PieceId): Point {
  const place = places.find((p) => p.id === id);
  expect(place, id).toBeDefined();
  return place!.center;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

function minus(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

interface Plank {
  readonly center: Point;
  readonly pairAxis: Point;
}

/** Checks a pair inside its plank, without overlapping, the first to arrive towards the axis. */
function expectPair(plank: Plank, first: Point, second: Point, label: string): void {
  const across = { x: plank.pairAxis.y, y: -plank.pairAxis.x };
  for (const center of [first, second]) {
    const offset = minus(center, plank.center);
    expect(Math.abs(dot(offset, plank.pairAxis)) + PIECE_RADIUS, label).toBeLessThanOrEqual(
      SQUARE_LENGTH / 2,
    );
    expect(Math.abs(dot(offset, across)) + PIECE_RADIUS, label).toBeLessThanOrEqual(
      SQUARE_WIDTH / 2,
    );
  }
  expect(distance(first, second), label).toBeGreaterThanOrEqual(2 * PIECE_RADIUS);
  expect(dot(minus(first, second), plank.pairAxis), label).toBeGreaterThan(0);
}

function rival(color: Color): Color {
  return COLORS[(COLORS.indexOf(color) + 1) % COLORS.length];
}

describe('board pieces', () => {
  it('RF-008: hay un lugar para cada ficha del estado', () => {
    const places = piecePlaces(NEW_GAME);
    expect(places.map((p) => p.id)).toEqual(NEW_GAME.pieces.map((p) => p.id));
    for (const place of places) {
      expect(place.color).toBe(NEW_GAME.pieces.find((p) => p.id === place.id)?.color);
    }
  });

  it('RF-010: cada ficha en casa ocupa el puesto de su número', () => {
    const places = piecePlaces(NEW_GAME);
    for (const home of homes()) {
      for (let index = 0; index < PIECES_PER_PLAYER; index++) {
        const id = `${home.color}-${index}` as PieceId;
        expect(centerOf(places, id), id).toEqual(home.slots[index]);
      }
    }
  });

  it('RF-010: una ficha en casa conserva su puesto aunque salgan las demás', () => {
    const places = piecePlaces(
      stateWith([
        ['red-0', { kind: 'track', square: 39 }],
        ['red-2', { kind: 'goal' }],
      ]),
    );
    const home = homes().find((h) => h.color === 'red')!;
    expect(centerOf(places, 'red-1')).toEqual(home.slots[1]);
    expect(centerOf(places, 'red-3')).toEqual(home.slots[3]);
  });

  it('RF-011: una ficha sola cae en el centro de su casilla del recorrido', () => {
    for (const square of trackSquares()) {
      const places = piecePlaces(
        stateWith([['green-1', { kind: 'track', square: square.number }]]),
      );
      expect(centerOf(places, 'green-1'), `casilla ${square.number}`).toEqual(square.center);
    }
  });

  it('RF-011: una ficha sola cae en el centro de su casilla del pasillo', () => {
    for (const square of laneSquares()) {
      const id = `${square.color}-2` as PieceId;
      const places = piecePlaces(stateWith([[id, { kind: 'lane', square: square.step }]]));
      expect(centerOf(places, id), `${square.color} ${square.step}`).toEqual(square.center);
    }
  });

  it('RF-012: una pareja queda dentro del tablón sin solaparse, la que llegó antes a la izquierda', () => {
    expect(trackSquares()).toHaveLength(TRACK_LENGTH);
    for (const square of trackSquares()) {
      const position: Position = { kind: 'track', square: square.number };
      const places = piecePlaces(
        stateWith([
          ['blue-3', position],
          ['yellow-0', position],
        ]),
      );
      expectPair(
        square,
        centerOf(places, 'blue-3'),
        centerOf(places, 'yellow-0'),
        `casilla ${square.number}`,
      );
    }
  });

  it('RF-012: el orden de la pareja es el de llegada, no el de las fichas', () => {
    const square = trackSquares().find((s) => s.number === 29)!;
    const position: Position = { kind: 'track', square: 29 };
    const places = piecePlaces(
      stateWith([
        ['yellow-0', position],
        ['blue-3', position],
      ]),
    );
    expectPair(square, centerOf(places, 'yellow-0'), centerOf(places, 'blue-3'), 'casilla 29');
  });

  it('RF-012: una pareja en el pasillo queda dentro del tablón, la que llegó antes a la izquierda', () => {
    expect(laneSquares()).toHaveLength(COLORS.length * LANE_LENGTH);
    for (const square of laneSquares()) {
      const position: Position = { kind: 'lane', square: square.step };
      const first = `${square.color}-3` as PieceId;
      const second = `${square.color}-1` as PieceId;
      const places = piecePlaces(
        stateWith([
          [first, position],
          [second, position],
        ]),
      );
      expectPair(
        square,
        centerOf(places, first),
        centerOf(places, second),
        `${square.color} ${square.step}`,
      );
    }
  });

  it('RF-012: fichas en la misma casilla de pasillos distintos no forman pareja', () => {
    const places = piecePlaces(
      stateWith([
        ['red-0', { kind: 'lane', square: 4 }],
        ['blue-0', { kind: 'lane', square: 4 }],
      ]),
    );
    for (const color of ['red', 'blue'] as const) {
      const square = laneSquares().find((s) => s.color === color && s.step === 4)!;
      expect(centerOf(places, `${color}-0`), color).toEqual(square.center);
    }
  });

  it('RF-013: las fichas en meta ocupan los puestos de su color por orden de llegada', () => {
    for (const goal of goals()) {
      const ids = [2, 0, 3, 1].map((index) => `${goal.color}-${index}` as PieceId);
      const places = piecePlaces(
        stateWith([
          [ids[0], { kind: 'goal' }],
          [`${rival(goal.color)}-0`, { kind: 'goal' }],
          [ids[1], { kind: 'goal' }],
          [ids[2], { kind: 'goal' }],
          [ids[3], { kind: 'goal' }],
        ]),
      );
      ids.forEach((id, i) => expect(centerOf(places, id), id).toEqual(goal.slots[i]));
    }
  });

  it('RF-013: la primera ficha en llegar a la meta ocupa el primer puesto', () => {
    const goal = goals().find((g) => g.color === 'red')!;
    const places = piecePlaces(stateWith([['red-3', { kind: 'goal' }]]));
    expect(centerOf(places, 'red-3')).toEqual(goal.slots[0]);
  });

  it('RF-014: la misma posición da siempre el mismo punto', () => {
    const state = stateWith([
      ['yellow-0', { kind: 'track', square: 68 }],
      ['blue-1', { kind: 'track', square: 68 }],
      ['red-2', { kind: 'lane', square: 7 }],
      ['green-3', { kind: 'goal' }],
    ]);
    const snapshot = structuredClone(state);
    expect(piecePlaces(state)).toEqual(piecePlaces(state));
    expect(state).toEqual(snapshot);

    const square = trackSquares().find((s) => s.number === 30)!;
    const center = pieceCenter('red', { kind: 'track', square: 30 }, { index: 0, count: 1 });
    expect(center).toEqual(square.center);
    expect(pieceCenter('red', { kind: 'track', square: 30 }, { index: 0, count: 1 })).toEqual(
      center,
    );
  });
});
