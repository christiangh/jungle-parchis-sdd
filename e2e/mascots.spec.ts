import { expect, Page, test } from '@playwright/test';
import { fixDice, roll } from './dice';

// Mascot animations of the pieces at home of the team in turn (HU-03): RF-007, RNF-002, CE-07.

/** Pieces whose mascot has an animation running, in board order. */
function animatedPieces(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-pieces] [data-piece]'))
      .filter((piece) =>
        piece
          .querySelector('[data-mascot]')!
          .getAnimations({ subtree: true })
          .some((animation) => animation.playState === 'running'),
      )
      .map((piece) => piece.getAttribute('data-piece')!),
  );
}

function homeInTurn(page: Page) {
  return page.locator('[data-home][data-turn]');
}

test('RF-007: al empezar, solo se animan las fichas en casa amarillas', async ({ page }) => {
  await page.goto('/');

  await expect(homeInTurn(page)).toHaveAttribute('data-home', 'yellow');
  await expect
    .poll(() => animatedPieces(page))
    .toEqual(['yellow-0', 'yellow-1', 'yellow-2', 'yellow-3']);
});

test('RF-007: al pasar el turno, solo se animan las fichas en casa del nuevo equipo', async ({
  page,
}) => {
  await fixDice(page, [3]);
  await page.goto('/');
  await roll(page);

  await expect(homeInTurn(page)).toHaveAttribute('data-home', 'blue');
  await expect.poll(() => animatedPieces(page)).toEqual(['blue-0', 'blue-1', 'blue-2', 'blue-3']);
});

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('RNF-002, CE-07: en el turno de verde, la casa verde sigue marcada y ninguna mascota se anima', async ({
    page,
  }) => {
    // Initial roll: green wins with a 6 and starts.
    await fixDice(page, [1, 2, 3, 6]);
    await page.goto('/');
    await roll(page, 4);

    await expect(homeInTurn(page)).toHaveAttribute('data-home', 'green');
    await expect(homeInTurn(page).locator('[data-part="turn-ring"]')).toBeVisible();
    await expect(homeInTurn(page).locator('[data-part="turn-glow"]')).toBeVisible();
    expect(await animatedPieces(page)).toEqual([]);
    const pulse = await homeInTurn(page)
      .locator('[data-part="turn-pulse"]')
      .evaluate((ring) => ring.getAnimations().length);
    expect(pulse).toBe(0);
  });
});
