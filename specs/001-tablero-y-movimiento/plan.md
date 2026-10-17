# Plan técnico — SPEC 001 — Tablero y movimiento básico

> **Spec:** `specs/001-tablero-y-movimiento/spec.md`
> **Rama:** `feat/spec-001-tablero-y-movimiento`
> **Fecha:** 2026-10-17

## PARTE-01: Tablero y creación de partida

**Estado:** Hecha

### Enfoque

El tablero se modela como datos y funciones puras en `board.ts`: colores en el orden de R-010, constantes de geometría (salidas, seguros, entradas, pasillo, capacidad) y un paso unitario `stepForward(color, posición)` que resuelve la vuelta del 68 al 1 y la entrada al pasillo. Las posiciones son una unión discriminada (`home`, `track`, `lane`, `goal`); la casilla de pasillo no lleva color porque siempre es el de su ficha, de modo que I-03 queda garantizado por el tipo. La partida (`game.ts`) es un objeto inmutable con jugadores en orden de turno, fichas, turno, tirada pendiente y ganador; `createGame` valida la configuración y devuelve un `Result` con el estado o el motivo del rechazo. PARTE-02 a PARTE-04 construirán movimientos y acciones sobre este modelo.

### Archivos

- `src/engine/board.ts` (nuevo): `Color`, `COLORS`, `PIECES_PER_PLAYER`, `DIE_FACES`, `isValidRoll`, tipos de posición, `START_SQUARE`, `ENTRY_SQUARE`, `SAFE_SQUARES`, `isSafe`, `TRACK_LENGTH`, `LANE_LENGTH`, `capacity`, `stepForward`.
- `src/engine/board.spec.ts` (nuevo): tests de R-001 a R-009 (salvo R-004).
- `src/engine/game.ts` (nuevo): `PieceId`, `Piece`, `GameState`, `Result`, `CreateGameError`, `createGame`.
- `src/engine/game.spec.ts` (nuevo): tests de HU-01, R-001, R-004 y no mutación de la entrada.
- `src/engine/index.ts`: exportar la API pública de `board.ts` y `game.ts`.

### Pasos

- [x] 1. Tests del tablero en `board.spec.ts` (R-001, R-002, R-003, R-005, R-006, R-007, R-008, R-009) y esqueleto de `board.ts` con tipos, firmas y valores neutros para que compile. Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [x] 2. Implementar `board.ts` hasta que pasen los tests del paso 1.
- [x] 3. Tests de creación de partida en `game.spec.ts` (HU-01, RF-001, RF-002, RF-003, R-001, R-004) y esqueleto de `game.ts`. Ejecutar y comprobar que fallan en sus aserciones.
- [x] 4. Implementar `createGame`, exportar la API en `index.ts` y pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|--------|--------|--------|
| HU-01 c1: amarillo y rojo, inicial amarillo → 2 jugadores, 4 fichas en casa cada uno, turno de amarillo | 3, 4 | `game.spec.ts`: «HU-01: crea una partida de amarillo y rojo con turno de amarillo» |
| HU-01 c2: un solo color o color repetido → rechazo con motivo | 3, 4 | `game.spec.ts`: «R-001: rechaza una partida con menos de 2 o más de 4 colores» (`invalid-player-count`), «R-001: rechaza colores repetidos» (`duplicate-color`) |
| HU-01 c3: azul y verde, inicial rojo → rechazo | 3, 4 | `game.spec.ts`: «HU-01: rechaza un jugador inicial que no participa» (`first-player-not-playing`) |
| RF-001 | 3, 4 | Tests de HU-01 c2 y «R-001: acepta partidas de 2, 3 y 4 colores distintos» |
| RF-002 | 3, 4 | Test de HU-01 c3 |
| R-010 (orden de turno guardado) | 3, 4 | «R-010: guarda los jugadores en el orden de turno amarillo, azul, rojo, verde» |
| RF-003 | 3, 4 | «R-004: todas las fichas empiezan en casa, fuera del tablero» |
| RF-004 (R-003) | 1, 2 | «R-003: el recorrido tiene 68 casillas y la 68 va seguida de la 1» |
| RF-004 (R-005) | 1, 2 | «R-005: casillas de salida 5, 22, 39 y 56» |
| RF-004 (R-006) | 1, 2 | «R-006: son seguros los 12 indicados y las salidas», «R-006: el resto no son seguros» |
| RF-004 (R-007) | 1, 2 | «R-007: el pasillo tiene 7 casillas y después la meta», «R-007: una ficha de otro color no entra en un pasillo ajeno» |
| RF-004 (R-008) | 1, 2 | «R-008: desde su entrada, cada color pasa a la primera casilla de su pasillo» |
| R-001 (tablero) | 1, 2 | «R-001: cuatro colores en orden amarillo, azul, rojo, verde y 4 fichas por jugador» |
| R-002 | 1, 2 | «R-002: solo son tiradas válidas los enteros de 1 a 6» (rechaza 0, 7, -1, 2.5, NaN) |
| R-009 | 1, 2 | «R-009: capacidad 2 en recorrido y pasillo, sin límite en meta» |
| RNF-001 | 4 | `pnpm lint` (frontera del motor en `eslint.config.js`) |
| RNF-002 | 3, 4 | «createGame no modifica la lista de colores recibida» (entrada congelada con `Object.freeze`) |
| RNF-005 | 1-4 | Nombres de test con su `R-NNN` |
| Hecho cuando | 4 | Tests de HU-01 y de R-001 a R-009 en verde con `pnpm check` |

