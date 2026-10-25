import { Component, input, output } from '@angular/core';
import { Color } from '@engine';

/** Glow of the pulse, in the colour of the player who has to roll. */
export const DICE_GLOW: Readonly<Record<Color, string>> = {
  yellow: '',
  blue: '',
  red: '',
  green: '',
};

/** Wooden dice on the central log: pulses when it can be rolled and spins while rolling (RF-007, RF-008). */
@Component({
  selector: 'jp-dice',
  template: '',
})
export class Dice {
  readonly face = input.required<number>();
  readonly color = input.required<Color>();
  readonly canRoll = input.required<boolean>();
  readonly rolling = input.required<boolean>();
  readonly roll = output();
}
