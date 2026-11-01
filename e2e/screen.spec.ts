import { expect, Locator, Page, test } from '@playwright/test';
import { dice, firstPlayer, fixDice, roll, spin } from './dice';
import { startGame, startScreen } from './start';

const SIZES = [
  { width: 320, height: 568 },
  { width: 568, height: 320 },
  { width: 768, height: 1024 },
  { width: 1920, height: 1080 },
];

// Initial roll tie, so the initial roll tab shows four rolls and the tie.
const TIE = [6, 2, 6, 1];

// Yellow wins the initial roll with a 6 and loses its first roll, a 4.
const YELLOW_STARTS = [6, 1, 1, 1, 4];

async function expectInside(page: Page, locator: Locator, name: string): Promise<void> {
  const box = (await locator.boundingBox())!;
  const { width, height } = page.viewportSize()!;
  expect(box, name).not.toBeNull();
  expect(box.x, name).toBeGreaterThanOrEqual(0);
  expect(box.y, name).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width, name).toBeLessThanOrEqual(width);
  expect(box.y + box.height, name).toBeLessThanOrEqual(height);
}

/** Checks that the boxes of `a` and `b` do not cross. */
async function expectApart(a: Locator, b: Locator, name: string): Promise<void> {
  const [first, second] = [(await a.boundingBox())!, (await b.boundingBox())!];
  const crosses =
    first.x < second.x + second.width &&
    second.x < first.x + first.width &&
    first.y < second.y + second.height &&
    second.y < first.y + first.height;
  expect(crosses, name).toBe(false);
}

for (const size of SIZES) {
  test(`CE-08: a ${size.width} × ${size.height} la pantalla se ve entera sin scroll`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await fixDice(page, TIE);
    await page.goto('/');
    await startGame(page);
    await roll(page, TIE.length);
    await expect(page.locator('[data-initial-round] [data-tie]')).toBeVisible();

    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(overflow).toEqual({ x: 0, y: 0 });
    await expectInside(page, page.locator('[data-plank]'), 'cartel');
    await expectInside(page, page.locator('[data-last-play-slot]'), 'hueco de la pestaña');
    await expectInside(page, page.locator('[data-initial-round]'), 'pestaña de la tirada inicial');
    await expectInside(
      page,
      page.getByRole('img', { name: 'Tablero de parchís de la jungla' }),
      'tablero',
    );
    await expectInside(page, page.locator('jp-dice button'), 'dado');

    // RNF-004: the gear fits too, apart from everything else on the screen.
    const gear = page.getByRole('button', { name: 'Menú' });
    await expectInside(page, gear, 'engranaje');
    await expectApart(gear, page.locator('[data-plank]'), 'engranaje y cartel');
    await expectApart(
      gear,
      page.locator('[data-last-play-slot]'),
      'engranaje y hueco de la pestaña',
    );
    await expectApart(
      gear,
      page.getByRole('img', { name: 'Tablero de parchís de la jungla' }),
      'engranaje y tablero',
    );
    await expectApart(gear, page.locator('jp-dice button'), 'engranaje y dado');
  });
}

for (const size of SIZES) {
  test(`RF-015: a ${size.width} × ${size.height}, el tablero ocupa la misma caja en la tirada inicial y después`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await fixDice(page, YELLOW_STARTS);
    await page.goto('/');
    await startGame(page);
    await page.evaluate(() => document.fonts.ready);
    const board = page.locator('[data-board-slot]');
    const before = (await board.boundingBox())!;

    await spin(page);
    await expect(page.locator('[data-initial-round]')).toBeVisible();
    expect(await board.boundingBox(), 'tirada inicial').toEqual(before);

    await spin(page, 3);
    await expect(firstPlayer(page)).toBeVisible();
    expect(await board.boundingBox(), 'Empieza el equipo Amarillo').toEqual(before);

    await firstPlayer(page).getByRole('button', { name: '¡Vamos!' }).click();
    await expect(firstPlayer(page)).toHaveCount(0);
    expect(await board.boundingBox(), 'tras «¡Vamos!»').toEqual(before);

    await roll(page);
    await expect(page.locator('[data-last-play]')).toHaveText('Saca 4 y pierde la tirada.');
    expect(await board.boundingBox(), 'primera jugada').toEqual(before);
  });
}

for (const size of SIZES) {
  test(`RNF-004, RF-016: a ${size.width} × ${size.height} «Empieza el equipo Amarillo» se ve entera sin scroll`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await fixDice(page, YELLOW_STARTS);
    await page.goto('/');
    await startGame(page);
    await spin(page, 4);
    const screen = firstPlayer(page);
    await expect(screen).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(overflow).toEqual({ x: 0, y: 0 });
    await expectInside(page, screen.locator('[data-plank]'), 'tablón');
    await expectInside(page, screen.locator('[data-title]'), 'título');
    await expectInside(page, screen.getByRole('button', { name: '¡Vamos!' }), '¡Vamos!');
    await expect(dice(page)).toBeDisabled();
  });
}

for (const size of SIZES) {
  test(`RNF-004: a ${size.width} × ${size.height} la pantalla de inicio se ve entera sin scroll`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto('/');
    const screen = startScreen(page);
    await expect(screen).toBeVisible();

    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(overflow).toEqual({ x: 0, y: 0 });
    await expectInside(page, screen.locator('[data-box]'), 'caja');
    for (const team of ['red', 'blue', 'green', 'yellow']) {
      await expectInside(page, screen.locator(`[data-team="${team}"]`), `tarjeta ${team}`);
    }
    await expectInside(page, screen.locator('[data-status]'), 'estado');
    await expectInside(page, screen.getByRole('button', { name: '¡A jugar!' }), '¡A jugar!');
  });
}
