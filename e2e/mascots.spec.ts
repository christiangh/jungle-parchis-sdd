import { expect, Page, test } from '@playwright/test';
import { fixDice, roll } from './dice';

// Mascot animations of the pieces at home of the team in turn (HU-03) and of the turn banner
// (HU-04), and of the home medallions: RF-007, RF-008, RF-014, RNF-002, CE-07.

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

/** Home medallions with an animation running, in board order. */
function animatedMedallions(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-medallions] [data-medallion]'))
      .filter((medallion) =>
        medallion
          .getAnimations({ subtree: true })
          .some((animation) => animation.playState === 'running'),
      )
      .map((medallion) => medallion.getAttribute('data-medallion')!),
  );
}

function homeInTurn(page: Page) {
  return page.locator('[data-home][data-turn]');
}

/** Running animations of the turn banner mascot. */
function bannerAnimations(page: Page): Promise<number> {
  return page
    .locator('[data-plank] [data-mascot]')
    .evaluate(
      (mascot) =>
        mascot
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running').length,
    );
}

test('RF-008, CE-07: la mascota del cartel se anima', async ({ page }) => {
  await page.goto('/');

  await expect.poll(() => bannerAnimations(page)).toBeGreaterThan(0);
});

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

test('RF-014, CE-07: solo se anima el medallón del equipo en turno, al empezar y al pasar el turno', async ({
  page,
}) => {
  await fixDice(page, [3]);
  await page.goto('/');

  await expect.poll(() => animatedMedallions(page)).toEqual(['yellow']);
  await roll(page);
  await expect.poll(() => animatedMedallions(page)).toEqual(['blue']);
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

  test('RNF-002, RF-014: ningún medallón se anima y el de la casa en turno sigue con brillo y aro', async ({
    page,
  }) => {
    await page.goto('/');

    const medallion = page.locator('[data-medallion][data-turn]');
    await expect(medallion).toHaveAttribute('data-medallion', 'yellow');
    await expect(medallion.locator('[data-part="medallion-glow"]')).toBeVisible();
    await expect(medallion.locator('[data-part="medallion-ring"]')).toBeVisible();
    expect(await animatedMedallions(page)).toEqual([]);
  });

  test('RNF-002, CE-07: la mascota del cartel no se anima', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-plank] [data-mascot]')).toBeVisible();
    expect(await bannerAnimations(page)).toBe(0);
  });
});
