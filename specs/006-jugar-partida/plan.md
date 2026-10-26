# Plan técnico — SPEC 006 — Jugar una partida

> **Spec:** `specs/006-jugar-partida/spec.md`
> **Rama:** `feat/spec-006-jugar-partida`
> **Fecha:** 2026-10-26

## PARTE-01: Pantalla, dado y tirada inicial

**Estado:** Hecha

### Enfoque

Nueva carpeta `src/app/game/` con lo que convierte el tablero en partida. Un `GameStore` (`@Service`, signals) crea la partida de 4 jugadores con el motor, guarda el estado, los eventos de la última acción, la cara del dado y si está girando, y aplica cada tirada con `applyAction` cuando termina el giro. El valor lo da un `DiceRoller` aparte, basado en `Math.random`, que los tests unitarios sustituyen por inyección y los de navegador sustituyendo `Math.random` antes de cargar la página (P-04, RF-010). El texto del cartel sale de una función pura `headline(state)`, que se prueba sin pintar nada (P-05). La página pasa a tener el fondo de jungla, una cabecera con el cartel de turno y el dado como botón encima del tronco del centro, superpuesto al SVG del tablero, que no cambia.

Como en el motor (P-07), cada paso de código va precedido de su paso de tests: primero los tests con un esqueleto mínimo que compila, y se ven fallar; después el código que los hace pasar.

### Archivos

- `public/background/fondo-jungla-{800,1200}.{webp,jpg}` (nuevos): copias de `docs/design/fondo-jungla`. El SVG fuente no se copia (RNF-009).
- `public/dice/dado-cara-{1..6}.svg` (nuevos): caras de `docs/design/dado-arbol/svg`, sin el bloque `<metadata>` de exportación. Sus hexadecimales quedan en `public/`, fuera de `src/app/` (RNF-007).
- `src/styles.css`: token `--color-jungle` (color de carga del fondo, `#264018`), utilidades `bg-jungle-tile` (loseta), `bg-plank` (vetas del cartel) y `text-outline-ink` (contorno del texto), y animaciones `--animate-dice-spin` y `--animate-dice-pulse` con sus `@keyframes`. Se quita `--color-page`, que deja de usarse.
- `src/app/game/dice-roller.ts` (nuevo): `DiceRoller`, con `roll(): number` entre 1 y 6.
- `src/app/game/game-store.ts` (nuevo): `GameStore` con `state`, `lastEvents`, `legalMoves`, `face`, `rolling`, `canRoll` y `roll()`; función pura `waitsForRoll(state)`; constantes `DICE_SPIN_MS = 500` e `INITIAL_FACE = 6`.
- `src/app/game/game-test-utils.ts` (nuevo): `provideRolls(...valores)`, un `DiceRoller` con tiradas fijas para los tests. La aplicación no lo importa, como `board-test-utils.ts`.
- `src/app/shared/color-names.ts` (nuevo): nombres en castellano de los colores («Amarillo», «Azul», «Rojo», «Verde»). Va en `shared/` porque lo usarán también el tablero (PARTE-02) y la línea de última jugada (PARTE-03).
- `src/app/game/headline.ts` (nuevo): `headline(state)`, que da el color, el título y la instrucción del cartel.
- `src/app/game/turn-banner.ts` y `.html` (nuevos): `jp-turn-banner`, cartel de madera del color del jugador, con sus clases de color de HTML (`bg-*`, `border-*`).
- `src/app/game/dice.ts` y `.html` (nuevos): `jp-dice`, botón con la cara, el latido y el giro.
- `src/app/app.ts`, `app.html`: pantalla de partida con fondo, cabecera, tablero y dado; el estado pasa a venir del `GameStore`.
- Tests: `dice-roller.spec.ts`, `game-store.spec.ts`, `headline.spec.ts`, `turn-banner.spec.ts` y `dice.spec.ts` (nuevos), y `app.spec.ts`.

### Pasos

