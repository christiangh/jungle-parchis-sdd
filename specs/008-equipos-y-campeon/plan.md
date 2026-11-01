# Plan técnico — SPEC 008 — Equipos y campeón

> **Spec:** `specs/008-equipos-y-campeon/spec.md`
> **Rama:** `feat/spec-008-equipos-y-campeon`
> **Fecha:** 2026-10-30

## PARTE-01: Pantalla de campeón

**Estado:** Hecha

### Enfoque

Un componente nuevo, `Champion` (`src/app/game/champion.ts`), reconstruye la pantalla de `docs/design/avisos-y-campeon` con la paleta y los componentes de la aplicación: capa oscura fija sobre toda la pantalla, rayos de sol detrás, tablón del color del ganador con su mascota flotando y el trofeo, «¡Campeón!» y, debajo, el botón «Nueva partida» de madera natural. El trofeo, los rayos y el confeti se dibujan en SVG y HTML propios, con colores de tokens nuevos. La posición, el tamaño y el ritmo de cada trozo de confeti salen de una función pura con semilla fija, como en el diseño, para que el confeti sea el mismo en cada partida y se pueda probar.

`App` pinta la pantalla de campeón fuera de `<main>` en cuanto el estado del motor tiene ganador, y marca `<main>` como `inert` mientras tanto: la partida sigue visible detrás, pero no la alcanzan ni el teclado ni el lector. La pantalla es un diálogo modal propio (`role="dialog"`, `aria-modal="true"`), sin manejadores de Escape ni de toque fuera, y el foco pasa al botón al crearse. Su único control es «Nueva partida», que llama a un método nuevo del almacén, `restart()`, que crea con el motor otra partida con los mismos equipos y vuelve todo lo de la pantalla (última jugada, cara del dado, selección) a su estado inicial. En PARTE-02 ese botón pasará a llevar a la pantalla de inicio.

Con movimiento reducido no se pinta el confeti, los rayos quedan quietos, la mascota no se anima y el trofeo no brilla. El componente lo lee al crearse con una función compartida, la misma que pasa a usar el almacén para el giro del dado; además, cada animación va con `motion-safe:` o dentro de `@media (prefers-reduced-motion: no-preference)`. En ventanas bajas (`max-height: 480px`) el botón se coloca al lado del tablón y la mascota, el trofeo y el título se reducen; por debajo de 520 px de ancho se reduce todo como en el diseño.

### Archivos

- `src/styles.css`: tokens de la capa, el trofeo, los rayos, el confeti y el botón de madera (`--color-champion-*`, `--color-trophy-*`); `@keyframes` y `--animate-*` del flotado de la mascota, el giro y el brillo de los rayos y la caída del confeti.
- `src/app/shared/reduced-motion.ts`, `reduced-motion.spec.ts` (nuevos): `REDUCED_MOTION` y `prefersReducedMotion(window)`.
- `src/app/game/game-store.ts`: usa `prefersReducedMotion`; método `restart()`.
- `src/app/game/game-store.spec.ts`: tests de `restart()`.
- `src/app/game/confetti.ts`, `confetti.spec.ts` (nuevos): `confettiPieces(color)` (función pura con semilla fija), `CONFETTI_COLORS` (clases de token por equipo) y el componente `Confetti`.
- `src/app/game/trophy.ts`, `trophy.html` (nuevos): componente `g[jp-trophy]`, trofeo con su brillo y destellos.
- `src/app/game/sun-rays.ts` (nuevo): componente `g[jp-sun-rays]`, 16 rayos y halo.
- `src/app/game/champion.ts`, `champion.html`, `champion.css`, `champion.spec.ts` (nuevos): pantalla de campeón con la salida `newGame`.
- `src/app/app.ts`, `app.html`: pinta `Champion` con ganador, `inert` en `<main>` y `restart()` al pulsar «Nueva partida».
- `src/app/app.spec.ts`: tests de la pantalla de campeón sobre la partida; `restart` en el almacén de prueba.

### Pasos

- [x] 1. Tokens de la capa, el trofeo, los rayos, el confeti y el botón en `src/styles.css`, con los colores del diseño (reutilizando los que ya existen, como `--color-wood`, `--color-wood-edge`, `--color-ink`, `--color-mascot-gold` o `--color-home-turn-glow`), y sus animaciones; búsqueda de hexadecimales en `src/app/` sin resultados (RNF-007).
- [x] 2. Tests de `reduced-motion.ts`, con un esqueleto que compila y los hace fallar: `true` si `prefers-reduced-motion: reduce` coincide, `false` si no, y `false` sin ventana o sin `matchMedia` (RNF-002).
- [x] 3. `reduced-motion.ts`, hasta que pasen los tests del paso 2, y el almacén lo usa en lugar de su método privado; los tests del almacén pasan sin cambios.
- [x] 4. Tests de `confettiPieces`, con un esqueleto que compila y los hace fallar: 46 trozos; colores solo de la paleta del equipo y todos usados; posición horizontal entre 0 y 100 %; duración entre 3,6 y 6,6 s con retardo negativo, para que caiga desde el primer instante; mismo resultado en cada llamada (RF-001).
- [x] 5. `confettiPieces` y `CONFETTI_COLORS`, hasta que pasen los tests del paso 4.
- [x] 6. Tests de `restart()` en `game-store.spec.ts`, con un esqueleto que no hace nada: tras unas tiradas y con una ficha seleccionada, `restart()` deja el estado igual a `createGame` con los mismos equipos (tirada inicial, turno de Amarillo), sin eventos ni último jugador, el dado en su cara inicial y que responde, y sin selección (RF-002, «Hecho cuando»).
- [x] 7. `restart()`, hasta que pasen los tests del paso 6.
- [x] 8. Componentes `Trophy`, `SunRays`, `Confetti` y `Champion`, con sus tests en `champion.spec.ts` en el mismo paso, porque son dibujo y plantilla: tablón del color del ganador con su mascota animada, trofeo, «¡Campeón!», rayos y confeti con su paleta, para los cuatro colores; ningún otro equipo ni puesto; `role="dialog"`, `aria-modal` y nombre accesible «¡Campeón! Gana Verde»; foco en «Nueva partida» al abrirse; Escape no emite nada; pulsar el botón emite `newGame`; con movimiento reducido, sin confeti, mascota sin animar y sin clases de animación (HU-01, RF-001, RF-002, RF-003, RNF-002, CE-01, CE-02).
- [x] 9. Pantalla de campeón en `App`, con sus tests en `app.spec.ts`: con un estado ganador aparece sobre la partida, fuera de `<main>`, y `<main>` es `inert`; sin ganador, ni pantalla ni `inert`; tocar la capa fuera del tablón y pulsar Escape no la quitan; «Nueva partida» llama a `restart()`; con el almacén real, tras `restart()` el cartel vuelve a la tirada inicial de Amarillo con 16 fichas en casa y sin pestaña (HU-01, RF-002, RF-003, «Hecho cuando»).
- [x] 10. Revisión manual en navegador de la pantalla de campeón a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido, frente a las capturas del diseño: el tablón y el botón caben enteros, el confeti y los rayos no tapan el botón, y el contraste del texto se mantiene con los cuatro colores. La partida se lleva al ganador con un script de Playwright en el directorio temporal de la sesión, sin código en el proyecto. Resultado registrado en «Decisiones técnicas» (RF-001, RNF-003, RNF-004, CE-06 en lo que toca a esta pantalla).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-01.1 (pantalla de campeón verde con la rana, trofeo, rayos y confeti) | 4, 5, 8, 9 | `champion.spec.ts`: `HU-01.1: …` con verde y los otros tres colores; `confetti.spec.ts`: paleta del equipo; `app.spec.ts`: aparece con el estado ganador |
| HU-01.2 (anuncia el ganador, foco en nueva partida) | 8 | `champion.spec.ts`: nombre accesible «¡Campeón! Gana Verde» y `document.activeElement` en el botón |
| HU-01.3 (Escape y tocar fuera no la cierran) | 8, 9 | `champion.spec.ts`: Escape no emite `newGame`; `app.spec.ts`: tras Escape y un toque en la capa sigue la pantalla |
| HU-01.4 (solo el ganador) | 8 | `champion.spec.ts`: una sola mascota, la del ganador, y ningún nombre de otro equipo |
| RF-001 | 1, 4, 5, 8, 10 | Ver HU-01.1; revisión manual de la reducción por debajo de 520 px y de la variante baja |
| RF-002 | 6, 7, 8, 9 | `game-store.spec.ts`: `RF-002: …` de `restart()`; `champion.spec.ts`: el botón emite `newGame`; `app.spec.ts`: llama a `restart()` |
| RF-003 | 8, 9 | `champion.spec.ts`: `role`, `aria-modal`, nombre y foco; `app.spec.ts`: `<main>` `inert` |
| RNF-002 | 2, 3, 8, 10 | `reduced-motion.spec.ts`; `champion.spec.ts` con `matchMedia` simulado; revisión manual con movimiento reducido |
| RNF-001 (transversal) | 8, 9 | Ver RF-003; el botón es un `<button>` con texto visible |
| RNF-003 (transversal) | 1, 10 | Texto blanco con contorno de tinta, como el cartel de SPEC 007; botón con `--color-ink` sobre `--color-wood` (5,7:1 en el diseño); revisión manual |
| RNF-004 (transversal, solo esta pantalla) | 10 | Revisión manual en las cuatro ventanas |
| RNF-005 (botón ≥ 24 × 24 px) | 8 | `champion.spec.ts`: el botón lleva `min-h-14` |
| RNF-006 (transversal) | 1-10 | `git diff master -- src/engine` vacío |
| RNF-007 (transversal) | 1, 8 | Búsqueda de `#[0-9a-fA-F]{3,8}\b` en `src/app/` sin resultados; ningún archivo de `docs/design` importado; sin dependencias nuevas |
| CE-01 | 8 | `champion.spec.ts` |
| CE-02 | 8 | `champion.spec.ts`: `CE-02: …` con movimiento reducido |
| Hecho cuando: nueva partida empieza otra de 4 equipos desde la tirada inicial | 6, 7, 9 | `game-store.spec.ts` y `app.spec.ts` con el almacén real |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- MCP `angular-cli` (`get_best_practices`): convenciones de Angular 22 antes de escribir los componentes.
- `run` o `claude-in-chrome`: revisión manual del paso 10.
- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte, si el usuario la pide.

