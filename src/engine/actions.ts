// Game actions: the single pure transition from a state and an action to a new state and events.

import { BoardPosition, Color, isValidRoll, LanePosition, TrackPosition } from './board';
import { GameState, Piece, PieceId, Result } from './game';
import { legalMoves, Move } from './moves';

const CAPTURE_BONUS = 20;

const GOAL_BONUS = 10;

const SIX = 6;

const MAX_SIXES_IN_ROW = 3;

export type Action =
  | { readonly type: 'roll'; readonly player: Color; readonly value: number }
  | { readonly type: 'move'; readonly player: Color; readonly pieceId: PieceId };

export type ActionError =
  | 'game-over'
  | 'not-your-turn'
  | 'roll-pending'
  | 'bonus-pending'
  | 'invalid-roll'
  | 'no-pending-roll'
  | 'illegal-move';

export type GameEvent =
  | { readonly type: 'piece-left-home'; readonly pieceId: PieceId; readonly to: TrackPosition }
  | {
      readonly type: 'piece-advanced';
      readonly pieceId: PieceId;
      readonly from: TrackPosition | LanePosition;
      readonly to: BoardPosition;
    }
  | { readonly type: 'piece-captured'; readonly pieceId: PieceId; readonly at: TrackPosition }
  | { readonly type: 'piece-reached-goal'; readonly pieceId: PieceId }
  | { readonly type: 'bonus-earned'; readonly player: Color; readonly amount: number }
  | { readonly type: 'bonus-lost'; readonly player: Color; readonly amount: number }
  | { readonly type: 'roll-lost'; readonly player: Color; readonly value: number }
  | { readonly type: 'roll-again'; readonly player: Color }
  | { readonly type: 'three-sixes'; readonly player: Color; readonly pieceId: PieceId | null }
  | { readonly type: 'turn-changed'; readonly player: Color }
  | { readonly type: 'game-over'; readonly winner: Color };

export interface ActionOutcome {
  readonly state: GameState;
  readonly events: readonly GameEvent[];
}

type RollAction = Extract<Action, { type: 'roll' }>;

type MoveAction = Extract<Action, { type: 'move' }>;

export function applyAction(state: GameState, action: Action): Result<ActionOutcome, ActionError> {
  // I-06: a finished game accepts no actions.
  if (state.winner !== null) {
    return { ok: false, error: 'game-over' };
  }
  if (action.player !== state.turn) {
    return { ok: false, error: 'not-your-turn' };
  }
  return action.type === 'roll' ? roll(state, action) : move(state, action);
}

/**
 * R-011, R-012: a roll stays pending if it has legal moves; otherwise it is lost.
 * R-032: the third 6 in a row is not played.
 */
function roll(state: GameState, action: RollAction): Result<ActionOutcome, ActionError> {
  // R-051, R-072: a bonus is used before the next roll.
  if (state.pendingBonus !== null) {
    return { ok: false, error: 'bonus-pending' };
  }
  if (state.pendingRoll !== null) {
    return { ok: false, error: 'roll-pending' };
  }
  if (!isValidRoll(action.value)) {
    return { ok: false, error: 'invalid-roll' };
  }
  const sixesInRow = action.value === SIX ? state.sixesInRow + 1 : 0;
  if (sixesInRow === MAX_SIXES_IN_ROW) {
    return { ok: true, value: threeSixes(state) };
  }
  const rolled: GameState = { ...state, pendingRoll: action.value, sixesInRow };
  if (legalMoves(rolled).length > 0) {
    return { ok: true, value: { state: rolled, events: [] } };
  }
  const events: GameEvent[] = [{ type: 'roll-lost', player: state.turn, value: action.value }];
  return { ok: true, value: endRoll({ ...rolled, pendingRoll: null }, events) };
}

/**
 * R-032: the last piece moved in the turn goes home unless it is in its lane or at the goal, and
 * the turn ends.
 */
function threeSixes(state: GameState): ActionOutcome {
  const last = state.pieces.find((piece) => piece.id === state.lastMovedPiece);
  const sentHome = last?.position.kind === 'track' ? last.id : null;
  const pieces = state.pieces.map((piece): Piece =>
    piece.id === sentHome ? { ...piece, position: { kind: 'home' } } : piece,
  );
  const events: GameEvent[] = [{ type: 'three-sixes', player: state.turn, pieceId: sentHome }];
  return passTurn({ ...state, pieces }, events);
}

