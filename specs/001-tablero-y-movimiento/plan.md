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