Comandos: `pnpm test:once`, `pnpm check`.

### Skills y agentes

- `caveman:cavecrew-reviewer` o `code-review`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** identificadores de color en inglés (`yellow`, `blue`, `red`, `green`). El código va en inglés (CLAUDE.md).
- **Sí:** posición como unión discriminada `home | track | lane | goal`, con el pasillo sin color. I-03 lo garantiza el tipo.
- **Sí:** `stepForward` solo admite posiciones `track` y `lane`; salir de casa (R-020) y el rebote (R-071) son lógica de movimiento de PARTE-02 y PARTE-03.
- **Sí:** jugadores guardados en orden de turno (R-010), sea cual sea el orden recibido. Simplifica la rotación de PARTE-04.
- **Sí:** `createGame` devuelve `Result<GameState, CreateGameError>` con un código de error por motivo, sin texto. La capa de presentación traduce el código; el motor no conoce el idioma de la interfaz.
- **No:** validar en ejecución colores desconocidos. El tipo `Color` ya lo impide y la app es TypeScript.
- **Sí:** ids de ficha `` `${Color}-${0 | 1 | 2 | 3}` ``. Estables y legibles en eventos y tests.
- **Revisión del modelo contra el reglamento completo:** barreras (R-060) y ocupación se derivan de las posiciones; el seis (contador de seises, última ficha movida) y los premios (premio pendiente) se añadirán como campos nuevos de `GameState` en sus specs; comer al salir con dos rivales (R-023) necesitará orden de llegada a la casilla, que se añadirá entonces. Nada de esto obliga a cambiar lo de esta parte.

## PARTE-02: Salida y avance

**Estado:** Hecha

### Enfoque

Nuevo módulo `moves.ts` con `legalMoves(state)`, que lee el turno y la tirada pendiente de `GameState` y devuelve los movimientos legales como `{ pieceId, to }`. La salida de casa se calcula aparte y, si es legal con un 5, es el único movimiento posible (R-021). El avance encadena `stepForward` tantas veces como indique la tirada y solo comprueba la ocupación de la casilla de destino, sin contar la propia ficha que se mueve: así se atraviesan casillas con 2 fichas (RF-012) y se puede terminar junto a una sola rival (RF-013). El rebote no entra en esta parte, así que un avance que se pasa de la meta no es legal hasta PARTE-03. Aplicar el movimiento al estado llega en PARTE-04, junto con la acción de mover y sus eventos.

### Archivos

- `src/engine/moves.ts` (nuevo): `Move`, `legalMoves` y funciones internas de salida, avance y ocupación.
- `src/engine/moves.spec.ts` (nuevo): tests de HU-02, HU-03, HU-06 y de los RF provisionales.
- `src/engine/test-utils.ts` (nuevo): `buildGame`, que crea una partida con `createGame` y coloca fichas y tirada pendiente. Es TypeScript puro sin vitest, para reutilizarlo en PARTE-03 a PARTE-05. No se exporta en `index.ts`.
- `src/engine/index.ts`: exportar `moves.ts`.

