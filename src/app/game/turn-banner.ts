import { Component, computed, input } from '@angular/core';
import { Color } from '@engine';
import { Headline } from './headline';

// Full class names, so Tailwind finds them in the source.

export const TEAM_BG: Readonly<Record<Color, string>> = {
  yellow: 'bg-team-yellow',
  blue: 'bg-team-blue',
  red: 'bg-team-red',
  green: 'bg-team-green',
};

export const TEAM_DARK_BORDER: Readonly<Record<Color, string>> = {
  yellow: 'border-team-yellow-dark',
  blue: 'border-team-blue-dark',
  red: 'border-team-red-dark',
  green: 'border-team-green-dark',
};

/** Painted wooden sign in the colour of the player in turn, with the current state (RF-003). */
@Component({
  selector: 'jp-turn-banner',
  templateUrl: './turn-banner.html',
  host: { class: 'block' },
})
export class TurnBanner {
  readonly headline = input.required<Headline>();

  protected readonly fill = computed(() => TEAM_BG[this.headline().color]);
  protected readonly edge = computed(() => TEAM_DARK_BORDER[this.headline().color]);
}
