import { prefersReducedMotion, REDUCED_MOTION } from './reduced-motion';

/** A window whose system setting asks for reduced motion or not. */
function windowWith(reduce: boolean): Window {
  const matchMedia = (query: string) => ({
    matches: reduce && query === REDUCED_MOTION,
    media: query,
  });
  return { matchMedia } as unknown as Window;
}

describe('prefersReducedMotion', () => {
  it('RNF-002: con el movimiento reducido activado devuelve true', () => {
    expect(prefersReducedMotion(windowWith(true))).toBe(true);
  });

  it('RNF-002: sin el movimiento reducido activado devuelve false', () => {
    expect(prefersReducedMotion(windowWith(false))).toBe(false);
  });

  it('RNF-002: sin ventana devuelve false', () => {
    expect(prefersReducedMotion(null)).toBe(false);
    expect(prefersReducedMotion(undefined)).toBe(false);
  });

  it('RNF-002: con una ventana sin matchMedia devuelve false', () => {
    expect(prefersReducedMotion({} as Window)).toBe(false);
  });
});
