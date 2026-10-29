import { Component, computed, input } from '@angular/core';
import { Color } from '@engine';
import { Mascot } from '../shared/mascot';
import { Headline } from './headline';

// Full class names, so Tailwind finds them in the source.

export const TEAM_BG: Readonly<Record<Color, string>> = {
  yellow: 'bg-team-yellow',
  blue: 'bg-team-blue',
  red: 'bg-team-red',
  green: 'bg-team-green',
};

export const TEAM_DARK_BG: Readonly<Record<Color, string>> = {
  yellow: 'bg-team-yellow-dark',
  blue: 'bg-team-blue-dark',
  red: 'bg-team-red-dark',
  green: 'bg-team-green-dark',
};

export const TEAM_DARK_BORDER: Readonly<Record<Color, string>> = {
  yellow: 'border-team-yellow-dark',
  blue: 'border-team-blue-dark',
  red: 'border-team-red-dark',
  green: 'border-team-green-dark',
};

/** Radius of the mascot inside its badge, in the units of the badge's 48 × 48 drawing. */
const BADGE_MASCOT_RADIUS = 22;

/**
 * Painted wooden sign in the colour of the team in turn, with its animated mascot and only the
 * action; the turn is a text for screen readers before it (RF-008, RF-010).
 */
@Component({
  selector: 'jp-turn-banner',
  templateUrl: './turn-banner.html',
  imports: [Mascot],
  host: { class: 'block' },
})
export class TurnBanner {
  readonly headline = input.required<Headline>();

  protected readonly fill = computed(() => TEAM_BG[this.headline().color]);
  protected readonly edge = computed(() => TEAM_DARK_BORDER[this.headline().color]);
  protected readonly badge = computed(() => TEAM_DARK_BG[this.headline().color]);
  protected readonly mascotRadius = BADGE_MASCOT_RADIUS;
}
