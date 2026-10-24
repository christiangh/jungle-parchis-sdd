# Plan técnico — SPEC 004 — El seis y la tirada inicial

> **Spec:** `specs/004-seis-y-tirada-inicial/spec.md`
> **Rama:** `feat/spec-004-seis-y-tirada-inicial`
> **Fecha:** 2026-10-21

## PARTE-01: El seis

**Estado:** Hecha

### Enfoque

R-031 se resuelve en `moves.ts`: una función interna `rollSteps(state, roll)` devuelve 7 si la tirada es un 6 y el jugador en turno no tiene fichas en casa, y la tirada en otro caso; `legalMoves` la usa al avanzar con una tirada, así que barreras, ocupación, comer, pasillo, meta y rebote se aplican con las casillas reales sin tocarlos (RF-008). `pendingRoll` sigue guardando el valor del dado, de modo que el 6 sigue siendo un 6 para R-030 y R-032; los premios no pasan por `rollSteps`. R-030 y R-032 van en `actions.ts`, con dos campos nuevos en `GameState`: `sixesInRow`, que la tirada pone a `n + 1` con un 6 y a 0 con cualquier otro valor, y `lastMovedPiece`, que cada movimiento, de tirada o de premio, actualiza. Un único `passTurn` pone ambos a cero/`null` al cambiar el turno (RF-009, RF-011). Cuando una tirada termina de resolverse sin ganador ni premio pendiente (tras perderse, tras moverse o tras usar o perder el último premio), el turno se mantiene si `sixesInRow > 0`, con el evento `roll-again`; si no, pasa. El tercer 6 se intercepta en `roll` antes de calcular movimientos: devuelve a casa `lastMovedPiece` si está en el recorrido común, produce `three-sixes` y pasa el turno.

### Archivos

- `src/engine/game.ts`: campos `sixesInRow` y `lastMovedPiece` en `GameState`, inicializados en `createGame`.
- `src/engine/moves.ts`: `rollSteps` y su uso en `legalMoves` (R-031).
- `src/engine/actions.ts`: eventos `roll-again` y `three-sixes`; cuenta de seises, última ficha movida, repetición y tres seises en `roll` y `move`; `passTurn`.
- `src/engine/test-utils.ts`: `GameSetup` admite `sixesInRow` y `lastMovedPiece`.
- `src/engine/moves.spec.ts`: tests de R-031 y revisión de las filas de la tabla del spec que tratan de `legalMoves`.
- `src/engine/actions.spec.ts`: tests de R-030 y R-032 y revisión de la fila de R-011.

### Pasos

