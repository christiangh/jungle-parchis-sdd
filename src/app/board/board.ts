import { Component } from '@angular/core';
import { boardDecor } from './board-decor';
import { goals, homes, laneSquares, rotation, trackSquares } from './board-geometry';
import {
  BLADE_STROKE,
  CANOPY_FILL,
  HOME_INSET,
  HOME_SIZE,
  SQUARE_LENGTH,
  SQUARE_WIDTH,
  TEAM_CANOPY_FILL,
  TEAM_DARK_FILL,
  TEAM_DARK_STROKE,
  TEAM_FILL,
} from './board.constants';
import { GoalView, HomeView, PlankView, SafeView } from './board.models';

const decor = boardDecor();

/** Jungle board drawn in SVG ("claro" variant of docs/design/tablero). */
@Component({
  selector: 'jp-board',
  templateUrl: './board.html',
  host: { class: 'block size-full' },
})
export class Board {
  protected readonly width = SQUARE_LENGTH;
  protected readonly height = SQUARE_WIDTH;
  protected readonly homeSize = HOME_SIZE;
  protected readonly homeInset = HOME_INSET;
  protected readonly decor = decor;
  protected readonly bladeStroke = BLADE_STROKE;
  protected readonly canopyFill = CANOPY_FILL;

  /** Heights of the board lines painted across each home. */
  protected readonly homeBoards = [1, 2, 3, 4, 5].map(
    (i) => HOME_INSET + (i * (HOME_SIZE - 2 * HOME_INSET)) / 6,
  );

  protected readonly planks: readonly PlankView[] = [
    ...trackSquares()
      .filter((s) => s.kind === 'plain')
      .map((s) => {
        const tint = decor.tints.get(s.number);
        return {
          key: `square-${s.number}`,
          square: s.number,
          lane: null,
          step: null,
          x: s.x,
          y: s.y,
          transform: rotation(s.rotation),
          fill: 'fill-[url(#jp-board-wood)]',
          edge: 'stroke-wood-edge',
          nail: 'fill-wood-edge',
          overlay: tint?.light ? 'fill-white' : 'fill-black',
          overlayOpacity: tint?.opacity ?? 0,
        };
      }),
    ...laneSquares().map((s) => ({
      key: `lane-${s.color}-${s.step}`,
      square: null,
      lane: s.color,
      step: s.step,
      x: s.x,
      y: s.y,
      transform: rotation(s.rotation),
      fill: TEAM_FILL[s.color],
      edge: 'stroke-black/30',
      nail: 'fill-black/40',
      overlay: 'fill-[url(#jp-board-grain)]',
      overlayOpacity: 1,
    })),
  ];

  protected readonly safes: readonly SafeView[] = trackSquares().flatMap((s) => {
    if (s.kind === 'plain') {
      return [];
    }
    const tones = s.color ? TEAM_CANOPY_FILL[s.color] : CANOPY_FILL;
    return [
      {
        square: s.number,
        kind: s.kind,
        color: s.color,
        x: s.x,
        y: s.y,
        transform: rotation(s.rotation),
        fill: s.color ? TEAM_DARK_FILL[s.color] : 'fill-canopy-dark',
        halo: s.color ? TEAM_DARK_STROKE[s.color] : 'stroke-canopy-dark',
        tufts: (decor.tufts.get(s.number) ?? []).map((t) => ({
          path: t.path,
          fill: tones[t.tone],
        })),
      },
    ];
  });

  protected readonly goals: readonly GoalView[] = goals().map((g) => ({
    ...g,
    transform: rotation(g.rotation),
    fill: TEAM_FILL[g.color],
  }));

  protected readonly homes: readonly HomeView[] = homes().map((h) => ({
    ...h,
    fill: TEAM_FILL[h.color],
  }));
}
