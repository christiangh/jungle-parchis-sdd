import { Component, input } from '@angular/core';

// 16 rays around the centre, alternating gold and pale, in a 200 × 200 drawing centred on the origin.
const RAYS = Array.from({ length: 16 }, (_, k) => ({
  transform: `rotate(${k * 22.5})`,
  light: k % 2 === 1,
}));

let nextId = 0;

/**
 * Sun rays behind the champion's plank, with a halo. Decorative. With `animated`, the rays turn
 * slowly and the halo glows; otherwise they keep still (RF-001, RNF-002).
 */
@Component({
  selector: 'g[jp-sun-rays]',
  template: `
    <svg:defs>
      <radialGradient [attr.id]="haloId">
        <stop offset="0" class="[stop-color:var(--color-sun-ray-light)] [stop-opacity:0.9]" />
        <stop offset="0.45" class="[stop-color:var(--color-sun-ray)] [stop-opacity:0.35]" />
        <stop offset="1" class="[stop-color:var(--color-sun-ray)] [stop-opacity:0]" />
      </radialGradient>
    </svg:defs>
    <svg:circle
      r="96"
      [attr.fill]="haloFill"
      [class]="animated() ? 'opacity-75 motion-safe:animate-sun-rays-glow' : 'opacity-75'"
    />
    <svg:g [class]="animated() ? 'motion-safe:animate-sun-rays-spin' : ''" data-rays>
      @for (ray of rays; track $index) {
        <path
          d="M-7 -40 L0 -100 L7 -40Z"
          [attr.transform]="ray.transform"
          [class]="ray.light ? 'fill-sun-ray-light opacity-35' : 'fill-sun-ray opacity-50'"
        />
      }
    </svg:g>
  `,
  host: { 'aria-hidden': 'true', '[attr.data-animated]': 'animated() || null' },
})
export class SunRays {
  readonly animated = input(false);

  protected readonly rays = RAYS;
  protected readonly haloId = `jp-sun-rays-${nextId++}-halo`;
  protected readonly haloFill = `url(#${this.haloId})`;
}
