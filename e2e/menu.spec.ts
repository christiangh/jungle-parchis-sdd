import { expect, Page, test } from '@playwright/test';
import { fixDice, roll } from './dice';
import { gear, menuPanel, openMenu } from './menu';
import { startGame, startScreen } from './start';

// Yellow beats green in the initial roll and rolls a 5, which takes a piece out.
const EXIT = [4, 2, 5];

function turn(page: Page) {
  return page.locator('jp-turn-banner [data-turn]');
}

function action(page: Page) {
  return page.locator('[data-title]');
}

function ghost(page: Page) {
  return page.locator('[data-ghost]');
}

/** Centre of every piece on the board, by piece. */
async function pieces(page: Page): Promise<Record<string, string>> {
  return page.locator('[data-piece]').evaluateAll((groups) =>
    Object.fromEntries(
      groups.map((group) => {
        const rim = group.querySelector('[data-part="rim"]')!;
        return [
          group.getAttribute('data-piece'),
          `${rim.getAttribute('cx')},${rim.getAttribute('cy')}`,
        ];
      }),
    ),
  );
}

test('CE-05: el menú se cierra sin tocar la partida y «Nueva partida» vuelve a la pantalla de inicio con los mismos equipos', async ({
  page,
}) => {
  await fixDice(page, EXIT);
  await page.goto('/');
  await startGame(page, ['yellow', 'green']);
  await roll(page, EXIT.length);
  await page.locator('[data-touch]').first().click();
  await expect(ghost(page)).toBeVisible();
  const title = await action(page).textContent();
  const before = await pieces(page);

  // HU-05.1, HU-05.2: only «Nueva partida»; Escape closes and gives the focus back to the gear.
  await openMenu(page);
  await expect(menuPanel(page).getByRole('button', { name: 'Cerrar' })).toBeFocused();
  await expect(menuPanel(page).locator('[data-option]')).toHaveText(['Nueva partida']);
  await page.keyboard.press('Escape');
  await expect(menuPanel(page)).toBeHidden();
  await expect(gear(page)).toBeFocused();

  // HU-05.5: «Seguir jugando» leaves the game as it was.
  await openMenu(page);
  await menuPanel(page).getByRole('button', { name: 'Nueva partida' }).click();
  await menuPanel(page).getByRole('button', { name: 'Seguir jugando' }).click();
  await expect(menuPanel(page)).toBeHidden();
  await expect(action(page)).toHaveText(title!);
  await expect(turn(page)).toHaveText('Turno de Amarillo.');
  await expect(ghost(page)).toBeVisible();
  expect(await pieces(page)).toEqual(before);

  // HU-05.4, RF-008: discarding goes back to the start screen with yellow and green.
  await openMenu(page);
  await menuPanel(page).getByRole('button', { name: 'Nueva partida' }).click();
  await menuPanel(page).getByRole('button', { name: 'Descartar partida' }).click();
  const screen = startScreen(page);
  await expect(screen).toBeVisible();
  for (const [team, on] of [
    ['yellow', 'true'],
    ['blue', 'false'],
    ['red', 'false'],
    ['green', 'true'],
  ]) {
    await expect(screen.locator(`[data-team="${team}"]`)).toHaveAttribute('aria-pressed', on);
  }

  // CE-06: the new game starts again with yellow's initial roll.
  await screen.getByRole('button', { name: '¡A jugar!' }).click();
  await expect(screen).toHaveCount(0);
  await expect(turn(page)).toHaveText('Tirada inicial, turno de Amarillo.');
  await expect(page.locator('[data-piece]')).toHaveCount(8);
  await expect(gear(page)).toBeVisible();
});
