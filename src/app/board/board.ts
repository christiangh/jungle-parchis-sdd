import { Component, computed, input, output } from '@angular/core';
import { Color, GameState, Move, PieceId } from '@engine';
import { boardDecor } from './board-decor';
import {
  Goal,
  goals,
  Home,
  HOME_INSET,
  HOME_PIECE_RADIUS,
  HOME_SIZE,
  homeMedallions,
  homes,
  laneSquares,
  Medallion,
  MEDALLION_GLOW_RADIUS,
  MEDALLION_RADIUS,
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
  TEAM_STROKE,
} from './board-palette';
import { animatedPieces, homeInTurn } from './board-turn';
import { HomeScene, homeScenes, SceneShape, SlotDecor } from './home-scenes';
import { Mascot } from '../shared/mascot';
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

/** A home with its scene and the decoration under each slot (RF-006). */
export interface HomeView extends Home {
  readonly fill: string;
  readonly scene: readonly SceneShape[];
  readonly decor: readonly SlotDecor[];
}

/** A home's medallion: its team's mascot on the team's dark tone, with a border of its colour (RF-014). */
export interface MedallionView extends Medallion {
  readonly fill: string;
  readonly stroke: string;
  /** Moves the mascot, drawn around the origin, to the medallion's centre. */
  readonly transform: string;
}

/**
 * A mascot piece: its team's mascot on a disc of the team's dark tone, with a border of
 * the team's colour, on a white rim (RF-005).
 */
export interface PieceView extends PiecePreview {
  readonly fill: string;
  readonly stroke: string;
  readonly rimRadius: number;
  readonly discRadius: number;
  readonly mascotRadius: number;
  /** Moves the mascot, drawn around the origin, to the piece's centre. */
  readonly transform: string;
  readonly halo: boolean;
  readonly animated: boolean;
}

/** Translucent copy of the selected piece, with its badges and pair mark. */
export interface GhostView extends Ghost {
  readonly fill: string;
  readonly stroke: string;
  readonly mascotRadius: number;
  readonly transform: string;
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

/** Width of the white rim around the disc. */
const RIM_WIDTH = 4;

/** Width of the disc's border; the mascot fills the disc inside it. */
const BORDER_WIDTH = 3;

/** Shadow of a medallion out of turn. */
const MEDALLION_SHADOW_RADIUS = 54;

/** White ring of the medallion in turn; its pulse grows from the shadow's radius to the glow's. */
const MEDALLION_RING_RADIUS = 50;

function mascotRadius(discRadius: number): number {
  return discRadius - BORDER_WIDTH / 2;
}

function translation(center: Point): string {
  return `translate(${center.x} ${center.y})`;
}

/** Offset of the ghost badges from its centre, up and to the right. */
const BADGE_OFFSET = 15;

const decor = boardDecor();

const scenes = new Map<Color, HomeScene>(homeScenes().map((s) => [s.color, s]));

function pointsOf(polygon: readonly Point[]): string {
  return polygon.map((p) => `${p.x},${p.y}`).join(' ');
}

/** Jungle board drawn in SVG ("claro" variant of docs/design/tablero). */
@Component({
  selector: 'jp-board',
  imports: [Mascot],
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
  protected readonly ghostDiscRadius = PIECE_RADIUS - RIM_WIDTH;
  protected readonly borderWidth = BORDER_WIDTH;

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
    scene: scenes.get(h.color)!.scene,
    decor: scenes.get(h.color)!.slots,
  }));

  protected readonly medallions: readonly MedallionView[] = homeMedallions().map((m) => ({
    ...m,
    fill: TEAM_DARK_FILL[m.color],
    stroke: TEAM_STROKE[m.color],
    transform: translation(m.center),
  }));

  protected readonly medallionRadius = MEDALLION_RADIUS;
  protected readonly medallionMascotRadius = mascotRadius(MEDALLION_RADIUS);
  protected readonly medallionShadowRadius = MEDALLION_SHADOW_RADIUS;
  protected readonly medallionRingRadius = MEDALLION_RING_RADIUS;
  protected readonly medallionGlowRadius = MEDALLION_GLOW_RADIUS;

  /** Home highlighted for the team in turn; none once there is a winner (RF-007). */
  protected readonly homeTurn = computed(() => homeInTurn(this.state()));

  private readonly preview = computed(() =>
    movePreview(this.state(), this.moves(), this.selected()),
  );

  protected readonly pieces = computed<readonly PieceView[]>(() => {
    const state = this.state();
    const atHome = new Set(
      state.pieces.filter((piece) => piece.position.kind === 'home').map((piece) => piece.id),
    );
    const animated = animatedPieces(state);
    return this.preview().pieces.map((p) => {
      const growth = p.mode === 'selected' ? SELECTED_GROWTH : 0;
      const rimRadius = (atHome.has(p.id) ? HOME_PIECE_RADIUS : PIECE_RADIUS) + growth;
      const discRadius = rimRadius - RIM_WIDTH;
      return {
        ...p,
        fill: TEAM_DARK_FILL[p.color],
        stroke: TEAM_STROKE[p.color],
        rimRadius,
        discRadius,
        mascotRadius: mascotRadius(discRadius),
        transform: translation(p.center),
        halo: p.mode === 'highlighted' || p.mode === 'selected',
        animated: animated.has(p.id),
      };
    });
  });

  protected readonly ghost = computed<GhostView | null>(() => {
    const ghost = this.preview().ghost;
    if (ghost === null) {
      return null;
    }
    const { pair } = ghost;
    return {
      ...ghost,
      fill: TEAM_DARK_FILL[ghost.color],
      stroke: TEAM_STROKE[ghost.color],
      mascotRadius: mascotRadius(PIECE_RADIUS - RIM_WIDTH),
      transform: translation(ghost.center),
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