### Decisiones técnicas

- **Sí:** diálogo modal propio con `role="dialog"`, `aria-modal="true"` e `inert` en `<main>`. Deja la partida fuera del alcance del teclado y del lector, y como «Nueva partida» es el único control, el foco no tiene adónde salir.
- **No:** `<dialog>` nativo con `showModal()`. El entorno de los tests unitarios (jsdom) no implementa `showModal`, y habría que simularlo; además, Escape lo cerraría por defecto y habría que cancelarlo.
- **Sí:** nombre accesible «¡Campeón! Gana Verde», con el título visible y el nombre del equipo como texto solo para el lector. Dice qué equipo ha ganado sin añadir texto visible que no está en el diseño.
- **Sí:** el tablón reutiliza el del cartel de turno (`TEAM_BG`, `TEAM_DARK_BORDER`, `bg-plank`, `text-outline-ink`) en lugar del borde y la sombra propios de cada color del diseño. Mismo aspecto que el cartel y contraste ya comprobado en SPEC 007, sin ocho tokens nuevos.
- **Sí:** la mascota va en una placa redonda del tono oscuro del equipo, como en el cartel y los medallones, flotando arriba y abajo. El diseño usa el fondo cuadrado de los componentes de `docs/design/mascotas`, que la aplicación no tiene.
- **Sí:** confeti de 46 trozos con la misma semilla y fórmula que el diseño, en una función pura. Es determinista y se prueba sin el navegador.
- **Sí:** movimiento reducido leído al crear la pantalla, con una función compartida en `src/app/shared/reduced-motion.ts` que también usa el almacén. Así el confeti ni se pinta y el test lo comprueba simulando `matchMedia`; las clases `motion-safe:` cubren además un cambio del ajuste con la pantalla abierta.
- **Sí:** `restart()` en el almacén crea la partida con los equipos de la actual (`state.players`). En PARTE-02 el botón llevará a la pantalla de inicio con esos mismos equipos.
- **Sí:** variante baja con `max-height: 480px`, el mismo umbral que ya pone la pantalla de partida en fila en horizontal: botón al lado del tablón y mascota, trofeo y título más pequeños. En el paso 8 se usa la misma variante exacta que `App`, `[@media(orientation:landscape)_and_(max-height:480px)]:`, para que las dos pantallas cambien a la vez.
- **Sí (paso 8):** sin `champion.css`. Todo cabe en clases de Tailwind y en los `@keyframes` de `src/styles.css`, así que el archivo previsto en «Archivos» no hace falta.
- **Sí (paso 8):** con movimiento reducido el trofeo no pinta su brillo ni sus destellos, en lugar de dejarlos quietos: un brillo fijo parecería una mancha sobre la copa.
- **Revisión manual (paso 10):** partidas aleatorias con semilla llevadas al ganador con un script de Playwright contra `ng serve` de producción, una por color (ganan Amarillo, Rojo, Verde y Azul), más Amarillo y Verde con movimiento reducido, a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080. En las 24 capturas el tablón y el botón caben enteros, el botón queda encima del confeti y de los rayos (es el elemento bajo su centro), tiene el foco, mide 274 × 56 px y no hay scroll. A 568 × 320 se usa la variante baja, con el botón al lado del tablón. Con movimiento reducido no hay confeti y los rayos quedan quietos. El texto blanco con contorno de tinta se lee en los cuatro tablones y la capa tiene el color del diseño. Sin cambios de código.
- **Sí:** trofeo, rayos y confeti en archivos propios de `src/app/game/`, porque solo los usa la pantalla de campeón; PARTE-04 reutilizará la capa y el tablón, no estos efectos.

## PARTE-02: Pantalla de inicio y partidas de 2 y 3 equipos

**Estado:** Hecha

### Enfoque

Un componente nuevo, `Start` (`src/app/start/start.ts`), reconstruye la pantalla «¿Quién juega?» de `docs/design/inicio-y-menu` con la paleta de la aplicación: capa oscura sobre la partida, caja crema con el título, una tarjeta por equipo en una cuadrícula de 2 × 2 en la posición de su casa (rojo y azul arriba, verde y amarillo abajo), el estado «N equipos listos» y el botón «¡A jugar!». Cada tarjeta es un botón con `aria-pressed`: activada, con el color del equipo, su mascota y una marca blanca con ✓; desactivada, punteada, con la mascota apagada y un «+». La mascota va en una placa redonda del tono oscuro del equipo, como en la pantalla de campeón. La lógica de la selección (alternar un equipo manteniendo el orden de los colores, si se puede empezar y el texto del estado) son funciones puras en `src/app/start/teams.ts`.

El almacén pasa a saber qué pantalla se ve: `screen` empieza en `'start'`, `start(players)` crea con el motor la partida de esos equipos, vuelve todo lo de la pantalla a su estado inicial y pasa a `'game'`, y `chooseTeams()` vuelve a `'start'` sin tocar la partida. `start` sustituye a `restart()` de PARTE-01. La selección inicial de la pantalla de inicio son los equipos de la partida del almacén (`state.players`): al cargar, los cuatro; tras una partida, los de esa partida. Así se recuerda mientras la página siga abierta y no se guarda nada en el navegador (RF-008).

`App` pinta la pantalla de inicio fuera de `<main>` mientras `screen` es `'start'`, con `<main>` `inert`, y la de campeón solo en `'game'`. El botón de la de campeón llama a `chooseTeams()`.

