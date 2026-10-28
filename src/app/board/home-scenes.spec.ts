import { COLORS } from '@engine';
import { HOME_SIZE, homes } from './board-geometry';
import { homeScenes } from './home-scenes';

describe('homeScenes', () => {
  it('RF-006: cada casa tiene su escena, dentro de la casa', () => {
    const scenes = homeScenes();
    expect(scenes.map((s) => s.color)).toEqual(COLORS);
    for (const home of homes()) {
      const { scene } = scenes.find((s) => s.color === home.color)!;
      expect(scene.length, home.color).toBeGreaterThan(0);
      for (const shape of scene) {
        expect(shape.at.x, home.color).toBeGreaterThanOrEqual(home.x);
        expect(shape.at.x, home.color).toBeLessThanOrEqual(home.x + HOME_SIZE);
        expect(shape.at.y, home.color).toBeGreaterThanOrEqual(home.y);
        expect(shape.at.y, home.color).toBeLessThanOrEqual(home.y + HOME_SIZE);
        expect(shape.transform, home.color).toMatch(
          new RegExp(`^translate\\(${shape.at.x} ${shape.at.y}\\)`),
        );
      }
    }
  });

  it('RF-006: cada hueco tiene un decorado centrado en él', () => {
    const scenes = homeScenes();
    expect(scenes.map((s) => s.color)).toEqual(COLORS);
    for (const home of homes()) {
      const { slots } = scenes.find((s) => s.color === home.color)!;
      expect(
        slots.map((slot) => slot.center),
        home.color,
      ).toEqual(home.slots);
      for (const slot of slots) {
        expect(slot.shapes.length, home.color).toBeGreaterThan(0);
        expect(slot.transform, home.color).toMatch(
          new RegExp(`^translate\\(${slot.center.x} ${slot.center.y}\\)`),
        );
      }
    }
  });

  it('RF-006: cada casa se pinta con los colores de la escena de su equipo', () => {
    const scenes = homeScenes();
    expect(scenes.map((s) => s.color)).toEqual(COLORS);
    for (const { color, scene, slots } of scenes) {
      const paints = [...scene, ...slots.flatMap((slot) => slot.shapes)].map((s) => s.paint);
      expect(
        paints.some((paint) => paint.includes(`-home-${color}-`)),
        color,
      ).toBe(true);
      for (const other of COLORS.filter((c) => c !== color)) {
        expect(
          paints.some((paint) => paint.includes(`-home-${other}-`)),
          color,
        ).toBe(false);
      }
    }
  });

  it('RF-006: la geometría es la misma en cada llamada', () => {
    const scenes = homeScenes();
    expect(scenes).toHaveLength(COLORS.length);
    expect(homeScenes()).toEqual(scenes);
  });
});
