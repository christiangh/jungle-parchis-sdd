import { GameEvent } from '@engine';

/** Sentence of the last play line: every event of the last action, in order (RF-005, RF-006). */
export function lastPlay(events: readonly GameEvent[]): string {
  return events.length === 0 ? '' : 'TODO';
}
