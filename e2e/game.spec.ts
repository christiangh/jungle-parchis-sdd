import { expect, Page, test } from '@playwright/test';
import { dice, firstPlayer, fixDice, roll, spin } from './dice';
import { startGame } from './start';

// Roll sequences checked with the engine: each roll before the last one has at most one legal move.

// Yellow and red tie with a 6 and red wins the tie-break with a 4 against a 3.
const TIE = [6, 2, 6, 1, 3, 4];
// After TIE, red takes two pieces out with a 5; a 3 lets both move.
const MOVE = [...TIE, 5, 1, 1, 1, 5, 1, 1, 1, 3];
// Blue starts; red captures green-0 with red-0 on the last 6 and earns 20.
const CAPTURE = [3, 5, 2, 1, 2, 5, 5, 4, 4, 6, 2, 3, 2, 5, 6, 6];
// Blue starts and loses a 4, takes blue-0 out with a 5 and rolls three sixes.
const SIXES = [3, 5, 2, 1, 4, 1, 1, 1, 5, 1, 1, 1, 6, 6, 6];

function action(page: Page) {
  return page.locator('jp-turn-banner [data-title]');
}

/** Turn text for screen readers, before the action. */
function turn(page: Page) {
  return page.locator('jp-turn-banner [data-turn]');
}

function banner(page: Page) {
  return page.locator('jp-turn-banner [data-plank]');
}

function lastPlay(page: Page) {
  return page.locator('[data-last-play]');
}

/** Tab of the initial roll round, with a still mascot and a value for each roll. */
function initialRound(page: Page) {
  return page.locator('[data-initial-round]');
}

/** Text of the initial roll round for screen readers. */
function initialRoundText(page: Page) {
  return page.locator('[data-initial-round] [data-text]');
}

/** Teams that rolled in the round, in order, by the colour of their mascot. */
function rollColors(page: Page): Promise<string[]> {
  return page
    .locator('[data-initial-round] [data-roll]')
    .evaluateAll((rolls) => rolls.map((roll) => roll.getAttribute('data-color')!));
}