### Pasos

- [x] 1. `test-utils.ts`, tests de salida de casa en `moves.spec.ts` (HU-02 c1 a c3, R-020, R-021, RF-013 en la salida) y esqueleto de `moves.ts` que devuelve `[]`. Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [x] 2. Implementar la salida de casa en `legalMoves`.
- [x] 3. Tests de avance y consulta (HU-02 c4, RF-008, HU-03, HU-06, R-008, R-013, R-040, R-041, RF-012, RF-013, no mutación). Ejecutar y comprobar que fallan en sus aserciones.
- [x] 4. Implementar el avance y la ocupación, exportar en `index.ts` y pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|--------|--------|--------|
| HU-02 c1: todas en casa, saca 5 → único movimiento sacar a la 5 | 1, 2 | «R-020: con un 5 y todas en casa, el único movimiento es sacar una ficha a su salida» |
| HU-02 c2: todas en casa, saca 3 → sin movimientos | 1, 2 | «R-020: sin un 5 no sale ninguna ficha de casa» |
| HU-02 c3: fichas en casa, una en la 20, salida libre, saca 5 → solo sacar | 1, 2 | «R-021: con un 5, fichas en casa y salida libre, sacar ficha es obligatorio» |
| HU-02 c4: 2 propias en la 5, saca 5 → no sale y sí mueve 5 otra | 3, 4 | «R-022: con 2 fichas propias en la salida no se sale y se mueve otra ficha» |
| RF-006 | 1, 2 | Tests de HU-02 c1 y «R-020: cada color sale a su casilla de salida» |
| RF-007 | 1-4 | Tests de HU-02 c1, c3 y c4 |
| RF-008 | 3, 4 | Test de HU-02 c4 y «R-022 (provisional RF-008): no se sale con una ficha propia y una rival en la salida» |
| RF-013 (salida) | 1, 2 | «RF-013 (provisional): sale con una sola ficha rival en la salida, sin comerla» |
| HU-03 c1: verde en 66 mueve 5 → casilla 3 | 3, 4 | «R-013: verde en la 66 con un 5 termina en la 3» |
| HU-03 c2: amarillo en 66 mueve 4 → 2.ª del pasillo | 3, 4 | «R-008: amarillo en la 66 con un 4 termina en la segunda casilla de su pasillo» |
| HU-03 c3: azul en 66 mueve 4 → casilla 2 | 3, 4 | «R-008: azul en la 66 con un 4 sigue por el recorrido común hasta la 2» |
| HU-03 c4: destino con 2 fichas → no legal | 3, 4 | «R-041: no se termina en una casilla del recorrido con 2 fichas», «R-041: no se termina en una casilla del pasillo con 2 fichas» |
| HU-06 c1: cada ficha que puede moverse con su destino | 3, 4 | «HU-06: devuelve cada ficha movible con su casilla de destino» |
| HU-06 c2: ficha en meta nunca aparece | 3, 4 | «HU-06: una ficha en meta nunca aparece entre los movimientos legales» |
| RF-005 | 3, 4 | Tests de HU-06 y «HU-06: sin tirada pendiente no hay movimientos legales» |
| RF-009 | 3, 4 | Tests de HU-03 c1 a c3 y «R-040: avanza siempre hacia delante el número exacto de casillas» |
| RF-010 | 3, 4 | Tests de HU-03 c2 y c3 |
| RF-011 | 3, 4 | Tests de HU-03 c4 y «R-041: las fichas del pasillo de otro color no ocupan el propio» |
| RF-012 | 3, 4 | «RF-012 (provisional): atraviesa una casilla con 2 fichas» |
| RF-013 | 3, 4 | «RF-013 (provisional): termina junto a una sola ficha rival fuera de un seguro» |
| Caso límite: única ficha bloqueada, resto en casa sin 5 → sin movimientos | 3, 4 | «R-041: sin movimientos si la única ficha en juego tiene el destino lleno» |
| RNF-002 | 3, 4 | «legalMoves no modifica el estado recibido» (estado congelado en profundidad) |
| RNF-005 | 1-4 | Nombres de test con su `R-NNN` o el RF provisional |
| Hecho cuando | 4 | Tests de HU-02, HU-03 y HU-06 en verde con `pnpm check` |

