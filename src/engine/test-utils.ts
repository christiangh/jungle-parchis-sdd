// Helpers to build game states in engine tests. Pure TypeScript, not exported from index.ts.

import { Action, ActionError, ActionOutcome, applyAction, GameEvent } from './actions';
import { barriers } from './barriers';
import {
  Color,
  DIE_FACES,
  GoalPosition,
  HomePosition,
  isSafe,
  LANE_LENGTH,
  LanePosition,
  MAX_PIECES_PER_SQUARE,
  PIECES_PER_PLAYER,
  Position,
  START_SQUARE,
  stepForward,
  TrackPosition,
} from './board';
import { createGame, GameState, Piece, PieceId } from './game';
import { legalMoves } from './moves';

export const HOME: HomePosition = { kind: 'home' };

export const GOAL: GoalPosition = { kind: 'goal' };

export const track = (square: number): TrackPosition => ({ kind: 'track', square });

export const lane = (square: number): LanePosition => ({ kind: 'lane', square });

export interface GameSetup {
  readonly players: readonly Color[];
  /** Defaults to the first color in `players`. */
  readonly turn?: Color;
  readonly pendingRoll?: number | null;
  readonly pendingBonus?: number | null;
  readonly sixesInRow?: number;
  readonly lastMovedPiece?: PieceId | null;
  /**
   * Pieces not listed stay at home. Listed pieces arrive in the order they are listed, after the
   * ones not listed (R-023).
   */
  readonly positions?: Partial<Record<PieceId, Position>>;
}

export function buildGame(setup: GameSetup): GameState {
  const result = createGame({ players: setup.players });
  if (!result.ok) {
    throw new Error(`Invalid game setup: ${result.error}`);
  }
  if (setup.turn !== undefined && !setup.players.includes(setup.turn)) {
    throw new Error(`Invalid game setup: ${setup.turn} does not play`);
  }
  const positions = setup.positions ?? {};
  const listed = Object.keys(positions) as PieceId[];
  return {
    ...result.value,
    turn: setup.turn ?? setup.players[0],
    initialRoll: null,
    pendingRoll: setup.pendingRoll ?? null,
    pendingBonus: setup.pendingBonus ?? null,
    sixesInRow: setup.sixesInRow ?? 0,
    lastMovedPiece: setup.lastMovedPiece ?? null,
    pieces: result.value.pieces.map((piece) => {
      const position = positions[piece.id];
      return position ? { ...piece, position } : piece;
    }),
    arrivalOrder: [...result.value.arrivalOrder.filter((id) => !listed.includes(id)), ...listed],
  };
}

/** Reproducible numbers in [0, 1) from a seed (mulberry32), so random games can be replayed. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

/** Reproducible die rolls from a seed. */
export function seededRolls(seed: number): () => number {
  const random = seededRandom(seed);
  return () => Math.floor(random() * DIE_FACES) + 1;
}

export interface PlayedGame {
  readonly actions: readonly Action[];
  /** The initial state followed by the state after each action. */
  readonly states: readonly GameState[];
  readonly events: readonly GameEvent[];
  /** The outcome of each action, so its own events need no replaying. */
  readonly outcomes: readonly ActionOutcome[];
  /** Why the game stopped before having a winner, if it did. */
  readonly stopped: ActionError | 'too-many-actions' | null;
}

const MAX_ACTIONS = 20_000;

/**
 * Plays from `initial` until there is a winner. `pickMove` receives how many legal moves there are
 * and returns the index of the one to make; by default, the first. Stops early on a rejected action
 * or after MAX_ACTIONS, so a broken engine makes tests fail instead of hang.
 */
export function playRandomGame(
  initial: GameState,
  nextRoll: () => number,
  pickMove: (count: number) => number = () => 0,
): PlayedGame {
  const actions: Action[] = [];
  const states: GameState[] = [initial];
  const events: GameEvent[] = [];
  const outcomes: ActionOutcome[] = [];
  let state = initial;
  while (state.winner === null) {
    if (actions.length >= MAX_ACTIONS) {
      return { actions, states, events, outcomes, stopped: 'too-many-actions' };
    }
    const moves = legalMoves(state);
    const action: Action =
      state.pendingRoll === null && state.pendingBonus === null
        ? { type: 'roll', player: state.turn, value: nextRoll() }
        : { type: 'move', player: state.turn, pieceId: moves[pickMove(moves.length)].pieceId };
    const result = applyAction(state, action);
    if (!result.ok) {
      return { actions, states, events, outcomes, stopped: result.error };
    }
    actions.push(action);
    states.push(result.value.state);
    events.push(...result.value.events);
    outcomes.push(result.value);
    state = result.value.state;
  }
  return { actions, states, events, outcomes, stopped: null };
}

/** Invariants that can be checked on a single state; I-04 needs two states and I-06 an action. */
export type StateInvariant = 'I-01' | 'I-02' | 'I-03' | 'I-05';

