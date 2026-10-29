import { Component, computed, inject } from '@angular/core';
import { Board } from './board/board';
import { Dice } from './game/dice';
import { GameStore } from './game/game-store';
import { headline } from './game/headline';
import { LastPlay, lastPlay, LONGEST_PLAY } from './game/last-play';
import { LastPlayTab } from './game/last-play-tab';
import { TurnBanner } from './game/turn-banner';

/**
 * Game screen: jungle background, turn banner with the last play tab hanging under it and board
 * with the dice on its log (RF-002, RF-005, RF-011).
 */
@Component({
  imports: [Board, Dice, LastPlayTab, TurnBanner],
  selector: 'jp-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  // A touch anywhere outside the board's touch areas cancels the selection (RF-016).
  host: { '(click)': 'store.cancel()' },
})
export class App {
  protected readonly store = inject(GameStore);
  protected readonly headline = computed(() => headline(this.store.state()));
  protected readonly lastPlay = computed(() =>
    lastPlay(this.store.lastPlayer(), this.store.lastEvents()),
  );
  /** Invisible copy that reserves the space of the longest tab (RNF-010). */
  protected readonly longestPlay: LastPlay = { color: 'yellow', text: LONGEST_PLAY };
}