Comandos: `pnpm test:once`, `pnpm check`.

### Skills y agentes

- `caveman:cavecrew-reviewer` o `code-review`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** `legalMoves(state)` lee la tirada de `state.pendingRoll` y devuelve `[]` sin tirada. Es la misma firma que usará la capa de presentación tras la acción de tirar de PARTE-04.
- **Sí:** `Move = { pieceId, to }`, con un movimiento como máximo por ficha. En este spec cada ficha tiene un único destino posible.
- **Sí:** la salida se ofrece como un único movimiento, con la primera ficha en casa por índice. HU-02 c1 pide «el único movimiento legal», y las 4 fichas en casa son equivalentes.
- **Sí:** la ocupación del destino no cuenta la ficha que se mueve. Hace falta para el rebote de PARTE-03, que puede terminar en la casilla de origen (HU-04 c2).
- **Sí:** las casillas de pasillo solo cuentan las fichas del mismo color. Cada color tiene su propio pasillo (R-007).
- **Sí:** de forma provisional, un avance que se pasa de la meta no es legal. El rebote lo sustituye en PARTE-03.
- **Sí:** helper `buildGame` compartido en `test-utils.ts`. Evita repetir la preparación de estados en las partes siguientes.
- **Sí:** los tests de las reglas provisionales llevan «provisional» y su RF en el nombre, como pide la mitigación de riesgos del spec.
- **Sí:** los tests de HU-02 c4 y RF-008 pasan a los pasos 3 y 4. Comprueban que, con la salida bloqueada, se puede avanzar otra ficha, y eso necesita el avance.

## PARTE-03: Meta y rebote

**Estado:** Hecha

### Enfoque

Solo cambia `advance` en `moves.ts`: al llegar a la meta con pasos sobrantes, en lugar de devolver `null` (provisional de PARTE-02) retrocede por el pasillo esos pasos (R-071). Con un dado de 6 caras y sin premios, el máximo sobrante es 5 (séptima casilla con un 6), así que el rebote nunca alcanza el principio del pasillo y basta con el rebote simple: destino `lane(LANE_LENGTH + 1 - sobrantes)`. Como solo se devuelve el destino final, pasar por la meta durante un rebote no cuenta como llegar. La comprobación de ocupación de PARTE-02 se reutiliza sin cambios: no cuenta la ficha que se mueve (HU-04 c2) y bloquea un destino de pasillo con 2 fichas (HU-04 c3). Las fichas en meta ya no se mueven (`advanceMove` solo acepta `track` y `lane`); se añade su test con la regla R-070. Aplicar el movimiento y el evento de llegada a meta siguen en PARTE-04.

### Archivos

- `src/engine/moves.spec.ts`: nuevo `describe` «legalMoves: meta y rebote» con los tests de HU-04, R-070 y R-071.
- `src/engine/moves.ts`: rebote en `advance` y comentario actualizado.

### Pasos

- [x] 1. Tests de meta y rebote en `moves.spec.ts` (HU-04 c1 a c3, R-070, R-071, casos límite de la séptima casilla y del paso por la meta). Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [x] 2. Implementar el rebote en `advance` y pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|--------|--------|--------|
| HU-04 c1: amarilla en 5.ª del pasillo mueve 3 → llega a meta y no vuelve a moverse | 1, 2 | «R-070: desde la quinta casilla del pasillo con un 3 llega a meta», «R-070: una ficha en meta no vuelve a moverse» |
| HU-04 c2: amarilla en 5.ª del pasillo mueve 6 → meta y retrocede 3 hasta la 5.ª | 1, 2 | «R-071: desde la quinta casilla del pasillo con un 6 rebota y termina en la quinta» |
| HU-04 c3: rebote que termina en casilla del pasillo con 2 fichas → no legal | 1, 2 | «R-071: un rebote que termina en una casilla del pasillo con 2 fichas no es legal» |
| RF-014 | 1, 2 | Tests de HU-04 c1 y «R-070: desde la segunda casilla del pasillo con un 6 llega justo a meta» |
| RF-015 | 1, 2 | Tests de HU-04 c2 y c3, y casos límite |
| Caso límite: séptima casilla con un 6 → tercera del pasillo | 1, 2 | «R-071: desde la séptima casilla del pasillo con un 6 rebota hasta la tercera, sin quedarse en meta» |
| Caso límite: paso por la meta durante un rebote no cuenta | 1, 2 | Mismo test: el destino es la tercera casilla, no la meta |
| RNF-005 | 1, 2 | Nombres de test con su `R-NNN` |
| Hecho cuando | 2 | Tests de HU-04 en verde con `pnpm check` |

