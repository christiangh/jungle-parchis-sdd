import { Service } from '@angular/core';

/**
 * Source of dice values, outside the engine (P-04, RF-010).
 * Tests replace it by injection; browser tests replace `Math.random` instead.
 */
@Service()
export class DiceRoller {
  /** Integer value from 1 to 6. */
  roll(): number {
    return 0;
  }
}