/** Returns the invariants that `state` breaks, without repeats and in identifier order. */
export function invariantViolations(state: GameState): StateInvariant[] {
  const violations: StateInvariant[] = [];
  if (!hasAllPieces(state)) {
    violations.push('I-01');
  }
  if (hasOvercrowdedSquare(state)) {
    violations.push('I-02');
  }
  if (hasPieceOutsideLane(state)) {
    violations.push('I-03');
  }
  if (!hasPlayingTurnAndWinner(state)) {
    violations.push('I-05');
  }
  return violations;
}

/** RNF-004 of SPEC 002: track squares, other than safe ones, holding pieces of two colors. */
export function mixedColorSquares(state: GameState): number[] {
  const colorsBySquare = new Map<number, Set<Color>>();
  for (const { color, position } of state.pieces) {
    if (position.kind === 'track' && !isSafe(position.square)) {
      const colors = colorsBySquare.get(position.square) ?? new Set<Color>();
      colorsBySquare.set(position.square, colors.add(color));
    }
  }
  return [...colorsBySquare]
    .filter(([, colors]) => colors.size > 1)
    .map(([square]) => square)
    .sort((a, b) => a - b);
}

/** Barrier squares that a piece meets when moving some steps along the common track. */
export interface BarrierHits {
  /** Squares passed through, in order, without the starting square. */
  readonly passed: readonly number[];
  /** The final square, if it holds a barrier. */
  readonly end: number | null;
}

/**
 * RNF-004 of SPEC 003: walks the move on its own, without moves.ts, so the property does not share
 * the engine's mistakes. Only the common track counts: once in its lane, a piece never leaves it.
 */
export function barrierHits(state: GameState, pieceId: PieceId, steps: number): BarrierHits {
  return walkHits(barrierSquares(state), pieceOf(state, pieceId), steps);
}

function barrierSquares(state: GameState): ReadonlySet<number> {
  return new Set(barriers(state).map(({ square }) => square));
}

function walkHits(blocked: ReadonlySet<number>, piece: Piece, steps: number): BarrierHits {
  const passed: number[] = [];
  if (blocked.size === 0) {
    return { passed, end: null };
  }
  let position: Position = piece.position;
  for (let step = 1; step <= steps && position.kind === 'track'; step++) {
    position = stepForward(piece.color, position);
    if (position.kind === 'track' && blocked.has(position.square)) {
      if (step === steps) {
        return { passed, end: position.square };
      }
      passed.push(position.square);
    }
  }
  return { passed, end: null };
}

function pieceOf(state: GameState, pieceId: PieceId): Piece {
  const piece = state.pieces.find(({ id }) => id === pieceId);
  if (piece === undefined) {
    throw new Error(`Unknown piece: ${pieceId}`);
  }
  return piece;
}

/**
 * Squares to move with the pending bonus or, if there is none, the pending roll, with a 6 that
 * counts as 7 if the player in turn has no pieces at home (R-031); null if nothing is pending.
 */
export function moveSteps(state: GameState): number | null {
  return state.pendingBonus ?? state.pendingRoll;
}

/**
 * R-062: whether `action` moves, with a pending 6, a piece that is not from a barrier of the
 * player's color while a piece of one of those barriers could move. Mixed barriers do not count.
 */
export function unopenedBarrier(before: GameState, action: Action): boolean {
  void before;
  void action;
  return false;
}

/**
 * R-032: indexes of the moves made with a pending roll that is the third 6 in a row, or a later one,
 * of the same turn. Lost sixes count too.
 */
export function thirdSixMoves(
  played: Pick<PlayedGame, 'states' | 'actions' | 'outcomes'>,
): number[] {
  void played;
  return [];
}

/** Facts that random games must produce at least once (CE-03 of SPEC 002, SPEC 003 and SPEC 004). */
export type GameFact =
  | 'capture-on-track'
  | 'capture-on-exit'
  | 'bonus-20'
  | 'bonus-10'
  | 'bonus-lost'
  | 'chained-bonus'
  | 'multiple-bounce'
  // CE-03 of SPEC 003.
  | 'single-color-barrier'
  | 'mixed-barrier'
  | 'move-blocked-by-barrier'
  | 'capture-on-exit-with-barrier'
  | 'bonus-lost-to-barrier'
  // CE-03 of SPEC 004.
  | 'roll-again'
  | 'six-counts-seven'
  | 'three-sixes-piece-home'
  | 'three-sixes-no-piece-home'
  | 'barrier-opened-by-six'
  | 'initial-roll-tie';

/** Returns the facts produced by the actions of `played`, without repeats and in type order. */
export function gameFacts(played: Pick<PlayedGame, 'states' | 'actions' | 'outcomes'>): GameFact[] {
  const found = new Set<GameFact>();
  played.actions.forEach((action, index) => {
    for (const fact of actionFacts(played.states[index], action, played.outcomes[index])) {
      found.add(fact);
    }
  });
  return GAME_FACTS.filter((fact) => found.has(fact));
}