Comandos: `pnpm test:once`, `pnpm check`.

### Skills y agentes

- `caveman:cavecrew-reviewer` o `code-review`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** rebote simple, calculado como retroceso desde la meta por los pasos sobrantes. El rebote múltiple queda fuera del spec y no se alcanza con un dado sin premios.
- **Sí:** el rebote se calcula en `advance` dentro de `moves.ts`, no en `stepForward`. Lo previsto en PARTE-01: `stepForward` es el paso unitario hacia delante.
- **Sí:** reutilizar `hasRoom` tal cual para el destino del rebote, sin contar la ficha que se mueve.

## PARTE-04: Turnos y fin de partida

**Estado:** Hecha

### Enfoque

Nuevo módulo `actions.ts` con una única transición pura, `applyAction(state, action)`, que devuelve `Result<ActionOutcome, ActionError>`. Si la acción se acepta, `ActionOutcome = { state, events }`; si no, el código del motivo, sin estado nuevo (P-03, RF-020). Hay dos acciones, y las dos indican el jugador que las envía, para poder rechazar las de quien no tiene el turno (HU-05 c4):

- `{ type: 'roll', player, value }`: valida el turno, que no haya tirada pendiente y el valor (R-002). Si `legalMoves` no da ningún movimiento, se pierde la tirada y pasa el turno (R-012). Si da alguno, la tirada queda pendiente, aunque sea uno solo (caso límite).
- `{ type: 'move', player, pieceId }`: valida el turno, la tirada pendiente y que la ficha esté entre los `legalMoves`. Aplica el destino, limpia la tirada y pasa el turno. Si con ese movimiento el jugador tiene sus 4 fichas en meta, la partida termina con él como ganador y el turno ya no cambia (R-090).

Las acciones sobre una partida terminada se rechazan antes que cualquier otra comprobación (I-06). El turno rota al siguiente color de `players`, que ya está en el orden de R-010. Los eventos son exactamente los de RF-021.

### Archivos

- `src/engine/actions.ts` (nuevo): `Action`, `ActionError`, `GameEvent`, `ActionOutcome`, `applyAction` y funciones internas de tirada, movimiento y siguiente turno.
- `src/engine/actions.spec.ts` (nuevo): tests de HU-05, HU-07, R-002, R-011, R-012, R-090, RF-016 a RF-023, casos límite, CE-03 y CE-04.
- `src/engine/test-utils.ts`: `seededRolls(seed)`, un generador de tiradas reproducible (mulberry32), y `playRandomGame(state, nextRoll)`, que juega hasta que hay ganador eligiendo el primer movimiento legal y devuelve las acciones, los estados y los eventos. Lo reutilizará PARTE-05.
- `src/engine/index.ts`: exportar `actions.ts`.

### Pasos

