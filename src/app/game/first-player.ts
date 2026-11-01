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
import { TEAM_BG, TEAM_DARK_BG, TEAM_DARK_BORDER } from './turn-banner';

/** Radius of the mascot inside its badge, in the units of the badge's 48 × 48 drawing. */
const BADGE_MASCOT_RADIUS = 22;

let nextId = 0;

/**
 * «Empieza el equipo X» over the game when the initial roll ends: the overlay, plank and button of
 * the champion screen, with only the starting team's mascot and title; no trophy, rays nor confetti.
 * A modal dialog that neither Escape nor a touch outside closes; it takes the focus to «¡Vamos!».
 * With reduced motion the mascot stays still (SPEC 008 HU-06.4, RF-016, RNF-002).
 */
@Component({
  selector: 'jp-first-player',
  templateUrl: './first-player.html',
  imports: [Mascot],
  host: {
    class: 'fixed inset-0 z-50 grid place-items-center overflow-hidden bg-champion-overlay',
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.data-color]': 'player()',
  },
})
export class FirstPlayer {
  readonly player = input.required<Color>();
  readonly go = output();

  // Read once: the screen is created when the initial roll ends.
  protected readonly animated = !prefersReducedMotion(inject(DOCUMENT).defaultView);

  protected readonly name = computed(() => COLOR_NAMES[this.player()]);
  protected readonly fill = computed(() => TEAM_BG[this.player()]);
  protected readonly edge = computed(() => TEAM_DARK_BORDER[this.player()]);
  protected readonly badge = computed(() => TEAM_DARK_BG[this.player()]);
  protected readonly mascotRadius = BADGE_MASCOT_RADIUS;
  protected readonly titleId = `jp-first-player-${nextId++}-title`;

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('goButton');

  constructor() {
    afterNextRender(() => this.button().nativeElement.focus());
  }
}
