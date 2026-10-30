import {
  afterNextRender,
  Component,
  computed,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Color } from '@engine';
import { COLOR_NAMES } from '../shared/color-names';
import { Mascot } from '../shared/mascot';
import { prefersReducedMotion } from '../shared/reduced-motion';
import { Confetti } from './confetti';
import { SunRays } from './sun-rays';
import { Trophy } from './trophy';
import { TEAM_BG, TEAM_DARK_BG, TEAM_DARK_BORDER } from './turn-banner';

/** Radius of the mascot inside its badge, in the units of the badge's 48 × 48 drawing. */
const BADGE_MASCOT_RADIUS = 22;

let nextId = 0;

/**
 * Champion screen over the finished game: the winner's plank with its mascot and the trophy, sun
 * rays and confetti, and «Nueva partida» as its only way out. A modal dialog that neither Escape nor
 * a touch outside closes; it takes the focus to its button. With reduced motion nothing moves and
 * there is no confetti (SPEC 008 HU-01, RF-001, RF-002, RF-003, RNF-002).
 */
@Component({
  selector: 'jp-champion',
  templateUrl: './champion.html',
  imports: [Confetti, Mascot, SunRays, Trophy],
  host: {
    class: 'fixed inset-0 z-50 grid place-items-center overflow-hidden bg-champion-overlay',
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.data-color]': 'winner()',
  },
})
export class Champion {
  readonly winner = input.required<Color>();
  readonly newGame = output();

  // Read once: the screen is created when the game ends.
  protected readonly animated = !prefersReducedMotion(inject(DOCUMENT).defaultView);

  protected readonly name = computed(() => COLOR_NAMES[this.winner()]);
  protected readonly fill = computed(() => TEAM_BG[this.winner()]);
  protected readonly edge = computed(() => TEAM_DARK_BORDER[this.winner()]);
  protected readonly badge = computed(() => TEAM_DARK_BG[this.winner()]);
  protected readonly mascotRadius = BADGE_MASCOT_RADIUS;
  protected readonly titleId = `jp-champion-${nextId++}-title`;

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('newGameButton');

  constructor() {
    afterNextRender(() => this.button().nativeElement.focus());
  }
}
