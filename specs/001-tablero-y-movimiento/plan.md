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
