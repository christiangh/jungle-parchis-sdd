# Plan técnico — SPEC 003 — Barreras

> **Spec:** `specs/003-barreras/spec.md`
> **Rama:** `feat/spec-003-barreras`
> **Fecha:** 2026-10-18

## PARTE-01: Reglas de barreras

**Estado:** Hecha

### Enfoque

Un módulo nuevo, `barriers.ts`, define qué es una barrera (R-060) y expone `barriers(state)`, la consulta que pide RF-007: cada casilla del recorrido común con barrera y las 2 fichas que la forman. La barrera se deduce de las fichas, no se guarda en el estado. `moves.ts` la usa para descartar los avances que atraviesan una barrera: `advance` pasa a devolver también las casillas por las que pasa, sin contar la de origen ni la de destino, y `advanceMove` descarta el movimiento si alguna es una casilla del recorrido común con barrera. Terminar en una barrera ya lo impide `hasRoom` (R-041), y la salida de casa tiene su propia comprobación (R-023), así que no cambian. Como tiradas y premios comparten `advanceMove`, las barreras se aplican igual a los dos, y un premio bloqueado se pierde con la lógica ya existente de `applyAction` (R-080). `actions.ts` no cambia.

### Archivos

- `src/engine/barriers.ts` (nuevo): tipo `Barrier` (`square` y `pieces`) y función `barriers(state)`.
- `src/engine/index.ts`: reexportar `barriers.ts` (P-02).
- `src/engine/moves.ts`: `advance` devuelve el destino y las casillas atravesadas; `advanceMove` descarta los que atraviesan una barrera. Se quita la mención provisional de RF-012 en el comentario de `advance`.
- `src/engine/barriers.spec.ts` (nuevo): tests de HU-05.
- `src/engine/moves.spec.ts`: reescritura del test de la tabla de la sección 7 del spec y tests nuevos de HU-01 a HU-04.
- `src/engine/actions.spec.ts`: tirada perdida y premio perdido por una barrera.

### Pasos