- [x] 1. Fondo y recursos: copiar las imágenes del fondo y las caras del dado a `public/`, añadir el token `--color-jungle` y la utilidad `bg-jungle-tile`, con la versión de 800 por debajo de 600 px de ancho y el color de carga detrás (RF-001, RNF-007, RNF-009).
- [x] 2. Tests de `DiceRoller` y `GameStore`, con un esqueleto que compila y los hace fallar: valores de 1 a 6, partida nueva de 4, tirada aplicada al terminar el giro de 500 ms, sin giro con movimiento reducido, toques ignorados mientras gira o cuando no toca tirar, acción rechazada sin cambiar el estado y tirada inicial con desempate.
- [x] 3. `DiceRoller` y `GameStore`, hasta que pasen los tests del paso 2 (RF-009, RF-010, RF-011, RF-021, RF-022, RNF-002, RNF-003).
- [x] 4. Tests de `headline(state)`, con un esqueleto que falla: tirada inicial, tirar, elegir ficha con el valor, usar el premio y ganador.
- [x] 5. `headline(state)` y nombres de los colores, hasta que pasen los tests del paso 4 (RF-004).
- [x] 6. Tests de `jp-turn-banner`, con un componente vacío: clases de fondo y círculo del color de cada jugador, título e instrucción.
- [x] 7. `jp-turn-banner`: cartel en el color del jugador, con su círculo y el texto en blanco con contorno de tinta, hasta que pasen los tests del paso 6; medición del contraste con los cuatro colores (RF-003, RNF-001).
- [x] 8. Tests de `jp-dice`, con un componente vacío: cara de `face`, cara inicial, latido en el color del jugador y botón activo solo con `canRoll`, giro mientras `rolling`, animaciones solo con `motion-safe:` y salida `roll`.
- [x] 9. `jp-dice`, hasta que pasen los tests del paso 8 (RF-007, RF-008, RNF-002).
- [x] 10. Tests de la aplicación con un `DiceRoller` fijo que recorren HU-01, HU-02 y HU-03: fondo, cabecera antes del tablero, dado sobre el tablero, tirada inicial con desempate y primera tirada de un jugador. Fallan con la pantalla actual.
- [x] 11. Montar la pantalla: cabecera con el cartel encima del tablero y dado sobre el tronco, sin scroll, hasta que pasen los tests del paso 10; revisión en navegador a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, y con las imágenes del fondo bloqueadas (RF-002, HU-01, HU-02, HU-03, RNF-004).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-01.1 (fondo, cabecera y tablero sin scroll) | 1, 10, 11 | `app.spec.ts`: fondo, cabecera y tablero presentes; revisión en navegador a los 4 tamaños |
| HU-01.2 (color de carga) | 1 | `app.spec.ts`: la página lleva `bg-jungle`; revisión en navegador con las imágenes bloqueadas |
| HU-01.3 (cartel amarillo, tirada inicial) | 4, 5, 6, 7, 10, 11 | `headline.spec.ts` y `app.spec.ts`: partida nueva → cartel amarillo que pide tirar a Amarillo en la tirada inicial |
| HU-02.1 (dado y cartel azules en su turno de tirada inicial) | 8, 9, 10, 11 | `app.spec.ts`: tras la tirada de amarillo, dado con latido azul y cartel azul |
| HU-02.2 (3, 5, 2, 1 → azul) | 2, 3, 10, 11 | `game-store.spec.ts` y `app.spec.ts`: cartel azul con la instrucción de tirar |
| HU-02.3 (empate de amarillo y rojo) | 2, 3, 10, 11 | `game-store.spec.ts` y `app.spec.ts`: 6, 2, 6, 1 → el cartel pide a Amarillo y solo tiran amarillo y rojo |
| HU-03.1 (gira 0,5 s y muestra la cara) | 2, 3, 8, 9 | `game-store.spec.ts` con temporizadores falsos: cara al tocar y tirada aplicada a los 500 ms; `dice.spec.ts`: clase de giro |
| HU-03.2 (movimiento reducido, sin giro) | 2, 3, 8, 9 | `game-store.spec.ts`: tirada aplicada sin espera; `dice.spec.ts`: animaciones solo con `motion-safe:` |
| HU-03.3 (cara visible, sin latido, cartel con valor) | 4, 5, 8, 9, 10, 11 | `app.spec.ts`: Azul saca un 5 con fichas en casa → cara 5, dado deshabilitado, título con «· 5» e instrucción de elegir ficha |
| HU-03.4 (dado inactivo) | 2, 3, 8, 9 | `game-store.spec.ts`: `roll()` no hace nada girando ni con tirada pendiente; `waitsForRoll` es falso con tirada o premio pendiente o con ganador |
| RF-001 | 1 | `app.spec.ts` (clases del fondo); revisión en navegador de la loseta y del cambio a la de 800 |
| RF-002 | 10, 11 | `app.spec.ts`: cabecera antes del tablero; revisión sin scroll |
| RF-003 | 6, 7 | `turn-banner.spec.ts`: clases de fondo y círculo en el color de cada jugador |
| RF-004 | 4, 5 | `headline.spec.ts`: un caso por fase |
| RF-007 | 8, 9 | `dice.spec.ts`: se ve la cara `face`; cara 6 antes de la primera tirada |
| RF-008 | 8, 9 | `dice.spec.ts`: latido y botón activo solo con `canRoll` |
| RF-009 | 2, 3 | `game-store.spec.ts`: valor del generador, giro, aplicación posterior y toques ignorados |
| RF-010 | 2, 3 | `dice-roller.spec.ts`: enteros de 1 a 6 con `Math.random` en los extremos; los tests sustituyen el `DiceRoller` por inyección |
| RF-011 | 2, 3 | `game-store.spec.ts`: rondas de tirada inicial y desempate con `roll()` |
| RF-021 | 2, 3 | `game-store.spec.ts`: partida de 4 creada con el motor, y estado, movimientos legales y eventos expuestos |
| RF-022 | 2, 3 | `game-store.spec.ts`: acción rechazada → estado, eventos y cara sin cambios |
| RNF-001 | 6, 7 | Medición del contraste del texto blanco con su contorno de tinta en los cuatro colores, anotada en «Decisiones técnicas» |
| RNF-002 | 2, 3, 8, 9 | Ver HU-03.2 |
| RNF-003 | 2, 3 | `game-store.spec.ts`: tirada aplicada a los 500 ms, sin esperas añadidas |
| RNF-004 | 10, 11 | Revisión en navegador a los 4 tamaños; la prueba automática es CE-08, en PARTE-03 |
| RNF-005 | 2, 3, 4, 5 | Cartel y `canRoll` derivados solo del estado del motor; revisión del diff |
| RNF-006 | todos | `pnpm check` sin cambios en `src/engine/`; ESLint impide importar el motor salvo por `@engine` |
| RNF-007 | 1, 6, 7, 8, 9 | Búsqueda de `#[0-9a-fA-F]{3,8}\b` en `src/app/` sin resultados |
| RNF-008 | todos | Sin cambios en `package.json` |
| RNF-009 | 1 | Imágenes WebP con respaldo JPEG; el SVG fuente no está en `public/` |
| Hecho cuando | 10, 11 | `app.spec.ts`: de la tirada inicial a la primera tirada de un jugador, con el cartel correcto en cada paso |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte, si el usuario la pide.
- `run` o `claude-in-chrome`: revisión en navegador del paso 11 a los 4 tamaños.

