// Game actions: the single pure transition from a state and an action to a new state and events.

import { BoardPosition, Color, isValidRoll, LanePosition, TrackPosition } from './board';
import { GameState, PieceId, Result } from './game';
import { legalMoves } from './moves';

export type Action =
  | { readonly type: 'roll'; readonly player: Color; readonly value: number }
  | { readonly type: 'move'; readonly player: Color; readonly pieceId: PieceId };

export type ActionError =
  | 'game-over'
  | 'not-your-turn'
  | 'roll-pending'
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

function move(state: GameState, action: MoveAction): Result<ActionOutcome, ActionError> {
  void state;
  void action;
  return { ok: false, error: 'illegal-move' };
}

/** R-010: players are stored in turn order, so the next one follows, wrapping around. */
function nextPlayer(state: GameState): Color {
  const index = state.players.indexOf(state.turn);
  return state.players[(index + 1) % state.players.length];
}
