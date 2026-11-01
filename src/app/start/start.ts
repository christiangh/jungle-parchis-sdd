import {
  afterNextRender,
  Component,
  computed,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { Color } from '@engine';
import { TEAM_BG, TEAM_DARK_BG, TEAM_DARK_BORDER } from '../game/turn-banner';
import { COLOR_NAMES } from '../shared/color-names';
import { Mascot } from '../shared/mascot';
import { prefersReducedMotion } from '../shared/reduced-motion';
import { canStart, teamsStatus, toggleTeam } from './teams';

/** Cards in the place of each team's home: red and blue on top, green and yellow below. */
export const CARD_ORDER: readonly Color[] = ['red', 'blue', 'green', 'yellow'];

/** Radius of the mascot inside its badge, in the units of the badge's 48 × 48 drawing. */
const BADGE_MASCOT_RADIUS = 22;

/** A team's card: switched on with its colour, its mascot and a tick, or dashed with a «+». */
export interface TeamCard {
  readonly color: Color;
  readonly name: string;
  readonly on: boolean;
  /** Plays its mascot's loop once: switched on during this visit, with motion allowed. */
  readonly animated: boolean;
  readonly classes: string;
  readonly badge: string;
}

const CARD_ON = 'bg-plank border-solid shadow-lg shadow-black/30';
const CARD_OFF = 'bg-start-card-off border-dashed border-start-card-off-edge';

let nextId = 0;

/**
 * «¿Quién juega?» screen over the game: one card per team, which switches it on or off, the status
 * and «¡A jugar!», which only answers with 2 teams or more. A modal dialog that takes the focus to
 * the first card. A team switched on plays its mascot's loop once, without reduced motion (SPEC 008
 * HU-03, RF-004, RF-005, RF-006, RNF-001, RNF-002).
 */
@Component({
  selector: 'jp-start',
  templateUrl: './start.html',
  imports: [Mascot],
  host: {
    class: 'fixed inset-0 z-50 grid place-items-center overflow-auto bg-champion-overlay p-4',
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-labelledby]': 'titleId',
  },
})
export class Start {
  /** Teams switched on when the screen opens: those of the last game. */
  readonly teams = input.required<readonly Color[]>();
  /** «¡A jugar!» with the chosen teams, in the order of `COLORS`. */
  readonly startGame = output<readonly Color[]>();

  // Read once: the screen is created each time it opens.
  private readonly motion = !prefersReducedMotion(inject(DOCUMENT).defaultView);

  protected readonly chosen = linkedSignal(() => this.teams());
  /** Teams switched on during this visit, whose mascot plays once. */
  private readonly fresh = signal<ReadonlySet<Color>>(new Set());

  protected readonly cards = computed<readonly TeamCard[]>(() =>
    CARD_ORDER.map((color) => {
      const on = this.chosen().includes(color);
      return {
        color,
        name: COLOR_NAMES[color],
        on,
        animated: on && this.motion && this.fresh().has(color),
        classes: on ? `${CARD_ON} ${TEAM_BG[color]} ${TEAM_DARK_BORDER[color]}` : CARD_OFF,
        badge: TEAM_DARK_BG[color],
      };
    }),
  );
  protected readonly ready = computed(() => canStart(this.chosen()));
  protected readonly status = computed(() => teamsStatus(this.chosen()));
  protected readonly mascotRadius = BADGE_MASCOT_RADIUS;
  protected readonly titleId = `jp-start-${nextId++}-title`;

  private readonly cardButtons = viewChildren<ElementRef<HTMLButtonElement>>('card');

  constructor() {
    afterNextRender(() => this.cardButtons()[0]?.nativeElement.focus());
  }

  protected toggle(color: Color): void {
    const on = !this.chosen().includes(color);
    this.chosen.update((teams) => toggleTeam(teams, color));
    this.fresh.update((fresh) => {
      const next = new Set(fresh);
      if (on) {
        next.add(color);
      } else {
        next.delete(color);
      }
      return next;
    });
  }

  protected submit(): void {
    if (this.ready()) {
      this.startGame.emit(this.chosen());
    }
  }
}
