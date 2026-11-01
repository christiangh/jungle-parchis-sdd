import { expect, Page } from '@playwright/test';

// Same value as DICE_SPIN_MS in the game store, which waits the spin with setTimeout.
const SPIN_MS = 500;

/**
 * Fixes the dice values by replacing `Math.random` before the page loads, so the app keeps its
 * real dice roller (RF-023, RF-024). Once the values run out, the dice rolls 1. It also installs
 * the fake clock that `roll` moves forward.
 */
export async function fixDice(page: Page, rolls: readonly number[]): Promise<void> {
  await page.clock.install();
  await page.addInitScript((values) => {
    const queue = [...values];
    // The roller takes floor(random * 6) + 1; the middle of each sixth avoids rounding edges.
    Math.random = () => ((queue.shift() ?? 1) - 0.5) / 6;
  }, rolls);
}

export function dice(page: Page) {
  return page.locator('jp-dice button');
}

/** «Empieza el equipo X» screen, a modal dialog over the game (SPEC 008 RF-016). */
export function firstPlayer(page: Page) {
  return page.getByRole('dialog', { name: /^Empieza el equipo / });
}

/**
 * Touches the dice, moves the fake clock past the spin so the roll is applied without waiting,
 * and waits for the screen to show it. It leaves «Empieza el equipo X» open, if it shows up.
 */
export async function spin(page: Page, count = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    await dice(page).click();
    await page.clock.runFor(SPIN_MS);
    await expect(dice(page)).not.toHaveClass(/animate-dice-spin/);
  }
}

/**
 * Like `spin`, but touches «¡Vamos!» when «Empieza el equipo X» shows up, so the game goes on
 * (SPEC 008 HU-06.5).
 */
export async function roll(page: Page, count = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    await spin(page);
    const go = firstPlayer(page).getByRole('button', { name: '¡Vamos!' });
    if ((await go.count()) > 0) {
      await go.click();
      await expect(firstPlayer(page)).toHaveCount(0);
    }
  }
}
