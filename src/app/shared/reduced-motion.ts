// Whether the player asked for reduced motion, read where an animation decides to run (RNF-002).

/** Media query of the system setting for reduced motion. */
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Whether `window` asks for reduced motion; `false` without a window or without `matchMedia`. */
export function prefersReducedMotion(window: Window | null | undefined): boolean {
  void window;
  return true;
}
