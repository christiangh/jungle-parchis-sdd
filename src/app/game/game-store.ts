import { computed, DOCUMENT, inject, Service, signal } from '@angular/core';
import {
  Action,
  applyAction,
  COLORS,
  createGame,
  GameEvent,
  GameState,
  legalMoves,
  PieceId,
} from '@engine';
import { DiceRoller } from './dice-roller';

/** How long the dice spins before the roll is applied (RF-009, RNF-003). */
export const DICE_SPIN_MS = 500;

/** Face shown before the first roll (RF-007). */
export const INITIAL_FACE = 6;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Whether the player in turn has to roll: no roll or bonus to use and no winner (RF-008). */
export function waitsForRoll(state: GameState): boolean {
  return state.winner === null && state.pendingRoll === null && state.pendingBonus === null;
}

function newGame(): GameState {
  const game = createGame({ players: COLORS });
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
  private readonly face$ = signal(INITIAL_FACE);
  private readonly rolling$ = signal(false);

  readonly state = this.state$.asReadonly();
  /** Events of the last accepted action, in the order the engine produced them. */
  readonly lastEvents = this.lastEvents$.asReadonly();
  readonly legalMoves = computed(() => legalMoves(this.state$()));
  /** Face of the last roll, shown from the moment the dice is touched (RF-007). */
  readonly face = this.face$.asReadonly();
  readonly rolling = this.rolling$.asReadonly();
  readonly canRoll = computed(() => !this.rolling$() && waitsForRoll(this.state$()));
  /** Highlighted piece the player touched; it does not exist in the engine. */
  readonly selected = signal<PieceId | null>(null).asReadonly();

  select(pieceId: PieceId): void {
    throw new Error(`Not implemented: ${pieceId}`);
  }

  cancel(): void {
    throw new Error('Not implemented');
  }

  confirm(): void {
    throw new Error('Not implemented');
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
    if (this.reducedMotion()) {
      apply();
      return;
    }
    this.rolling$.set(true);
    setTimeout(apply, DICE_SPIN_MS);
  }

  /** Applies an action; a rejected one changes nothing (RF-022). */
  private apply(action: Action): boolean {
    const result = applyAction(this.state$(), action);
    if (!result.ok) {
      return false;
    }
    this.state$.set(result.value.state);
    this.lastEvents$.set(result.value.events);
    return true;
  }

  private reducedMotion(): boolean {
    return this.window?.matchMedia?.(REDUCED_MOTION).matches ?? false;
  }
}
