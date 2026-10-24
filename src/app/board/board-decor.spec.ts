import { isSafe, TRACK_LENGTH } from '@engine';
import { boardDecor, DECOR_SEED } from './board-decor';

const SQUARES = Array.from({ length: TRACK_LENGTH }, (_, i) => i + 1);

describe('boardDecor', () => {
  it('RF-005: la decoración es estable con la misma semilla', () => {
    expect(boardDecor(DECOR_SEED)).toEqual(boardDecor(DECOR_SEED));
    expect(boardDecor()).toEqual(boardDecor(DECOR_SEED));
  });

  it('RF-005: otra semilla da otra decoración', () => {
    expect(boardDecor(DECOR_SEED + 1)).not.toEqual(boardDecor(DECOR_SEED));
  });

  it('RF-005: la hierba tiene 90 briznas de los 4 tonos del diseño', () => {
    const { blades } = boardDecor();
    expect(blades).toHaveLength(90);
    expect(new Set(blades.map((b) => b.tone))).toEqual(new Set([0, 1, 2, 3]));
  });

  it('RF-005: la madera tiene 16 vetas, 16 vetas de pintura y 4 nudos', () => {
    const { grain, paintGrain, knots } = boardDecor();
    expect(grain).toHaveLength(16);
    expect(paintGrain).toHaveLength(16);
    expect(knots).toHaveLength(4);
  });

  it('RF-005: cada tablón del recorrido tiene su matiz y cada seguro sus 90 hojas de copa', () => {
    const { tints, tufts } = boardDecor();
    expect([...tints.keys()].sort((a, b) => a - b)).toEqual(SQUARES.filter((n) => !isSafe(n)));
    expect([...tufts.keys()].sort((a, b) => a - b)).toEqual(SQUARES.filter((n) => isSafe(n)));
    for (const [square, blades] of tufts) {
      expect(blades, `casilla ${square}`).toHaveLength(90);
    }
    for (const [square, tint] of tints) {
      expect(tint.opacity, `casilla ${square}`).toBeLessThanOrEqual(0.1);
    }
  });

  it('RF-005: hay 3 hojas en cada esquina', () => {
    const { leaves } = boardDecor();
    expect(leaves).toHaveLength(12);
    for (const leaf of leaves) {
      expect(leaf.length).toBeGreaterThanOrEqual(120 - 24 * 0.8);
      expect(leaf.length).toBeLessThanOrEqual(160);
    }
  });
});
