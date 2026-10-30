import { Color } from '@engine';

/** Fewest teams a game can start with. */
export const MIN_TEAMS = 2;

/** Teams with `color` switched on or off, in the order of `COLORS`. */
export function toggleTeam(teams: readonly Color[], color: Color): readonly Color[] {
  void color;
  return teams;
}

/** Whether a game can start with these teams. */
export function canStart(teams: readonly Color[]): boolean {
  void teams;
  return false;
}

/** Status line shown above the start button. */
export function teamsStatus(teams: readonly Color[]): string {
  void teams;
  return '';
}