### Decisiones técnicas

- **Sí:** tests antes que el código también en la aplicación, con un esqueleto que compila (funciones que devuelven un valor vacío, componentes sin plantilla) para que fallen por sus aserciones y no por la compilación, como en el motor.
- **Sí:** `GameStore` con `@Service` y signals, y `headline` como función pura. Una sola fuente de verdad, y el texto del cartel se prueba sin componentes (RF-021, RNF-005).
- **Sí:** el giro y la cara del dado viven en el `GameStore`, que aplica la tirada al motor cuando termina el giro. Así los resaltados de PARTE-02 no aparecen antes de ver la cara, y el retardo se prueba con temporizadores falsos.
- **Sí:** el movimiento reducido se lee con `matchMedia('(prefers-reduced-motion: reduce)')`; con él, el retardo es 0. En CSS, las animaciones solo van con `motion-safe:`.
- **Sí:** `DiceRoller` usa `Math.random`. Es lo que sustituirá `page.addInitScript` en las pruebas en navegador de PARTE-03 (RF-023), sin código de pruebas en la aplicación (RF-024).
- **No:** `crypto.getRandomValues`. No hace falta azar criptográfico y complica sustituirlo desde el navegador.
- **Sí:** las caras del dado como SVG en `public/` con `<img>`. El README del diseño pide usar el SVG sin metadatos, y sus colores quedan fuera de `src/app/`.
- **No:** dibujar el dado dentro del SVG del tablero. El tablero es `role="img"` y solo presenta el estado; el dado es un control con su propio botón.
- **Sí:** cara 6 antes de la primera tirada (supuesto del spec que deja la elección al plan).
- **Sí:** textos del cartel: «Tirada inicial · Amarillo» / «Toca el dado»; «Turno de Rojo» / «Toca el dado»; «Turno de Rojo · 4» / «Elige una ficha iluminada»; «Turno de Rojo» / «Usa tu +20»; «Gana Rojo», sin instrucción.
- **Sí:** `headline` mira el estado en este orden: ganador, tirada inicial, premio pendiente, tirada pendiente y, si no hay nada, tirar. El premio va antes que la tirada, como en `legalMoves` del motor.
- **Sí:** texto del cartel en blanco con contorno de tinta (`--color-ink`), como el diseño. El blanco solo sobre el amarillo no llega a 4,5:1; con el contorno, el contraste que cuenta es el del texto con su contorno, que lo rodea entero.
- **Medición del contraste (RNF-001), paso 7:** el blanco sobre el cartel da 1,96:1 en amarillo, 4,48:1 en azul, 4,83:1 en rojo y 4,25:1 en verde; sin contorno, solo el rojo llega a 4,5:1. El contorno de tinta es de 2 px en las 8 direcciones, y el blanco contra la tinta da 14,51:1 en los cuatro colores.
- **Sí:** `TEAM_BG` y `TEAM_DARK_BORDER` viven en `turn-banner.ts`, porque las clases de `board-palette.ts` son de relleno SVG (`fill-*`) y no sirven en HTML.
- **Sí:** el contorno se hace con `text-shadow` en 8 direcciones, no con `-webkit-text-stroke` y `paint-order`, que en HTML no todos los navegadores pintan por fuera de la letra.
- **Sí:** `waitsForRoll(state)` como función pura exportada, que da `canRoll` junto con `rolling`. Así el premio pendiente y el ganador se prueban sin recorrer una partida entera.
- **Sí:** el almacén expone ya `legalMoves` y `lastEvents`, como pide RF-021; los usarán PARTE-02 y PARTE-03.
- **Sí:** la cara se muestra al tocar, antes de que el motor acepte la tirada; si la rechaza, el dado vuelve a la cara anterior (RF-022).
- **Sí:** el sustituto de `matchMedia` vive en `game-store.spec.ts`, no en `game-test-utils.ts`: los archivos que no son `.spec.ts` entran en la compilación de la aplicación, donde `vi` no existe.
- **Sí:** `jp-dice` pinta las seis caras con `ngSrc` fijo y `loading="eager"`, y oculta con `hidden` las que no tocan. `NgOptimizedImage` no admite cambiar `ngSrc` después de iniciarse, y así no hay parpadeo al cambiar de cara.
- **Sí:** el latido solo anima el brillo, sin escala, con el color en la variable `--dice-glow` que el componente fija por color desde los tokens. Con escala, Playwright nunca ve el botón estable y no puede tocarlo (PARTE-03).
- **Sí:** el dado es un `<button>` deshabilitado cuando no se puede tirar, con `aria-label` «Dado, cara N»; las caras llevan `alt=""` porque el botón ya dice la cara.
- **Sí:** el tablero ocupa el hueco que deja la cabecera con un contenedor `container-type: size` y un ancho `min(100cqw, 100cqh, 900px)`. En apaisado bajo (`orientation: landscape` y alto ≤ 480 px), la cabecera pasa a la izquierda, con un ancho máximo del 40 %.
- **Sí:** en `app.spec.ts` los temporizadores falsos se activan después del primer `whenStable`, que con ellos no termina nunca.
- **Sí:** los dos tests que ya había en `app.spec.ts` pasan a tener el nombre en español, como el resto.
- **Revisión en navegador, paso 11:** sin scroll en ningún tamaño. Tablero de 304 px a 320 × 568 y a 568 × 320 (con la cabecera a la izquierda), de 736 px a 768 × 1024 y de 900 px a 1920 × 1080; el dado mide un 10 % del tablero y queda sobre el tronco. Con las imágenes del fondo bloqueadas se ve el color de carga `--color-jungle` y todo sigue legible.

