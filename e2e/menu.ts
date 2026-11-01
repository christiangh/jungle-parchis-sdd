import { expect, Page } from '@playwright/test';

/** Gear at the top right that opens the side menu (SPEC 008 RF-010). */
export function gear(page: Page) {
  return page.getByRole('button', { name: 'Menú' });
}

/** Side menu, a modal dialog over the game. */
export function menuPanel(page: Page) {
  return page.getByRole('dialog', { name: 'Menú' });
}

/** Touches the gear and waits for the side menu to show up (SPEC 008 HU-05.1). */
export async function openMenu(page: Page): Promise<void> {
  await gear(page).click();
  await expect(menuPanel(page)).toBeVisible();
}