- [x] 1. Tests de R-031 en `moves.spec.ts`: HU-03 c1-c4 y revisión en su sitio de las filas de R-040, HU-06, R-070 y las tres de R-071 según la tabla del spec. Sin esqueleto: no cambia ninguna firma. Deben fallar HU-03 c1, c3 y c4 y las revisiones de R-040 y HU-06; HU-03 c2 y las de R-070 y R-071 (ficha pasada a casa) pasan ya y quedan como guarda.
- [x] 2. Implementar `rollSteps` en `moves.ts`; pasar `pnpm check`.
- [x] 3. Tests de R-030 y R-032 en `actions.spec.ts`: HU-02 c1-c5, HU-04 c1-c5, revisión en su sitio de la fila de R-011, 6 cuyo premio se pierde y 6 con premios encadenados. Esqueleto: campos `sixesInRow` y `lastMovedPiece` en `GameState` y `createGame`, `GameSetup` ampliado y tipos de evento nuevos, sin lógica. Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [x] 4. Implementar en `actions.ts` la repetición, la cuenta de seises, la última ficha movida y los tres seises; pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-03 c1 / RF-007 | 1, 2 | «R-031: sin fichas en casa, un 6 mueve 7 casillas» (fichas en 10, 30, 40 y meta) |
| HU-03 c2 / RF-007 | 1 | «R-031: con una ficha en casa, un 6 mueve 6 casillas» |
| HU-03 c3 / RF-008 | 1, 2 | «R-031, R-061: un 6 que vale 7 no termina en una barrera» (ficha en la 10, dos rojas en la 17) |
| HU-03 c4 / RF-008 | 1, 2 | «R-031, R-071: desde la segunda casilla del pasillo, un 6 que vale 7 rebota a la séptima» |
| RF-007 (meta cuenta fuera de casa) | 1, 2 | HU-03 c1 y revisión de HU-06: fichas en meta y ninguna en casa |
| RNF-003 / tabla del spec (6 filas de `legalMoves`) | 1, 2 | R-040 → «R-040, R-031: avanza siempre hacia delante las casillas de la tirada» (17 con el 6); HU-06 (27 con el 6); R-070 y tres de R-071 con una ficha de meta pasada a casa, nombres sin cambios |
| HU-02 c1 / RF-005 | 3, 4 | «R-030: con un 6 se mueve 6 y se vuelve a tirar», revisión en su sitio de «R-011: con un 6 se mueve 6 y el turno pasa…» (RNF-003): ficha en la 16, turno de amarillo, sin tirada pendiente, eventos con `roll-again` |
| HU-02 c2 / RF-005 | 3, 4 | «R-030: un 6 sin movimiento legal se pierde y se vuelve a tirar» (`roll-lost` y `roll-again`, sin `turn-changed`) |
| HU-02 c3 / RF-005 | 3, 4 | «R-030: un 6 que come vuelve a tirar después de usar el premio»: tirar con el premio pendiente se rechaza con `bonus-pending`; tras usarlo, turno de amarillo y `roll-again` |
| RF-005 (premio perdido) | 3, 4 | «R-030: un 6 cuyo premio se pierde vuelve a tirar» (`bonus-lost` y `roll-again`) |
| RF-005 (premios encadenados) | 3, 4 | «R-030, R-081: tras un 6 se usan todos los premios encadenados antes de repetir» |
| HU-02 c4 / RF-005 | 3, 4 | «R-090: un 6 que mete la cuarta ficha termina la partida sin repetir» (ficha en la primera casilla del pasillo, un 6 que vale 7) |
| HU-02 c5 / RF-006 | 3, 4 | «R-021: tras repetir por un 6, un 5 obliga a salir de casa» |
| HU-04 c1 / RF-010 | 3, 4 | «R-032: el tercer 6 devuelve a casa la última ficha movida y pasa el turno» (`three-sixes` con la ficha y `turn-changed`) |
| HU-04 c2 / RF-011 | 3, 4 | «R-032: la última ficha movida puede ser la de un premio» |
| HU-04 c3 / RF-010 | 3, 4 | «R-032: la última ficha movida en el pasillo o en meta no vuelve a casa» |
| HU-04 c4 / RF-011 | 3, 4 | «R-032: sin ficha movida en el turno, el tercer 6 solo pasa el turno» (`three-sixes` sin ficha) |
| HU-04 c5 / RF-009 | 3, 4 | «R-032: los seises seguidos se reinician con otro valor y al cambiar el turno» (6, 6, 4: turno pasa; `sixesInRow` y `lastMovedPiece` a cero en el siguiente turno) |
| RF-015 | 3, 4 | Eventos `roll-again` en los tests de HU-02 |
| RF-016 | 3, 4 | Eventos `three-sixes` en los tests de HU-04 |
| RNF-001 | 1-4 | Solo imports del motor (lint); «CE-04: ninguna acción modifica el estado recibido» sigue en verde con los campos nuevos |
| RNF-002 | 1, 3 | Nombres con R-030, R-031 y R-032; fallo visto antes de los pasos 2 y 4 |
| Hecho cuando | 4 | HU-02 a HU-04 en verde; filas de la tabla del spec que tratan del 6 revisadas; `pnpm check` en verde |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar cada paso de código y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** `pendingRoll` guarda el valor del dado y las casillas se calculan al pedir los movimientos. El 6 sigue siendo un 6 para R-030, R-032 y R-062, y las fichas en casa no cambian entre la tirada y el movimiento, así que da lo mismo calcularlo al tirar.
- **No:** guardar las casillas en el estado. Duplica información derivable.
- **Sí:** `sixesInRow` se pone a 0 con cualquier tirada que no sea 6. Así `sixesInRow > 0` indica que la tirada en curso es un 6 y basta para decidir la repetición tras resolver premios.
- **Sí:** el tercer 6 no produce `roll-lost`, solo `three-sixes` y `turn-changed`. No es una tirada sin movimientos, sino una penalización.
- **Sí:** las propiedades de SPEC 003 siguen calculando con el valor de la tirada hasta PARTE-04. Con un 6 que vale 7 recorren una casilla de menos: comprueban de menos, pero no dan falsos positivos, porque el motor nunca atraviesa la sexta casilla si es barrera.

