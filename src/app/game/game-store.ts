import { computed, Service, signal } from '@angular/core';
import { GameEvent, GameState, Move } from '@engine';

/** How long the dice spins before the roll is applied (RF-009, RNF-003). */
export const DICE_SPIN_MS = 0;

/** Face shown before the first roll (RF-007). */
export const INITIAL_FACE = 0;

/** Whether the player in turn has to roll: no roll or bonus to use and no winner (RF-008). */
export function waitsForRoll(state: GameState): boolean {
  void state;
  return false;
}

function newGame(): GameState {
  throw new Error('Not implemented');
}

/** Single store of the game: applies every action with the engine and exposes the result (RF-021). */
@Service()
export class GameStore {
  private readonly state$ = signal(newGame());

  readonly state = this.state$.asReadonly();
  /** Events of the last accepted action, in the order the engine produced them. */
  readonly lastEvents = signal<readonly GameEvent[]>([]).asReadonly();
  readonly legalMoves = computed<readonly Move[]>(() => []);
  /** Face of the last roll, shown from the moment the dice is touched (RF-007). */
  readonly face = signal(INITIAL_FACE).asReadonly();
  readonly rolling = signal(false).asReadonly();
  readonly canRoll = computed(() => false);

  /** Rolls the dice for the player in turn, also in the initial roll phase (RF-009, RF-011). */
  roll(): void {
    return;
  }
}