/**
 * R-030: once a roll and all its bonuses are resolved, a 6 rolls again (R-051, R-072, R-081);
 * any other value passes the turn.
 */
function endRoll(state: GameState, events: GameEvent[]): ActionOutcome {
  if (state.sixesInRow > 0) {
    events.push({ type: 'roll-again', player: state.turn });
    return { state, events };
  }
  return passTurn(state, events);
}

/** R-010: the next player starts the turn with no sixes in a row nor last moved piece (R-032). */
function passTurn(state: GameState, events: GameEvent[]): ActionOutcome {
  const next = nextPlayer(state);
  events.push({ type: 'turn-changed', player: next });
  return { state: { ...state, turn: next, sixesInRow: 0, lastMovedPiece: null }, events };
}

/**
 * R-013, R-090: applies one legal move with the pending roll or bonus, then ends the game, keeps
 * the turn for a new bonus (R-051, R-072, R-081) or ends the roll (R-030).
 */
function move(state: GameState, action: MoveAction): Result<ActionOutcome, ActionError> {
  if (state.pendingRoll === null && state.pendingBonus === null) {
    return { ok: false, error: 'no-pending-roll' };
  }
  const legal = legalMoves(state).find((candidate) => candidate.pieceId === action.pieceId);
  const piece = state.pieces.find((candidate) => candidate.id === action.pieceId);
  if (!legal || !piece) {
    return { ok: false, error: 'illegal-move' };
  }

  // R-023, R-050: a captured piece goes back home.
  const pieces = state.pieces.map((current): Piece => {
    if (current.id === piece.id) {
      return { ...current, position: legal.to };
    }
    return current.id === legal.captures ? { ...current, position: { kind: 'home' } } : current;
  });
  const events: GameEvent[] = [moveEvent(piece, legal.to)];
  // Captures only happen on the track (R-023, R-050).
  if (legal.captures && legal.to.kind === 'track') {
    events.push({ type: 'piece-captured', pieceId: legal.captures, at: legal.to });
  }
  if (legal.to.kind === 'goal') {
    events.push({ type: 'piece-reached-goal', pieceId: piece.id });
  }
  const arrivalOrder = [...state.arrivalOrder.filter((id) => id !== piece.id), piece.id];
  const moved: GameState = {
    ...state,
    pieces,
    pendingRoll: null,
    pendingBonus: null,
    arrivalOrder,
    lastMovedPiece: piece.id,
  };

  if (hasWon(pieces, state.turn)) {
    events.push({ type: 'game-over', winner: state.turn });
    return { ok: true, value: { state: { ...moved, winner: state.turn }, events } };
  }
  const bonus = earnedBonus(legal);
  if (bonus !== null) {
    events.push({ type: 'bonus-earned', player: state.turn, amount: bonus });
    const rewarded: GameState = { ...moved, pendingBonus: bonus };
    if (legalMoves(rewarded).length > 0) {
      return { ok: true, value: { state: rewarded, events } };
    }
    // R-080: a bonus no piece can use is lost.
    events.push({ type: 'bonus-lost', player: state.turn, amount: bonus });
  }
  return { ok: true, value: endRoll(moved, events) };
}

/** R-051: capturing counts 20. R-072: reaching the goal counts 10, not bouncing past it (R-071). */
function earnedBonus(move: Move): number | null {
  if (move.captures) {
    return CAPTURE_BONUS;
  }
  return move.to.kind === 'goal' ? GOAL_BONUS : null;
}

function moveEvent(piece: Piece, to: BoardPosition): GameEvent {
  const from = piece.position;
  if (from.kind === 'track' || from.kind === 'lane') {
    return { type: 'piece-advanced', pieceId: piece.id, from, to };
  }
  // Only pieces at home or on the board have legal moves, and leaving home lands on the track.
  if (from.kind !== 'home' || to.kind !== 'track') {
    throw new Error(`Unexpected move of ${piece.id}`);
  }
  return { type: 'piece-left-home', pieceId: piece.id, to };
}

/** R-090: a player wins with all their pieces at the goal. */
function hasWon(pieces: readonly Piece[], color: Color): boolean {
  return pieces
    .filter((piece) => piece.color === color)
    .every((piece) => piece.position.kind === 'goal');
}

/** R-010: players are stored in turn order, so the next one follows, wrapping around. */
function nextPlayer(state: GameState): Color {
  const index = state.players.indexOf(state.turn);
  return state.players[(index + 1) % state.players.length];
}
