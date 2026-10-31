import { Component, model, output } from '@angular/core';

/**
 * Gear at the top right and the side menu it opens, with «Nueva partida» and its confirmation
 * (SPEC 008 HU-05, RF-010, RF-011, RF-012).
 */
@Component({
  selector: 'jp-menu',
  templateUrl: './menu.html',
})
export class Menu {
  /** Whether the side menu is open. */
  readonly open = model(false);
  /** «Descartar partida»: the player gives up the game in progress. */
  readonly newGame = output<void>();
}
