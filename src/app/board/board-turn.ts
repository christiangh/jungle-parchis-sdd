import { Color, COLORS, GameState, PieceId } from '@engine';

// Which home the board highlights and which pieces show their mascot's animation (RF-007).

/** Home of the team in turn, also during the initial roll, or `null` once there is a winner. */
export function homeInTurn(state: GameState): Color | null {
  return state.winner === null ? state.turn : null;
}

/** Homes of the teams that do not play, shown dimmed and still (SPEC 008 RF-009). */
export function inactiveHomes(state: GameState): ReadonlySet<Color> {
  return new Set(COLORS.filter((color) => !state.players.includes(color)));
}

/** Pieces of the team in turn that are at home: the only ones animated. */
export function animatedPieces(state: GameState): ReadonlySet<PieceId> {
  const home = homeInTurn(state);
  return new Set(
    state.pieces
      .filter((piece) => piece.color === home && piece.position.kind === 'home')
      .map((piece) => piece.id),
  );
}
