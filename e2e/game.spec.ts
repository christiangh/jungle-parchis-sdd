import { expect, Page, test } from '@playwright/test';
import { dice, fixDice, roll } from './dice';

// Roll sequences checked with the engine: each roll before the last one has at most one legal move.

// Yellow and red tie, red starts and takes two pieces out with a 5; a 3 lets both move.
const MOVE = [6, 2, 6, 1, 3, 4, 5, 1, 1, 1, 5, 1, 1, 1, 3];
// Blue starts; red captures green-0 with red-0 on the last 6 and earns 20.
const CAPTURE = [3, 5, 2, 1, 2, 5, 5, 4, 4, 6, 2, 3, 2, 5, 6, 6];
// Blue starts and loses a 4, takes blue-0 out with a 5 and rolls three sixes.
const SIXES = [3, 5, 2, 1, 4, 1, 1, 1, 5, 1, 1, 1, 6, 6, 6];

function title(page: Page) {
  return page.locator('[data-title]');
}

function instruction(page: Page) {
  return page.locator('[data-instruction]');
}

function lastPlay(page: Page) {
  return page.locator('[data-last-play]');
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

test('RF-023: tirada inicial con empate, salir con un 5, cambiar, cancelar y confirmar la selección', async ({
  page,
}) => {
  await fixDice(page, MOVE);
  await page.goto('/');
  await expect(title(page)).toHaveText('Tirada inicial · Amarillo');

  await roll(page, 4);
  await expect(lastPlay(page)).toHaveText('Verde saca 1, empate entre Amarillo y Rojo.');
  await expect(title(page)).toHaveText('Tirada inicial · Amarillo');

  await roll(page, 2);
  await expect(lastPlay(page)).toHaveText('Rojo saca 4, empieza Rojo.');
  await expect(title(page)).toHaveText('Turno de Rojo');

  await roll(page);
  await expect(dice(page)).toHaveAttribute('aria-label', 'Dado, cara 5');
  await expect(title(page)).toHaveText('Turno de Rojo · 5');
  await expect(highlighted(page)).toHaveCount(1);
  await touch(page, 'red-0');
  await expect(ghost(page)).toHaveAttribute('data-ghost', 'red-0');
  await touch(page, 'ghost');
  await expect(lastPlay(page)).toHaveText('Rojo saca una ficha de casa, turno de Verde.');

  await play(page, [1, 1, 1, 5, 1, 1, 1]);
  await roll(page);
  await expect(title(page)).toHaveText('Turno de Rojo · 3');
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
  await expect(lastPlay(page)).toHaveText('Rojo mueve una ficha, turno de Verde.');
  await expect(highlighted(page)).toHaveCount(0);
  await expect(title(page)).toHaveText('Turno de Verde');
});

test('RF-023: comer, no poder tirar con el +20 pendiente y usarlo', async ({ page }) => {
  await fixDice(page, CAPTURE);
  await page.goto('/');

  await play(page, CAPTURE.slice(0, -1));
  await roll(page);
  await touch(page, 'red-0');
  await expect(ghost(page).locator('[data-mark="target"]')).toBeVisible();
  await touch(page, 'ghost');

  await expect(lastPlay(page)).toHaveText('Rojo mueve una ficha, come una ficha verde, cuenta 20.');
  await expect(instruction(page)).toHaveText('Usa tu +20');
  await expect(dice(page)).toBeDisabled();

  await touch(page, 'red-0');
  await touch(page, 'ghost');
  await expect(lastPlay(page)).toHaveText('Rojo mueve una ficha, Rojo repite.');
  await expect(title(page)).toHaveText('Turno de Rojo');
  await expect(instruction(page)).toHaveText('Toca el dado');
  await expect(dice(page)).toBeEnabled();
});

test('RF-023: tirada perdida, repetir con un 6 y tres seises', async ({ page }) => {
  await fixDice(page, SIXES);
  await page.goto('/');

  await roll(page, 5);
  await expect(lastPlay(page)).toHaveText('Azul saca 4 y pierde la tirada, turno de Rojo.');
  await expect(title(page)).toHaveText('Turno de Rojo');

  await play(page, [1, 1, 1, 5, 1, 1, 1, 6]);
  await expect(lastPlay(page)).toHaveText('Azul mueve una ficha, Azul repite.');
  await expect(title(page)).toHaveText('Turno de Azul');
  await expect(instruction(page)).toHaveText('Toca el dado');

  await play(page, [6]);
  await roll(page);
  await expect(lastPlay(page)).toHaveText(
    'Tres seises de Azul y su ficha vuelve a casa, turno de Rojo.',
  );
  await expect(title(page)).toHaveText('Turno de Rojo');
  await expect(highlighted(page)).toHaveCount(0);

  const home = (await page.locator('[data-home="blue"]').boundingBox())!;
  const piece = (await page.locator('[data-piece="blue-0"]').boundingBox())!;
  expect(piece.x).toBeGreaterThanOrEqual(home.x);
  expect(piece.y).toBeGreaterThanOrEqual(home.y);
  expect(piece.x + piece.width).toBeLessThanOrEqual(home.x + home.width);
  expect(piece.y + piece.height).toBeLessThanOrEqual(home.y + home.height);
});
