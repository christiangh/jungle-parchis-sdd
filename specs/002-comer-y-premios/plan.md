# Plan técnico — SPEC 002 — Comer y premios

> **Spec:** `specs/002-comer-y-premios/spec.md`
> **Rama:** `feat/spec-002-comer-y-premios`
> **Fecha:** 2026-10-18

## PARTE-01: Comer

**Estado:** En curso

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

- [ ] 1. Tests de `arrivalOrder`: estado inicial de `createGame`, orden de `buildGame` según `positions` y ficha movida al final tras `applyAction`. Deben fallar.
- [ ] 2. Implementar `arrivalOrder` en `GameState`, `createGame`, `buildGame` y al mover; pasar `pnpm check`.
- [ ] 3. Tests de `legalMoves`: reescribir en su sitio los 3 tests de la tabla del spec y añadir HU-01 c1-c3, HU-02 c1-c3 y el desempate por orden de llegada. Los que dependen del cambio deben fallar.
- [ ] 4. Implementar en `moves.ts` la salida bloqueada solo por fichas propias, la salida comiendo, la comida en el recorrido común y el campo `captures`; pasar `pnpm check`.
- [ ] 5. Tests de `applyAction`: la ficha comida vuelve a casa, evento `piece-captured` tras el de movimiento, comer al salir, convivir en un seguro sin evento, y el turno pasa tras comer. Deben fallar.
- [ ] 6. Implementar en `actions.ts` la comida y el evento `piece-captured`; pasar `pnpm check`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-01 c1 / RF-001 | 3-6 | «R-050: termina sobre una sola ficha rival fuera de un seguro y la come» (reescrito, `legalMoves` con `captures: 'red-0'`) y «R-050: la ficha comida vuelve a casa» (`applyAction`) |
| HU-01 c2 / RF-002 | 3-6 | «R-052: en un seguro conviven con una sola rival sin comerse» (casilla 12) en `legalMoves` y `applyAction` |
| HU-01 c3 / RF-002 | 3, 4 | «R-052: en la salida de otro color conviven si no se sale de casa» (casilla 22) |
| HU-01 c4 | — | Ya cubierto por «R-041: no se termina en una casilla del recorrido con 2 fichas» de SPEC 001, sin cambios |
| HU-02 c1 / RF-004 | 3-6 | «R-023: sale con una sola ficha rival en la salida y la come» (reescrito) y su aplicación en `applyAction` |
| HU-02 c2 / RF-003, RF-004 | 3, 4 | «R-023: con una ficha propia y una rival en la salida, sale comiendo la rival» (reescrito) |
| HU-02 c3 / RF-005 | 1-4 | «R-023: con dos rivales en la salida come la que llegó en último lugar», con el orden de llegada en ambos sentidos |
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
- **Sí:** evento `piece-captured` con `pieceId` y `at` (casilla del recorrido), emitido después de `piece-left-home` o `piece-advanced`. Primero se mueve la ficha y después se come, como en el tablero.