## PARTE-02: Abrir barrera con un 6

**Estado:** Hecha

### Enfoque

R-062 se resuelve solo en `legalMoves`, en `moves.ts`. Tras la salida obligatoria, que con un 6 nunca aplica, se calculan los avances con las casillas de la tirada como hasta ahora. Si la tirada es un 6, se filtran a los de las fichas que están en barreras de un color del jugador en turno, obtenidas con `barriers(state)`. Si el filtro deja algún movimiento, esos son los legales; si no, siguen siéndolo todos los avances (RF-012). Las barreras mixtas no entran en el filtro porque sus fichas son de colores distintos, y los premios no pasan por esta rama porque `legalMoves` los resuelve antes (RF-013). Como el filtro trabaja sobre movimientos ya calculados, una ficha de la barrera que no puede moverse no cuenta, y una que abre una barrera para formar otra es legal. `actions.ts` no cambia: `move` ya rechaza con `illegal-move` lo que no está en `legalMoves`.

### Archivos

- `src/engine/moves.ts`: filtro de R-062 en `legalMoves`.
- `src/engine/moves.spec.ts`: tests de R-062.

### Pasos

- [x] 1. Tests de R-062 en `moves.spec.ts`: HU-05 c1-c6, barrera propia en la casilla de salida, 5 con barrera propia y otro valor con barrera propia. Sin esqueleto: no cambia ninguna firma. Deben fallar HU-05 c1, c5 y el de la casilla de salida; los demás pasan ya y quedan como guarda (con c4 no queda ninguna ficha fuera de las barreras, así que solo puede ser guarda).
- [x] 2. Implementar el filtro en `legalMoves`; pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-05 c1 / RF-012 | 1, 2 | «R-062: con un 6 solo se mueven las fichas de una barrera propia» (dos en la 20, una en la 40, una en casa) |
| HU-05 c2 / RF-012 | 1 | «R-062, R-061: si ninguna ficha de la barrera puede moverse, se mueve otra» (dos rojas en la 24) |
| HU-05 c3 / RF-013 | 1 | «R-062: una barrera mixta no obliga a abrirse» (amarilla y roja en la 12) |
| HU-05 c4 / RF-012 | 1 | «R-062: con dos barreras propias se mueve cualquier ficha de ambas» (20 y 40) |
| HU-05 c5 / RF-012 | 1, 2 | «R-062, R-031: sin fichas en casa, la barrera se abre moviendo 7» (dos en la 20, una en la 40, una en meta) |
| HU-05 c6 / RF-013 | 1 | «R-062, R-080: un premio no obliga a abrir la barrera» |
| Caso límite: salida | 1, 2 | «R-062: una barrera propia en la casilla de salida también se abre con un 6» |
| Caso límite: 5 | 1 | «R-062, R-021: con un 5 manda la salida obligatoria, no la barrera» |
| RF-012 (solo con 6) | 1 | «R-062: con otro valor una barrera propia no obliga a abrirse» |
| RNF-001 | 1, 2 | Solo imports del motor (lint) |
| RNF-002 | 1 | Nombres con R-062; fallo visto antes del paso 2 |
| Hecho cuando | 2 | HU-05 en verde; `pnpm check` en verde |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar el paso de código y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** filtrar los movimientos ya calculados. Que una ficha "pueda moverse" queda definido por las mismas reglas de avance, barreras y ocupación, sin duplicarlas.
- **No:** un evento o un error propio para la barrera obligada. El spec lo descarta: los movimientos legales ya lo reflejan.
- **No:** tests en `actions.spec.ts`. `move` valida contra `legalMoves`, que es donde vive la regla.

