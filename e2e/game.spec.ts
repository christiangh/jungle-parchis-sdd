import { expect, Page, test } from '@playwright/test';
import { dice, fixDice, roll } from './dice';

// Roll sequences checked with the engine: each roll before the last one has at most one legal move.

// Yellow and red tie, red starts and takes two pieces out with a 5; a 3 lets both move.
const MOVE = [6, 2, 6, 1, 3, 4, 5, 1, 1, 1, 5, 1, 1, 1, 3];
// Blue starts; red captures green-0 with red-0 on the last 6 and earns 20.
const CAPTURE = [3, 5, 2, 1, 2, 5, 5, 4, 4, 6, 2, 3, 2, 5, 6, 6];
// Blue starts and loses a 4, takes blue-0 out with a 5 and rolls three sixes.
const SIXES = [3, 5, 2, 1, 4, 1, 1, 1, 5, 1, 1, 1, 6, 6, 6];

function action(page: Page) {
  return page.locator('[data-title]');
}

/** Turn text for screen readers, before the action. */
function turn(page: Page) {
  return page.locator('jp-turn-banner [data-turn]');
}

function banner(page: Page) {
  return page.locator('[data-plank]');
}

function lastPlay(page: Page) {
  return page.locator('[data-last-play]');
}

/** Tab of the last play, painted in the colour of the team that made it. */
function lastPlayTab(page: Page) {
  return page.locator('[data-last-play] [data-tab]');
}

function ghost(page: Page) {
  return page.locator('[data-ghost]');
}

function highlighted(page: Page) {
  return page.locator('[data-piece][data-mode="highlighted"], [data-piece][data-mode="selected"]');
}

async function touch(page: Page, target: string): Promise<void> {
  await page.locator(`[data-touch="${target}"]`).click();
}

/** Touches a point of the background, outside the board's touch areas. */
async function touchOutside(page: Page): Promise<void> {
  await page.mouse.click(5, 5);
}

/**
 * Rolls the next values fixed for the dice, checking each face (HU-09.1), and plays the only
 * legal move of each, if there is one.
 */
async function play(page: Page, rolls: readonly number[]): Promise<void> {
  for (const value of rolls) {
    await roll(page);
    await expect(dice(page)).toHaveAttribute('aria-label', `Dado, cara ${value}`);
    const area = page.locator('[data-touch]').first();
    if ((await area.count()) > 0) {
      await touch(page, (await area.getAttribute('data-touch'))!);
      await touch(page, 'ghost');
    }
  }
}

test('RF-013: tirada inicial con empate, salir con un 5, cambiar, cancelar y confirmar la selección', async ({
  page,
}) => {
  await fixDice(page, MOVE);
  await page.goto('/');
  await expect(banner(page)).toHaveAttribute('data-color', 'yellow');
  await expect(turn(page)).toHaveText('Tirada inicial, turno de Amarillo.');
  await expect(action(page)).toHaveText('Toca el dado');
  await expect(lastPlay(page)).toHaveCount(0);

  await roll(page, 4);
  await expect(lastPlay(page)).toHaveText('Saca 1, empate entre Amarillo y Rojo.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'green');
  await expect(turn(page)).toHaveText('Tirada inicial, turno de Amarillo.');
  await expect(banner(page)).toHaveAttribute('data-color', 'yellow');

  await roll(page, 2);
  await expect(lastPlay(page)).toHaveText('Saca 4.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'red');
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(action(page)).toHaveText('Toca el dado');

  await roll(page);
  await expect(dice(page)).toHaveAttribute('aria-label', 'Dado, cara 5');
  await expect(action(page)).toHaveText('Elige una ficha');
  await expect(highlighted(page)).toHaveCount(1);
  await touch(page, 'red-0');
  await expect(ghost(page)).toHaveAttribute('data-ghost', 'red-0');
  await touch(page, 'ghost');
  await expect(lastPlay(page)).toHaveText('Saca una ficha de casa.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'red');
  await expect(banner(page)).toHaveAttribute('data-color', 'green');

  await play(page, [1, 1, 1, 5, 1, 1, 1]);
  await roll(page);
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(action(page)).toHaveText('Elige una ficha');
  await expect(highlighted(page)).toHaveCount(2);

  await touch(page, 'red-0');
  await expect(ghost(page)).toHaveAttribute('data-ghost', 'red-0');
  await touch(page, 'red-1');
  await expect(ghost(page)).toHaveAttribute('data-ghost', 'red-1');
  await touchOutside(page);
  await expect(ghost(page)).toHaveCount(0);
  await expect(highlighted(page)).toHaveCount(2);

  await touch(page, 'red-1');
  await touch(page, 'ghost');
  await expect(lastPlay(page)).toHaveText('Mueve una ficha.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'red');
  await expect(highlighted(page)).toHaveCount(0);
  await expect(turn(page)).toHaveText('Turno de Verde.');
  await expect(banner(page)).toHaveAttribute('data-color', 'green');
});

test('RF-013: comer, no poder tirar con el +20 pendiente y usarlo', async ({ page }) => {
  await fixDice(page, CAPTURE);
  await page.goto('/');

  await play(page, CAPTURE.slice(0, -1));
  await roll(page);
  await touch(page, 'red-0');
  await expect(ghost(page).locator('[data-mark="target"]')).toBeVisible();
  await touch(page, 'ghost');

  await expect(lastPlay(page)).toHaveText(
    'Mueve una ficha, se come una ficha de Verde, cuenta 20.',
  );
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'red');
  await expect(action(page)).toHaveText('Usa tu +20');
  await expect(dice(page)).toBeDisabled();

  await touch(page, 'red-0');
  await touch(page, 'ghost');
  await expect(lastPlay(page)).toHaveText('Mueve una ficha, repite.');
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(action(page)).toHaveText('Toca el dado');
  await expect(dice(page)).toBeEnabled();
});

test('RF-013: tirada perdida, repetir con un 6 y tres seises', async ({ page }) => {
  await fixDice(page, SIXES);
  await page.goto('/');

  await roll(page, 5);
  await expect(lastPlay(page)).toHaveText('Saca 4 y pierde la tirada.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'blue');
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(banner(page)).toHaveAttribute('data-color', 'red');

  await play(page, [1, 1, 1, 5, 1, 1, 1, 6]);
  await expect(lastPlay(page)).toHaveText('Mueve una ficha, repite.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'blue');
  await expect(turn(page)).toHaveText('Turno de Azul.');
  await expect(action(page)).toHaveText('Toca el dado');

  await play(page, [6]);
  await roll(page);
  await expect(lastPlay(page)).toHaveText('Tres seises y su ficha vuelve a casa.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'blue');
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(banner(page)).toHaveAttribute('data-color', 'red');
  await expect(highlighted(page)).toHaveCount(0);

  const home = (await page.locator('[data-home="blue"]').boundingBox())!;
  const piece = (await page.locator('[data-piece="blue-0"]').boundingBox())!;
  expect(piece.x).toBeGreaterThanOrEqual(home.x);
  expect(piece.y).toBeGreaterThanOrEqual(home.y);
  expect(piece.x + piece.width).toBeLessThanOrEqual(home.x + home.width);
  expect(piece.y + piece.height).toBeLessThanOrEqual(home.y + home.height);
});