Al activar un equipo, su mascota hace una vez su animación de SPEC 007: `Mascot` recibe una entrada `once` que deja cada bucle en una sola vuelta, y la tarjeta solo la anima si el equipo se ha activado en esta visita a la pantalla. Al desactivarlo se quita la animación, así que volver a activarlo la repite. Con movimiento reducido la tarjeta no pide animación, como la pantalla de campeón.

En el tablero, una función pura `inactiveHomes(state)` da los colores que no juegan. Sus casas y medallones se pintan atenuados (opacidad y escala de grises) y con `data-inactive`. Ya no tienen fichas, porque el motor solo las crea para los equipos de la partida, y nunca se resaltan ni se animan, porque el motor nunca les da el turno (R-010); las pruebas lo comprueban igualmente.

En ventanas bajas (`max-height: 480px`, la misma variante que la partida y la pantalla de campeón), la caja se pone en fila: título, estado y botón a la izquierda y la cuadrícula de 2 × 2, con tarjetas más bajas, a la derecha.

### Archivos

- `src/styles.css`: tokens de la pantalla de inicio (`--color-start-*`: caja, tarjeta desactivada, bordes punteados, textos, botón y sus estados), reutilizando `--color-champion-focus` (el acento del diseño) y la capa de la pantalla de campeón.
- `src/app/start/teams.ts`, `teams.spec.ts` (nuevos): `toggleTeam`, `canStart`, `teamsStatus`, `MIN_TEAMS`.
- `src/app/start/start.ts`, `start.html`, `start.spec.ts` (nuevos): pantalla de inicio con la entrada `teams` y la salida `startGame`.
- `src/app/game/game-store.ts`, `game-store.spec.ts`: `screen`, `start(players)` y `chooseTeams()`; sale `restart()`.
- `src/app/shared/mascot.ts`, `mascot.css`, `mascot.spec.ts`: entrada `once`.
- `src/app/board/board-turn.ts`, `board-turn.spec.ts`: `inactiveHomes(state)`.
- `src/app/board/board.ts`, `board.html`, `board.spec.ts`: casas y medallones inactivos atenuados.
- `src/app/app.ts`, `app.html`, `app.spec.ts`: pantalla de inicio, `inert` y nueva partida desde la de campeón.
- `e2e/start.ts` (nuevo): ayudante `startGame(page, teams?)` que deja activados solo los equipos pedidos y pulsa «¡A jugar!».
- `e2e/*.spec.ts`: pasan por la pantalla de inicio con `startGame`; `e2e/screen.spec.ts` comprueba además la pantalla de inicio sin scroll en las cuatro ventanas.

### Pasos

- [x] 1. Tests de `teams.ts`, con un esqueleto que compila y los hace fallar: `toggleTeam` activa un equipo desactivado y desactiva uno activado, y devuelve los equipos en el orden de `COLORS`; `canStart` es falso con 0 y 1 equipos y verdadero con 2, 3 y 4; `teamsStatus` dice «Elige al menos 2 equipos» con menos de 2 y «N equipos listos» con 2 o más (HU-03.4, RF-005).
- [x] 2. `teams.ts`, hasta que pasen los tests del paso 1.
- [x] 3. Tests del almacén en `game-store.spec.ts`, con un esqueleto de `start` y `chooseTeams` que no hace nada: al crearse, `screen` es `'start'` con los cuatro equipos; `start(['yellow', 'green'])` deja el estado igual a `createGame` con esos equipos, la tirada inicial solo entre ellos, sin última jugada, con la cara inicial, sin selección y en `'game'`; `chooseTeams()` vuelve a `'start'` y conserva los equipos de la partida. Los tests de `restart()` de PARTE-01 pasan a `start` (HU-02.1, HU-02.2, HU-03.3, RF-004, RF-007, RF-008).
- [x] 4. `start` y `chooseTeams` en el almacén, hasta que pasen los tests del paso 3; sale `restart()`, y `App`, hasta el paso 10, llama a `start` con los mismos equipos.
- [x] 5. Tests de `inactiveHomes` en `board-turn.spec.ts`, con un esqueleto que devuelve un conjunto vacío: con amarillo, rojo y verde, solo azul; con amarillo y verde, azul y rojo; con cuatro, ninguno; y `homeInTurn` nunca da una casa inactiva en una partida de 2 equipos a lo largo de varios turnos (HU-04.1, HU-04.2, RF-009).
- [x] 6. `inactiveHomes`, hasta que pasen los tests del paso 5.
- [x] 7. Casas y medallones inactivos en el tablero, con sus tests en `board.spec.ts`: con amarillo, rojo y verde, la casa y el medallón azules llevan `data-inactive` y las clases de atenuado, sin fichas, sin resalte ni mascota animada; con cuatro equipos, ninguno (HU-04.1, RF-009).
- [x] 8. Entrada `once` de `Mascot`, con su test en `mascot.spec.ts`: con `once`, el host lleva `data-once` y la hoja deja cada animación en una vuelta (RF-006).
- [x] 9. Tokens de la pantalla de inicio y componente `Start`, con sus tests en `start.spec.ts`: diálogo modal con nombre «¿Quién juega?»; cuatro tarjetas en el orden rojo, azul, verde y amarillo, con su mascota y su nombre, todas `aria-pressed="true"` con los cuatro equipos; foco en la primera; tocar una la desactiva con su estilo apagado y su «+»; activarla anima su mascota una vez y con movimiento reducido no; las que ya estaban activadas no se animan; con un equipo, «¡A jugar!» está desactivado y el estado dice «Elige al menos 2 equipos»; con dos, emite `startGame` con los equipos en el orden de `COLORS`; se maneja con teclado; controles de al menos 24 × 24 px (HU-03.1, HU-03.2, HU-03.4, HU-03.5, RF-004, RF-005, RF-006, RNF-001, RNF-002, RNF-005).
- [x] 10. Pantalla de inicio en `App`, con sus tests en `app.spec.ts`: al cargar aparece con los cuatro equipos activados, fuera de `<main>`, y `<main>` es `inert`; «¡A jugar!» con amarillo y verde empieza esa partida, sin pantalla de inicio ni `inert`; con el almacén real, la tirada inicial y los turnos son solo entre amarillo y verde; en la pantalla de campeón de una partida de amarillo y verde, «Nueva partida» lleva a la pantalla de inicio con solo esos dos activados y sin la de campeón (HU-02.1, HU-02.2, HU-03.1, HU-03.3, HU-04.2, RF-004, RF-007, RF-008).
- [x] 11. Pruebas en navegador: ayudante `startGame` en `e2e/start.ts`, y todas las pruebas de `e2e/` pasan por la pantalla de inicio con él; `screen.spec.ts` comprueba la pantalla de inicio entera y sin scroll en las cuatro ventanas; una prueba nueva desactiva azul y rojo, empieza y comprueba que las casas azul y roja están atenuadas y que la tirada inicial es de amarillo y verde (HU-03.3, HU-04.1, RNF-004, parte de CE-06).
- [x] 12. Revisión manual en navegador de la pantalla de inicio y de las casas inactivas a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido, frente a las capturas del diseño: contraste de textos y tarjetas, la animación de la mascota al activar y el foco. Resultado registrado en «Decisiones técnicas» (RNF-001, RNF-002, RNF-003, RNF-004).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-02.1 (nueva partida desde campeón con amarillo y verde activados) | 3, 4, 10 | `game-store.spec.ts`: `chooseTeams()` conserva los equipos; `app.spec.ts`: pantalla de inicio con solo amarillo y verde activados |
| HU-02.2 (recargar en la pantalla de campeón da los cuatro) | 3, 10 | `game-store.spec.ts`: un almacén nuevo empieza en `'start'` con los cuatro; `app.spec.ts`: al cargar, los cuatro activados |
| HU-03.1 (cuatro equipos con mascota y nombre, en la posición de su casa, activados) | 9, 10 | `start.spec.ts`: orden rojo, azul, verde y amarillo, mascota, nombre y `aria-pressed`; `app.spec.ts`: al cargar |
| HU-03.2 (la mascota se anima al activar; sin animación con movimiento reducido) | 8, 9 | `mascot.spec.ts`: `once`; `start.spec.ts` con y sin `matchMedia` simulado |
| HU-03.3 (amarillo y verde, tirada inicial solo entre ellos) | 3, 4, 10, 11 | `game-store.spec.ts`: `start`; `app.spec.ts` con el almacén real; `e2e`: partida de amarillo y verde |
| HU-03.4 (con menos de 2, «¡A jugar!» no responde y se indica) | 1, 2, 9 | `teams.spec.ts`; `start.spec.ts`: botón desactivado, sin `startGame`, y estado |
| HU-03.5 (teclado y lector) | 9 | `start.spec.ts`: Enter y espacio sobre las tarjetas y el botón, `aria-pressed`, nombre del diálogo y estado en una región `aria-live` |
| HU-04.1 (casa azul sin fichas, escena y medallón atenuados y quietos) | 5, 6, 7, 11 | `board-turn.spec.ts`; `board.spec.ts`; `e2e`: casas atenuadas |
| HU-04.2 (turno solo entre amarillo y verde, sin resaltar casas inactivas) | 5, 6, 10 | `board-turn.spec.ts`: `homeInTurn` a lo largo de varios turnos; `app.spec.ts` con el almacén real |
| RF-004 | 3, 9, 10 | Ver HU-02.2 y HU-03.1 |
| RF-005 | 1, 2, 9 | Ver HU-03.4 |
| RF-006 | 8, 9, 12 | Ver HU-03.2; revisión manual de la animación |
| RF-007 | 3, 4, 10 | `game-store.spec.ts`: estado igual a `createGame` con los equipos, sin última jugada |
| RF-008 | 3, 4, 10 | Ver HU-02.1; ningún acceso a `localStorage` ni `sessionStorage` |
| RF-009 | 5, 6, 7 | Ver HU-04.1 y HU-04.2 |
| RNF-001 (transversal) | 9, 12 | Ver HU-03.5; el estado activado no depende solo del color: marca ✓ o «+», borde continuo o punteado y `aria-pressed` |
| RNF-002 (transversal) | 9, 12 | Ver HU-03.2 |
| RNF-003 (transversal) | 9, 12 | Nombres blancos con contorno de tinta sobre el color del equipo, como el cartel; textos y botón con los colores del diseño; revisión manual |
| RNF-004 (transversal) | 11, 12 | `e2e/screen.spec.ts`: pantalla de inicio en las cuatro ventanas |
| RNF-005 (transversal) | 9 | `start.spec.ts`: tarjetas y botón con alto mínimo de al menos 24 px |
| RNF-006 (transversal) | 1-12 | `git diff master -- src/engine` vacío |
| RNF-007 (transversal) | 9 | Sin colores en hexadecimal en `src/app/`; ningún archivo de `docs/design` importado; sin dependencias nuevas |
| CE-03 (lo que toca a esta parte) | 9, 10 | `start.spec.ts` y `app.spec.ts`; la vuelta desde el menú llega en PARTE-03 |
| CE-06 (lo que toca a la pantalla de inicio) | 11 | `e2e/screen.spec.ts` |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- MCP `angular-cli` (`get_best_practices`): convenciones de Angular 22 antes de escribir `Start`.
- Script de Playwright en el directorio temporal de la sesión para la revisión manual del paso 12, como en PARTE-01.

