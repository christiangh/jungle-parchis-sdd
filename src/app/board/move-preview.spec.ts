import { applyAction, GameState, legalMoves, PieceId, Position } from '@engine';
import {
  goals,
  homes,
  laneSquares,
  plankCorners,
  Point,
  SQUARE_LENGTH,
  SQUARE_WIDTH,
  trackSquares,
} from './board-geometry';
import { pieceCenter, piecePlaces } from './board-pieces';
import { NEW_GAME, rolled, stateWith } from './board-test-utils';
import { MovePreview, movePreview, PiecePreview } from './move-preview';

const PLANK_AREA = SQUARE_LENGTH * SQUARE_WIDTH;

/** Preview of a state with the engine's own legal moves. */
function previewOf(state: GameState, selected: PieceId | null = null): MovePreview {
  return movePreview(state, legalMoves(state), selected);
}

function pieceIn(preview: MovePreview, id: PieceId): PiecePreview {
  const piece = preview.pieces.find((p) => p.id === id);
  expect(piece, id).toBeDefined();
  return piece!;
}

function idsWith(preview: MovePreview, mode: PiecePreview['mode']): PieceId[] {
  return preview.pieces.filter((p) => p.mode === mode).map((p) => p.id);
}

function track(square: number): Point {
  return trackSquares().find((s) => s.number === square)!.center;
}

function trackCorners(square: number): readonly Point[] {
  return plankCorners(trackSquares().find((s) => s.number === square)!);
}

/** Area of a polygon (shoelace formula). */
function areaOf(polygon: readonly Point[]): number {
  const sum = polygon.reduce((total, a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    return total + a.x * b.y - b.x * a.y;
  }, 0);
  return Math.abs(sum) / 2;
}

/** Whether a convex polygon holds a point, edges included. */
function contains(polygon: readonly Point[], point: Point): boolean {
  const sides = polygon.map((a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    return Math.sign((b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x));
  });
  return sides.every((s) => s >= 0) || sides.every((s) => s <= 0);
}

