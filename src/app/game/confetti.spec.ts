import { COLORS } from '@engine';
import { CONFETTI_COLORS, CONFETTI_COUNT, confettiPieces } from './confetti';

describe('confettiPieces', () => {
  it.each(COLORS)(
    'RF-001: la paleta de %s empieza por el color del equipo y tiene cinco colores',
    (color) => {
      expect(CONFETTI_COLORS[color]).toHaveLength(5);
      expect(CONFETTI_COLORS[color][0]).toBe(`bg-team-${color}`);
    },
  );

  it.each(COLORS)('RF-001: el confeti de %s tiene 46 trozos', (color) => {
    expect(CONFETTI_COUNT).toBe(46);
    expect(confettiPieces(color)).toHaveLength(CONFETTI_COUNT);
  });

  it.each(COLORS)('RF-001: el confeti de %s usa solo y todos los colores de su paleta', (color) => {
    const used = new Set(confettiPieces(color).map((piece) => piece.color));
    expect([...used].sort()).toEqual([...CONFETTI_COLORS[color]].sort());
  });

  it('RF-001: cada trozo cae desde una posición horizontal dentro de la pantalla', () => {
    const pieces = confettiPieces('green');
    expect(pieces).not.toHaveLength(0);
    for (const piece of pieces) {
      expect(piece.left).toBeGreaterThanOrEqual(0);
      expect(piece.left).toBeLessThanOrEqual(100);
    }
  });

  it('RF-001: cada trozo tarda entre 3,6 y 6,6 s y ya está cayendo al abrirse la pantalla', () => {
    const pieces = confettiPieces('green');
    expect(pieces).not.toHaveLength(0);
    for (const piece of pieces) {
      expect(piece.duration).toBeGreaterThanOrEqual(3.6);
      expect(piece.duration).toBeLessThanOrEqual(6.6);
      expect(piece.delay).toBeLessThanOrEqual(0);
      expect(piece.delay).toBeGreaterThan(-piece.duration);
    }
  });

  it('RF-001: cada trozo mide entre 6 y 13 px de ancho y no es más alto que ancho', () => {
    const pieces = confettiPieces('green');
    expect(pieces).not.toHaveLength(0);
    for (const piece of pieces) {
      expect(piece.width).toBeGreaterThanOrEqual(6);
      expect(piece.width).toBeLessThanOrEqual(13);
      expect(piece.height).toBeGreaterThan(0);
      expect(piece.height).toBeLessThanOrEqual(piece.width);
    }
  });

  it('RF-001: cada llamada devuelve el mismo confeti', () => {
    expect(confettiPieces('red')).not.toHaveLength(0);
    expect(confettiPieces('red')).toEqual(confettiPieces('red'));
  });
});
