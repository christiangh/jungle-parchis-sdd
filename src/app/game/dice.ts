import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Color } from '@engine';

/** Glow of the pulse, in the colour of the player who has to roll. Full class names for Tailwind. */
export const DICE_GLOW: Readonly<Record<Color, string>> = {
  yellow: '[--dice-glow:var(--color-team-yellow)]',
  blue: '[--dice-glow:var(--color-team-blue)]',
  red: '[--dice-glow:var(--color-team-red)]',
  green: '[--dice-glow:var(--color-team-green)]',
};

const FACES = [1, 2, 3, 4, 5, 6] as const;

/** Wooden dice on the central log: pulses when it can be rolled and spins while rolling (RF-007, RF-008). */
@Component({
  selector: 'jp-dice',
  imports: [NgOptimizedImage],
  templateUrl: './dice.html',
  host: { class: 'block' },
})
export class Dice {
  readonly face = input.required<number>();
  readonly color = input.required<Color>();
  readonly canRoll = input.required<boolean>();
  readonly rolling = input.required<boolean>();
  readonly roll = output();

  protected readonly faces = FACES;
  protected readonly glow = computed(() => DICE_GLOW[this.color()]);
}
