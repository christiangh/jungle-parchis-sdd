import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Color, COLORS } from '@engine';
import { Dice, DICE_GLOW } from './dice';

interface DiceInputs {
  face: number;
  color: Color;
  canRoll: boolean;
  rolling: boolean;
}

async function render(inputs: Partial<DiceInputs> = {}): Promise<ComponentFixture<Dice>> {
  const fixture = TestBed.createComponent(Dice);
  const { face, color, canRoll, rolling } = {
    face: 6,
    color: 'yellow',
    canRoll: true,
    rolling: false,
    ...inputs,
  };
  fixture.componentRef.setInput('face', face);
  fixture.componentRef.setInput('color', color);
  fixture.componentRef.setInput('canRoll', canRoll);
  fixture.componentRef.setInput('rolling', rolling);
  await fixture.whenStable();
  return fixture;
}

function button(fixture: ComponentFixture<Dice>): HTMLButtonElement {
  return (fixture.nativeElement as HTMLElement).querySelector('button')!;
}

function visibleFaces(fixture: ComponentFixture<Dice>): string[] {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>('img'),
  )
    .filter((img) => !img.hidden)
    .map((img) => img.getAttribute('src')!);
}

describe('Dice', () => {
  it('RF-007: muestra solo la imagen de la cara indicada', async () => {
    for (const face of [1, 2, 3, 4, 5, 6]) {
      const fixture = await render({ face });
      expect(visibleFaces(fixture), String(face)).toEqual([`/dice/dado-cara-${face}.svg`]);
    }
  });

  it('RF-007: tiene las seis caras cargadas desde el principio, para no parpadear al cambiar', async () => {
    const images = button(await render()).querySelectorAll('img');
    expect(images).toHaveLength(6);
    for (const img of images) {
      expect(img.getAttribute('loading')).toBe('eager');
      expect(img.getAttribute('alt')).toBe('');
    }
  });

  it('RF-007: el botón dice la cara que muestra', async () => {
    expect(button(await render({ face: 4 })).getAttribute('aria-label')).toBe('Dado, cara 4');
  });

  it('RF-008: cuando se puede tirar, late en el color del jugador y responde', async () => {
    for (const color of COLORS) {
      const dice = button(await render({ color, canRoll: true }));
      expect(dice.disabled, color).toBe(false);
      expect(dice.classList, color).toContain('motion-safe:animate-dice-pulse');
      expect(dice.classList, color).toContain(DICE_GLOW[color]);
    }
  });

  it('RF-008: cuando no se puede tirar, no late y está deshabilitado', async () => {
    const dice = button(await render({ canRoll: false }));
    expect(dice.disabled).toBe(true);
    expect(dice.classList).not.toContain('motion-safe:animate-dice-pulse');
  });

  it('RF-008: cada color late con su token de la paleta', () => {
    expect(DICE_GLOW).toEqual({
      yellow: '[--dice-glow:var(--color-team-yellow)]',
      blue: '[--dice-glow:var(--color-team-blue)]',
      red: '[--dice-glow:var(--color-team-red)]',
      green: '[--dice-glow:var(--color-team-green)]',
    });
  });

  it('RF-009: gira mientras rueda, sin latir y sin responder', async () => {
    const dice = button(await render({ canRoll: false, rolling: true }));
    expect(dice.classList).toContain('motion-safe:animate-dice-spin');
    expect(dice.classList).not.toContain('motion-safe:animate-dice-pulse');
    expect(dice.disabled).toBe(true);
  });

  it('RNF-002: las animaciones solo se aplican sin movimiento reducido', async () => {
    const pulsing = button(await render({ canRoll: true }));
    const spinning = button(await render({ canRoll: false, rolling: true }));
    const animations = [...pulsing.classList, ...spinning.classList].filter((name) =>
      name.includes('animate-'),
    );
    expect(animations).toEqual(['motion-safe:animate-dice-pulse', 'motion-safe:animate-dice-spin']);
  });

  it('RF-009: al tocarlo avisa de la tirada', async () => {
    const fixture = await render({ canRoll: true });
    const rolled = vi.fn();
    fixture.componentInstance.roll.subscribe(rolled);
    button(fixture).click();
    expect(rolled).toHaveBeenCalledTimes(1);
  });

  it('RF-008: deshabilitado no avisa de ninguna tirada', async () => {
    const fixture = await render({ canRoll: false });
    const rolled = vi.fn();
    fixture.componentInstance.roll.subscribe(rolled);
    button(fixture).click();
    expect(rolled).not.toHaveBeenCalled();
  });
});
