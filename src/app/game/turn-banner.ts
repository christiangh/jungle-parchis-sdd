import { Component, input } from '@angular/core';
import { Color } from '@engine';
import { Headline } from './headline';

export const TEAM_BG: Readonly<Record<Color, string>> = {
  yellow: '',
  blue: '',
  red: '',
  green: '',
};

export const TEAM_DARK_BORDER: Readonly<Record<Color, string>> = {
  yellow: '',
  blue: '',
  red: '',
  green: '',
};

/** Painted wooden sign in the colour of the player in turn, with the current state (RF-003). */
@Component({
  selector: 'jp-turn-banner',
  template: '',
})
export class TurnBanner {
  readonly headline = input.required<Headline>();
}
