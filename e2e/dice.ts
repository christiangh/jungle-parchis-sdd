import { Page } from '@playwright/test';

const SPIN = 'motion-safe:animate-dice-spin';

/**
 * Fixes the dice values by replacing `Math.random` before the page loads, so the app keeps its
 * real dice roller (RF-023, RF-024). Once the values run out, the dice rolls 1.
 */
export async function fixDice(page: Page, rolls: readonly number[]): Promise<void> {
  await page.addInitScript((values) => {
    const queue = [...values];
    // The roller takes floor(random * 6) + 1; the middle of each sixth avoids rounding edges.
    Math.random = () => ((queue.shift() ?? 1) - 0.5) / 6;
  }, rolls);
}

export function dice(page: Page) {
  return page.locator('jp-dice button');
}

/**
 * Touches the dice and waits for the spin to end. Polling the class could miss a 500 ms spin on a
 * busy machine, so an observer installed before the touch waits for the spin class to go away.
 */
export async function roll(page: Page, count = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    const spun = dice(page).evaluate(
      (button, spin) =>
        new Promise<void>((resolve) => {
          new MutationObserver((records, observer) => {
            const stopped = records.some(
              (record) =>
                record.oldValue?.split(' ').includes(spin) && !button.classList.contains(spin),
            );
            if (stopped) {
              observer.disconnect();
              resolve();
            }
          }).observe(button, { attributeFilter: ['class'], attributeOldValue: true });
        }),
      SPIN,
    );
    await dice(page).click();
    await spun;
  }
}
