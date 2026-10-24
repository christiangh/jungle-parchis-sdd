import { Component } from '@angular/core';
import { goals, homes, laneSquares, rotation, trackSquares } from './board-geometry';
import {
  HOME_INSET,
  HOME_SIZE,
  SQUARE_LENGTH,
  SQUARE_WIDTH,
  TEAM_DARK_FILL,
  TEAM_DARK_STROKE,
  TEAM_FILL,
} from './board.constants';
import { GoalView, HomeView, PlankView, SafeView } from './board.models';

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

  protected readonly planks: readonly PlankView[] = [
    ...trackSquares()
      .filter((s) => s.kind === 'plain')
      .map((s) => ({
        key: `square-${s.number}`,
        square: s.number,
        lane: null,
        step: null,
        x: s.x,
        y: s.y,
        transform: rotation(s.rotation),
        fill: 'fill-wood',
        edge: 'stroke-wood-edge',
        nail: 'fill-wood-edge',
      })),
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
    })),
  ];

  protected readonly safes: readonly SafeView[] = trackSquares().flatMap((s) =>
    s.kind === 'plain'
      ? []
      : [
          {
            square: s.number,
            kind: s.kind,
            color: s.color,
            x: s.x,
            y: s.y,
            transform: rotation(s.rotation),
            fill: s.color ? TEAM_DARK_FILL[s.color] : 'fill-canopy-dark',
            halo: s.color ? TEAM_DARK_STROKE[s.color] : 'stroke-canopy-dark',
          },
        ],
  );

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
