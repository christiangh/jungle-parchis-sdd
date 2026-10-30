import { computed, DOCUMENT, inject, Service, signal } from '@angular/core';
import {
  Action,
  applyAction,
  Color,
  COLORS,
  createGame,
  GameEvent,
  GameState,
  legalMoves,
  PieceId,
} from '@engine';
import { prefersReducedMotion } from '../shared/reduced-motion';
import { DiceRoller } from './dice-roller';

/** How long the dice spins before the roll is applied (RF-009, RNF-003). */
export const DICE_SPIN_MS = 500;

/** Face shown before the first roll (RF-007). */
export const INITIAL_FACE = 6;

/** Whether the player in turn has to roll: no roll or bonus to use and no winner (RF-008). */
export function waitsForRoll(state: GameState): boolean {
  return state.winner === null && state.pendingRoll === null && state.pendingBonus === null;
}

/** Screen in front: choosing the teams or playing the game (SPEC 008 RF-004). */
export type Screen = 'start' | 'game';

function newGame(players: readonly Color[] = COLORS): GameState {
  const game = createGame({ players });
  if (!game.ok) {
    throw new Error(game.error);
  }
  return game.value;
}

/** Single store of the game: applies every action with the engine and exposes the result (RF-021). */
@Service()
export class GameStore {
  private readonly roller = inject(DiceRoller);
  private readonly window = inject(DOCUMENT).defaultView;

  private readonly state$ = signal(newGame());
  private readonly lastEvents$ = signal<readonly GameEvent[]>([]);
  private readonly lastPlayer$ = signal<Color | null>(null);
  private readonly face$ = signal(INITIAL_FACE);
  private readonly rolling$ = signal(false);
  private readonly selected$ = signal<PieceId | null>(null);
  private readonly screen$ = signal<Screen>('game');

  /** Screen in front; the start screen shows the teams of `state` as the initial choice. */
  readonly screen = this.screen$.asReadonly();
  readonly state = this.state$.asReadonly();
  /** Events of the last accepted action, in the order the engine produced them. */
  readonly lastEvents = this.lastEvents$.asReadonly();
  /** Player of the last accepted action, or `null` before the first one (RF-011). */
  readonly lastPlayer = this.lastPlayer$.asReadonly();
  readonly legalMoves = computed(() => legalMoves(this.state$()));
  /** Face of the last roll, shown from the moment the dice is touched (RF-007). */
  readonly face = this.face$.asReadonly();
  readonly rolling = this.rolling$.asReadonly();
  readonly canRoll = computed(() => !this.rolling$() && waitsForRoll(this.state$()));
  /** Highlighted piece the player touched; it does not exist in the engine. */
  readonly selected = this.selected$.asReadonly();

  /**
   * Touch on a piece: selects it if it has a legal move, cancels the selection if it was
   * selected, and does nothing otherwise (RF-012, RF-016).
   */
  select(pieceId: PieceId): void {
    if (!this.legalMoves().some((move) => move.pieceId === pieceId)) {
      return;
    }
    this.selected$.update((selected) => (selected === pieceId ? null : pieceId));
  }

  cancel(): void {
    this.selected$.set(null);
  }

  /** Moves the selected piece, also with a single legal move or a bonus (RF-016, RF-017, RF-019). */
  confirm(): void {
    const pieceId = this.selected$();
    if (pieceId !== null) {
      this.apply({ type: 'move', player: this.state$().turn, pieceId });
    }
  }

  /** Rolls the dice for the player in turn, also in the initial roll phase (RF-009, RF-011). */
  roll(): void {
    if (!this.canRoll()) {
      return;
    }
    const previousFace = this.face$();
    const value = this.roller.roll();
    const action: Action = { type: 'roll', player: this.state$().turn, value };
    const apply = () => {
      this.rolling$.set(false);
      if (!this.apply(action)) {
        this.face$.set(previousFace);
      }
    };
    this.face$.set(value);
    if (prefersReducedMotion(this.window)) {
      apply();
      return;
    }
    this.rolling$.set(true);
    setTimeout(apply, DICE_SPIN_MS);
  }

  /** Starts another game with the same teams, from the initial roll (SPEC 008 RF-002). */
  restart(): void {
    this.state$.set(newGame(this.state$().players));
    this.lastEvents$.set([]);
    this.lastPlayer$.set(null);
    this.face$.set(INITIAL_FACE);
    this.rolling$.set(false);
    this.selected$.set(null);
  }

  /** Starts a game of `players`, from the initial roll, and shows it (SPEC 008 RF-007). */
  start(players: readonly Color[]): void {
    void players;
  }

  /** Goes back to the start screen, keeping the teams of the last game (SPEC 008 RF-008). */
  chooseTeams(): void {
    return;
  }

  /** Applies an action; a rejected one changes nothing (RF-022). */
  private apply(action: Action): boolean {
    const result = applyAction(this.state$(), action);
    if (!result.ok) {
      return false;
    }
    this.state$.set(result.value.state);
    this.lastEvents$.set(result.value.events);
    this.lastPlayer$.set(action.player);
    this.selected$.set(null);
    return true;
  }
}
