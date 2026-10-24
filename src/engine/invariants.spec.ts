import fc from 'fast-check';

import { Action, applyAction } from './actions';
import { COLORS, PIECES_PER_PLAYER } from './board';
import { createGame, PieceId } from './game';
import {
  barrierHits,
  deepFreeze,
  GAME_FACTS,
  GameFact,
  gameFacts,
  invariantViolations,
  leftGoal,
  mixedColorSquares,
  moveSteps,
  playRandomGame,
  seededRandom,
  seededRolls,
  thirdSixMoves,
  unopenedBarrier,
} from './test-utils';

const GAMES = 1000;

/**
 * Playing and checking 1000 full games takes around 25 s, but has gone over 75 s on a busy
 * machine, well above the default 5 s.
 */
const TIMEOUT_MS = 180_000;

const pieceIds: PieceId[] = COLORS.flatMap((color) =>
  Array.from({ length: PIECES_PER_PLAYER }, (_, index) => `${color}-${index}` as PieceId),
);

const anyAction: fc.Arbitrary<Action> = fc.oneof(
  fc.record({
    type: fc.constant('roll' as const),
    player: fc.constantFrom(...COLORS),
    value: fc.integer(),
  }),
  fc.record({
    type: fc.constant('move' as const),
    player: fc.constantFrom(...COLORS),
    pieceId: fc.constantFrom(...pieceIds),
  }),
);

const randomGame = fc.record({
  players: fc.shuffledSubarray([...COLORS], { minLength: 2 }),
  rollSeed: fc.integer(),
  moveSeed: fc.integer(),
  afterEnd: fc.array(anyAction, { minLength: 1, maxLength: 5 }),
});

describe('invariantes', () => {
  it(
    `CE-02, CE-03: ${GAMES} partidas aleatorias de 2, 3 y 4 jugadores desde la tirada inicial cumplen I-01 a I-06 y RNF-004 de SPEC 002, SPEC 003 y SPEC 004 tras cada acción, y producen todos los hechos de CE-03`,
    () => {
      const facts = new Set<GameFact>();
      fc.assert(
        fc.property(randomGame, ({ players, rollSeed, moveSeed, afterEnd }) => {
          const created = createGame({ players });
          if (!created.ok) {
            throw new Error(`Invalid players: ${created.error}`);
          }
          const random = seededRandom(moveSeed);

          // The initial roll phase is played with the same dice (R-010).
          const played = playRandomGame(created.value, seededRolls(rollSeed), (count) =>
            Math.floor(random() * count),
          );

          expect(played.stopped).toBeNull();
          for (const [step, state] of played.states.entries()) {
            expect(invariantViolations(state)).toEqual([]);
            // RNF-004 of SPEC 002: captures always apply, so two colors only share a safe square.
            expect(mixedColorSquares(state)).toEqual([]);
            // A pending bonus must be used before rolling again (R-051, R-072).
            expect(state.pendingRoll !== null && state.pendingBonus !== null).toBe(false);
            if (step > 0) {
              expect(leftGoal(played.states[step - 1], state)).toEqual([]);
            }
          }
          // RNF-004 of SPEC 003: no move passes through or ends on a barrier (R-042, R-061).
          // Leaving home is left out: the piece is placed on its start square without walking.
          for (const [index, action] of played.actions.entries()) {
            const before = played.states[index];
            const piece = before.pieces.find(
              ({ id }) => action.type === 'move' && id === action.pieceId,
            );
            const steps = moveSteps(before);
            if (piece !== undefined && piece.position.kind !== 'home' && steps !== null) {
              expect(barrierHits(before, piece.id, steps)).toEqual({ passed: [], end: null });
            }
            // RNF-004 of SPEC 004: a 6 moves a piece of an own barrier when one can move (R-062).
            expect(unopenedBarrier(before, action)).toBe(false);
          }
          // RNF-004 of SPEC 004: no piece moves with a third 6 in a row (R-032).
          expect(thirdSixMoves(played)).toEqual([]);
          for (const fact of gameFacts(played)) {
            facts.add(fact);
          }

          // I-06: once the game is over, every action is rejected and the state does not change.
          const finished = played.states[played.states.length - 1];
          const snapshot = structuredClone(finished);
          for (const action of afterEnd) {
            expect(applyAction(deepFreeze(finished), action)).toEqual({
              ok: false,
              error: 'game-over',
            });
          }
          expect(finished).toEqual(snapshot);
        }),
        { numRuns: GAMES },
      );

      // CE-03: every fact happened in at least one game.
      expect(GAME_FACTS.filter((fact) => !facts.has(fact))).toEqual([]);
    },
    TIMEOUT_MS,
  );
});