## PARTE-02: Mover fichas y premios

**Estado:** Pendiente

### Enfoque

La selección es estado de la pantalla, no del motor. Vive en el `GameStore` como `selected` (id de ficha o `null`), con `select(id)`, `confirm()` y `cancel()`:

- `select` solo acepta fichas de `legalMoves`; tocar otra resaltada cambia la selección y tocar la seleccionada la cancela.
- `confirm` aplica la acción `move` con el motor.
- Cada estado nuevo borra la selección.

Los premios no necesitan nada aparte: `legalMoves` del motor ya da los del premio, y `canRoll` ya es falso con premio pendiente (RF-019).

Lo que se pinta sale de una función pura nueva, `movePreview(state, moves, selected)`, en `src/app/board/`:

- Para cada ficha: su modo (sin nada que elegir, resaltada, seleccionada o atenuada), su centro, que en una previsualización de pareja pasa a su lado del tablón, y su área táctil.
- Para la réplica: su centro, su área táctil y sus indicadores, que salen solo del `Move` del motor y del estado (RNF-005): diana si come (`captures`), sol si el destino es la meta, y pareja si en el destino queda otra ficha que no se come (puente si es del mismo color, hoja si es rival en un seguro).

El tablero (`jp-board`) recibe `moves` y `selected` y emite `pieceTouch(id)` y `ghostTouch()`. Las áreas táctiles van en un segundo SVG superpuesto, con el mismo `viewBox`, porque el SVG del dibujo es `role="img"` y sus hijos no pueden ser controles. Un toque en cualquier otro punto llega al `host` de `App` y cancela la selección.