- [x] 1. Tests de la acción de tirar en `actions.spec.ts` (HU-05 c2, c4 y c5 al tirar, R-002, R-011, R-012, RF-016, RF-017, caso límite del único movimiento legal) y esqueleto de `actions.ts` con tipos y un `applyAction` que siempre rechaza con `game-over`. Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [x] 2. Implementar la tirada: validaciones, tirada perdida, tirada pendiente y paso de turno.
- [x] 3. Tests de la acción de mover, del fin de partida y transversales (HU-05 c1, c3, c4 y c5 al mover, HU-07, R-013, R-090, RF-018 a RF-023, casos límite del 6 y de azul y verde, CE-03 y CE-04), con `seededRolls` y `playRandomGame` en `test-utils.ts`. Ejecutar y comprobar que fallan en sus aserciones.
- [x] 4. Implementar el movimiento, los eventos de salida, avance y meta, el fin de partida y el rechazo tras terminar; exportar en `index.ts` y pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|--------|--------|--------|
| HU-05 c1: amarillo mueve una ficha legal → turno al siguiente color | 3, 4 | «R-011: tras mover, el turno pasa al siguiente color participante» |
| HU-05 c2: tirada sin movimientos legales → pierde la tirada y pasa el turno | 1, 2 | «R-012: sin movimientos legales se pierde la tirada y pasa el turno» |
| HU-05 c3: amarillo y rojo, turno de rojo, termina → turno de amarillo | 3, 4 | «RF-019: después del último color vuelve el primero» |
| HU-05 c4: turno de amarillo, azul tira o mueve → rechazo sin cambio | 1-4 | «RF-016: rechaza la tirada de un jugador sin turno» (`not-your-turn`), «RF-018: rechaza el movimiento de un jugador sin turno» (`not-your-turn`) |
| HU-05 c5: tirada pendiente, tira otra vez o mueve una ficha no legal → rechazo | 1-4 | «RF-016: rechaza tirar con una tirada pendiente» (`roll-pending`), «RF-018: rechaza mover una ficha sin movimiento legal» (`illegal-move`) |
| HU-07 c1: amarillo con 3 en meta mete la cuarta → gana amarillo | 3, 4 | «R-090: gana quien mete su cuarta ficha en meta y la partida termina» |
| HU-07 c2: partida terminada, cualquier acción → rechazo sin cambio | 3, 4 | «RF-023: rechaza tirar o mover en una partida terminada» (`game-over`) |
| RF-016 | 1, 2 | Tests de HU-05 c4 y c5 al tirar, y «R-002: rechaza tiradas fuera de 1 a 6 o no enteras» (`invalid-roll`) |
| RF-017 | 1, 2 | Test de HU-05 c2 |
| RF-018 | 1-4 | «R-011: con movimientos legales la tirada queda pendiente y el turno no cambia», tests de HU-05 c4 y c5 al mover, y «RF-018: rechaza mover sin tirada pendiente» (`no-pending-roll`) |
| RF-019 | 1-4 | Tests de HU-05 c1 a c3 y «RF-019: con azul y verde el turno alterna entre ellos» |
| RF-020 | 1-4 | Todos los tests de rechazo comprueban el código del motivo y que el estado recibido no cambia |
| RF-021 | 1-4 | «RF-021: sacar ficha produce los eventos de salida y cambio de turno», «RF-021: avanzar produce los eventos de avance y cambio de turno», «RF-021: llegar a meta produce los eventos de avance y llegada», test de HU-05 c2 (tirada perdida) y de HU-07 c1 (fin de partida) |
| RF-022 | 3, 4 | Test de HU-07 c1 |
| RF-023 | 3, 4 | Test de HU-07 c2 |
| R-013 | 3, 4 | «R-013: mover aplica a la ficha el destino de su movimiento legal» |
| Caso límite: único movimiento legal no se aplica solo | 1, 2 | Test de R-011 con tirada pendiente, con un solo movimiento legal |
| Caso límite: tirada de 6 → 6 casillas y pasa el turno | 3, 4 | «R-011: con un 6 se mueve 6 y el turno pasa como con cualquier valor» |
| Caso límite: azul y verde alternan | 3, 4 | Test de RF-019 con azul y verde |
| Caso límite: tirada 0, 7, negativa o decimal → rechazo | 1, 2 | Test de R-002 |
| Caso límite: mover sin tirada pendiente → rechazo | 3, 4 | Test de RF-018 sin tirada pendiente |
| CE-03 / RNF-003 | 3, 4 | «CE-03: la misma secuencia de acciones produce el mismo estado final y los mismos eventos» (partida completa de 4 jugadores con `seededRolls`) |
| CE-04 / RNF-002 | 3, 4 | «CE-04: ninguna acción modifica el estado recibido» (cada estado de una partida completa, congelado con `deepFreeze` y comparado con su copia) |
| RNF-005 | 1-4 | Nombres de test con su `R-NNN`, `RF-NNN` o `CE-NN` |
| Hecho cuando | 4 | Tests de HU-05, HU-07, CE-03 y CE-04 en verde con `pnpm check` |

