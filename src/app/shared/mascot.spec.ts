import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Color, COLORS } from '@engine';
import { Mascot, MASCOTS } from './mascot';

const SVG = 'http://www.w3.org/2000/svg';

interface Drawn {
  readonly color: Color;
  readonly animated?: boolean;
}

@Component({
  imports: [Mascot],
  template: `
    <svg viewBox="-50 -50 100 100">
      @for (mascot of mascots(); track $index) {
        <g jp-mascot [color]="mascot.color" [radius]="22" [animated]="mascot.animated ?? false" />
      }
    </svg>
  `,
})
class Host {
  readonly mascots = input.required<readonly Drawn[]>();
}

async function render(mascots: readonly Drawn[]): Promise<SVGGElement[]> {
  const fixture = TestBed.createComponent(Host);
  fixture.componentRef.setInput('mascots', mascots);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return [...root.querySelectorAll<SVGGElement>('[data-mascot]')];
}

describe('Mascot', () => {
  it('RF-004: cada equipo tiene su mascota: jaguar amarillo, loro rojo, hipopótamo azul y rana verde', async () => {
    expect(MASCOTS).toEqual({ yellow: 'jaguar', red: 'parrot', blue: 'hippo', green: 'frog' });
    const drawn = await render(COLORS.map((color) => ({ color })));
    expect(drawn.map((mascot) => mascot.getAttribute('data-mascot'))).toEqual(
      COLORS.map((color) => MASCOTS[color]),
    );
  });

  it('RF-004: se dibuja en SVG, con todas sus piezas dentro del espacio de nombres SVG', async () => {
    for (const mascot of await render(COLORS.map((color) => ({ color })))) {
      const parts = [...mascot.querySelectorAll('*')];
      expect(parts.length, mascot.dataset['mascot']).toBeGreaterThan(10);
      expect(parts.every((part) => part.namespaceURI === SVG)).toBe(true);
    }
  });

  it('RF-004: es decorativa para el lector de pantalla', async () => {
    for (const mascot of await render(COLORS.map((color) => ({ color })))) {
      expect(mascot.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('RF-004: llena un círculo del radio pedido, centrado en el origen', async () => {
    const [mascot] = await render([{ color: 'yellow' }]);
    expect(mascot.firstElementChild!.getAttribute('transform')).toBe('scale(0.5) translate(0 -3)');
    const circle = mascot.querySelector('clipPath circle')!;
    expect([circle.getAttribute('cy'), circle.getAttribute('r')]).toEqual(['3', '44']);
  });

  it('RF-004: cada mascota recorta con sus propios ids, aunque haya varias del mismo equipo', async () => {
    const drawn = await render([{ color: 'yellow' }, { color: 'yellow' }, { color: 'red' }]);
    const ids = drawn.flatMap((mascot) =>
      [...mascot.querySelectorAll('clipPath')].map((clip) => clip.id),
    );
    expect(new Set(ids).size).toBe(ids.length);
    for (const mascot of drawn) {
      const own = [...mascot.querySelectorAll('clipPath')].map((clip) => `url(#${clip.id})`);
      const used = [...mascot.querySelectorAll('[clip-path]')].map((part) =>
        part.getAttribute('clip-path'),
      );
      expect(used.length).toBeGreaterThan(0);
      expect(used.every((clip) => own.includes(clip!))).toBe(true);
    }
  });

  it('RNF-002: solo se marca como animada si se le pide', async () => {
    const drawn = await render([
      { color: 'blue', animated: true },
      { color: 'blue' },
      { color: 'green', animated: false },
    ]);
    expect(drawn.map((mascot) => mascot.hasAttribute('data-animated'))).toEqual([
      true,
      false,
      false,
    ]);
  });
});
