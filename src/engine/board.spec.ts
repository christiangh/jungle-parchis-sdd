import {
  capacity,
  COLORS,
  DIE_FACES,
  ENTRY_SQUARE,
  isSafe,
  isValidRoll,
  LANE_LENGTH,
  MAX_PIECES_PER_SQUARE,
  PIECES_PER_PLAYER,
  SAFE_SQUARES,
  START_SQUARE,
  stepForward,
  TRACK_LENGTH,
} from './board';

const track = (square: number) => ({ kind: 'track', square }) as const;
const lane = (square: number) => ({ kind: 'lane', square }) as const;

describe('board', () => {
  it('R-001: cuatro colores en orden amarillo, azul, rojo, verde y 4 fichas por jugador', () => {
    expect(COLORS).toEqual(['yellow', 'blue', 'red', 'green']);
    expect(PIECES_PER_PLAYER).toBe(4);
  });

  it('R-002: solo son tiradas válidas los enteros de 1 a 6', () => {
    expect(DIE_FACES).toBe(6);
    for (const value of [1, 2, 3, 4, 5, 6]) {
      expect(isValidRoll(value)).toBe(true);
    }
    for (const value of [0, 7, -1, 2.5, Number.NaN]) {
      expect(isValidRoll(value)).toBe(false);
    }
  });

  it('R-003: el recorrido tiene 68 casillas y la 68 va seguida de la 1', () => {
    expect(TRACK_LENGTH).toBe(68);
    // Yellow enters its lane from 68, so every other square leads to the next one.
    for (let square = 1; square < 68; square++) {
      expect(stepForward('yellow', track(square))).toEqual(track(square + 1));
    }
    expect(stepForward('blue', track(68))).toEqual(track(1));
  });

  it('R-005: casillas de salida 5, 22, 39 y 56', () => {
    expect(START_SQUARE).toEqual({ yellow: 5, blue: 22, red: 39, green: 56 });
  });

  it('R-006: son seguros los 12 indicados y las salidas', () => {
    const safe = [5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68];
    expect([...SAFE_SQUARES].sort((a, b) => a - b)).toEqual(safe);
    for (const square of safe) {
      expect(isSafe(square)).toBe(true);
    }
    for (const color of COLORS) {
      expect(isSafe(START_SQUARE[color])).toBe(true);
    }
  });

  it('R-006: el resto no son seguros', () => {
    for (const square of [1, 6, 11, 13, 40, 67]) {
      expect(isSafe(square)).toBe(false);
    }
  });

  it('R-007: el pasillo tiene 7 casillas y después la meta', () => {
    expect(LANE_LENGTH).toBe(7);
    for (let square = 1; square < 7; square++) {
      expect(stepForward('red', lane(square))).toEqual(lane(square + 1));
    }
    expect(stepForward('red', lane(7))).toEqual({ kind: 'goal' });
  });

  it('R-007: una ficha de otro color no entra en un pasillo ajeno', () => {
    expect(stepForward('blue', track(68))).toEqual(track(1));
    expect(stepForward('red', track(17))).toEqual(track(18));
    expect(stepForward('yellow', track(51))).toEqual(track(52));
  });

  it('R-008: desde su entrada, cada color pasa a la primera casilla de su pasillo', () => {
    expect(ENTRY_SQUARE).toEqual({ yellow: 68, blue: 17, red: 34, green: 51 });
    for (const color of COLORS) {
      expect(stepForward(color, track(ENTRY_SQUARE[color]))).toEqual(lane(1));
    }
  });

  it('R-009: capacidad 2 en recorrido y pasillo, sin límite en meta', () => {
    expect(MAX_PIECES_PER_SQUARE).toBe(2);
    expect(capacity(track(10))).toBe(2);
    expect(capacity(lane(3))).toBe(2);
    expect(capacity({ kind: 'goal' })).toBe(Number.POSITIVE_INFINITY);
  });
});
