# Plan técnico — SPEC 002 — Comer y premios

> **Spec:** `specs/002-comer-y-premios/spec.md`
> **Rama:** `feat/spec-002-comer-y-premios`
> **Fecha:** 2026-10-18

## PARTE-01: Comer

**Estado:** Hecha

### Enfoque

El cálculo de movimientos legales (`moves.ts`) decide si un movimiento come y a quién, y lo indica en el propio `Move` con un campo opcional `captures`. Así la presentación sabe antes de mover qué ficha se comerá, y `applyAction` (`actions.ts`) solo aplica lo que ya viene decidido: devuelve la ficha comida a casa y emite `piece-captured`. La salida deja de bloquearse por fichas rivales: solo la bloquean 2 fichas propias (R-022), y si hay rivales la ficha sale comiendo (R-023), aunque la casilla tenga ya 2 fichas. Para saber qué rival llegó en último lugar, `GameState` guarda `arrivalOrder`, los ids de todas las fichas ordenados por su último movimiento; se guarda en el estado y no en cada ficha para no cambiar la forma de `Piece`, que comparan tests de SPEC 001 ajenos a la tabla del spec. Esta parte no da premios: después de comer, el turno pasa como hasta ahora.

### Archivos

- `src/engine/game.ts`: campo `arrivalOrder` en `GameState`, inicializado en `createGame` con el orden de `pieces`.
- `src/engine/moves.ts`: campo opcional `captures` en `Move`; salida bloqueada solo por 2 fichas propias; salida comiendo a la rival llegada en último lugar; avance que termina fuera de seguro sobre una sola rival la come. Se quita la mención provisional de RF-013 y RF-008 en los comentarios.
- `src/engine/actions.ts`: evento `piece-captured`; aplicar la comida (la ficha comida vuelve a casa) y mover la ficha movida al final de `arrivalOrder`.
- `src/engine/test-utils.ts`: `buildGame` ordena `arrivalOrder` según el orden de las claves de `positions` (la primera clave llegó antes) y deja después las fichas no listadas.
- `src/engine/game.spec.ts`, `src/engine/test-utils.spec.ts`: tests de `arrivalOrder`.
- `src/engine/moves.spec.ts`: reescritura de los 3 tests de la tabla de la sección 7 del spec y tests nuevos de HU-01 y HU-02.
- `src/engine/actions.spec.ts`: tests de aplicar la comida, del evento y del orden de llegada tras mover.

`index.ts` no cambia: ya reexporta `game.ts`, `moves.ts` y `actions.ts`.

### Pasos

