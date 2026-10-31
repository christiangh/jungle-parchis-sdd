import { expect, Locator, Page, test } from '@playwright/test';
import { fixDice, roll } from './dice';
import { startGame, startScreen } from './start';

const SIZES = [
  { width: 320, height: 568 },
  { width: 568, height: 320 },
  { width: 768, height: 1024 },
  { width: 1920, height: 1080 },
];

// Initial roll tie, so the last play tab shows one of its longer sentences.
const TIE = [6, 2, 6, 1];

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
    await expect(page.locator('[data-last-play]')).toBeVisible();

    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(overflow).toEqual({ x: 0, y: 0 });
    await expectInside(page, page.locator('[data-plank]'), 'cartel');
    await expectInside(page, page.locator('[data-last-play-slot]'), 'hueco de la pestaña');
    await expectInside(page, page.locator('[data-last-play]'), 'pestaña de última jugada');
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
