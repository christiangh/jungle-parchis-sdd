import { Component, computed, input } from '@angular/core';
import { Mascot } from '../shared/mascot';
import { InitialRound, initialRoundText } from './initial-round';
import { names } from './last-play';
import { TEAM_DARK_BG } from './turn-banner';

/** Radius of the mascot inside its badge, in the units of the badge's 48 × 48 drawing. */
const BADGE_MASCOT_RADIUS = 22;

/**
 * Last play tab during the initial roll, in the darkened colour of the last team that rolled: a
 * still mascot with its value for each roll of the round, in order, and the tie if the round ended
 * in one. What is drawn is decorative; screen readers get the round as a sentence (SPEC 008 RF-014,
 * RF-015).
 */
@Component({
  selector: 'jp-initial-round-tab',
  templateUrl: './initial-round-tab.html',
  imports: [Mascot],
  host: { class: 'block' },
})
export class InitialRoundTab {
  readonly round = input.required<InitialRound>();

  protected readonly color = computed(() => this.round().rolls.at(-1)?.color ?? null);
  protected readonly fill = computed(() => {
    const color = this.color();
    return color === null ? '' : TEAM_DARK_BG[color];
  });
  protected readonly tie = computed(() => {
    const tie = this.round().tie;
    return tie === null ? null : `Empate entre ${names(tie)}.`;
  });
  protected readonly text = computed(() => initialRoundText(this.round()));
  protected readonly mascotRadius = BADGE_MASCOT_RADIUS;
}