Como en PARTE-01, cada paso de código va precedido de su paso de tests, con un esqueleto que compila y los hace fallar.

### Archivos

- `src/styles.css`: animación `--animate-piece-halo`, solo de opacidad, con sus `@keyframes`.
- `src/app/game/game-store.ts`: `selected`, `select`, `confirm` y `cancel`.
- `src/app/board/board-geometry.ts`: `plankCorners`, las cuatro esquinas de un tablón en coordenadas del tablero.
- `src/app/board/move-preview.ts` (nuevo): `movePreview(state, moves, selected)` y sus tipos.
- `src/app/board/board.ts` y `board.html`:
  - entradas `moves` y `selected`; salidas `pieceTouch` y `ghostTouch`;
  - halo, atenuación y ficha seleccionada más grande;
  - réplica translúcida, diana «+20», sol «+10» y marca de pareja;
  - SVG de áreas táctiles.
- `src/app/app.ts` y `app.html`: pasan `legalMoves` y `selected` al tablero, conectan sus salidas y cancelan con `(click)` en el `host`.
- Tests: `move-preview.spec.ts` (nuevo), y `game-store.spec.ts`, `board-geometry.spec.ts`, `board.spec.ts` y `app.spec.ts`.

### Pasos

- [ ] 1. Tests de la selección en el `GameStore`, con `selected`, `select`, `confirm` y `cancel` vacíos, que fallan:
  - `select` no hace nada con una ficha sin movimiento legal, ni mientras gira el dado, ni sin tirada ni premio pendientes.
  - Tocar otra resaltada cambia la selección, y tocar la seleccionada la cancela.
  - `cancel` no cambia el estado ni `legalMoves`.
  - `confirm` mueve y borra la selección, también con un solo movimiento; sin selección no hace nada.
  - Seleccionar y confirmar son síncronos, sin temporizadores.
  - El premio sigue el mismo flujo y el dado no responde hasta usarlo.
