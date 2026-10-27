// Helpers to drive the game in application tests. Not used by the application.

import { Provider } from '@angular/core';
import { DiceRoller } from './dice-roller';

/** Provides a `DiceRoller` that returns the given values in order (RF-010). */
export function provideRolls(...values: number[]): Provider {
  const queue = [...values];
  return {
    provide: DiceRoller,
    useValue: {
      roll: () => {
        const value = queue.shift();
        if (value === undefined) {
          throw new Error('No more rolls');
        }
        return value;
      },
    },
  };
}
