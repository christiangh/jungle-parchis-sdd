import { COLORS, Color } from '@engine';

/** Fewest teams a game can start with. */
export const MIN_TEAMS = 2;

/** Teams with `color` switched on or off, in the order of `COLORS`. */
export function toggleTeam(teams: readonly Color[], color: Color): readonly Color[] {
  const on = teams.includes(color);
  return COLORS.filter((team) => (team === color ? !on : teams.includes(team)));
}

/** Whether a game can start with these teams. */
export function canStart(teams: readonly Color[]): boolean {
  return teams.length >= MIN_TEAMS;
}

/** Status line shown above the start button. */
export function teamsStatus(teams: readonly Color[]): string {
  return canStart(teams) ? `${teams.length} equipos listos` : `Elige al menos ${MIN_TEAMS} equipos`;
}