/** Tab of the last play, painted in the colour of the team that made it. */
function lastPlayTab(page: Page) {
  return page.locator('[data-last-play] [data-tab]');
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

test('RF-013: tirada inicial con empate, salir con un 5, cambiar, cancelar y confirmar la selección', async ({
  page,
}) => {
  await fixDice(page, MOVE);
  await page.goto('/');
  await startGame(page);
  await expect(banner(page)).toHaveAttribute('data-color', 'yellow');
  await expect(turn(page)).toHaveText('Turno de Amarillo.');
  await expect(action(page)).toHaveText('Tirada inicial: Toca el dado');
  await expect(lastPlay(page)).toHaveCount(0);
  await expect(initialRound(page)).toHaveCount(0);

  await roll(page, 4);
  await expect(initialRoundText(page)).toHaveText(
    'Amarillo saca 6, Azul saca 2, Rojo saca 6, Verde saca 1, empate entre Amarillo y Rojo.',
  );
  await expect(initialRound(page).locator('[data-tab]')).toHaveAttribute('data-color', 'green');
  await expect(turn(page)).toHaveText('Turno de Amarillo.');
  await expect(banner(page)).toHaveAttribute('data-color', 'yellow');

  await roll(page, 2);
  await expect(initialRoundText(page)).toHaveText('Amarillo saca 3, Rojo saca 4.');
  await expect(initialRound(page).locator('[data-tab]')).toHaveAttribute('data-color', 'red');
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(action(page)).toHaveText('Toca el dado');

  await roll(page);
  await expect(initialRound(page)).toHaveCount(0);
  await expect(dice(page)).toHaveAttribute('aria-label', 'Dado, cara 5');
  await expect(action(page)).toHaveText('Elige una ficha');
  await expect(highlighted(page)).toHaveCount(1);
  await touch(page, 'red-0');
  await expect(ghost(page)).toHaveAttribute('data-ghost', 'red-0');
  await touch(page, 'ghost');
  await expect(lastPlay(page)).toHaveText('Saca una ficha de casa.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'red');
  await expect(banner(page)).toHaveAttribute('data-color', 'green');

  await play(page, [1, 1, 1, 5, 1, 1, 1]);
  await roll(page);
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(action(page)).toHaveText('Elige una ficha');
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
  await expect(lastPlay(page)).toHaveText('Mueve una ficha.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'red');
  await expect(highlighted(page)).toHaveCount(0);
  await expect(turn(page)).toHaveText('Turno de Verde.');
  await expect(banner(page)).toHaveAttribute('data-color', 'green');
});

test('RF-013: comer, no poder tirar con el +20 pendiente y usarlo', async ({ page }) => {
  await fixDice(page, CAPTURE);
  await page.goto('/');
  await startGame(page);

  await play(page, CAPTURE.slice(0, -1));
  await roll(page);
  await touch(page, 'red-0');
  await expect(ghost(page).locator('[data-mark="target"]')).toBeVisible();
  await touch(page, 'ghost');

  await expect(lastPlay(page)).toHaveText(
    'Mueve una ficha, se come una ficha de Verde, cuenta 20.',
  );
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'red');
  await expect(action(page)).toHaveText('Usa tu +20');
  await expect(dice(page)).toBeDisabled();

  await touch(page, 'red-0');
  await touch(page, 'ghost');
  await expect(lastPlay(page)).toHaveText('Mueve una ficha, repite.');
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(action(page)).toHaveText('Toca el dado');
  await expect(dice(page)).toBeEnabled();
});

test('RF-013: tirada perdida, repetir con un 6 y tres seises', async ({ page }) => {
  await fixDice(page, SIXES);
  await page.goto('/');
  await startGame(page);

  await roll(page, 5);
  await expect(lastPlay(page)).toHaveText('Saca 4 y pierde la tirada.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'blue');
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(banner(page)).toHaveAttribute('data-color', 'red');

  await play(page, [1, 1, 1, 5, 1, 1, 1, 6]);
  await expect(lastPlay(page)).toHaveText('Mueve una ficha, repite.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'blue');
  await expect(turn(page)).toHaveText('Turno de Azul.');
  await expect(action(page)).toHaveText('Toca el dado');

  await play(page, [6]);
  await roll(page);
  await expect(lastPlay(page)).toHaveText('Tres seises y su ficha vuelve a casa.');
  await expect(lastPlayTab(page)).toHaveAttribute('data-color', 'blue');
  await expect(turn(page)).toHaveText('Turno de Rojo.');
  await expect(banner(page)).toHaveAttribute('data-color', 'red');
  await expect(highlighted(page)).toHaveCount(0);

  const home = (await page.locator('[data-home="blue"]').boundingBox())!;
  const piece = (await page.locator('[data-piece="blue-0"]').boundingBox())!;
  expect(piece.x).toBeGreaterThanOrEqual(home.x);
  expect(piece.y).toBeGreaterThanOrEqual(home.y);
  expect(piece.x + piece.width).toBeLessThanOrEqual(home.x + home.width);
  expect(piece.y + piece.height).toBeLessThanOrEqual(home.y + home.height);
});

test('HU-03.3, HU-04.1: partida de amarillo y verde, con las casas azul y roja atenuadas', async ({
  page,
}) => {
  // Yellow wins the initial roll with a 4 and starts.
  await fixDice(page, [4, 2]);
  await page.goto('/');
  await startGame(page, ['yellow', 'green']);

  await expect(page.locator('[data-piece]')).toHaveCount(8);
  for (const color of ['blue', 'red']) {
    for (const selector of [`[data-home="${color}"]`, `[data-medallion="${color}"]`]) {
      const inactive = page.locator(selector);
      await expect(inactive, selector).toHaveAttribute('data-inactive');
      await expect(inactive, selector).toHaveCSS('opacity', '0.5');
      await expect(inactive, selector).toHaveCSS('filter', 'grayscale(1)');
    }
  }
  for (const color of ['yellow', 'green']) {
    await expect(page.locator(`[data-home="${color}"]`)).not.toHaveAttribute('data-inactive');
  }

  await expect(turn(page)).toHaveText('Turno de Amarillo.');
  await roll(page);
  await expect(turn(page)).toHaveText('Turno de Verde.');
  await roll(page);
  await expect(banner(page)).toHaveAttribute('data-color', 'yellow');
  await expect(turn(page)).toHaveText('Turno de Amarillo.');
  await expect(initialRoundText(page)).toHaveText('Amarillo saca 4, Verde saca 2.');
});

test('HU-06, CE-07: empate en la tirada inicial, desempate y «Empieza el equipo Rojo»', async ({
  page,
}) => {
  await fixDice(page, TIE);
  await page.goto('/');
  await startGame(page);

  // HU-06.1: the banner asks yellow for the initial roll.
  await expect(banner(page)).toHaveAttribute('data-color', 'yellow');
  await expect(action(page)).toHaveText('Tirada inicial: Toca el dado');

  // HU-06.2: each roll adds its mascot and its value, in order.
  await spin(page);
  expect(await rollColors(page)).toEqual(['yellow']);
  await expect(initialRound(page).locator('[data-value]')).toHaveText(['6']);
  await expect(banner(page)).toHaveAttribute('data-color', 'blue');

  // HU-06.3: the tie shows with the rolls, and the tie-break round starts empty.
  await spin(page, 3);
  expect(await rollColors(page)).toEqual(['yellow', 'blue', 'red', 'green']);
  await expect(initialRound(page).locator('[data-value]')).toHaveText(['6', '2', '6', '1']);
  await expect(initialRound(page).locator('[data-tie]')).toHaveText(
    'Empate entre Amarillo y Rojo.',
  );
  await expect(banner(page)).toHaveAttribute('data-color', 'yellow');
  await expect(action(page)).toHaveText('Tirada inicial: Toca el dado');

  await spin(page);
  expect(await rollColors(page)).toEqual(['yellow']);
  await expect(initialRound(page).locator('[data-value]')).toHaveText(['3']);
  await expect(initialRound(page).locator('[data-tie]')).toHaveCount(0);

  // HU-06.4: only «Empieza el equipo Rojo», with the rolls behind and the dice out of reach.
  await spin(page);
  const screen = firstPlayer(page);
  await expect(screen).toHaveAccessibleName('Empieza el equipo Rojo');
  await expect(screen).toHaveAttribute('data-color', 'red');
  const go = screen.getByRole('button', { name: '¡Vamos!' });
  await expect(go).toBeFocused();
  await expect(initialRound(page).locator('[data-value]')).toHaveText(['3', '4']);
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await expect(dice(page)).toBeDisabled();

  // HU-06.5: «¡Vamos!» closes it, red is asked to roll and the dice responds.
  await go.click();
  await expect(screen).toHaveCount(0);
  await expect(dice(page)).toBeFocused();
  await expect(banner(page)).toHaveAttribute('data-color', 'red');
  await expect(action(page)).toHaveText('Toca el dado');
  await expect(dice(page)).toBeEnabled();
});
