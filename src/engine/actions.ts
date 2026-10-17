// Game actions: the single pure transition from a state and an action to a new state and events.

import { BoardPosition, Color, LanePosition, TrackPosition } from './board';
import { GameState, PieceId, Result } from './game';

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

export function applyAction(state: GameState, action: Action): Result<ActionOutcome, ActionError> {
  void state;
  void action;
  return { ok: false, error: 'game-over' };
}