- [ ] 2. Selección en el `GameStore`, hasta que pasen los tests del paso 1 (RF-016, RF-017, RF-019, RF-020, RNF-003).
- [ ] 3. Tests de `plankCorners` y `movePreview` sobre estados construidos con `stateWith` y los `legalMoves` del motor, con un esqueleto que falla (CE-03):
  - Resaltadas exactamente las fichas de `legalMoves`; atenuadas las demás, también las de casa; sin movimientos, ninguna atenuada.
  - Réplica en el destino: la casilla de salida al salir comiendo, la casilla final tras un rebote y el puesto libre de la meta.
  - Cada indicador aparece solo cuando su `Move` lo justifica.
  - Previsualización de pareja: la que ya estaba primero, como queda tras aplicar el movimiento; vuelve al centro al cambiar la selección.
  - Áreas táctiles: el tablón entero, medio tablón en parejas y en la previsualización, un tablón centrado en el puesto de casa, y la casilla o el triángulo de meta para la réplica sola.
- [ ] 4. `plankCorners` y `movePreview`, hasta que pasen los tests del paso 3 (RF-012 a RF-015, RF-018, RNF-005).
- [ ] 5. Tests de `jp-board` con las nuevas entradas y salidas sin pintar nada, que fallan:
  - Clases de halo, atenuación y ficha seleccionada más grande; el halo solo late con `motion-safe:`.
  - Réplica con diana «+20», sol «+10» o marca de pareja, y fichas en su lado de la pareja.
  - Áreas táctiles pintadas con sus polígonos, `role="button"` y `aria-label`.
  - Tocar un área emite `pieceTouch` o `ghostTouch` sin propagar el clic; Intro y Espacio igual.
  - Sin movimientos legales no hay áreas táctiles.
- [ ] 6. Pintar en `jp-board`, con tokens de la paleta, hasta que pasen los tests del paso 5 (RF-012 a RF-015, RF-018, RNF-002, RNF-007).
- [ ] 7. Tests de la aplicación, que fallan con la pantalla actual:
  - Con un `DiceRoller` fijo, salir con un 5: seleccionar, cancelar tocando fuera, volver a seleccionar y confirmar en la réplica.
  - Con un `DiceRoller` fijo, comer: el cartel pide usar el +20, el dado no responde y el premio se usa. La secuencia de tiradas se comprueba antes con el motor.
  - Con el `GameStore` sustituido en el test por uno con un estado con ganador: cartel «Gana Rojo» en rojo, dado inactivo y ninguna ficha resaltada ni que responda (CE-05).