- [x] 1. Tests de `barriers` (HU-05 c1-c3 y barrera de un color en un seguro). Esqueleto: `barriers.ts` con el tipo `Barrier` y `barriers` devolviendo `[]`, reexportado en `index.ts`. Ejecutar y comprobar que fallan en sus aserciones (P-07); el de la casilla del pasillo pasa ya y queda como guarda.
- [x] 2. Implementar `barriers`; pasar `pnpm check`.
- [x] 3. Tests de `legalMoves` y `applyAction`: reescribir en su sitio el test de la tabla del spec y añadir HU-01 c2-c6, HU-02 c3, HU-03 c1-c3, HU-04 c1-c2 y el destino justo antes de una barrera. Sin esqueleto: no cambia ninguna firma pública. Los de atravesar deben fallar; los de terminar en una barrera, salir comiendo, pasillo y destino previo pasan ya y quedan como guarda.
- [x] 4. Implementar en `moves.ts` la prohibición de atravesar barreras y quitar la mención provisional de RF-012; pasar `pnpm check`, incluido el test de propiedades de SPEC 002.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-05 c1 / RF-001, RF-007 | 1, 2 | «R-060: dos fichas del mismo color en una casilla forman una barrera» (`barriers`, casilla 14) |
| HU-05 c2 / RF-001, RF-007 | 1, 2 | «R-060: dos fichas de distinto color en un seguro forman una barrera mixta» (casilla 12) |
| RF-001 | 1, 2 | «R-060: dos fichas del mismo color en un seguro forman una barrera» y «R-060: una sola ficha no forma barrera» |
| HU-05 c3 / RF-001 | 1, 2 | «R-063: dos fichas en la misma casilla del pasillo no forman barrera» |
| HU-01 c1 / RF-002 / RNF-003 / CE-04 | 3, 4 | «RF-012 (provisional): atraviesa una casilla con 2 fichas» reescrito en su sitio como «R-061: no atraviesa una barrera de otro color», sin movimientos legales |
| HU-01 c2 / RF-002, RF-004 | 3, 4 | «R-061: no atraviesa una barrera propia, pero sus fichas sí salen de ella» |
| HU-01 c3 / RF-002 | 3, 4 | «R-061: no atraviesa una barrera mixta en un seguro» |
| HU-01 c4 / RF-002 | 3, 4 | «R-061: una barrera en la casilla de entrada impide entrar en el pasillo» |
| HU-01 c5 / RF-003 | 3 | «R-042: no se termina en una barrera» |
| Caso límite: destino justo antes | 3 | «R-061: se puede terminar justo antes de una barrera» |
| HU-01 c6 / RF-002 | 3, 4 | «R-061: si la única tirada atraviesa una barrera, se pierde la tirada» (`applyAction`) |
| HU-02 c1 / RF-003 / CE-01 (R-023) | — | Ya cubierto por «R-023: con dos rivales del mismo color en la salida come la que llegó en último lugar» de SPEC 002, sin cambios |
| HU-02 c2 / RF-003 | — | Ya cubierto por «R-023: con una ficha propia y una rival en la salida, sale comiendo la rival» de SPEC 002, sin cambios |
| HU-02 c3 / RF-002 | 3, 4 | «R-061: no atraviesa la barrera mixta de una salida»; la salida comiendo la cubren los tests de R-023 de HU-02 c1 y c2 |
| HU-03 c1 / RF-006 | 3, 4 | «R-061: un movimiento de premio de 20 no atraviesa una barrera» |
| HU-03 c2 / RF-006 | 3, 4 | «R-080: un premio cuyo único movimiento atraviesa una barrera se pierde» (`applyAction`) |
| HU-03 c3 / RF-006 | 3, 4 | «R-061: un movimiento de premio de 10 no atraviesa una barrera» |
| HU-04 c1 / RF-005 | 3, 4 | «R-063: en el pasillo se adelanta a dos fichas propias» |
| HU-04 c2 / RF-005 | 3, 4 | «R-063: un rebote pasa por una casilla del pasillo con 2 fichas» |
| RNF-001 | 1-4 | `barriers.ts` solo importa del motor (lint); `barriers` y `legalMoves` no modifican el estado recibido, comprobado por «CE-04: ninguna acción modifica el estado recibido» y un test de `barriers` con `deepFreeze` |
| RNF-002 | 1, 3 | Nombres con R-042, R-060, R-061, R-063 y R-080; fallo visto antes de los pasos 2 y 4 |
| CE-01 / CE-04 / Hecho cuando | 4 | Tests anteriores en verde; `grep` sin «RF-012 (provisional)» en `src/`; `pnpm check` en verde |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar cada paso de código y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** módulo propio `barriers.ts` para la definición y la consulta. Es una regla del tablero con consulta pública propia, y `moves.ts` la reutiliza.
- **No:** definir las barreras dentro de `moves.ts`. Mezclaría la consulta de la presentación con el cálculo de movimientos.
- **Sí:** `Barrier` con `square` (número del recorrido común) y `pieces` (los 2 ids). El spec pide la casilla y las fichas; de las fichas salen los colores.
- **Sí:** `barriers` aplica R-060 literalmente: 2 fichas de colores distintos fuera de un seguro no son barrera. En una partida válida no ocurre, porque se come (R-050).
- **Sí:** las casillas atravesadas se calculan en `advance`, sin la de origen (RF-004) ni la de destino, que ya comprueba `hasRoom`. Solo cuentan las del recorrido común (R-063).
- **Sí:** los tests de HU-02 c1 y c2 no se duplican: los de SPEC 002 ya tienen esos escenarios con una barrera en la salida y cumplen CE-01 para R-023.
- **Sí:** en el cierre, el test de HU-02 c3 se renombra a «R-061: no atraviesa la barrera mixta de una salida», porque solo prueba el atravesar; salir comiendo ya lo prueban los tests de R-023. Decisión del usuario tras la revisión del diff.
- **Sí:** si al cerrar el paso 4 alguna partida aleatoria se detiene por el límite de acciones, se para y se consulta al usuario (riesgo del spec); no se toca la comprobación.

## PARTE-02: Propiedades con barreras

**Estado:** Hecha

### Enfoque

El motor no cambia: esta parte solo amplía los tests de propiedades, como PARTE-03 de SPEC 002. Las partidas aleatorias ya juegan con barreras desde PARTE-01. Se añade una ayuda en `test-utils.ts`, `barrierHits(state, pieceId, steps)`, que recorre por su cuenta el avance de una ficha del tablero y devuelve las casillas con barrera de `state` que atraviesa (`passed`, sin la de origen) y la de destino si tiene barrera (`end`, o `null`). Solo mira el recorrido común: en cuanto la ficha entra en su pasillo ya no vuelve a él (R-063). Usa `barriers` y `stepForward`, pero no `moves.ts`, que es lo que se comprueba.

La propiedad de RNF-004 se comprueba tras cada acción de mover una ficha que no sale de casa: con la tirada o el premio pendiente del estado previo, `barrierHits` no da ninguna casilla. La salida comiendo queda fuera porque la ficha sale de casa y se coloca en su salida sin atravesar nada.

`gameFacts` reconoce cinco hechos nuevos de CE-03:

