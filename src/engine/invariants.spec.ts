import fc from 'fast-check';

import { Action, applyAction } from './actions';
import { COLORS, PIECES_PER_PLAYER } from './board';
import { PieceId } from './game';
import {
  buildGame,
  deepFreeze,
  invariantViolations,
  leftGoal,
  playRandomGame,
  seededRandom,
  seededRolls,
} from './test-utils';

const GAMES = 1000;

/** Playing 1000 full games takes around 10 s, well above the default 5 s. */
const TIMEOUT_MS = 60_000;

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
  firstPlayer: fc.nat(),
  rollSeed: fc.integer(),
  moveSeed: fc.integer(),
  afterEnd: fc.array(anyAction, { minLength: 1, maxLength: 5 }),
});

describe('invariantes', () => {
  it(
    `CE-02: ${GAMES} partidas aleatorias de 2, 3 y 4 jugadores cumplen I-01 a I-06 tras cada acción`,
    () => {
      fc.assert(
        fc.property(randomGame, ({ players, firstPlayer, rollSeed, moveSeed, afterEnd }) => {
          const initial = buildGame({ players, turn: players[firstPlayer % players.length] });
          const random = seededRandom(moveSeed);

          const played = playRandomGame(initial, seededRolls(rollSeed), (count) =>
            Math.floor(random() * count),
          );

          expect(played.stopped).toBeNull();
          for (const [step, state] of played.states.entries()) {
            expect(invariantViolations(state)).toEqual([]);
            if (step > 0) {
              expect(leftGoal(played.states[step - 1], state)).toEqual([]);
            }
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
    },
    TIMEOUT_MS,
  );
});