function centroid(polygon: readonly Point[]): Point {
  return {
    x: polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length,
    y: polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length,
  };
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

/** yellow-0 can join yellow-1 on square 13, and yellow-1 can move on to 16. */
const OWN_PAIR = rolled(
  [
    ['yellow-1', { kind: 'track', square: 13 }],
    ['yellow-0', { kind: 'track', square: 10 }],
  ],
  'yellow',
  3,
);

describe('move preview', () => {
  it('RF-012: resalta exactamente las fichas de los movimientos legales y atenúa las demás, también las de casa', () => {
    const preview = previewOf(TWO_MOVES);
    const movable = legalMoves(TWO_MOVES).map((m) => m.pieceId);

    expect(movable).toEqual(['yellow-0', 'yellow-1']);
    expect(idsWith(preview, 'highlighted')).toEqual(movable);
    expect(idsWith(preview, 'dimmed')).toEqual(
      TWO_MOVES.pieces.map((p) => p.id).filter((id) => !movable.includes(id)),
    );
    expect(pieceIn(preview, 'yellow-2').mode).toBe('dimmed');
    expect(preview.ghost).toBeNull();
  });

  it('RF-012, R-051: con un premio resalta las fichas que pueden usarlo', () => {
    const state: GameState = {
      ...stateWith([['yellow-0', { kind: 'track', square: 10 }]]),
      initialRoll: null,
      turn: 'yellow',
      pendingBonus: 20,
    };
    const preview = previewOf(state);

    expect(idsWith(preview, 'highlighted')).toEqual(['yellow-0']);
    expect(pieceIn(preview, 'yellow-1').mode).toBe('dimmed');
  });

  it('RF-020: sin movimientos legales no hay resaltados, réplica ni áreas táctiles', () => {
    const preview = movePreview(NEW_GAME, legalMoves(NEW_GAME), 'yellow-0');

    expect(preview.pieces.every((p) => p.mode === 'idle')).toBe(true);
    expect(preview.pieces.every((p) => p.touchArea === null)).toBe(true);
    expect(preview.ghost).toBeNull();
  });

  it('RF-013: la ficha tocada queda seleccionada y su réplica aparece en el destino', () => {
    const preview = previewOf(TWO_MOVES, 'yellow-0');

    expect(pieceIn(preview, 'yellow-0').mode).toBe('selected');
    expect(pieceIn(preview, 'yellow-0').center).toEqual(track(10));
    expect(pieceIn(preview, 'yellow-1').mode).toBe('highlighted');
    expect(preview.ghost).toEqual({
      pieceId: 'yellow-0',
      color: 'yellow',
      center: track(13),
      touchArea: trackCorners(13),
      captures: false,
      reachesGoal: false,
      pair: null,
    });
  });

  it('RF-013, R-071: tras un rebote la réplica queda en la casilla final del pasillo', () => {
    const state = rolled([['yellow-0', { kind: 'lane', square: 5 }]], 'yellow', 4);
    expect(legalMoves(state)).toEqual([{ pieceId: 'yellow-0', to: { kind: 'lane', square: 7 } }]);

    const ghost = previewOf(state, 'yellow-0').ghost!;
    const last = laneSquares().find((s) => s.color === 'yellow' && s.step === 7)!;
    expect(ghost.center).toEqual(last.center);
    expect(ghost.touchArea).toEqual(plankCorners(last));
    expect(ghost.reachesGoal).toBe(false);
  });

  it('RF-014, R-070: al llegar a la meta la réplica ocupa el puesto libre y lleva el sol', () => {
    const state = rolled(
      [
        ['yellow-1', { kind: 'goal' }],
        ['yellow-0', { kind: 'lane', square: 5 }],
      ],
      'yellow',
      3,
    );
    const goal = goals().find((g) => g.color === 'yellow')!;

    const ghost = previewOf(state, 'yellow-0').ghost!;
    expect(ghost.center).toEqual(goal.slots[1]);
    expect(ghost.reachesGoal).toBe(true);
    expect(ghost.captures).toBe(false);
    expect(ghost.pair).toBeNull();
  });

  it('RF-014, R-050: la diana aparece solo si el movimiento come', () => {
    const state = rolled(
      [
        ['red-0', { kind: 'track', square: 13 }],
        ['yellow-0', { kind: 'track', square: 10 }],
        ['yellow-1', { kind: 'track', square: 30 }],
      ],
      'yellow',
      3,
    );

    const capture = previewOf(state, 'yellow-0').ghost!;
    expect(capture.center).toEqual(track(13));
    expect(capture.captures).toBe(true);
    expect(capture.reachesGoal).toBe(false);
    expect(capture.pair).toBeNull();

    expect(previewOf(state, 'yellow-1').ghost?.captures).toBe(false);
  });

  it('RF-014, R-023: al salir de casa comiendo, la réplica está en la salida con la diana', () => {
    const state = rolled([['red-0', { kind: 'track', square: 5 }]], 'yellow', 5);
    expect(legalMoves(state)).toEqual([
      { pieceId: 'yellow-0', to: { kind: 'track', square: 5 }, captures: 'red-0' },
    ]);

    const ghost = previewOf(state, 'yellow-0').ghost!;
    expect(ghost.center).toEqual(track(5));
    expect(ghost.captures).toBe(true);
    expect(ghost.pair).toBeNull();
  });

  it('RF-015, R-060: con una ficha propia en el destino se previsualiza la pareja con puente', () => {
    const preview = previewOf(OWN_PAIR, 'yellow-0');
    const position: Position = { kind: 'track', square: 13 };

    expect(pieceIn(preview, 'yellow-1').center).toEqual(
      pieceCenter('yellow', position, { index: 0, count: 2 }),
    );
    expect(preview.ghost?.center).toEqual(pieceCenter('yellow', position, { index: 1, count: 2 }));
    expect(preview.ghost?.pair).toEqual({ kind: 'bridge', center: track(13), rotation: 270 });
    expect(preview.ghost?.captures).toBe(false);
  });

  it('RF-015: la previsualización de pareja coincide con lo que queda tras confirmar', () => {
    const preview = previewOf(OWN_PAIR, 'yellow-0');
    const result = applyAction(OWN_PAIR, { type: 'move', player: 'yellow', pieceId: 'yellow-0' });
    expect(result.ok).toBe(true);
    const after = piecePlaces((result as { value: { state: GameState } }).value.state);

    expect(after.find((p) => p.id === 'yellow-1')?.center).toEqual(
      pieceIn(preview, 'yellow-1').center,
    );
    expect(after.find((p) => p.id === 'yellow-0')?.center).toEqual(preview.ghost?.center);
  });

  it('RF-015, R-052: con una rival en un seguro se previsualiza la pareja con hoja', () => {
    const state = rolled(
      [
        ['blue-0', { kind: 'track', square: 12 }],
        ['yellow-0', { kind: 'track', square: 9 }],
      ],
      'yellow',
      3,
    );
    const preview = previewOf(state, 'yellow-0');
    const position: Position = { kind: 'track', square: 12 };

    expect(pieceIn(preview, 'blue-0').center).toEqual(
      pieceCenter('blue', position, { index: 0, count: 2 }),
    );
    expect(pieceIn(preview, 'blue-0').mode).toBe('dimmed');
    expect(preview.ghost?.pair?.kind).toBe('leaf');
    expect(preview.ghost?.captures).toBe(false);
  });

  it('RF-015: al cambiar la selección la ficha de la pareja vuelve al centro y tiene su réplica', () => {
    const preview = previewOf(OWN_PAIR, 'yellow-1');

    expect(pieceIn(preview, 'yellow-1').center).toEqual(track(13));
    expect(pieceIn(preview, 'yellow-0').center).toEqual(track(10));
    expect(preview.ghost?.center).toEqual(track(16));
    expect(preview.ghost?.pair).toBeNull();
  });

  it('RF-018: una ficha sola se toca en todo su tablón', () => {
    const preview = previewOf(TWO_MOVES, 'yellow-0');

    expect(pieceIn(preview, 'yellow-0').touchArea).toEqual(trackCorners(10));
    expect(pieceIn(preview, 'yellow-1').touchArea).toEqual(trackCorners(30));
    expect(pieceIn(preview, 'blue-0').touchArea).toBeNull();
    expect(pieceIn(preview, 'yellow-2').touchArea).toBeNull();
  });

  it('RF-018: en una pareja cada ficha se toca en la mitad del tablón de su lado', () => {
    const state = rolled(
      [
        ['yellow-0', { kind: 'track', square: 10 }],
        ['yellow-1', { kind: 'track', square: 10 }],
      ],
      'yellow',
      3,
    );
    const pairs = [
      { preview: previewOf(state), ids: ['yellow-0', 'yellow-1'] as const, plank: 10 },
      { preview: previewOf(OWN_PAIR, 'yellow-0'), ids: ['yellow-1', null] as const, plank: 13 },
    ];
    for (const { preview, ids, plank } of pairs) {
      const sides = ids.map((id) => {
        const touched = id === null ? preview.ghost! : pieceIn(preview, id);
        return { center: touched.center, area: touched.touchArea! };
      });
      const corners = trackCorners(plank);
      const label = `casilla ${plank}`;
      for (const [own, other] of [sides, [...sides].reverse()]) {
        expect(areaOf(own.area), label).toBe(PLANK_AREA / 2);
        expect(contains(own.area, own.center), label).toBe(true);
        expect(contains(own.area, other.center), label).toBe(false);
        expect(
          own.area.every((p) => contains(corners, p)),
          label,
        ).toBe(true);
      }
    }
  });

  it('RF-018: una ficha en casa se toca en un tablón centrado en su puesto', () => {
    const state = rolled([], 'yellow', 5);
    const home = homes().find((h) => h.color === 'yellow')!;
    const area = pieceIn(previewOf(state), 'yellow-0').touchArea!;

    expect(areaOf(area)).toBe(PLANK_AREA);
    expect(centroid(area)).toEqual(home.slots[0]);
  });

  it('RF-018: la réplica sola se toca en su casilla o en el triángulo de la meta', () => {
    expect(previewOf(TWO_MOVES, 'yellow-1').ghost?.touchArea).toEqual(trackCorners(33));

    const state = rolled([['yellow-0', { kind: 'lane', square: 5 }]], 'yellow', 3);
    const goal = goals().find((g) => g.color === 'yellow')!;
    expect(previewOf(state, 'yellow-0').ghost?.touchArea).toEqual(goal.corners);
  });

  it('RNF-005: la previsualización no cambia el estado y da siempre lo mismo', () => {
    const snapshot = structuredClone(OWN_PAIR);
    const moves = legalMoves(OWN_PAIR);

    expect(movePreview(OWN_PAIR, moves, 'yellow-0')).toEqual(
      movePreview(OWN_PAIR, moves, 'yellow-0'),
    );
    expect(OWN_PAIR).toEqual(snapshot);
  });
});
