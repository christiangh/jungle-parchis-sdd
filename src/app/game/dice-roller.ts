import { Service } from '@angular/core';

const FACES = 6;

/**
 * Source of dice values, outside the engine (P-04, RF-010).
 * Tests replace it by injection; browser tests replace `Math.random` instead.
 */
@Service()
export class DiceRoller {
  /** Integer value from 1 to 6. */
  roll(): number {
    return Math.floor(Math.random() * FACES) + 1;
  }
}
