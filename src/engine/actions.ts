// Game actions: the single pure transition from a state and an action to a new state and events.

import { BoardPosition, Color, isValidRoll, LanePosition, TrackPosition } from './board';
import { GameState, Piece, PieceId, Result } from './game';
import { legalMoves } from './moves';

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
  | { readonly type: 'roll-lost'; readonly player: Color; readonly value: number }
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

/** R-011, R-012: a roll stays pending if it has legal moves; otherwise it is lost. */
function roll(state: GameState, action: RollAction): Result<ActionOutcome, ActionError> {
  if (state.pendingRoll !== null) {
    return { ok: false, error: 'roll-pending' };
  }
  if (!isValidRoll(action.value)) {
    return { ok: false, error: 'invalid-roll' };
  }
  const rolled: GameState = { ...state, pendingRoll: action.value };
  if (legalMoves(rolled).length > 0) {
    return { ok: true, value: { state: rolled, events: [] } };
  }
  const next = nextPlayer(state);
  return {
    ok: true,
    value: {
      state: { ...state, turn: next },
      events: [
        { type: 'roll-lost', player: state.turn, value: action.value },
        { type: 'turn-changed', player: next },
      ],
    },
  };
}

/** R-013, R-090: applies one legal move, then passes the turn or ends the game. */
function move(state: GameState, action: MoveAction): Result<ActionOutcome, ActionError> {
  if (state.pendingRoll === null) {
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
  const moved: GameState = { ...state, pieces, pendingRoll: null, arrivalOrder };

  if (hasWon(pieces, state.turn)) {
    events.push({ type: 'game-over', winner: state.turn });
    return { ok: true, value: { state: { ...moved, winner: state.turn }, events } };
  }
  const next = nextPlayer(state);
  events.push({ type: 'turn-changed', player: next });
  return { ok: true, value: { state: { ...moved, turn: next }, events } };
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
