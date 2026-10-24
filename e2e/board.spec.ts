import { expect, test } from '@playwright/test';

const COLORS = ['yellow', 'blue', 'red', 'green'] as const;
const PIECES_PER_PLAYER = 4;

test('RF-016: la aplicación carga y pinta el tablero con 16 fichas en sus casas', async ({
  page,
}) => {
  await page.goto('/');

  const board = page.getByRole('img', { name: 'Tablero de parchís de la jungla' });
  await expect(board).toBeVisible();

  const pieces = board.locator('[data-piece]');
  await expect(pieces).toHaveCount(COLORS.length * PIECES_PER_PLAYER);

  for (const color of COLORS) {
    const home = await board.locator(`[data-home="${color}"]`).boundingBox();
    expect(home, color).not.toBeNull();
    const own = board.locator(`[data-piece][data-color="${color}"]`);
    await expect(own).toHaveCount(PIECES_PER_PLAYER);
    for (const piece of await own.all()) {
      await expect(piece).toBeVisible();
      const box = await piece.boundingBox();
      expect(box, color).not.toBeNull();
      expect(box!.x, color).toBeGreaterThanOrEqual(home!.x);
      expect(box!.y, color).toBeGreaterThanOrEqual(home!.y);
      expect(box!.x + box!.width, color).toBeLessThanOrEqual(home!.x + home!.width);
      expect(box!.y + box!.height, color).toBeLessThanOrEqual(home!.y + home!.height);
    }
  }
});
