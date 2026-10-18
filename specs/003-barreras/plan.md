# Plan técnico — SPEC 003 — Barreras

> **Spec:** `specs/003-barreras/spec.md`
> **Rama:** `feat/spec-003-barreras`
> **Fecha:** 2026-10-18

## PARTE-01: Reglas de barreras

**Estado:** Aprobado

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

- [ ] 1. Tests de `barriers` (HU-05 c1-c3 y barrera de un color en un seguro). Esqueleto: `barriers.ts` con el tipo `Barrier` y `barriers` devolviendo `[]`, reexportado en `index.ts`. Ejecutar y comprobar que fallan en sus aserciones (P-07); el de la casilla del pasillo pasa ya y queda como guarda.
- [ ] 2. Implementar `barriers`; pasar `pnpm check`.
- [ ] 3. Tests de `legalMoves` y `applyAction`: reescribir en su sitio el test de la tabla del spec y añadir HU-01 c2-c6, HU-02 c3, HU-03 c1-c3, HU-04 c1-c2 y el destino justo antes de una barrera. Sin esqueleto: no cambia ninguna firma pública. Los de atravesar deben fallar; los de terminar en una barrera, salir comiendo, pasillo y destino previo pasan ya y quedan como guarda.
- [ ] 4. Implementar en `moves.ts` la prohibición de atravesar barreras y quitar la mención provisional de RF-012; pasar `pnpm check`, incluido el test de propiedades de SPEC 002.

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
| HU-02 c3 / RF-002 | 3, 4 | «R-061: la barrera mixta de una salida solo se puede ocupar saliendo de casa» |
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
- **Sí:** si al cerrar el paso 4 alguna partida aleatoria se detiene por el límite de acciones, se para y se consulta al usuario (riesgo del spec); no se toca la comprobación.
