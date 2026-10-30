import { Component, input } from '@angular/core';

// Left and right handles of the cup.
const HANDLES = ['M30 22 C10 20 8 48 34 54', 'M90 22 C110 20 112 48 86 54'];

let nextId = 0;

/**
 * Gold trophy of the champion screen, drawn in the 120 × 140 units of docs/design/avisos-y-campeon.
 * Decorative. With `animated`, a shine crosses the cup and two sparkles twinkle (RF-001, RNF-002).
 */
@Component({
  selector: 'g[jp-trophy]',
  templateUrl: './trophy.html',
  host: { 'aria-hidden': 'true', '[attr.data-animated]': 'animated() || null' },
})
export class Trophy {
  readonly animated = input(false);

  protected readonly handles = HANDLES;
  protected readonly cupId = `jp-trophy-${nextId++}-cup`;
  protected readonly cupClip = `url(#${this.cupId})`;
}