- [x] 1. Tests de `arrivalOrder`: estado inicial de `createGame`, orden de `buildGame` según `positions` y ficha movida al final tras `applyAction`. Esqueleto: campo `arrivalOrder` en `GameState` con valor neutro `[]` para que compile. Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [x] 2. Implementar `arrivalOrder` en `GameState`, `createGame`, `buildGame` y al mover; pasar `pnpm check`.
- [x] 3. Tests de `legalMoves`: reescribir en su sitio los 3 tests de la tabla del spec y añadir HU-01 c1-c3, HU-02 c1-c3 y el desempate por orden de llegada. Esqueleto: campo opcional `captures` en `Move`. Los que dependen del cambio fallan en sus aserciones; los que comprueban que no se come pasan ya y quedan como guarda.
- [x] 4. Implementar en `moves.ts` la salida bloqueada solo por fichas propias, la salida comiendo, la comida en el recorrido común y el campo `captures`, y en `actions.ts` la vuelta a casa de la ficha de `captures`; pasar `pnpm check`.
- [x] 5. Tests de `applyAction`: la ficha comida vuelve a casa, evento `piece-captured` tras el de movimiento, comer al salir, convivir en un seguro sin evento, y el turno pasa tras comer. Los del evento deben fallar; los de la vuelta a casa pasan ya y quedan como guarda.
- [x] 6. Implementar en `actions.ts` el evento `piece-captured`; pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-01 c1 / RF-001 | 3-6 | «R-050: termina sobre una sola ficha rival fuera de un seguro y la come» (reescrito, `legalMoves` con `captures: 'red-0'`) y «R-050: la ficha comida vuelve a casa» (`applyAction`) |
| RF-001 | 3, 4 | «R-050: no come una ficha propia» |
| HU-01 c2 / RF-002 | 3-6 | «R-052: en un seguro conviven con una sola rival sin comerse» (casilla 12, `legalMoves`) y «R-052: en un seguro conviven sin evento de ficha comida» (`applyAction`) |
| HU-01 c3 / RF-002 | 3, 4 | «R-052: en la salida de otro color conviven si no se sale de casa» (casilla 22) |
| RF-002 (caso límite) | 3, 4 | «R-052: en la propia salida conviven si no se sale de casa» |
| HU-01 c4 | — | Ya cubierto por «R-041: no se termina en una casilla del recorrido con 2 fichas» de SPEC 001, sin cambios |
| HU-02 c1 / RF-004 | 3-6 | «R-023: sale con una sola ficha rival en la salida y la come» (reescrito) y «R-023: al salir de casa come la rival de la salida y produce el evento» (`applyAction`) |
| HU-02 c2 / RF-003, RF-004 | 3, 4 | «R-023: con una ficha propia y una rival en la salida, sale comiendo la rival» (reescrito) |
| HU-02 c3 / RF-005 | 1-4 | «R-023: con dos rivales en la salida come la que llegó en último lugar», con el orden de llegada en ambos sentidos, y «R-023: con dos rivales del mismo color en la salida come la que llegó en último lugar» |
| HU-02 c4 / RF-003 | — | Ya cubierto por «R-022: con 2 fichas propias en la salida no se sale y se mueve otra ficha» de SPEC 001, sin cambios |
| RF-014 | 5, 6 | «RF-014: comer produce el evento de ficha comida tras el de movimiento» |
| RNF-003 / CE-04 | 3 | Los 3 tests de la tabla del spec con su nombre nuevo; `grep` sin «provisional» junto a RF-008 o RF-013 en `src/` |
| Hecho cuando | 6 | Todos los anteriores en verde con `pnpm check` |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar cada paso de código y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** `captures` opcional en `Move`. La presentación sabe qué ficha se comerá antes de mover, y `applyAction` no repite la decisión.
- **No:** decidir la comida solo en `applyAction`. La regla quedaría repartida entre dos módulos.
- **Sí:** `arrivalOrder` en `GameState` con todos los ids, ordenados por su último movimiento. Basta con mover un id al final en cada movimiento, sin contadores.
- **No:** un número de llegada en cada `Piece`. Cambiaría la forma de las fichas y el test «R-013: mover aplica a la ficha el destino de su movimiento legal» de SPEC 001, que no está en la tabla del spec.
- **Sí:** cada paso de tests añade el esqueleto mínimo (tipos y valores neutros) para que compile, y los tests fallan en sus aserciones. El builder de Angular comprueba tipos al ejecutar los tests; es la misma convención que SPEC 001.
- **Sí:** el paso 4 incluye la vuelta a casa de la ficha comida en `applyAction`. Sin ella, `legalMoves` deja salir a una salida con 2 fichas y CE-02 falla por I-02 hasta el paso 6; así cada commit pasa `pnpm check`.
- **No:** un commit del paso 4 con CE-02 en rojo, ni juntar los pasos 4 a 6. El primero rompe la comprobación de un commit; el segundo mezcla tests y código.
- **Sí:** evento `piece-captured` con `pieceId` y `at` (casilla del recorrido), emitido después de `piece-left-home` o `piece-advanced`. Primero se mueve la ficha y después se come, como en el tablero.

## PARTE-02: Premios

**Estado:** Hecha

### Enfoque