- [ ] 8. Montar en `App`: conectar entradas y salidas del tablero y cancelar con `(click)` en el `host`, hasta que pasen los tests del paso 7; revisión en navegador a los 4 tamaños y medición de las áreas táctiles a 320 × 568 (HU-04, HU-05, HU-06, HU-08, CE-07).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-04.1 (halo y atenuación) | 3, 4, 5, 6 | `move-preview.spec.ts`: resaltadas = `legalMoves`, el resto atenuado, también en casa; `board.spec.ts`: clases |
| HU-04.2 (crece, réplica) | 3–8 | `move-preview.spec.ts`: réplica en el destino; `board.spec.ts`: radio mayor; `app.spec.ts`: tocar ficha → réplica |
| HU-04.3 (confirmar en réplica) | 1, 2, 7, 8 | `game-store.spec.ts`: `confirm` mueve; `app.spec.ts`: tocar réplica → ficha en destino, sin halo, réplica ni atenuación |
| HU-04.4 (cambiar selección) | 1–4 | `game-store.spec.ts`: `select` de otra resaltada; `move-preview.spec.ts`: réplica de la nueva |
| HU-04.5 (cancelar) | 1, 2, 7, 8 | `game-store.spec.ts`: tocar la seleccionada cancela; `app.spec.ts`: tocar fuera cancela y los halos siguen |
| HU-04.6 (un solo movimiento) | 1, 2, 7, 8 | Salida con 5, único movimiento: no mueve sin confirmar |
| HU-04.7 (tablón a 320 px) | 3, 4, 8 | `move-preview.spec.ts`: área = esquinas del tablón; medición en navegador a 320 × 568 |
| HU-05.1 (diana +20) | 3–6 | `move-preview.spec.ts`: solo con `captures`; `board.spec.ts`: diana con «+20» |
| HU-05.2 (sol +10) | 3–6 | `move-preview.spec.ts`: solo con destino meta; `board.spec.ts`: sol con «+10» |
| HU-05.3 (pareja) | 3–6 | `move-preview.spec.ts`: la que estaba a su lado, réplica al otro, puente u hoja; `board.spec.ts`: posiciones |
| HU-05.4 (seleccionar la de la pareja) | 3, 4 | `move-preview.spec.ts`: vuelve al centro y tiene su réplica |
| HU-05.5 (confirmar en pareja) | 1–4 | `move-preview.spec.ts`: la previsualización coincide con el estado tras aplicar el movimiento |
| HU-05.6 (salir comiendo) | 3, 4 | `move-preview.spec.ts`: réplica en la casilla de salida con diana (R-023) |
| HU-06.1 (+20, halos, dado inactivo) | 1, 2, 7, 8 | `app.spec.ts`: tras comer, cartel «Usa tu +20», fichas del premio resaltadas, dado deshabilitado |
| HU-06.2 (usar premio) | 1, 2, 7, 8 | `app.spec.ts`: confirmar → avanza 20 y el cartel pide tirar o pasa de turno |
| HU-06.3 (premio encadenado) | 1, 2 | `game-store.spec.ts`: el flujo no distingue premios; el texto ya lo prueba `headline.spec.ts` |
| HU-08.1 (Gana Rojo) | 7, 8 | `app.spec.ts` con estado con ganador: cartel «Gana Rojo» en rojo |
| HU-08.2 (todo quieto) | 1–8 | `game-store.spec.ts`: `select` no hace nada; `board.spec.ts`: sin áreas táctiles; `app.spec.ts`: dado deshabilitado y tablero en la posición final |
| RF-012, RF-013 | 3–6 | Ver HU-04.1 y HU-04.2 |
| RF-014, RF-015 | 3–6 | Ver HU-05.1 a HU-05.5 |
| RF-016, RF-017 | 1, 2, 7, 8 | Ver HU-04.3 a HU-04.6 |
| RF-018 | 3–6 | `move-preview.spec.ts`: tablón, mitades, casa y réplica; `board.spec.ts`: polígonos pintados |
| RF-019 | 1, 2, 7, 8 | Ver HU-06 |
| RF-020 | 1–8 | Ver HU-08 |
| RNF-002 | 5, 6 | `board.spec.ts`: el halo solo late con `motion-safe:` |
| RNF-003 | 1, 2 | `game-store.spec.ts`: selección y confirmación síncronas, sin temporizadores |
| RNF-005 | 3, 4 | `movePreview` solo lee `Move` y el estado; revisión del diff |
| RNF-006, RNF-008 | todos | `pnpm check`; `src/engine/` y `package.json` sin cambios |
| RNF-007 | 5, 6 | Búsqueda de `#[0-9a-fA-F]{3,8}\b` en `src/app/` sin resultados |
| CE-03 | 3–6 | `move-preview.spec.ts` y `board.spec.ts` |
| CE-05 | 7, 8 | `app.spec.ts` con estado con ganador |
| CE-07 | 3, 4, 8 | Área = esquinas del tablón en unidades del SVG; medición en navegador a 320 px |
| Hecho cuando | 8 | Todo lo anterior en verde con `pnpm check` y `pnpm test:e2e` |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte, si el usuario la pide.
- `run` o Playwright: revisión en navegador y medición de las áreas táctiles del paso 8.

