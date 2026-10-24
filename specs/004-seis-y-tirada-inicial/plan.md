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
