# Plan técnico — SPEC 006 — Jugar una partida

> **Spec:** `specs/006-jugar-partida/spec.md`
> **Rama:** `feat/spec-006-jugar-partida`
> **Fecha:** 2026-10-26

## PARTE-01: Pantalla, dado y tirada inicial

**Estado:** Pendiente

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
- [ ] 9. `jp-dice`, hasta que pasen los tests del paso 8 (RF-007, RF-008, RNF-002).
- [ ] 10. Tests de la aplicación con un `DiceRoller` fijo que recorren HU-01, HU-02 y HU-03: fondo, cabecera antes del tablero, dado sobre el tablero, tirada inicial con desempate y primera tirada de un jugador. Fallan con la pantalla actual.
- [ ] 11. Montar la pantalla: cabecera con el cartel encima del tablero y dado sobre el tronco, sin scroll, hasta que pasen los tests del paso 10; revisión en navegador a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, y con las imágenes del fondo bloqueadas (RF-002, HU-01, HU-02, HU-03, RNF-004).

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
- `run` o `claude-in-chrome`: revisión en navegador del paso 6 a los 4 tamaños.

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