- Barrera de un color y barrera mixta: `barriers` del estado previo a una acción tiene una barrera con fichas del mismo color o de colores distintos.
- Movimiento descartado por atravesar una barrera: en una acción de mover que no sale de casa, otra ficha del jugador en el recorrido común tiene `passed` no vacío con la misma tirada o premio. Al no salir de casa, el motor ha calculado los avances de todas sus fichas.
- Salida comiendo con barrera en la salida: salida comiendo con una barrera en la casilla de salida del jugador en el estado previo.
- Premio perdido por una barrera: `bonus-lost` y, en el estado tras la acción, alguna ficha del jugador en el recorrido común tiene `passed` no vacío o `end` con esa cantidad. Las fichas ya están colocadas tras el movimiento que ganó el premio; solo ha cambiado el turno.

### Archivos

- `src/engine/test-utils.ts`: `barrierHits` con el tipo `BarrierHits`, y los cinco hechos nuevos en `GameFact`, `GAME_FACTS` y `gameFacts`.
- `src/engine/test-utils.spec.ts`: tests de `barrierHits` y de los hechos nuevos con escenarios de `buildGame`.
- `src/engine/invariants.spec.ts`: el test de CE-02 comprueba la propiedad de RNF-004 de este spec, y su nombre lo dice.

### Pasos

- [x] 1. Tests de `barrierHits` (barrera de otro color, propia y mixta atravesadas; destino en una barrera; barrera en la casilla de origen, que no cuenta; barrera tras la casilla de entrada, que no cuenta; sin barreras) y de `gameFacts` (un caso por hecho nuevo y una salida comiendo sin barrera en la salida, que no da el hecho). Esqueleto: `barrierHits` devuelve `{ passed: [], end: null }` y los hechos nuevos entran en `GameFact` y `GAME_FACTS` sin que `gameFacts` los produzca. Ejecutar y comprobar que fallan en sus aserciones (P-07); el de CE-03 de `invariants.spec.ts` también falla hasta el paso 2.
- [x] 2. Implementar `barrierHits` y los hechos nuevos de `gameFacts`; pasar `pnpm check`.
- [x] 3. Ampliar el test de CE-02 con la propiedad de RNF-004 de este spec tras cada acción y renombrarlo; medir cuántas veces sale cada hecho en las 1000 partidas y cuántas se detienen por el límite de acciones; pasar `pnpm check`. Medido en una ejecución: ninguna partida se detiene; los hechos nuevos salen en 999 (barrera de un color), 793 (mixta), 834 (movimiento descartado), 120 (salida comiendo con barrera) y 108 (premio perdido por una barrera) de las 1000 partidas.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| RNF-004 (propiedad) | 1, 2 | Tests de `barrierHits` en `test-utils.spec.ts` |
| RNF-004 / CE-02 | 3 | «CE-02, CE-03: 1000 partidas aleatorias de 2, 3 y 4 jugadores cumplen I-01 a I-06, RNF-004 de SPEC 002 y RNF-004 de SPEC 003 tras cada acción, y producen todos los hechos de CE-03» |
| CE-03 | 1-3 | Tests de los hechos nuevos de `gameFacts` y, en el mismo test de CE-02, los 12 hechos producidos al menos una vez |
| Riesgo: límite de acciones | 3 | En el mismo test, `played.stopped` es `null` en las 1000 partidas |
| Hecho cuando | 3 | `pnpm check` en verde |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar cada paso y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** `barrierHits` recorre el avance por su cuenta en lugar de reutilizar `advance` de `moves.ts`. Si la propiedad usara el mismo cálculo que el motor, no detectaría sus errores. Usa `stepForward` y `barriers`, que tienen sus propios tests.
- **Sí:** `barrierHits` separa las casillas atravesadas del destino. El hecho de CE-03 habla de atravesar, y la propiedad de RNF-004 comprueba las dos cosas.
- **Sí:** los hechos nuevos se cuentan en las mismas 1000 partidas de CE-02, como en SPEC 002.
- **Sí:** el movimiento descartado se reconoce solo en acciones que no salen de casa. Con un 5 y fichas en casa, la salida obligatoria (R-021) impide calcular los avances, y no estarían descartados por la barrera.
- **Sí:** `playRandomGame` guarda el resultado de cada acción (`outcomes`) y `gameFacts` lo lee en lugar de repetir cada acción. Con los hechos nuevos, el test de CE-02 pasaba del límite de 60 s en una máquina cargada (entre 30 y 95 s según la ejecución). Con el cambio tarda unos 25 s, pero ha llegado a 77 s, así que el límite sube a 180 s. Subirlo no debilita ninguna aserción: se siguen jugando las 1000 partidas con las mismas comprobaciones.
- **Sí:** si algún hecho no sale o alguna partida se detiene por el límite de acciones, se para y se consulta al usuario; se ajusta la elección de movimientos o el límite, nunca la comprobación (riesgos de la sección 14 del spec).