`GameState` gana `pendingBonus` (20, 10 o `null`), excluyente con `pendingRoll`. Con un premio pendiente, `legalMoves` devuelve solo avances de esa cantidad, sin salida de casa (R-020), reutilizando las mismas comprobaciones de comer, seguros y ocupación (RF-010). En `applyAction`, tras cada movimiento, de tirada o de premio, se calcula el premio ganado: 20 si ha comido, 10 si ha llegado a meta sin ganar la partida. Si lo hay, se emite `bonus-earned` y el turno no pasa; si con ese premio no hay ningún movimiento legal, se emite `bonus-lost` y el turno pasa en la misma acción, igual que una tirada perdida. Así los premios encadenados (R-081) salen solos: usar un premio es un movimiento más, que puede ganar otro. El rebote deja de ser una fórmula de un solo rebote y pasa a recorrer el pasillo paso a paso cambiando de sentido en la meta y en la primera casilla del pasillo (R-071).

### Archivos

- `src/engine/game.ts`: campo `pendingBonus` en `GameState`, `null` en `createGame`.
- `src/engine/moves.ts`: movimientos legales con premio pendiente y rebote múltiple en `advance`.
- `src/engine/actions.ts`: error `bonus-pending`, eventos `bonus-earned` y `bonus-lost`, premio tras mover y aceptar `move` con un premio pendiente.
- `src/engine/test-utils.ts`: opción `pendingBonus` en `buildGame`; `playRandomGame` mueve también cuando hay un premio pendiente, en lugar de tirar.
- `src/engine/moves.spec.ts`: tests de movimientos de premio y rebote múltiple.
- `src/engine/actions.spec.ts`: tests de ganar, usar, perder y encadenar premios, y de sus eventos.

### Pasos

- [x] 1. Tests de `legalMoves` con un premio pendiente: movimientos de 20 de cada ficha que puede, incluida la que ha comido (HU-03 c1, c3); sin salida de casa ni fichas en casa; comer con un premio (RF-010); rebote múltiple (HU-07 c1, c2, rebote en la primera casilla del pasillo); destino con 2 fichas no legal (HU-05 c2). Esqueleto: `pendingBonus` en `GameState` y `buildGame`, siempre `null` en el motor. Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [x] 2. Implementar en `moves.ts` los movimientos de premio y el rebote múltiple; pasar `pnpm check`.
- [x] 3. Tests de `applyAction`: premio de 20 al comer y al salir comiendo, con `bonus-earned` y sin cambio de turno (HU-03); rechazo de tirar con premio pendiente (HU-03 c2); usar el premio pasa el turno (HU-03 c4); premio de 10 al llegar a meta (HU-04 c1); sin premio al ganar (HU-04 c2); premio perdido con `bonus-lost` y cambio de turno (HU-05 c1, c2); premios encadenados (HU-06 c1, c2); rebote que pasa por la meta sin premio (HU-07 c3). Esqueleto: error `bonus-pending` en `ActionError`. Ejecutar y comprobar que fallan en sus aserciones.
- [x] 4. Implementar en `actions.ts` los premios y sus eventos, y en `playRandomGame` el movimiento con premio pendiente; pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-03 c1 / RF-009 | 1, 2 | «R-051: con un premio de 20 se mueve 20 cualquier ficha que pueda, también la que ha comido» |
| HU-03 c2 / RF-008 | 3, 4 | «R-051: con un premio pendiente se rechaza tirar» |
| HU-03 c3 / RF-009 | 1-4 | «R-080: con una sola ficha que pueda usar el premio, es el único movimiento legal» y «R-080: el premio no se aplica solo aunque haya un único movimiento» |
| HU-03 c4 | 3, 4 | «R-051: usar el premio sin ganar otro pasa el turno» |
| RF-006 | 3, 4 | «R-051: comer da un premio de 20 y el turno no pasa» y «R-051: salir comiendo da un premio de 20» |
| HU-04 c1 / RF-007 | 3, 4 | «R-072: llegar a meta da un premio de 10 para otra ficha» |
| HU-04 c2 / RF-007 | 3, 4 | «R-090: meter la cuarta ficha con un premio termina la partida sin premio de 10» y «R-090: gana quien mete su cuarta ficha en meta y la partida termina» de SPEC 001, sin cambios |
| RNF-003 | 3 | «RF-021: llegar a meta produce los eventos de avance y llegada» de SPEC 001, reescrito en su sitio como «R-072: llegar a meta produce los eventos de avance, llegada y premio» y añadido a la tabla de la sección 7 del spec |
| HU-05 c1 / RF-011 | 3, 4 | «R-080: un premio de 10 sin movimientos se pierde y el turno pasa» |
| HU-05 c2 / RF-011 | 1-4 | «R-080: un movimiento de premio a una casilla con 2 fichas no es legal» y «R-080: si el único destino del premio está lleno, se pierde» |
| HU-06 c1 / RF-012 | 3, 4 | «R-081: comer con un premio da otro premio de 20» |
| HU-06 c2 / RF-012 | 3, 4 | «R-081: llegar a meta con un premio da un premio de 10» |
| HU-07 c1 / RF-013 | 1, 2 | «R-071: desde la quinta casilla del pasillo con un premio de 20 rebota dos veces y termina en la quinta» |
| HU-07 c2 / RF-013 | 1, 2 | «R-071: desde la casilla 66 con un premio de 10 llega a meta» |
| HU-07 c3 / RF-013 | 3, 4 | «R-071: un rebote que pasa por la meta no da premio» |
| RF-013 (primera casilla del pasillo) | 1, 2 | «R-071: al llegar a la primera casilla del pasillo rebotando vuelve a avanzar» |
| RF-010 | 1, 2 | «R-080: un movimiento de premio come como uno de tirada» y «R-080: las fichas en casa no pueden usar un premio» |
| RF-015 | 3, 4 | Eventos `bonus-earned` y `bonus-lost` en los tests de RF-006, RF-007 y RF-011 |
| CE-01 / Hecho cuando | 4 | Tests con R-022, R-023, R-050, R-051, R-052, R-071, R-072, R-080 y R-081 en su nombre; `pnpm check` en verde |