## PARTE-03: Tirada inicial

**Estado:** Hecha

### Enfoque

La fase de tirada inicial es un campo nuevo de `GameState`, `initialRoll: InitialRoll | null`, con los jugadores que siguen optando a empezar (`contenders`, en el orden de R-010) y los valores de la ronda en curso (`rolls`, en ese mismo orden). `createGame` deja de recibir `firstPlayer`: crea la partida con todos los participantes optando, sin tiradas, y con `turn` en el primero de ellos (RF-001). Durante la fase, `turn` es siempre el jugador al que le toca tirar en la ronda, así que I-05 se sigue cumpliendo y `applyAction` rechaza con `not-your-turn`, como hasta ahora, la acción de otro jugador o de un color que no participa. Tras esa comprobación, si hay fase de tirada inicial, `applyAction` la resuelve aparte: la tirada usa la misma acción `roll`, con su validación de 1 a 6 (`invalid-roll`), y cualquier movimiento se rechaza con un error nuevo, `initial-roll-pending` (RF-002). Cada tirada inicial produce `initial-roll`. Al completar la ronda, si el valor más alto es único, la fase termina (`initialRoll: null`), el turno pasa al ganador sin tirada pendiente y se produce `first-player` (RF-003, RF-004); si no, empieza una ronda solo con los empatados en el valor más alto, el turno pasa al primero de ellos y se produce `initial-roll-tie` con esos jugadores (RF-003, RF-014). La tirada inicial no mueve fichas ni toca los seises seguidos.

`buildGame` en `test-utils.ts` crea los estados a medida de los tests de reglas ya fuera de la fase (`initialRoll: null`), con el turno que indiquen; así los tests de SPEC 001 a SPEC 003 y los de propiedades no cambian en esta parte. Las partidas de propiedades desde la tirada inicial son de PARTE-04.

### Archivos

- `src/engine/game.ts`: tipo `InitialRoll`, campo `initialRoll` en `GameState`; `GameConfig` sin `firstPlayer` y `CreateGameError` sin `first-player-not-playing`; `createGame` en fase de tirada inicial.
- `src/engine/actions.ts`: error `initial-roll-pending`; eventos `initial-roll`, `initial-roll-tie` y `first-player`; resolución de la fase en `applyAction`.
- `src/engine/test-utils.ts`: `buildGame` sin `firstPlayer`, con `turn` e `initialRoll: null`.
- `src/engine/game.spec.ts`: revisión de las dos filas de creación de la tabla del spec, HU-01 c1 y creación sin jugador inicial en el resto.
- `src/engine/actions.spec.ts`: tests de R-010 de la fase de tirada inicial.

### Pasos

