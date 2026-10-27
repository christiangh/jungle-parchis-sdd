import { expect, Locator, Page, test } from '@playwright/test';
import { fixDice, roll } from './dice';

const SIZES = [
  { width: 320, height: 568 },
  { width: 568, height: 320 },
  { width: 768, height: 1024 },
  { width: 1920, height: 1080 },
];

// Initial roll tie, so the last play line shows one of its longer sentences.
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

for (const size of SIZES) {
  test(`CE-08: a ${size.width} × ${size.height} la pantalla se ve entera sin scroll`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await fixDice(page, TIE);
    await page.goto('/');
    await roll(page, TIE.length);
    await expect(page.locator('[data-last-play]')).toBeVisible();

    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(overflow).toEqual({ x: 0, y: 0 });
    await expectInside(page, page.locator('[data-plank]'), 'cartel');
    await expectInside(page, page.locator('[data-last-play]'), 'última jugada');
    await expectInside(
      page,
      page.getByRole('img', { name: 'Tablero de parchís de la jungla' }),
      'tablero',
    );
    await expectInside(page, page.locator('jp-dice button'), 'dado');
  });
}
