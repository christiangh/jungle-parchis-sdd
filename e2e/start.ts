import { expect, Page } from '@playwright/test';

export type Team = 'yellow' | 'blue' | 'red' | 'green';

const TEAMS: readonly Team[] = ['yellow', 'blue', 'red', 'green'];

/** «¿Quién juega?» screen, a modal dialog over the game. */
export function startScreen(page: Page) {
  return page.getByRole('dialog', { name: '¿Quién juega?' });
}

/**
 * Leaves only `teams` switched on in the start screen, touches «¡A jugar!» and waits for the
 * game to show up (SPEC 008 HU-03).
 */
export async function startGame(page: Page, teams: readonly Team[] = TEAMS): Promise<void> {
  const screen = startScreen(page);
  for (const team of TEAMS) {
    const card = screen.locator(`[data-team="${team}"]`);
    const wanted = teams.includes(team);
    if ((await card.getAttribute('aria-pressed')) !== String(wanted)) {
      await card.click();
    }
    await expect(card).toHaveAttribute('aria-pressed', String(wanted));
  }
  await screen.getByRole('button', { name: '¡A jugar!' }).click();
  await expect(screen).toHaveCount(0);
}