- [x] 1. Tests de R-010 en `game.spec.ts` y `actions.spec.ts`: HU-01 c1-c5, revisión en su sitio de las dos filas de creación de la tabla del spec, empate de todos, empate que no es el más alto, tirada inicial no válida y primer turno del ganador. Esqueleto: tipo `InitialRoll` y campo `initialRoll` (siempre `null`), `createGame` sin `firstPlayer` con `turn` en el primero en el orden de turno, `CreateGameError` sin `first-player-not-playing`, error y eventos nuevos sin lógica, y `buildGame` ajustado. El resto de tests de creación solo dejan de pasar `firstPlayer`. Ejecutar y comprobar que fallan en sus aserciones (P-07); quedan como guarda los que ya se cumplen con `not-your-turn` e `invalid-roll`.
- [x] 2. Implementar la fase en `createGame` y en `applyAction`; pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-01 c1 / RF-001 | 1, 2 | «R-010: una partida nueva empieza en fase de tirada inicial con todos optando y tira primero el primero en el orden de turno» (colores pasados como azul, rojo, amarillo; tira amarillo) |
| RNF-003 / tabla del spec (creación) | 1, 2 | «R-010: crea una partida de amarillo y rojo en fase de tirada inicial, empezando a tirar amarillo», revisión de «HU-01: crea una partida de amarillo y rojo con turno de amarillo» |
| RNF-003 / tabla del spec (creación) | 1 | «R-010: rechaza la tirada inicial de un color que no participa», revisión de «HU-01: rechaza un jugador inicial que no participa» (azul y verde; tirada de rojo rechazada con `not-your-turn`, estado congelado) |
| HU-01 c2 / RF-003, RF-004, RF-014 | 1, 2 | «R-010: empieza quien saca el valor más alto de la ronda» (3, 5, 2: turno de azul, sin fase ni tirada pendiente; eventos `initial-roll` y `first-player`) |
| HU-01 c3 / RF-003, RF-014 | 1, 2 | «R-010: los empatados en el valor más alto repiten en una nueva ronda» (6, 2, 6: amarillo y rojo optando, turno de amarillo; evento `initial-roll-tie`) |
| HU-01 c4 / RF-003 | 1, 2 | «R-010: en la nueva ronda solo cuentan las tiradas de los empatados» (después, 1 y 4: empieza rojo) |
| HU-01 c5 / RF-002 | 1, 2 | «R-010: en la tirada inicial solo se acepta la tirada del jugador al que le toca» (turno de azul: tirada de amarillo y de verde con `not-your-turn`, movimiento de azul con `initial-roll-pending`; estado congelado) |
| RF-002 (valor) | 1 | «R-002, R-010: una tirada inicial fuera de 1 a 6 se rechaza» (`invalid-roll`) |
| Caso límite: todos empatan | 1, 2 | «R-010: si empatan todos, repiten todos» |
| Caso límite: empate bajo | 1, 2 | «R-010: un empate que no es el valor más alto no cuenta» (2, 2, 5: empieza rojo) |
| RF-004 | 1, 2 | «R-010: quien gana la tirada inicial empieza su turno tirando, con las fichas en casa» (tras ganar azul, su 5 saca ficha) |
| CE-04 | 1 | `GameConfig` sin `firstPlayer`: ningún test puede crear una partida con jugador inicial (lo comprueba el compilador) |
| RNF-001 | 1, 2 | Solo imports del motor (lint); tests de rechazo con estado congelado (`deepFreeze`) |
| RNF-002 | 1 | Nombres con R-010; fallo visto antes del paso 2 |
| Hecho cuando | 2 | HU-01 en verde; filas de creación de la tabla del spec revisadas; `pnpm check` en verde |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar el paso de código y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** la tirada inicial usa la acción `roll`. La presentación envía lo mismo en ambos casos y `applyAction` sabe en qué fase está; una acción propia solo añadiría un rechazo más.
- **Sí:** durante la fase, `turn` es quien tira en la ronda. Reutiliza `not-your-turn` y mantiene I-05 sin casos especiales.
- **Sí:** error propio `initial-roll-pending` para mover en la fase. `no-pending-roll` diría que falta tirar, no que la partida aún no ha empezado.
- **No:** `turn-changed` durante la fase. Los eventos `initial-roll`, `initial-roll-tie` y `first-player` ya dicen quién tira y quién empieza.
- **Sí:** la fase vive en `actions.ts`, junto a `roll` y `move`. Separarla en otro archivo obligaría a mover los tipos de acción y evento para evitar una importación circular.
- **Sí:** `buildGame` crea estados fuera de la fase. Los tests de reglas parten de una partida ya empezada; la fase se prueba con `createGame` y `applyAction`.

## PARTE-04: Propiedades con el seis y la tirada inicial

**Estado:** Hecha

### Enfoque

El motor no cambia: esta parte solo amplía los tests de propiedades, como PARTE-02 de SPEC 003. Las partidas aleatorias ya juegan con el seis y con la barrera obligada desde PARTE-01 y PARTE-02, y `playRandomGame` ya sirve para la tirada inicial: sin tirada ni premio pendiente envía una tirada del jugador en turno, que durante la fase es quien tira en la ronda.

Partidas desde la tirada inicial: el test de CE-02 crea cada partida con `createGame` en lugar de `buildGame`, y el arbitrario deja de elegir jugador inicial (`firstPlayer`). La fase se juega con los mismos dados de la semilla.