### Decisiones técnicas

- **Sí:** la pantalla de inicio es una capa sobre la partida, como en el diseño, y no una página aparte ni una ruta. Reutiliza la capa y el `inert` de la pantalla de campeón; al cargar, detrás se ve el tablero de cuatro equipos.
- **Sí:** la pantalla que se ve vive en el almacén (`screen`), junto a la partida, y la selección inicial son los equipos de la partida (`state.players`). No hace falta otro servicio ni guardar la selección aparte.
- **Sí:** `start(players)` sustituye a `restart()`: desde esta parte, nueva partida siempre pasa por la pantalla de inicio.
- **Sí:** la mascota de la tarjeta va en una placa redonda del tono oscuro del equipo, como en la pantalla de campeón, en lugar del fondo cuadrado de `docs/design/mascotas`.
- **Sí:** animación de una sola vuelta con una entrada `once` en `Mascot` en lugar de copiar sus bucles. Para repetirla al volver a activar, basta con quitar y poner la animación.
- **Sí:** «¡A jugar!» desactivado con `disabled` y el motivo en el estado, que es una región `aria-live`, como en el diseño.
- **Sí:** casas inactivas atenuadas con opacidad y escala de grises sobre la casa y el medallón, sin tocar las casillas de salida ni los pasillos, que siguen siendo del tablero.
- **Sí:** «¡A jugar!» en Figtree 600, la que ya sirve la aplicación, con fondo `--color-start-button` = `accent-700` de la paleta del diseño (#8c491a, 5,72:1 con el texto crema); al pasar el ratón y al pulsar, `--color-wood-edge` (6,50:1); desactivado, opacidad 0,45 como en el diseño (WCAG no exige contraste a un control desactivado). **No:** el acento #c67139 del diseño, que con texto crema da 3,03:1 y en Figtree 600 no llega a texto grande en negrita; añadir Figtree 700 sería otro recurso para un solo botón.
- **Sí:** la salida de `Start` se llama `startGame` y no `play`, porque `play` es un evento del DOM y la regla `@angular-eslint/no-output-native` lo prohíbe.
- **Sí:** el nombre de las tarjetas desactivadas va en `n700` de la paleta del diseño (#645c50, 4,92:1 sobre la tarjeta), el mismo tono que el estado, en lugar de `n600` (#82796a, 3,21:1), que no llega a 4,5:1 en Caprasimo de 20 px. El «+» sigue en `n600`, que como icono necesita 3:1.
- **Revisión manual (paso 12):** script de Playwright contra `ng serve` de producción, a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido, manejando la pantalla con el teclado (tabulador, espacio y Enter). En las 32 capturas la caja cabe entera; en 568 × 320 se pone en fila, con las tarjetas a la derecha. El foco empieza en la tarjeta roja y su contorno se ve. Al activar un equipo, su mascota arranca sus animaciones y a los 4 s ya no queda ninguna en marcha; con movimiento reducido no arranca ninguna. Con un equipo, el estado dice «Elige al menos 2 equipos» y el botón está desactivado. Los textos tienen al menos 4,5:1 (nombres de tarjetas desactivadas 4,92:1; «¡A jugar!» 5,72:1; nombres activados, blancos con contorno de tinta como el cartel), y el botón desactivado, a la opacidad del diseño, queda exento como control inactivo. En la partida de amarillo y verde, las casas y los medallones rojo y azul se ven atenuados y en gris, también en el SVG. Frente al diseño cambian solo la placa redonda de la mascota y la capa, la de la pantalla de campeón, que deja ver la partida, como ya se decidió.

## PARTE-03: Menú y nueva partida durante el juego

**Estado:** Hecha

### Enfoque

Un componente nuevo, `Menu` (`src/app/menu/menu.ts`), reconstruye el engranaje y el panel lateral de `docs/design/inicio-y-menu` con la paleta de la aplicación. El engranaje es un botón redondo de madera de 48 × 48 px, fijo arriba a la derecha, con `aria-label="Menú"`, `aria-haspopup="dialog"` y `aria-expanded`. El panel entra desde la derecha. Tiene el título «Menú», el botón de cerrar, una sola fila «Nueva partida» con el icono de reiniciar y la flecha, y el pie «Parchís de la Jungla». Detrás queda una capa oscura. El panel es un diálogo modal propio (`role="dialog"`, `aria-modal="true"`, nombre «Menú»), como las pantallas de inicio y campeón. Al abrirse, el foco pasa a cerrar. Escape, tocar la capa y cerrar lo cierran y devuelven el foco al engranaje. El panel está siempre en el DOM y se oculta con `invisible` y desplazado, para que se deslice al abrir y al cerrar. Con movimiento reducido no hay transición (`motion-safe:`).

«Nueva partida» no sale del panel: su contenido pasa a la confirmación, con el estilo del menú. Muestra el título «¿Empezar otra partida?», el texto «Se perderá la partida en curso.» y dos botones, «Descartar partida» y «Seguir jugando». El foco va a «Seguir jugando», la opción que no pierde nada. Las dos opciones cierran el menú. «Seguir jugando», al igual que Escape, cierra y devuelve el foco al engranaje sin emitir nada. «Descartar partida» cierra y emite `newGame`. Al volver a abrir el menú, se ve otra vez la lista. Siempre se pide confirmación, porque el engranaje solo se puede usar con una partida en curso: en la pantalla de inicio no se pinta y, con ganador, la pantalla de campeón lo tapa y lo deja `inert` (RF-012).

El estado abierto o cerrado vive en `Menu` como `model()` `open`. `App` lo enlaza para añadirlo a `covered()`, así `<main>` queda `inert` con el menú abierto (RF-011). `Menu` se pinta fuera de `<main>` solo en la pantalla de partida. `newGame` llama a `chooseTeams()` del almacén, que ya conserva los equipos de la partida (RF-008). El almacén no cambia. El host de `Menu` corta la propagación de los clics, para que tocar el engranaje, el panel o la capa no llegue al host de `App`, que cancela la selección. Así, al seguir jugando, la selección, la réplica y los resaltados siguen igual (HU-05.5). Si el dado está girando, la tirada se aplica igual detrás del menú.

Hueco del engranaje (decisión del usuario): siempre arriba a la derecha. En vertical, la cabecera deja a la derecha un margen del ancho del engranaje más su separación. A 320 px el cartel pasa de 304 a unos 248 px de ancho y deja de estar centrado cuando no cabe. En horizontal bajo (`[@media(orientation:landscape)_and_(max-height:480px)]:`, la misma variante de siempre), el hueco del tablero reserva ese margen. A 568 × 320 el tablero pasa de 304 a unos 256 px. Ninguna de las dos añade altura.

### Archivos

- `src/styles.css`: tokens del menú (`--color-menu-*`). La mayoría son alias de los de la pantalla de inicio (panel, superficie de las filas, textos, flecha) y de la de campeón (madera, borde y hover del engranaje, acento del icono y del foco). Solo es nuevo el hover de las filas, `accent-100` del diseño.
- `src/app/menu/menu.ts`, `menu.html`, `menu.spec.ts` (nuevos): engranaje, capa, panel y confirmación, con `open` (`model`) y la salida `newGame`.
- `src/app/app.ts`, `app.html`, `app.spec.ts`: pinta `Menu` en la pantalla de partida, `inert` con ganador, `covered()` con el menú abierto, `chooseTeams()` al descartar y hueco del engranaje en la cabecera y en el hueco del tablero.
- `e2e/menu.ts` (nuevo): ayudantes `openMenu(page)` y `menuPanel(page)`.
- `e2e/menu.spec.ts` (nuevo): CE-05.
- `e2e/screen.spec.ts`: engranaje dentro de la ventana y sin tocar el cartel, la pestaña, el tablero ni el dado.

### Pasos

- [x] 1. Tokens del menú en `src/styles.css`, con los colores del diseño y reutilizando los existentes. La búsqueda de hexadecimales en `src/app/` no da resultados (RNF-007).
- [x] 2. Tests de `Menu` en `menu.spec.ts`, con un esqueleto que solo pinta el engranaje y los hace fallar. Comprueban:
  - el engranaje con nombre «Menú» y `aria-expanded="false"`;
  - al tocarlo, se abre el diálogo modal «Menú», `open` pasa a verdadero, `aria-expanded="true"` y el foco va a cerrar;
  - la única opción es «Nueva partida»;
  - Escape, tocar la capa y cerrar lo cierran y devuelven el foco al engranaje;
  - «Nueva partida» muestra la confirmación con «Descartar partida» y «Seguir jugando», y el foco en «Seguir jugando»;
  - «Seguir jugando» y Escape cierran sin emitir `newGame`;
  - «Descartar partida» emite `newGame` una vez y cierra;
  - al reabrir se ve la lista;
  - los clics dentro no se propagan;
  - con movimiento reducido no hay transición;
  - los controles miden al menos 24 × 24 px.

  Cubre HU-05.1, HU-05.2, HU-05.3, RF-010, RF-011, RF-012, RNF-001, RNF-002 y RNF-005.
- [x] 3. `Menu`, hasta que pasen los tests del paso 2.
- [x] 4. Menú en `App` y hueco del engranaje, con sus tests en `app.spec.ts`:
  - en la pantalla de partida hay engranaje, fuera de `<main>`; en la de inicio, no;
  - con ganador, el menú es `inert`;
  - con el menú abierto, `<main>` es `inert`;
  - en una partida de amarillo y verde, «Nueva partida» y «Descartar partida» llevan a la pantalla de inicio con solo esos dos equipos activados.

  Con el almacén real:
  - con una ficha seleccionada, abrir el menú, pedir «Nueva partida» y «Seguir jugando», o tocar la capa, deja el estado, la selección y la réplica igual;
  - abrir el menú con el dado girando aplica la tirada igual.

  Cubre HU-05.3, HU-05.4, HU-05.5, RF-008, RF-010, RF-011 y RF-012.
- [x] 5. Pruebas en navegador:
  - ayudantes en `e2e/menu.ts`;
  - `e2e/menu.spec.ts` configura una partida de amarillo y verde y hace unas tiradas. Abre el menú, comprueba que solo tiene «Nueva partida» y lo cierra con Escape, con el foco en el engranaje. Pide «Nueva partida», sigue jugando y comprueba que el cartel y las fichas siguen igual. Luego descarta y comprueba que la pantalla de inicio tiene solo amarillo y verde activados. Empieza otra partida y comprueba que vuelve a la tirada inicial de amarillo;
  - en `screen.spec.ts`, el engranaje queda dentro de la ventana y su caja no se cruza con el cartel, el hueco de la pestaña, el tablero ni el dado, en las cuatro ventanas.

  Cubre CE-05, CE-06 y RNF-004.
- [x] 6. Revisión manual en navegador del engranaje, el menú y la confirmación a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido, manejándolos con el teclado y frente a la captura del diseño. Revisa el contraste de textos e iconos, el contorno de foco, el deslizamiento y el hueco del engranaje. El resultado se registra en «Decisiones técnicas» (RNF-001, RNF-002, RNF-003, RNF-004).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-05.1 (el engranaje abre el menú con solo «Nueva partida») | 2, 3, 5 | `menu.spec.ts`: diálogo «Menú» con una sola opción; `e2e/menu.spec.ts` |
| HU-05.2 (Escape, fuera y cerrar lo cierran; foco al engranaje) | 2, 3, 5 | `menu.spec.ts`: las tres formas y `document.activeElement`; `e2e/menu.spec.ts`: Escape |
| HU-05.3 (confirmación con partida en curso) | 2, 3, 4 | `menu.spec.ts`: confirmación con sus dos opciones; `app.spec.ts`: sin descartar, la partida sigue |
| HU-05.4 (confirmar lleva a inicio con los equipos descartados) | 4, 5 | `app.spec.ts`: amarillo y verde activados; `e2e/menu.spec.ts` |
| HU-05.5 (cancelar devuelve la partida igual, selección incluida) | 2, 3, 4, 5 | `menu.spec.ts`: no emite y no se propagan los clics; `app.spec.ts` con el almacén real; `e2e/menu.spec.ts`: cartel y fichas iguales |
| RF-010 | 1, 2, 3, 4 | Ver HU-05.1; `app.spec.ts`: engranaje solo en la pantalla de partida |
| RF-011 | 2, 3, 4 | Ver HU-05.2; `app.spec.ts`: `<main>` `inert` con el menú abierto |
| RF-012 | 2, 3, 4 | Ver HU-05.3 y HU-05.5; `app.spec.ts`: con ganador, menú `inert` |
| RNF-005 | 2 | `menu.spec.ts`: engranaje `size-12`, cerrar `size-11`, filas y botones de la confirmación con alto mínimo de al menos 44 px |
| RNF-001 (transversal) | 2, 6 | Botones nativos con nombre, `aria-expanded`, diálogo con nombre y foco gestionado |
| RNF-002 (transversal) | 2, 6 | `menu.spec.ts`: transición solo con `motion-safe:`; revisión manual |
| RNF-003 (transversal) | 1, 6 | Colores del diseño ya comprobados en la pantalla de inicio; revisión manual |
| RNF-004 (transversal) | 4, 5, 6 | `e2e/screen.spec.ts`: engranaje sin cruzarse con cartel, pestaña, tablero ni dado y sin scroll |
| RNF-006 (transversal) | 1-6 | `git diff master -- src/engine` vacío |
| RNF-007 (transversal) | 1 | Sin colores en hexadecimal en `src/app/`; ningún archivo de `docs/design` importado; sin dependencias nuevas |
| CE-03 (vuelta desde el menú) | 4 | `app.spec.ts`: inicio con los equipos de la partida descartada |
| CE-04 | 2, 3, 4 | `menu.spec.ts` y `app.spec.ts` |
| CE-05 | 5 | `e2e/menu.spec.ts`; la partida de amarillo y verde con casas atenuadas ya está en `e2e/game.spec.ts` |
| CE-06 | 5 | `e2e/screen.spec.ts`: pantalla de partida con el engranaje y pantalla de inicio en las cuatro ventanas |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- MCP `angular-cli` (`get_best_practices`): convenciones de Angular 22 antes de escribir `Menu`.
- Script de Playwright en el directorio temporal de la sesión para la revisión manual del paso 6, como en las partes anteriores.

### Decisiones técnicas

- **Sí (usuario):** el engranaje va siempre arriba a la derecha y se le hace hueco. En vertical, con un margen derecho en la cabecera; en horizontal bajo, con un margen derecho en el hueco del tablero. Sin hueco, a 320 × 568 tapaba el cartel (de 8 a 312 px de ancho) y a 568 × 320 el medallón azul. **No:** ponerlo arriba a la izquierda en horizontal, que se aparta de RF-010, ni invertir la fila de la partida, que cambia la disposición de SPEC 007.
- **Sí:** la confirmación sustituye el contenido del panel en lugar de abrir otro diálogo. Tiene el estilo del menú, como pide el spec, y no apila dos diálogos.
- **Sí:** siempre se pide confirmación. El engranaje solo es alcanzable con una partida en curso, así que no hace falta preguntar al motor.
- **Sí:** el foco de la confirmación va a «Seguir jugando», la opción que no pierde nada.
- **Sí:** «Descartar partida» con el estilo de «¡A jugar!» (`--color-start-button`, 5,72:1) y «Seguir jugando» con el de las filas del menú.
- **Sí:** panel como diálogo modal propio, con `inert` en `<main>`, como las pantallas de inicio y campeón. **No:** `<dialog>` nativo, por lo mismo que en PARTE-01.
- **Sí:** el host de `Menu` corta la propagación de los clics, para que abrir, usar o cerrar el menú no cancele la selección de ficha.
- **Sí:** «Configuración» y la sección «Pronto» del diseño no se pintan (RF-010). El pie «Parchís de la Jungla» sí, porque es parte del panel.
- **Sí:** en vertical, la cabecera es una rejilla `1fr auto minmax(60px, 1fr)`: centrada mientras cabe y, si no, con el hueco del engranaje a la derecha. Medido a 320 × 568, el cartel ocupa de 8 a 252 px y el engranaje de 260 a 308, con la misma altura. La pestaña, más estrecha, ocupa una línea más, y el tablero baja 9 px (de 197 a 206) sin perder tamaño ni hacer scroll. A 568 × 320 el tablero mide 263 px y acaba a 8 px del engranaje. A 768 × 1024 el cartel se desplaza 16 px a la izquierda; a 1920 × 1080 no cambia.
- **Sí:** al abrir, el panel pasa a visible sin transición de `visibility` y solo anima el deslizamiento; al cerrar, la transición incluye `visibility`, para que se vea mientras sale. Lo encontró la prueba en navegador del paso 5: con `visibility` en la transición, el panel sigue oculto en el instante de darle el foco y «Cerrar» no lo recibe. jsdom no aplica CSS, así que el test unitario no podía verlo.
- **Revisión manual (paso 6):** script de Playwright en el directorio temporal de la sesión contra `ng serve` de producción, a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido, manejando el menú con el teclado.
  - Bien a la primera:
    - El engranaje se alcanza con dos tabulaciones, tras el dado, con contorno de foco de 2 px.
    - El foco va a «Cerrar» al abrir, a «Seguir jugando» al confirmar y vuelve al engranaje al cerrar.
    - El panel se desliza en 0,28 s y, con movimiento reducido, sin transición.
    - La capa es `rgb(18 14 8 / 0.55)`, como en el diseño.
    - Contraste sobre el panel o la fila:
      - título y texto de la confirmación 13,95:1, opción y «Seguir jugando» 12,4:1, pie 5,53:1 y «Descartar partida» 5,72:1;
      - tinta del engranaje sobre la madera, al menos 5,72:1;
      - flecha 3,21:1, icono blanco sobre el acento 3,61:1 y contorno de foco 13,95:1.
  - Corregido:
    - **Sí:** con el menú abierto, el tabulador salía del panel y llegaba al engranaje, tapado por la capa (WCAG 2.4.11). El engranaje queda `inert` mientras el menú está abierto, y al cerrar el foco vuelve a él después de pintar, cuando ya no es inerte. Test nuevo en `menu.spec.ts`, visto fallar antes.
    - **Sí:** el pie «Parchís de la Jungla» estaba centrado; en el diseño va alineado a la izquierda con el título.
    - **Sí:** a 568 × 320 la confirmación desbordaba el panel en 49 px y el pie quedaba fuera. En horizontal bajo, el margen superior del panel pasa de 56 a 20 px, el inferior de 24 a 16 y el del pie de 24 a 12; ahora cabe sin scroll (320 de 320).

## PARTE-04: Tirada inicial en el cartel y la pestaña

**Estado:** Pendiente

### Enfoque

El cartel sale de `headline()`, que es una función pura. En la tirada inicial y en sus desempates, la acción pasa a ser «Tirada inicial: Toca el dado» (RF-013). El texto del turno para el lector pasa de «Tirada inicial, turno de X.» a «Turno de X.», porque la acción ya dice que es la tirada inicial y si no el lector lo repetiría. Medido en la versión actual, a 320 × 568 la acción ocupa dos líneas: el tablón crece 10 px y el tablero baja 5 px. A 568 × 320 ocupa tres líneas, pero el tablero no se mueve. Para que el tablero no se mueva, el título del cartel reserva el espacio de la acción más larga, `LONGEST_ACTION`, con una copia invisible. Es la misma técnica del hueco de la pestaña (RNF-010 de SPEC 007).

Las tiradas de la ronda salen de un archivo nuevo de funciones puras, `src/app/game/initial-round.ts`:
- `nextInitialRound(round, events)` acumula las tiradas a partir de los eventos del motor (RF-015). Por cada `initial-roll` añade el equipo y su valor, en el orden en que llegan. `initial-roll-tie` y `first-player` cierran la ronda, y el primero guarda los equipos empatados. Una tirada sobre una ronda cerrada empieza una ronda nueva, vacía. Una acción sin `initial-roll` devuelve `null`, y la pestaña vuelve a la última jugada normal.
- `initialRoundText(round)` da el texto accesible: «Amarillo saca 5, Azul saca 3.», y con empate «…, empate entre Amarillo y Rojo.».
- `LONGEST_ROUND`, con cuatro tiradas y el empate de los cuatro, reserva el hueco.

El motor sigue decidiendo los empates y quién empieza; la aplicación solo lo pinta.

El almacén guarda dos datos nuevos:
- `initialRound`: se actualiza en cada acción aceptada con `nextInitialRound`.
- `starter`: el color del evento `first-player`, mientras no se pulse «¡Vamos!».

`canRoll` es falso mientras hay `starter`, así que el dado no responde, aunque se le haga clic por programa. `go()` borra `starter`, y `start()` borra los dos datos.

Dos componentes nuevos, sin dependencias nuevas:
- **`InitialRoundTab`**: la pestaña de `LastPlayTab`, en el tono oscuro del último equipo que ha tirado. Muestra una mascota pequeña, quieta, con su valor en blanco por cada tirada, y debajo el empate si lo hay («Empate entre Amarillo y Rojo.»). Para el lector, lo visible es decorativo y el texto es `initialRoundText`. Mientras hay ronda, `App` la pinta en el mismo hueco en lugar de la última jugada. Ese hueco reserva el tamaño mayor entre `LONGEST_PLAY` y `LONGEST_ROUND`, con dos copias invisibles.
- **`FirstPlayer`**: la pantalla «Empieza el equipo X», en `src/app/game/first-player.ts`. Usa la capa de la pantalla de campeón (`bg-champion-overlay`), su tablón (`bg-plank`, `TEAM_BG`, `TEAM_DARK_BORDER`) con la mascota animada en su placa y su botón de madera, con el texto «¡Vamos!». No lleva trofeo, confeti ni rayos. Es un diálogo modal propio, como la pantalla de campeón: nombre «Empieza el equipo Azul», foco en «¡Vamos!» y sin manejadores de Escape ni de toque fuera. Con movimiento reducido, la mascota no se anima. En ventanas bajas usa la misma variante compacta que la pantalla de campeón.

En `App`:
- `FirstPlayer` se pinta fuera de `<main>` mientras hay `starter`.
- `covered()` incluye `starter`, así que `<main>` queda `inert`.
- El menú queda `inert`, como con ganador.
- «¡Vamos!» llama a `go()` y, después de pintar, lleva el foco al dado, que es la acción siguiente.

### Archivos

- `src/app/game/headline.ts`, `headline.spec.ts`: acción y turno de la tirada inicial y `LONGEST_ACTION`.
- `src/app/game/turn-banner.html`, `turn-banner.ts`, `turn-banner.spec.ts`: copia invisible de `LONGEST_ACTION` en el título.
- `src/app/game/last-play.ts`: exporta `names()` para reutilizarla.
- `src/app/game/initial-round.ts`, `initial-round.spec.ts` (nuevos): `InitialRound`, `nextInitialRound`, `initialRoundText` y `LONGEST_ROUND`.
- `src/app/game/game-store.ts`, `game-store.spec.ts`: `initialRound`, `starter`, `go()` y `canRoll`.
- `src/app/game/initial-round-tab.ts`, `initial-round-tab.html`, `initial-round-tab.spec.ts` (nuevos).
- `src/app/game/first-player.ts`, `first-player.html`, `first-player.spec.ts` (nuevos).
- `src/app/app.ts`, `app.html`, `app.spec.ts`: pestaña de la ronda, copia invisible de `LONGEST_ROUND`, `FirstPlayer`, `inert` y foco al dado.
- `e2e/dice.ts`: `spin(page)` tira sin cerrar el aviso; `roll(page)` además pulsa «¡Vamos!» si aparece «Empieza el equipo X».
- `e2e/game.spec.ts`, `e2e/notices.spec.ts`, `e2e/menu.spec.ts` y las demás pruebas que pasan por la tirada inicial: textos nuevos. `e2e/game.spec.ts` añade además el escenario de HU-06.
- `e2e/screen.spec.ts`: el tablero no se mueve entre la tirada inicial y la partida, y «Empieza el equipo X» cabe sin scroll en las cuatro ventanas.

### Pasos

- [x] 1. Tests de `headline`, con un esqueleto que compila y los hace fallar. Comprueban:
  - en la tirada inicial y en un desempate, la acción es «Tirada inicial: Toca el dado», en el color de quien tira;
  - el turno es «Turno de Rojo.»;
  - `LONGEST_ACTION` es la acción más larga.

  Cubre HU-06.1 y RF-013.
- [x] 2. `headline` hasta que pasen los tests del paso 1, más la copia invisible en el cartel, con sus tests en `turn-banner.spec.ts`: la copia es `aria-hidden` y comparte celda con el título. Se actualizan los tests de SPEC 007 que esperaban «Toca el dado» en la tirada inicial (RF-013, CE-07).
- [x] 3. Tests de `initial-round.ts`, con un esqueleto que compila y los hace fallar. Comprueban:
  - las tiradas de una ronda, en orden;
  - el empate cierra la ronda con los equipos implicados;
  - la primera tirada del desempate empieza una ronda vacía con solo esa tirada;
  - `first-player` cierra la ronda y conserva sus tiradas;
  - una acción normal da `null`;
  - el texto «Amarillo saca 5, Azul saca 3.», con y sin empate;
  - `LONGEST_ROUND` tiene cuatro tiradas y el empate de los cuatro.

  Cubre HU-06.2, HU-06.3, HU-06.6, RF-014 y RF-015.
- [x] 4. `initial-round.ts`, hasta que pasen los tests del paso 3.
- [x] 5. Tests del almacén, con un esqueleto que compila y los hace fallar. Con tiradas fijas sobre el motor real, comprueban:
  - `initialRound` sigue la ronda y el desempate, y vuelve a `null` tras la primera jugada normal;
  - `starter` es el equipo de `first-player`;
  - con `starter`, `roll()` no hace nada;
  - `go()` lo borra y el dado responde;
  - `start()` borra los dos.

  Cubre HU-06.4, HU-06.5, RF-015 y RF-016.
- [x] 6. Almacén, hasta que pasen los tests del paso 5.
- [x] 7. `InitialRoundTab` y `FirstPlayer`, con sus tests en el mismo paso, porque son plantilla.
  - Pestaña:
    - una mascota quieta y su valor por tirada, en orden;
    - el empate visible;
    - el tono oscuro del último que ha tirado;
    - lo visible es `aria-hidden` y el texto accesible es el de `initialRoundText`.
  - Pantalla, para los cuatro colores:
    - tablón del color y mascota animada del equipo;
    - título «Empieza el equipo Azul», sin trofeo, confeti ni rayos;
    - `role="dialog"`, `aria-modal` y nombre accesible;
    - foco en «¡Vamos!»;
    - Escape no emite nada y pulsar el botón emite `go`;
    - con movimiento reducido, la mascota no se anima;
    - el botón mide al menos 44 px.

  Cubre HU-06.2, HU-06.3, HU-06.4, HU-06.6, RF-014, RF-016, RNF-001, RNF-002 y CE-07.
- [x] 8. Integración en `App`, con sus tests en `app.spec.ts`.
  - Durante la tirada inicial, la pestaña de la ronda sustituye a la de la última jugada.
  - El hueco tiene las dos copias invisibles.
  - Con `starter`:
    - aparece la pantalla fuera de `<main>`;
    - `<main>` y el menú son `inert`;
    - el dado no tira.
  - «¡Vamos!» llama a `go()`, el foco pasa al dado y el cartel dice «Toca el dado» en el color del que empieza.
  - Con el almacén real, una tirada inicial con desempate completa.

  Cubre HU-06.1 a HU-06.6, RF-013 a RF-016 y CE-07.
- [x] 9. Pruebas en navegador:
  - `spin` y `roll` en `e2e/dice.ts`.
  - Textos nuevos en las pruebas de SPEC 006, SPEC 007 y SPEC 008 que pasan por la tirada inicial.
  - Escenario de HU-06 en `game.spec.ts`:
    - un empate y su desempate, con las mascotas y los valores en la pestaña;
    - «Empieza el equipo X», con «¡Vamos!» y el foco en el dado.
  - En `screen.spec.ts`:
    - el tablero ocupa la misma caja en la tirada inicial y después;
    - la pantalla «Empieza el equipo X» cabe sin scroll, con el botón dentro, en las cuatro ventanas.

  Cubre CE-07 y RNF-004.
- [x] 10. Revisión manual en navegador a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido. Se revisan el cartel de la tirada inicial, la pestaña con cuatro tiradas y empate, y «Empieza el equipo X» frente a la pantalla de campeón, manejándolo con el teclado. Se miden el contraste del valor y del empate sobre las cuatro pestañas y el del título sobre los cuatro tablones. El resultado se registra en «Decisiones técnicas» (RNF-001, RNF-002, RNF-003, RNF-004).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-06.1 (cartel «Tirada inicial: Toca el dado» en rojo con el loro) | 1, 2, 8, 9 | `headline.spec.ts`; `app.spec.ts`; `e2e/game.spec.ts` |
| HU-06.2 (jaguar con 5 e hipopótamo con 3, en orden) | 3, 4, 7, 8, 9 | `initial-round.spec.ts`; `initial-round-tab.spec.ts`; `e2e/game.spec.ts` |
| HU-06.3 (empate y ronda siguiente vacía) | 3, 4, 5, 6, 7, 9 | `initial-round.spec.ts`; `game-store.spec.ts`; `e2e/game.spec.ts` |
| HU-06.4 (solo la notificación azul con el hipopótamo; detrás, las tiradas) | 5, 6, 7, 8, 9 | `first-player.spec.ts`; `app.spec.ts`; `e2e/game.spec.ts` |
| HU-06.5 («¡Vamos!» cierra; «Toca el dado» en azul y el dado responde) | 5, 6, 8, 9 | `game-store.spec.ts`; `app.spec.ts`; `e2e/game.spec.ts` |
| HU-06.6 (texto accesible «Amarillo saca 5, Azul saca 3») | 3, 4, 7 | `initial-round.spec.ts`; `initial-round-tab.spec.ts` |
| RF-013 | 1, 2 | Ver HU-06.1 |
| RF-014 | 3, 4, 7, 8 | Ver HU-06.2 y HU-06.3 |
| RF-015 | 3-6, 8, 9 | Ver HU-06.3; `app.spec.ts`: hueco con `LONGEST_ROUND`; `e2e/screen.spec.ts`: tablero quieto |
| RF-016 | 5-9 | Ver HU-06.4 y HU-06.5; `e2e/screen.spec.ts`: cabe sin scroll |
| RNF-001 (transversal) | 7, 8, 10 | Diálogo con nombre y foco, botón nativo, foco al dado al cerrar; texto accesible de la pestaña |
| RNF-002 (transversal) | 7, 10 | `first-player.spec.ts` con movimiento reducido; revisión manual |
| RNF-003 (transversal) | 10 | Revisión manual del contraste |
| RNF-004 (transversal) | 2, 9, 10 | `e2e/screen.spec.ts`; revisión manual |
| RNF-006 (transversal) | 1-10 | `git diff master -- src/engine` vacío |
| RNF-007 (transversal) | 7 | Sin hexadecimales en `src/app/`; sin tokens ni dependencias nuevas |
| CE-07 | 1-9 | Todas las anteriores |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- MCP `angular-cli` (`get_best_practices`), si se conecta. En esta sesión no ha conectado; se siguen las convenciones de `src/app/CLAUDE.md`.
- Script de Playwright en el directorio temporal de la sesión para la revisión manual del paso 10.

### Decisiones técnicas

- **Sí:** el turno para el lector pasa a «Turno de X.» en la tirada inicial. La acción ya dice «Tirada inicial». **No:** dejar «Tirada inicial, turno de X.», que el lector leería seguido de «Tirada inicial: Toca el dado».
- **Sí:** el título del cartel reserva el espacio de `LONGEST_ACTION` con una copia invisible, para que el tablero no baje 5 px a 320 × 568 al terminar la tirada inicial. **No:** aceptar el salto, aunque pase detrás de «Empieza el equipo X», ni reducir el texto, que se apartaría del cartel de SPEC 007.
- **Sí:** las tiradas se acumulan con una función pura sobre los eventos (`initial-roll`, `initial-roll-tie`, `first-player`), como permite RF-015. El estado del motor pierde las tiradas de una ronda en cuanto termina, y la pestaña tiene que seguir mostrándolas.
- **Sí:** `starter` vive en el almacén y bloquea `canRoll`. Así «el dado no responde» se prueba sin depender de `inert`, que jsdom no aplica a los clics.
- **Sí:** `FirstPlayer` es un componente propio con las clases y los tokens de la capa, el tablón y el botón de la pantalla de campeón. **No:** sacar un componente común de las dos pantallas, que obligaría a reescribir `Champion`, que ya está cerrada y revisada, para compartir unas pocas clases.
- **Sí:** al pulsar «¡Vamos!», el foco va al dado, que es lo siguiente que hay que hacer. Si no, se quedaría en `body` al desaparecer el botón.
- **Sí:** `roll()` de `e2e/dice.ts` pulsa «¡Vamos!» cuando aparece, como propone el riesgo del spec. `spin()` tira sin cerrarlo, para las pruebas que comprueban la pantalla.
- **Sí:** en `game-store.spec.ts`, `rollTimes` pulsa «¡Vamos!» (`go()`) cuando aparece `starter`, igual que `roll()` en las pruebas en navegador. Los tests nuevos usan `spinTimes`, que no lo cierra. Así los tests de SPEC 007 que juegan después de la tirada inicial siguen probando lo mismo.
- **Sí:** desde el paso 6, `roll()` de `app.spec.ts` cierra el anuncio con `store.go()` cuando aparece `starter`. En el paso 8 pasa a pulsar «¡Vamos!». **No:** dejar fallar los 13 tests de SPEC 007 que juegan después de la tirada inicial hasta que exista el botón.
- **Revisión manual (paso 10):** script de Playwright contra `ng serve` de producción, a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido. Recorre un empate de los cuatro, el desempate, «Empieza el equipo Amarillo», «¡Vamos!» y la primera tirada, manejado con el teclado. La pantalla de campeón se saca para compararla en `ng serve` de desarrollo, poniendo el ganador desde la consola del navegador, sin código en el proyecto.
  - En las 8 combinaciones no hay scroll, y el tablero ocupa la misma caja antes de tirar y después de «¡Vamos!».
  - La pestaña con cuatro tiradas y empate cabe en su hueco. A 568 × 320 la cuarta mascota pasa a una segunda fila y el cartel ocupa tres líneas, sin mover el tablero.
  - «Empieza el equipo X» se ve entera, con el tablón y el botón dentro. Usa la misma disposición que la pantalla de campeón, con el botón debajo y, a 568 × 320, en fila a la derecha. Lleva la capa, el tablón y el botón de esa pantalla, sin trofeo, confeti ni rayos.
  - Teclado:
    - el foco empieza en «¡Vamos!»;
    - Escape no la cierra;
    - el tabulador sale al navegador, porque el resto de la página es `inert`, y mayúsculas y tabulador vuelve a «¡Vamos!»;
    - Enter la cierra y deja el foco en el dado;
    - otro Enter tira.
  - Sin movimiento reducido, la mascota de la pantalla tiene 6 animaciones en marcha. Con movimiento reducido no hay ninguna.
  - Contraste del valor y del empate sobre las pestañas:
    - amarilla 4,79:1;
    - azul 8,91:1;
    - roja 9,46:1;
    - verde 8,62:1.
  - Contraste del título: blanco con contorno de tinta, como el cartel y la pantalla de campeón, a 14,51:1 contra el contorno con los cuatro colores. Sobre el tablón amarillo sin contorno daría 1,96:1, como ya pasa en el cartel.
  - Contraste de «¡Vamos!»: 5,72:1, el mismo que «Nueva partida».
