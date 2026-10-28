import { Color, COLORS, GameState, PieceId } from '@engine';

// Which home the board highlights and which pieces show their mascot's animation (RF-007).

/** Home of the team in turn, also during the initial roll, or `null` once there is a winner. */
export function homeInTurn(state: GameState): Color | null {
  // Skeleton until step 3: never the team in turn.
  return COLORS.find((color) => color !== state.turn) ?? null;
}

/** Pieces of the team in turn that are at home: the only ones animated. */
export function animatedPieces(state: GameState): ReadonlySet<PieceId> {
  // Skeleton until step 3: every piece.
  return new Set(state.pieces.map((piece) => piece.id));
}