Casillas reales: nueva ayuda `moveSteps(state)` en `test-utils.ts`, que devuelve las casillas del premio pendiente o, si no hay, de la tirada pendiente, con un 6 que vale 7 cuando el jugador en turno no tiene fichas en casa (R-031); sin nada pendiente, `null`. Calcula R-031 por su cuenta, sin `rollSteps` de `moves.ts`. Sustituye a `pendingBonus ?? pendingRoll` en la propiedad de RNF-004 de SPEC 003 y en el hecho de movimiento descartado, como anotó el plan de SPEC 003.

Dos propiedades nuevas, con ayudas propias en `test-utils.ts`:

- R-062, `unopenedBarrier(before, action)`: en una acción de mover con un 6 de tirada pendiente y sin premio, si el jugador en turno tiene barreras de su color con alguna ficha que pueda moverse, devuelve `true` cuando la ficha movida no es de una de ellas. "Puede moverse" se decide sin `moves.ts`: la ficha avanza las casillas reales con `stepForward`, `walkHits` no da barreras atravesadas ni de destino, y la casilla de destino del recorrido o del pasillo no tiene ya 2 fichas. Las barreras mixtas no cuentan (R-062).
- R-032, `thirdSixMoves(played)`: índices de las acciones de mover hechas con una tirada pendiente de 6 que es el tercer 6 seguido, o posterior, del mismo turno. La cuenta sube con cada tirada de 6, movida o perdida, y vuelve a cero con una tirada de otro valor y con los eventos `turn-changed` y `first-player`. Así no se confunden dos turnos seguidos del mismo jugador en una partida de 2 (riesgo de la sección 14 del spec).

`gameFacts` reconoce seis hechos nuevos de CE-03:

- Repetir tirada por 6: evento `roll-again`.
- 6 que vale 7: acción de mover con un 6 de tirada pendiente, sin premio y sin fichas del jugador en casa en el estado previo.
- Tres seises con ficha devuelta: evento `three-sixes` con `pieceId` no nulo.
- Tres seises sin ficha devuelta: evento `three-sixes` con `pieceId` nulo.
- Barrera abierta por un 6: acción de mover con un 6 de tirada pendiente, sin premio, de una ficha de una barrera de su color en el estado previo.
- Empate en la tirada inicial: evento `initial-roll-tie`.

### Archivos

- `src/engine/test-utils.ts`: `moveSteps`, `unopenedBarrier` y `thirdSixMoves`; los seis hechos nuevos en `GameFact`, `GAME_FACTS` y `gameFacts`; el hecho de movimiento descartado con `moveSteps`.
- `src/engine/test-utils.spec.ts`: tests de las tres ayudas y de los hechos nuevos, con escenarios de `buildGame` y `createGame`.
- `src/engine/invariants.spec.ts`: partidas desde `createGame`, sin `firstPlayer`; `moveSteps` en la propiedad de RNF-004 de SPEC 003; propiedades de R-062 y R-032; nombre del test con RNF-004 de este spec.

### Pasos

- [x] 1. Tests en `test-utils.spec.ts`. Esqueleto: `moveSteps` devuelve `pendingBonus ?? pendingRoll`, `unopenedBarrier` devuelve `false`, `thirdSixMoves` devuelve `[]`, y los hechos nuevos entran en `GameFact` y `GAME_FACTS` sin que `gameFacts` los produzca. Ejecutar y comprobar que fallan en sus aserciones (P-07); quedan como guarda los casos que ya cumple el esqueleto. El test de CE-03 de `invariants.spec.ts` también falla hasta el paso 2.
  - `moveSteps`: un 6 sin fichas en casa da 7; con fichas en casa, 6; las fichas en meta no cuentan como en casa; otro valor da su valor; un premio da su cantidad; sin nada pendiente, `null`.
  - `unopenedBarrier`: mover una ficha que no es de la barrera propia, pudiendo moverse alguna de ella, da `true`; mover una de la barrera, `false`; si ninguna ficha de la barrera puede moverse (barrera delante, destino con 2 fichas), `false`; una barrera mixta no cuenta; con otro valor o con un premio, `false`.
  - `thirdSixMoves`: detecta un movimiento con el tercer 6 seguido; no detecta dos seises seguidos; un 6 perdido cuenta; otro valor corta la cuenta; un cambio de turno también, incluso entre dos turnos del mismo jugador en una partida de 2.
  - `gameFacts`: un caso por hecho nuevo, y un 6 con fichas en casa, que no da el hecho de 6 que vale 7.