### Decisiones técnicas

- **Sí:** la selección en el `GameStore`, junto al estado. El tablero sigue sin estado propio, y confirmar, cambiar o cancelar se prueban sin componentes.
- **Sí:** `movePreview` como función pura en `src/app/board/`. Es geometría de pantalla a partir del `Move` del motor y no decide reglas (RNF-005).
- **Sí:** `movePreview` da a cada ficha un modo: `idle` si no hay nada que elegir, y si no `highlighted`, `selected` o `dimmed`. Así, sin movimientos legales (ganador, dado girando o esperando tirada), no se atenúa nada.
- **Sí:** la marca de pareja distingue puente (mismo color) y hoja (rival en un seguro), como el diseño. Solo mira el color de la ficha que ya ocupa el destino.
- **Sí:** el área táctil de una ficha sale de su centro: el tablón entero si está en el centro de su casilla, y la mitad más cercana si no. Sirve igual para las parejas y para la previsualización de pareja.
- **Sí:** en casa, el área es un rectángulo del tamaño de un tablón, horizontal y centrado en el puesto.
- **Sí:** las áreas táctiles van en un SVG aparte superpuesto. Los hijos de un `role="img"` son decorativos para los lectores de pantalla.
- **Sí:** áreas táctiles con `role="button"`, `tabindex="0"`, `aria-label` y teclas Intro y Espacio. Lo exige el lint de accesibilidad de plantillas, que no se desactiva (P-09). La accesibilidad completa con teclado sigue siendo de otro spec.
- **Sí:** se cancela tocando fuera con `(click)` en el `host` de `App`, y los toques del tablero paran la propagación.
- **Sí:** la ficha seleccionada crece con un radio mayor, no con `transform: scale`, que en SVG obliga a ajustar `transform-box`.
- **Sí:** solo tokens que ya existen: halo con `sun`, diana con `team-red` y blanco, sol con `team-yellow` y `sun`, puente con los tonos de madera y hoja con `canopy`.
- **Sí:** el halo late solo en opacidad. Sin escala, Playwright puede tocar las fichas en PARTE-03.
- **Sí:** los tests del almacén llegan a cada situación con secuencias reales de tiradas, comprobadas antes con el motor: salir con un 5 (un solo movimiento), dos fichas azules y un 6 (dos movimientos), y rojo come y gana un +20.
- **Sí:** el ganador se prueba en `app.spec.ts` sustituyendo el `GameStore` por inyección con uno que expone un estado con ganador, solo en el test. El almacén real no puede empezar desde un estado construido sin añadir código solo para tests (RF-024).
- **Sí:** los tests de `movePreview` usan los `legalMoves` del motor sobre estados construidos, no movimientos escritos a mano.
- **Observación:** en el spec, HU-05 numera dos criterios como «4.»; aquí el de salir comiendo es HU-05.6.
