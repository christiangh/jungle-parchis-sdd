import { Component, computed, inject } from '@angular/core';
import { Board } from './board/board';
import { Dice } from './game/dice';
import { GameStore } from './game/game-store';
import { headline } from './game/headline';
import { TurnBanner } from './game/turn-banner';

/** Game screen: jungle background, turn banner and board with the dice on its log (RF-002). */
@Component({
  imports: [Board, Dice, TurnBanner],
  selector: 'jp-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  // A touch anywhere outside the board's touch areas cancels the selection (RF-016).
  host: { '(click)': 'store.cancel()' },
})
export class App {
  protected readonly store = inject(GameStore);
  protected readonly headline = computed(() => headline(this.store.state()));
}
