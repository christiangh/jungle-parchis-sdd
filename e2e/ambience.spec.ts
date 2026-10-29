import { expect, test } from '@playwright/test';
import { fixDice, roll } from './dice';

// Softened background and design fonts (HU-01): RF-001, RF-002 and RNF-008.

test('RF-001: con las imágenes del fondo bloqueadas, la página se ve con el color salvia', async ({
  page,
}) => {
  await page.route('**/background/**', (route) => route.abort());
  await page.goto('/');

  await expect(page.locator('main')).toHaveCSS('background-color', 'rgb(169, 177, 140)');
});

test('RF-002: el cartel se pinta con Caprasimo y la pestaña de última jugada con Figtree', async ({
  page,
}) => {
  await fixDice(page, [6]);
  await page.goto('/');
  await roll(page);

  await expect(page.locator('[data-title]')).toHaveCSS('font-family', /^Caprasimo,/);
  await expect(page.locator('[data-last-play] [data-text]')).toHaveCSS('font-family', /^Figtree,/);
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [document.fonts.check('400 20px Caprasimo'), document.fonts.check('600 16px Figtree')];
  });
  expect(loaded).toEqual([true, true]);
});

test('RNF-008: al cargar y en una tirada, todas las peticiones son al mismo origen', async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol !== 'data:' && url.origin !== origin) foreign.push(request.url());
  });

  await fixDice(page, [6]);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await roll(page);
  await expect(page.locator('[data-last-play]')).toBeVisible();

  expect(foreign).toEqual([]);
});
