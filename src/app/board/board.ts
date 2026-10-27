import { Component, computed, input, output } from '@angular/core';
import { Color, GameState, Move, PieceId } from '@engine';
import { boardDecor } from './board-decor';
import {
  Goal,
  goals,
  Home,
  HOME_INSET,
  HOME_SIZE,
  homes,
  laneSquares,
  PIECE_RADIUS,
  Point,
  rotation,
  SQUARE_LENGTH,
  SQUARE_WIDTH,
  trackSquares,
} from './board-geometry';
import {
  BLADE_STROKE,
  CANOPY_FILL,
  TEAM_CANOPY_FILL,
  TEAM_DARK_FILL,
  TEAM_DARK_STROKE,
  TEAM_FILL,
} from './board-palette';
import { pieceName } from '../shared/piece-id';
import { Ghost, movePreview, PiecePreview } from './move-preview';

/** A wooden or painted plank: plain track squares and lane squares. */
export interface PlankView {
  readonly key: string;
  readonly square: number | null;
  readonly lane: Color | null;
  readonly step: number | null;
  readonly x: number;
  readonly y: number;
  readonly transform: string;
  readonly fill: string;
  readonly edge: string;
  readonly nail: string;
  /** Wash over the plank: a light or dark tint on wood, painted grain on lanes. */
  readonly overlay: string;
  readonly overlayOpacity: number;
}

export interface TuftView {
  readonly path: string;
  readonly fill: string;
}

/** Canopy of a safe square, painted in the team's dark tone on start squares. */
export interface SafeView {
  readonly square: number;
  readonly kind: 'safe' | 'start';
  readonly color: Color | null;
  readonly x: number;
  readonly y: number;
  readonly transform: string;
  readonly fill: string;
  readonly halo: string;
  readonly tufts: readonly TuftView[];
}

export interface GoalView extends Goal {
  readonly transform: string;
  readonly fill: string;
}

export interface HomeView extends Home {
  readonly fill: string;
}

/**
 * A piece: a disc of its colour with an ink border, on a white rim. Ink and white
 * are 14.5:1 apart, so one of them reaches 3:1 on any background (RNF-004).
 */
export interface PieceView extends PiecePreview {
  readonly fill: string;
  readonly rimRadius: number;
  readonly discRadius: number;
  readonly halo: boolean;
}

/** Translucent copy of the selected piece, with its badges and pair mark. */
export interface GhostView extends Ghost {
  readonly fill: string;
  /** Centre of the +20 or +10 badge, next to the ghost. */
  readonly badge: Point;
  /** SVG transform that lays the pair mark along the plank. */
  readonly pairTransform: string | null;
}

/** Transparent polygon over the board that selects a piece or confirms on the ghost. */
export interface TouchAreaView {
  readonly target: PieceId | 'ghost';
  readonly points: string;
  readonly label: string;
}

/** The selected piece grows by this much, still inside the width of its plank. */
const SELECTED_GROWTH = 3;

/** Offset of the ghost badges from its centre, up and to the right. */
const BADGE_OFFSET = 15;

const decor = boardDecor();

function pointsOf(polygon: readonly Point[]): string {
  return polygon.map((p) => `${p.x},${p.y}`).join(' ');
}

/** Jungle board drawn in SVG ("claro" variant of docs/design/tablero). */
@Component({
  selector: 'jp-board',
  templateUrl: './board.html',
  host: { class: 'relative block size-full' },
})
export class Board {
  readonly state = input.required<GameState>();
  /** Legal moves of the player in turn, from the engine. */
  readonly moves = input<readonly Move[]>([]);
  readonly selected = input<PieceId | null>(null);
  /** Touch on a highlighted piece. */
  readonly pieceTouch = output<PieceId>();
  /** Touch on the ghost of the selected piece. */
  readonly ghostTouch = output<void>();

  protected readonly width = SQUARE_LENGTH;
  protected readonly height = SQUARE_WIDTH;
  protected readonly homeSize = HOME_SIZE;
  protected readonly homeInset = HOME_INSET;
  protected readonly decor = decor;
  protected readonly bladeStroke = BLADE_STROKE;
  protected readonly canopyFill = CANOPY_FILL;
  protected readonly pieceRadius = PIECE_RADIUS;

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

  private readonly preview = computed(() =>
    movePreview(this.state(), this.moves(), this.selected()),
  );

  protected readonly pieces = computed<readonly PieceView[]>(() =>
    this.preview().pieces.map((p) => {
      const growth = p.mode === 'selected' ? SELECTED_GROWTH : 0;
      return {
        ...p,
        fill: TEAM_FILL[p.color],
        rimRadius: PIECE_RADIUS + growth,
        discRadius: PIECE_RADIUS - 4 + growth,
        halo: p.mode === 'highlighted' || p.mode === 'selected',
      };
    }),
  );

  protected readonly ghost = computed<GhostView | null>(() => {
    const ghost = this.preview().ghost;
    if (ghost === null) {
      return null;
    }
    const { pair } = ghost;
    return {
      ...ghost,
      fill: TEAM_FILL[ghost.color],
      badge: { x: ghost.center.x + BADGE_OFFSET, y: ghost.center.y - BADGE_OFFSET },
      pairTransform: pair
        ? `translate(${pair.center.x} ${pair.center.y}) rotate(${pair.rotation})`
        : null,
    };
  });

  protected readonly touchAreas = computed<readonly TouchAreaView[]>(() => {
    const { pieces, ghost } = this.preview();
    const areas: TouchAreaView[] = pieces.flatMap((p) =>
      p.touchArea === null
        ? []
        : [
            {
              target: p.id,
              points: pointsOf(p.touchArea),
              label: `Ficha ${pieceName(p.id)}`,
            },
          ],
    );
    if (ghost !== null) {
      areas.push({
        target: 'ghost',
        points: pointsOf(ghost.touchArea),
        label: `Mover la ficha ${pieceName(ghost.pieceId)} aquí`,
      });
    }
    return areas;
  });

  /** Touch, Enter or Space on a touch area; it does not reach the screen behind (RF-016). */
  protected activate(event: Event, target: PieceId | 'ghost'): void {
    event.stopPropagation();
    event.preventDefault();
    if (target === 'ghost') {
      this.ghostTouch.emit();
    } else {
      this.pieceTouch.emit(target);
    }
  }
}
