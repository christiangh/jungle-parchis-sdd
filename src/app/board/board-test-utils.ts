// Helpers to build game states in board tests. Not used by the application.

import { Color, COLORS, createGame, GameState, PieceId, Position } from '@engine';

export function newGame(players: readonly Color[] = COLORS): GameState {
  const game = createGame({ players });
  if (!game.ok) {
    throw new Error(game.error);
  }
  return game.value;
}

export const NEW_GAME = newGame();

/** New game with the given pieces moved, in order of arrival: the last one arrived last. */
export function stateWith(moved: readonly (readonly [PieceId, Position])[]): GameState {
  const positions = new Map(moved);
  return {
    ...NEW_GAME,
    pieces: NEW_GAME.pieces.map((piece) => {
      const position = positions.get(piece.id);
      return position ? { ...piece, position } : piece;
    }),
    arrivalOrder: [
      ...NEW_GAME.arrivalOrder.filter((id) => !positions.has(id)),
      ...moved.map(([id]) => id),
    ],
  };
}

/** New game with the given pieces moved and `turn` waiting to move a roll of `roll`. */
export function rolled(
  moved: readonly (readonly [PieceId, Position])[],
  turn: Color,
  roll: number,
): GameState {
  return { ...stateWith(moved), initialRoll: null, turn, pendingRoll: roll };
}
