import { Component, computed, input } from '@angular/core';
import { Mascot } from '../shared/mascot';
import { LastPlay } from './last-play';
import { TEAM_DARK_BG } from './turn-banner';

/** Radius of the mascot inside its badge, in the units of the badge's 48 × 48 drawing. */
const BADGE_MASCOT_RADIUS = 22;

/**
 * Smaller plank hanging under the turn banner, in the darkened colour of the team that acted, with
 * its still mascot and what happened (RF-011, RF-012).
 */
@Component({
  selector: 'jp-last-play-tab',
  templateUrl: './last-play-tab.html',
  imports: [Mascot],
  host: { class: 'block' },
})
export class LastPlayTab {
  readonly play = input.required<LastPlay>();

  protected readonly fill = computed(() => TEAM_DARK_BG[this.play().color]);
  protected readonly mascotRadius = BADGE_MASCOT_RADIUS;
}