- [x] 2. Implementar `moveSteps`, `unopenedBarrier`, `thirdSixMoves` y los hechos nuevos de `gameFacts`, con `moveSteps` en el hecho de movimiento descartado. En `invariants.spec.ts`, crear las partidas con `createGame`, sin `firstPlayer`. Pasar `pnpm check`.
- [x] 3. Ampliar el test de CE-02 con `moveSteps` en la propiedad de RNF-004 de SPEC 003 y con las propiedades de R-062 y R-032 tras cada acción, y renombrarlo. Medir cuántas veces sale cada hecho nuevo en las 1000 partidas, cuántas se detienen por el límite de acciones y cuánto tarda. Pasar `pnpm check`. Medido en una ejecución: ninguna partida se detiene; los hechos nuevos salen en 1000 (repetir tirada), 1000 (6 que vale 7), 894 (barrera abierta por un 6), 531 (tres seises con ficha devuelta), 311 (tres seises sin ficha devuelta) y 231 (empate en la tirada inicial) de las 1000 partidas; jugarlas sin comprobar tarda unos 11 s, y `pnpm check` entero, 48 s.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| RNF-004 (casillas reales) | 1-3 | Tests de `moveSteps`; `moveSteps` en la propiedad de RNF-004 de SPEC 003 y en el hecho de movimiento descartado |
| RNF-004 (R-062) | 1-3 | Tests de `unopenedBarrier`; en el test de CE-02, `unopenedBarrier` es `false` en cada acción |
| RNF-004 (R-032) | 1-3 | Tests de `thirdSixMoves`; en el test de CE-02, `thirdSixMoves` es `[]` en cada partida |
| RNF-004 (tirada inicial) | 2, 3 | Partidas de 2, 3 y 4 jugadores desde `createGame` |
| RNF-004 / CE-02 | 3 | «CE-02, CE-03: 1000 partidas aleatorias de 2, 3 y 4 jugadores desde la tirada inicial cumplen I-01 a I-06 y RNF-004 de SPEC 002, SPEC 003 y SPEC 004 tras cada acción, y producen todos los hechos de CE-03» |
| CE-03 | 1-3 | Tests de los hechos nuevos de `gameFacts` y, en el test de CE-02, los 18 hechos producidos al menos una vez |
| CE-01 | — | Cubierto en PARTE-01 a PARTE-03; se comprueba al cerrar el spec |
| CE-04 | 2 | `invariants.spec.ts` deja de usar `firstPlayer`; ningún test crea una partida con jugador inicial |
| Riesgo: límite de acciones | 3 | `played.stopped` es `null` en las 1000 partidas |
| Hecho cuando | 3 | CE-01 a CE-04 cumplidos; `pnpm check` en verde |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar cada paso de código y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** `moveSteps` y la movilidad de `unopenedBarrier` se calculan por su cuenta, sin `moves.ts`. Si la propiedad usara el cálculo del motor, no detectaría sus errores. Usan `stepForward`, `barriers` y `walkHits`, que tienen sus propios tests.
- **Sí:** la movilidad de `unopenedBarrier` solo mira barreras y ocupación. Una ficha de barrera está en el recorrido común y avanza como mucho 7 casillas, así que no llega a rebotar; si no encuentra barrera ni un destino con 2 fichas, puede moverse, coma o no.
- **Sí:** la propiedad de R-032 cuenta los seises con las acciones y los eventos en lugar de leer `sixesInRow`. Leer el campo del motor lo comprobaría consigo mismo.
- **Sí:** los hechos nuevos se cuentan en las mismas 1000 partidas de CE-02, como en SPEC 002 y SPEC 003.
- **No:** un hecho propio de empate a 4 en la tirada inicial. CE-03 pide un empate, sin número de jugadores.
- **Sí:** si algún hecho no sale o alguna partida se detiene por el límite de acciones, se para y se consulta al usuario. Se ajusta la elección de movimientos, las tiradas o el límite, nunca la comprobación (riesgos de la sección 14 del spec).