Comandos: `pnpm test:once`, `pnpm check`.

### Skills y agentes

- `caveman:cavecrew-reviewer` o `code-review`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** una sola función `applyAction(state, action)` con acciones como unión discriminada. Es la forma de P-03 (estado y acción en, estado y eventos fuera) y deja una única puerta para la presentación y los tests de propiedades.
- **Sí:** cada acción lleva `player`. Sin él no se puede rechazar la acción de quien no tiene el turno (HU-05 c4).
- **Sí:** el movimiento se pide por `pieceId`. Cada ficha tiene un único movimiento legal por tirada (decisión de PARTE-02) y el destino lo calcula el motor.
- **Sí:** códigos de rechazo `game-over`, `not-your-turn`, `roll-pending`, `invalid-roll`, `no-pending-roll` e `illegal-move`, comprobados en ese orden. Como en `createGame`: solo código, la presentación pone el texto.
- **Sí:** eventos `piece-left-home`, `piece-advanced` (con `from` y `to`), `piece-reached-goal`, `roll-lost`, `turn-changed` y `game-over`, los de RF-021. Llegar a meta produce `piece-advanced` seguido de `piece-reached-goal`, para que la presentación pueda animar el avance y marcar la llegada.
- **Sí:** una tirada con movimientos legales se acepta sin eventos. RF-021 no incluye un evento de tirada y el valor ya queda en `pendingRoll`.
- **Sí:** al ganar no hay `turn-changed`. La partida termina en ese momento (R-090) y el turno se queda en el ganador.
- **Sí:** `playRandomGame` elige siempre el primer movimiento legal y tiene un límite de acciones que hace fallar el test si se supera, en lugar de colgarlo (riesgo del spec).

## PARTE-05: Invariantes con tests de propiedades

**Estado:** Pendiente

### Enfoque

Esta parte no cambia el motor, solo añade tests. Un comprobador puro en `test-utils.ts` recibe un estado y devuelve la lista de invariantes incumplidos, con su identificador. Así un fallo dice qué invariante se rompe y en qué estado. Sus funciones:

- `invariantViolations(state)` comprueba los invariantes de un estado:
  - I-01: cada jugador tiene 4 fichas y no hay fichas de colores que no juegan.
  - I-02: ninguna casilla del recorrido ni del pasillo de un color tiene más de 2 fichas.
  - I-03: toda ficha de pasillo está en una casilla de 1 a 7. Que el pasillo sea de su color ya lo garantiza el tipo (decisión de PARTE-01).
  - I-05: el turno, y el ganador si lo hay, son de un jugador que participa.
- `leftGoal(before, after)` compara dos estados consecutivos y devuelve las fichas que han salido de la meta (I-04).

Como el comprobador es código nuevo, primero se prueba con estados rotos construidos a mano y debe fallar antes de implementarlo (P-07).

Después, `invariants.spec.ts` usa fast-check con 1000 ejecuciones (CE-02). En cada ejecución se generan:

- los colores (2, 3 o 4, sin repetir),
- el jugador inicial,
- una semilla para las tiradas y otra para elegir el movimiento.

Con eso se juega una partida completa con `playRandomGame`. Tras cada acción se comprueban I-01 a I-05 sobre el nuevo estado e I-04 entre el estado anterior y el nuevo. Al terminar, fast-check genera acciones cualesquiera: de cualquier color, de tirar con cualquier entero o de mover cualquier ficha. Todas deben rechazarse con `game-over` y sin cambiar el estado (I-06). Para que las partidas no sigan siempre el mismo camino, `playRandomGame` acepta un selector de movimiento opcional. Si no se pasa, elige el primero, como hasta ahora, y los tests de CE-03 y CE-04 no cambian.

### Archivos

- `src/engine/test-utils.ts`: `invariantViolations`, `leftGoal`, `seededRandom` (el generador de `seededRolls`, separado para elegir movimientos) y un parámetro opcional `pickMove` en `playRandomGame`.
- `src/engine/test-utils.spec.ts` (nuevo): tests del comprobador con estados válidos y rotos a mano.
- `src/engine/invariants.spec.ts` (nuevo): propiedad de I-01 a I-06 sobre 1000 partidas aleatorias con fast-check.