Los tests de rebote de SPEC 001 (R-071 con un 6) deben seguir pasando sin cambios con el rebote nuevo.

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar cada paso de código y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** `pendingBonus` separado de `pendingRoll`. Una tirada y un premio se comportan distinto: solo la tirada saca de casa y solo el premio impide tirar.
- **No:** reutilizar `pendingRoll` con valores 10 y 20. Mezclaría el valor del dado con premios y rompería la validación de 1 a 6.
- **Sí:** el premio se calcula en `applyAction` tras cada movimiento, y un premio sin movimientos se pierde en la misma acción, como una tirada perdida. No hace falta una acción nueva para el premio: se usa con la misma acción `move`.
- **Sí:** un movimiento solo puede ganar un premio, porque se come en el recorrido común y la meta está fuera de él.
- **Sí:** eventos `bonus-earned` y `bonus-lost` con `player` y `amount`, después de los de movimiento y comida, y antes de `turn-changed`.
- **Sí:** rebote paso a paso, cambiando de sentido en la meta y en la primera casilla del pasillo. Cubre cualquier cantidad sin casos especiales.
- **Sí:** al dar premios cambian 3 tests ya existentes, que se reescriben en su sitio en el paso 3. Uno es de SPEC 001 («RF-021: llegar a meta…»): con otra ficha en juego, llegar a meta da un premio de 10 y el turno ya no pasa, así que se añade a la tabla de la sección 7 del spec, como ella misma pide. Los otros dos son de PARTE-01 («RF-014: comer produce el evento…» y «R-023: al salir de casa come…») y esperaban que el turno pasara tras comer porque esa parte aún no daba premios.
- **Sí:** `playRandomGame` se ajusta en esta parte y no en PARTE-03. Sin él, una partida aleatoria tiraría con un premio pendiente y CE-02 fallaría.

## PARTE-03: Propiedades con comer y premios

**Estado:** En curso

### Enfoque

