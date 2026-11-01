import { expect, Locator, Page, test } from '@playwright/test';
import { fixDice, roll } from './dice';
import { startGame } from './start';

// Turn banner and last play tab (HU-04, HU-05): RNF-001 and RNF-010, CE-05 and CE-11.

const SIZES = [
  { width: 320, height: 568 },
  { width: 568, height: 320 },
  { width: 768, height: 1024 },
  { width: 1920, height: 1080 },
];

/**
 * WCAG contrast ratio between two CSS colours. A canvas turns any colour syntax (`rgb()`,
 * `color(srgb …)` from `color-mix`) into sRGB bytes.
 */
function contrast(page: Page, foreground: string, background: string): Promise<number> {
  return page.evaluate(
    ([a, b]) => {
      const context = document.createElement('canvas').getContext('2d')!;
      const luminance = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b] = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3)).map(
          (byte) => {
            const channel = byte / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          },
        );
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (light + 0.05) / (dark + 0.05);
    },
    [foreground, background],
  );
}

/** Banner text against its ink outline, the first colour of its `text-shadow`. */
async function bannerContrast(page: Page): Promise<number> {
  const { color, outline } = await page.locator('jp-turn-banner [data-title]').evaluate((title) => {
    const style = getComputedStyle(title);
    return { color: style.color, outline: /^\w+\([^)]*\)/.exec(style.textShadow)![0] };
  });
  return contrast(page, color, outline);
}

/**
 * Text of the initial roll tab, the value of its last roll, against the tab's dark tone. It is the
 * same dark tone and the same white as the last play tab's (SPEC 008 RF-014).
 */
async function tabContrast(page: Page): Promise<number> {
  const color = await page
    .locator('[data-initial-round] [data-value]')
    .last()
    .evaluate((text) => getComputedStyle(text).color);
  const background = await page
    .locator('[data-initial-round] [data-tab]')
    .evaluate((tab) => getComputedStyle(tab).backgroundColor);
  return contrast(page, color, background);
}

async function box(locator: Locator) {
  return (await locator.boundingBox())!;
}

test('RNF-001, CE-05: el texto del cartel y de la pestaña llega a 4,5:1 con los cuatro colores', async ({
  page,
}) => {
  // Initial roll without a tie: yellow, blue, red and green roll in turn, and green starts.
  await fixDice(page, [1, 2, 3, 6]);
  await page.goto('/');
  await startGame(page);
  const banner = page.locator('jp-turn-banner [data-plank]');
  const tab = page.locator('[data-initial-round] [data-tab]');

  await expect(banner).toHaveAttribute('data-color', 'yellow');
  expect(await bannerContrast(page), 'cartel amarillo').toBeGreaterThanOrEqual(4.5);

  for (const [player, next] of [
    ['yellow', 'blue'],
    ['blue', 'red'],
    ['red', 'green'],
    ['green', 'green'],
  ]) {
    await roll(page);
    await expect(tab).toHaveAttribute('data-color', player);
    await expect(banner).toHaveAttribute('data-color', next);
    expect(await tabContrast(page), `pestaña ${player}`).toBeGreaterThanOrEqual(4.5);
    expect(await bannerContrast(page), `cartel ${next}`).toBeGreaterThanOrEqual(4.5);
  }
});

for (const size of SIZES) {
  test(`RNF-010, CE-11: a ${size.width} × ${size.height}, el tablero no se mueve al aparecer ni al cambiar la pestaña`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    // Yellow's roll is the shortest round; the other three tie with it, the longest round
    // (SPEC 008 RF-015).
    await fixDice(page, [6, 6, 6, 6]);
    await page.goto('/');
    await startGame(page);
    await page.evaluate(() => document.fonts.ready);
    const board = page.locator('[data-board-slot]');
    const round = page.locator('[data-initial-round] [data-text]');

    await expect(round).toHaveCount(0);
    const before = await box(board);

    await roll(page);
    await expect(round).toHaveText('Amarillo saca 6.');
    expect(await box(board), 'pestaña corta').toEqual(before);

    await roll(page, 3);
    await expect(round).toHaveText(
      'Amarillo saca 6, Azul saca 6, Rojo saca 6, Verde saca 6, empate entre Amarillo, Azul, Rojo y Verde.',
    );
    expect(await box(board), 'empate de cuatro').toEqual(before);
  });
}
