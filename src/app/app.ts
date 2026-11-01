import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { Board } from './board/board';
import { Champion } from './game/champion';
import { Dice } from './game/dice';
import { FirstPlayer } from './game/first-player';
import { GameStore } from './game/game-store';
import { headline } from './game/headline';
import { InitialRound, LONGEST_ROUND } from './game/initial-round';
import { InitialRoundTab } from './game/initial-round-tab';
import { LastPlay, lastPlay, LONGEST_PLAY } from './game/last-play';
import { LastPlayTab } from './game/last-play-tab';
import { TurnBanner } from './game/turn-banner';
import { Menu } from './menu/menu';
import { Start } from './start/start';

/**
 * Game screen: jungle background, turn banner with the last play tab hanging under it and board
 * with the dice on its log (RF-002, RF-005, RF-011). During the initial roll the tab shows the rolls
 * of the round, and when it ends «Empieza el equipo X» covers the game until «¡Vamos!». The start
 * screen opens over it to choose the teams, and once there is a winner the champion screen covers
 * it; during the game, the gear opens the side menu over it. Behind any of them, the game stays
 * visible but out of reach (SPEC 008 RF-001, RF-003, RF-004, RF-007, RF-010, RF-011, RF-012,
 * RF-014, RF-016).
 */
@Component({
  imports: [
    Board,
    Champion,
    Dice,
    FirstPlayer,
    InitialRoundTab,
    LastPlayTab,
    Menu,
    Start,
    TurnBanner,
  ],
  selector: 'jp-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  // A touch anywhere outside the board's touch areas cancels the selection (RF-016).
  host: { '(click)': 'store.cancel()' },
})
export class App {
  protected readonly store = inject(GameStore);
  private readonly injector = inject(Injector);
  private readonly dice = viewChild.required(Dice, { read: ElementRef<HTMLElement> });

  protected readonly headline = computed(() => headline(this.store.state()));
  protected readonly winner = computed(() => this.store.state().winner);
  protected readonly menuOpen = signal(false);
  /**
   * The start screen, the champion screen, «Empieza el equipo X» or the side menu is in front of the
   * game.
   */
  protected readonly covered = computed(
    () =>
      this.store.screen() === 'start' ||
      this.winner() !== null ||
      this.store.starter() !== null ||
      this.menuOpen(),
  );
  protected readonly lastPlay = computed(() =>
    lastPlay(this.store.lastPlayer(), this.store.lastEvents()),
  );
  /** Invisible copy that reserves the space of the longest tab (RNF-010). */
  protected readonly longestPlay: LastPlay = { color: 'yellow', text: LONGEST_PLAY };
  /** Invisible copy that reserves the space of the longest initial roll round (SPEC 008 RF-015). */
  protected readonly longestRound: InitialRound = LONGEST_ROUND;

  /** Closes «Empieza el equipo X» and takes the focus to the dice, the next thing to do (RF-016). */
  protected go(): void {
    this.store.go();
    afterNextRender(() => this.dice().nativeElement.querySelector('button')?.focus(), {
      injector: this.injector,
    });
  }
}