`fast-check` ya está en `devDependencies` y lo permite CLAUDE.md para los tests del motor. No se añade ninguna dependencia.

### Pasos

- [x] 1. Tests del comprobador en `test-utils.spec.ts`: una partida recién creada y una a mitad no incumplen nada; un estado roto a mano por cada invariante (I-01 con 3 o 5 fichas y con un color que no juega, I-02 con 3 fichas en una casilla del recorrido y del pasillo, I-03 con pasillo 0 u 8, I-05 con turno o ganador que no juegan, I-04 con una ficha que sale de meta). Esqueleto en `test-utils.ts` que devuelve `[]`. Ejecutar y comprobar que fallan en sus aserciones (P-07).
- [x] 2. Implementar `invariantViolations` y `leftGoal` hasta que pasen los tests del paso 1.
- [x] 3. Añadir `pickMove` a `playRandomGame` y la propiedad en `invariants.spec.ts` con 1000 ejecuciones. Medir su duración y pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|--------|--------|--------|
| RNF-004 / CE-02 | 3 | `invariants.spec.ts`: «CE-02: 1000 partidas aleatorias de 2, 3 y 4 jugadores cumplen I-01 a I-06 tras cada acción» |
| I-01 | 1-3 | Comprobador: «I-01: detecta un jugador sin 4 fichas o fichas de un color que no juega», y propiedad de CE-02 |
| I-02 | 1-3 | Comprobador: «I-02: detecta una casilla del recorrido o del pasillo con más de 2 fichas», y propiedad de CE-02 |
| I-03 | 1-3 | Comprobador: «I-03: detecta una ficha fuera de las casillas de su pasillo», y propiedad de CE-02 |
| I-04 | 1-3 | Comprobador: «I-04: detecta una ficha que sale de meta», y propiedad de CE-02 (entre cada par de estados consecutivos) |
| I-05 | 1-3 | Comprobador: «I-05: detecta un turno o un ganador que no participan», y propiedad de CE-02 |
| I-06 | 3 | Propiedad de CE-02: tras terminar, toda acción generada se rechaza con `game-over` y el estado no cambia |
| Comprobador sin falsos positivos | 1, 2 | «no detecta nada en una partida recién creada ni a mitad», «I-02: no suma fichas de pasillos de colores distintos», «I-04: no detecta nada si las fichas en meta siguen en ella», «devuelve cada invariante incumplido una vez y en orden» |
| RNF-005 | 1-3 | Nombres de test con su `I-NN` o `CE-NN` |
| Hecho cuando | 3 | CE-02 en verde con `pnpm check` |

Comandos: `pnpm test:once`, `pnpm check`.

### Skills y agentes

- `caveman:cavecrew-reviewer` o `code-review`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** comprobador en `test-utils.ts`, no en el motor. Los invariantes los garantiza el motor; comprobarlos es cosa de los tests, y así no entra en la API pública.
- **Sí:** el comprobador devuelve los identificadores incumplidos, no un booleano. Si la propiedad falla, se ve qué invariante se rompe.
- **Sí:** fast-check genera colores, jugador inicial y semillas, y la partida se juega con `seededRolls`. Las semillas hacen que un contraejemplo se pueda reproducir, y fast-check lo reduce a la semilla mínima.
- **Sí:** el movimiento se elige al azar entre los legales (`pickMove`). Elegir siempre el primero explora poco: con el primero siempre avanza la misma ficha.
- **Sí:** partidas completas hasta el ganador. Así se comprueban todos los estados intermedios y también I-06 al final. Si el test tarda demasiado, se sube su timeout y no se bajan las 1000 ejecuciones (CE-02). Medido: unos 10 s, por encima de los 5 s por defecto de vitest; el test usa un timeout de 60 s.
- **Sí:** I-06 se prueba con acciones generadas por fast-check, que incluyen tiradas no válidas y fichas de otros colores. En una partida terminada `game-over` va antes que cualquier otra comprobación.
- **Sí:** los tests de los pasos 1 y 2 prueban el comprobador antes que la propiedad. La propiedad puede pasar a la primera porque el motor ya existe, y estos tests demuestran que el comprobador detecta incumplimientos.