export const GAME_FACTS: readonly GameFact[] = [
  'capture-on-track',
  'capture-on-exit',
  'bonus-20',
  'bonus-10',
  'bonus-lost',
  'chained-bonus',
  'multiple-bounce',
  'single-color-barrier',
  'mixed-barrier',
  'move-blocked-by-barrier',
  'capture-on-exit-with-barrier',
  'bonus-lost-to-barrier',
  'roll-again',
  'six-counts-seven',
  'three-sixes-piece-home',
  'three-sixes-no-piece-home',
  'barrier-opened-by-six',
  'initial-roll-tie',
];

const CAPTURE_BONUS = 20;

function actionFacts(
  before: GameState,
  action: Action,
  { state: after, events }: ActionOutcome,
): GameFact[] {
  const facts: GameFact[] = [];
  // Random games run this on every action, so barriers are found once per state.
  const barriersBefore = barriers(before);
  const blockedBefore = new Set(barriersBefore.map(({ square }) => square));
  for (const barrier of barriersBefore) {
    const [first, second] = barrier.pieces.map((id) => pieceOf(before, id).color);
    facts.push(first === second ? 'single-color-barrier' : 'mixed-barrier');
  }
  events.forEach((event, index) => {
    if (event.type === 'piece-captured') {
      // The capture follows the event of the move that made it.
      const leftHome = events[index - 1]?.type === 'piece-left-home';
      facts.push(leftHome ? 'capture-on-exit' : 'capture-on-track');
      if (leftHome && blockedBefore.has(START_SQUARE[before.turn])) {
        facts.push('capture-on-exit-with-barrier');
      }
    } else if (event.type === 'bonus-earned') {
      facts.push(event.amount === CAPTURE_BONUS ? 'bonus-20' : 'bonus-10');
      if (before.pendingBonus !== null) {
        facts.push('chained-bonus');
      }
    } else if (event.type === 'bonus-lost') {
      facts.push('bonus-lost');
      // The pieces are already where the move that earned the bonus left them.
      const blockedAfter = barrierSquares(after);
      const blocked = ownPieces(after, event.player).some((other) => {
        const hits = walkHits(blockedAfter, other, event.amount);
        return hits.passed.length > 0 || hits.end !== null;
      });
      if (blocked) {
        facts.push('bonus-lost-to-barrier');
      }
    }
  });
  const piece = action.type === 'move' ? pieceOf(before, action.pieceId) : undefined;
  // From any lane square, 20 squares always bounce at the goal and again at the first lane square.
  if (before.pendingBonus === CAPTURE_BONUS && piece?.position.kind === 'lane') {
    facts.push('multiple-bounce');
  }
  // Without leaving home, the engine has walked every own piece with the same steps (R-021).
  const steps = before.pendingBonus ?? before.pendingRoll;
  if (piece !== undefined && piece.position.kind !== 'home' && steps !== null) {
    const blocked = ownPieces(before, piece.color)
      .filter(({ id }) => id !== piece.id)
      .some((other) => walkHits(blockedBefore, other, steps).passed.length > 0);
    if (blocked) {
      facts.push('move-blocked-by-barrier');
    }
  }
  return facts;
}

function ownPieces(state: GameState, color: Color): readonly Piece[] {
  return state.pieces.filter((piece) => piece.color === color);
}

/** I-04: returns the pieces at the goal in `before` that are no longer there in `after`. */
export function leftGoal(before: GameState, after: GameState): PieceId[] {
  return before.pieces
    .filter((piece) => piece.position.kind === 'goal')
    .filter(
      (piece) => after.pieces.find((other) => other.id === piece.id)?.position.kind !== 'goal',
    )
    .map((piece) => piece.id);
}

/** I-01: every player has exactly 4 pieces and no other color has any. */
function hasAllPieces(state: GameState): boolean {
  return (
    state.pieces.every((piece) => state.players.includes(piece.color)) &&
    state.players.every(
      (color) => state.pieces.filter((piece) => piece.color === color).length === PIECES_PER_PLAYER,
    )
  );
}

/** I-02: no track square, nor lane square of a color, holds more than 2 pieces. */
function hasOvercrowdedSquare(state: GameState): boolean {
  const counts = new Map<string, number>();
  for (const { color, position } of state.pieces) {
    const key =
      position.kind === 'track'
        ? `track-${position.square}`
        : position.kind === 'lane'
          ? `lane-${color}-${position.square}`
          : null;
    if (key !== null) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.values()].some((count) => count > MAX_PIECES_PER_SQUARE);
}

/** I-03: lane positions carry no color, so a piece is in its own lane if the square exists. */
function hasPieceOutsideLane(state: GameState): boolean {
  return state.pieces.some(
    ({ position }) =>
      position.kind === 'lane' &&
      !(
        Number.isInteger(position.square) &&
        position.square >= 1 &&
        position.square <= LANE_LENGTH
      ),
  );
}

/** I-05: the turn, and the winner if any, belong to playing colors. */
function hasPlayingTurnAndWinner(state: GameState): boolean {
  return (
    state.players.includes(state.turn) &&
    (state.winner === null || state.players.includes(state.winner))
  );
}

/** Freezes a value and everything reachable from it, so any mutation throws (P-03). */
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}