El motor no cambia: esta parte solo amplía los tests de propiedades. Las partidas aleatorias ya comen y resuelven premios desde PARTE-02. Se añaden dos ayudas en `test-utils.ts`: `mixedColorSquares`, que devuelve las casillas del recorrido común que no son seguro y tienen fichas de dos colores (la propiedad de RNF-004), y `gameFacts`, que recorre una partida jugada y devuelve qué hechos de CE-03 se han producido en ella. `gameFacts` vuelve a aplicar cada acción sobre su estado previo para tener los eventos de cada acción por separado, sin cambiar la forma de `PlayedGame`. El test de CE-02 comprueba además la propiedad tras cada acción y acumula los hechos de sus 1000 partidas; al terminar, exige que se hayan producido los 7.

Hechos de CE-03 y cómo se reconocen en los eventos de una acción:

- Comer en el recorrido común: `piece-captured` tras `piece-advanced`.
- Salir comiendo: `piece-captured` tras `piece-left-home`.
- Premio de 20 y premio de 10: `bonus-earned` con esa cantidad.
- Premio perdido: `bonus-lost`.
- Premio encadenado: `bonus-earned` en una acción hecha con un premio pendiente.
- Rebote múltiple: movimiento con un premio de 20 desde el pasillo. Desde cualquier casilla del pasillo, la meta está a 7 casillas como mucho y la primera casilla del pasillo a 6 más, así que con 20 siempre rebota al menos dos veces.

### Archivos

- `src/engine/test-utils.ts`: `mixedColorSquares` y `gameFacts`, con el tipo `GameFact`.
- `src/engine/test-utils.spec.ts`: tests de las dos ayudas con escenarios de `buildGame`.
- `src/engine/invariants.spec.ts`: el test de CE-02 comprueba la propiedad de RNF-004 y los hechos de CE-03, y su nombre lo dice.

### Pasos

- [ ] 1. Tests de `mixedColorSquares` (dos colores fuera de seguro, en seguro, del mismo color, en el pasillo) y de `gameFacts` (un caso por hecho y una acción sin ninguno). Esqueleto: las dos funciones devuelven `[]`. Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [ ] 2. Implementar `mixedColorSquares` y `gameFacts`; pasar `pnpm check`.
- [ ] 3. Ampliar el test de CE-02 con la propiedad de RNF-004 y la exclusión de tirada y premio pendientes tras cada acción, y la comprobación de CE-03 al final; medir cuántas veces sale cada hecho en las 1000 partidas; pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| RNF-004 (propiedad) | 1, 2 | Tests de `mixedColorSquares` en `test-utils.spec.ts` |
| RNF-004 / CE-02 | 3 | «CE-02: 1000 partidas aleatorias de 2, 3 y 4 jugadores cumplen I-01 a I-06 y RNF-004 tras cada acción» |
| CE-03 | 1-3 | Tests de `gameFacts` y, en el mismo test de CE-02, los 7 hechos producidos al menos una vez |
| Enfoque de PARTE-02 (`pendingBonus` excluyente con `pendingRoll`) | 3 | En el mismo test de CE-02, ningún estado tiene a la vez tirada y premio pendientes |
| Hecho cuando | 3 | `pnpm check` en verde |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar cada paso y la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** los hechos de CE-03 se cuentan en las mismas 1000 partidas de CE-02. El spec habla de «esas partidas», y no duplica el tiempo de los tests.
- **No:** un test aparte con sus propias partidas. Dependería de otras semillas y alargaría la ejecución.
- **Sí:** `gameFacts` repite cada acción para obtener sus eventos. Es puro y no cambia `PlayedGame`, que usa un test de SPEC 001.
- **Sí:** el rebote múltiple se reconoce como un movimiento de premio de 20 desde el pasillo. Siempre rebota dos veces o más, y no hace falta repetir el cálculo del rebote en los tests.
- **Sí:** comprobar en las partidas aleatorias que nunca hay a la vez una tirada y un premio pendientes. Lo sugirió la revisión de PARTE-02: la exclusión solo la garantiza el código de `applyAction`, no el tipo de `GameState`. Decisión del usuario; no es un criterio del spec ni un invariante del reglamento.
- **Sí:** si algún hecho no sale en las partidas aleatorias, se ajusta la elección de movimientos de las partidas, nunca la comprobación (riesgo de la sección 14 del spec).
