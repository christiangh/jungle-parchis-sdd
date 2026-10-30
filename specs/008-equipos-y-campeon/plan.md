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

**Estado:** Pendiente

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
- [ ] 12. Revisión manual en navegador de la pantalla de inicio y de las casas inactivas a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido, frente a las capturas del diseño: contraste de textos y tarjetas, la animación de la mascota al activar y el foco. Resultado registrado en «Decisiones técnicas» (RNF-001, RNF-002, RNF-003, RNF-004).

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
