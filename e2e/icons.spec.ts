import { expect, test } from '@playwright/test';

// Favicon, home screen icon and web manifest, with relative paths that also work under a
// GitHub Pages subpath (HU-06): RF-015, RNF-011, CE-13.

const LINKS = [
  {
    selector: 'link[rel="icon"][href="favicon.ico"]',
    type: /^image\/(x-icon|vnd\.microsoft\.icon)/,
  },
  { selector: 'link[rel="icon"][href="favicon.svg"]', type: /^image\/svg\+xml/ },
  { selector: 'link[rel="apple-touch-icon"]', type: /^image\/png/ },
  { selector: 'link[rel="manifest"]', type: /^application\/(manifest\+)?json/ },
];

test('RF-015, RNF-011: los iconos y el manifiesto se enlazan con rutas relativas', async ({
  page,
}) => {
  await page.goto('/');

  const hrefs = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
  expect(hrefs).toEqual(['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'site.webmanifest']);
  for (const href of hrefs) {
    expect(href, href).not.toMatch(/^(\/|[a-z]+:)/i);
  }
});

test('RF-015, CE-13: cada icono y el manifiesto responden desde el mismo origen con su tipo', async ({
  page,
}) => {
  await page.goto('/');
  const origin = new URL(page.url()).origin;

  for (const { selector, type } of LINKS) {
    const url = await page.locator(selector).evaluate((link: HTMLLinkElement) => link.href);
    expect(new URL(url).origin, selector).toBe(origin);
    const response = await page.request.get(url);
    expect(response.status(), url).toBe(200);
    expect(response.headers()['content-type'], url).toMatch(type);
  }
});

test('RF-015, CE-13: el manifiesto se llama Parchís y sus iconos responden', async ({ page }) => {
  await page.goto('/');
  const url = await page
    .locator('link[rel="manifest"]')
    .evaluate((link: HTMLLinkElement) => link.href);
  const manifest = (await (await page.request.get(url)).json()) as {
    short_name: string;
    icons: { src: string; type: string }[];
  };

  expect(manifest.short_name).toBe('Parchís');
  expect(manifest.icons.map((icon) => icon.src)).toEqual(['icon-192.png', 'icon-512.png']);
  for (const icon of manifest.icons) {
    const response = await page.request.get(new URL(icon.src, url).href);
    expect(response.status(), icon.src).toBe(200);
    expect(response.headers()['content-type'], icon.src).toMatch(/^image\/png/);
  }
});
