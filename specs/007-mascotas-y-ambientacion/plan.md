# Plan técnico — SPEC 007 — Mascotas y ambientación

> **Spec:** `specs/007-mascotas-y-ambientacion/spec.md`
> **Rama:** `feat/spec-007-mascotas-y-ambientacion`
> **Fecha:** 2026-10-27

## PARTE-01: Ambientación y nombre de ficha compartido

**Estado:** Hecha

### Enfoque

El fondo suavizado sustituye a las imágenes de `public/background/` con los mismos nombres, de modo que la utilidad `bg-jungle-tile` no cambia; solo cambia el valor del token `--color-jungle`, que pasa al salvia del diseño. Las tipografías se sirven desde `public/fonts/` en WOFF2, con su `@font-face` en `src/styles.css` y precargadas en `index.html`: Caprasimo como token `--font-display` para el cartel y Figtree como `--font-sans`, la tipografía por defecto de toda la página. Solo se incluye el peso que usa el diseño de cada una (Caprasimo 400, Figtree 600) y el subconjunto latino, que ya cubre las letras del castellano. Un archivo nuevo, `src/app/shared/piece-id.ts`, es el único que descompone un `PieceId`: da su color, su número de hueco y su nombre legible, y lo usan el tablero, la colocación de las fichas y la línea de última jugada.

El cartel y la línea no cambian de diseño en esta parte (eso es PARTE-03): solo cambian de tipografía.

### Archivos

- `public/background/fondo-jungla-{800,1200}.{webp,jpg}`: se sustituyen por las de `docs/design/fondo-jungla` (versión suavizada). El SVG fuente no se copia.
- `public/fonts/caprasimo-latin-400-normal.woff2` y `public/fonts/figtree-latin-600-normal.woff2` (nuevos): tipografías del diseño.
- `public/fonts/OFL.txt` (nuevo): licencia SIL Open Font License de ambas, que pide acompañar los archivos de la fuente.
- `src/styles.css`: `--color-jungle` pasa a `#a9b18c`; tokens `--font-display` y `--font-sans`; dos `@font-face` con `font-display: swap`.
- `src/index.html`: `<link rel="preload" as="font" type="font/woff2" crossorigin>` de las dos fuentes, para que lleguen antes de pintar el cartel.
- `src/app/game/turn-banner.html`: `font-serif` → `font-display`.
- `src/app/app.html`: la línea de última jugada con `font-semibold` (Figtree 600, como la pestaña del diseño).
- `src/app/shared/piece-id.ts` (nuevo): `pieceColor(id)`, `pieceIndex(id)` (0 a 3) y `pieceName(id)` («1 de Amarillo»).
- `src/app/shared/piece-id.spec.ts` (nuevo): tests de RF-003.
- `src/app/board/board.ts`, `src/app/board/board-pieces.ts`, `src/app/game/last-play.ts`: usan `piece-id.ts` en lugar de su `split`, `indexOf` o `colorOf` propios.
- `e2e/ambience.spec.ts` (nuevo): color de carga, tipografías aplicadas y ninguna petición a otro origen.
- `docs/design/README.md`: la fila de `fondo-jungla/` deja de marcar la versión suavizada como pendiente y pasa a SPEC 007.

### Pasos

- [x] 1. Fondo suavizado: sustituir las cuatro imágenes de `public/background/` por las del diseño y cambiar `--color-jungle` a `#a9b18c`; actualizar la fila de `docs/design/README.md`. Revisión en navegador a 320 × 568 y 1920 × 1080, con y sin las imágenes bloqueadas (RF-001, RNF-006).
- [x] 2. Tipografías: descargar de Fontsource los WOFF2 latinos de Caprasimo 400 y Figtree 600 y su licencia a `public/fonts/`, declarar los `@font-face` y los tokens, precargarlas en `index.html` y aplicar `font-display` al cartel y `font-semibold` a la línea (RF-002, RNF-008).
- [x] 3. Pruebas en navegador de la ambientación en `e2e/ambience.spec.ts`: con las imágenes del fondo bloqueadas, el fondo de la página es `rgb(169, 177, 140)`; el título del cartel se pinta con Caprasimo y la línea de última jugada con Figtree, y `document.fonts.check` las da por cargadas; durante la carga y una tirada, todas las peticiones son al mismo origen (HU-01, CE-08).
- [x] 4. Tests de `piece-id.ts`, con un esqueleto que compila y los hace fallar: color, número de hueco y nombre de las 16 fichas («1 de Amarillo» … «4 de Verde») (RF-003).
- [x] 5. `piece-id.ts`, hasta que pasen los tests del paso 4, y sustitución en `board.ts`, `board-pieces.ts` y `last-play.ts`; los tests existentes del tablero y de la línea pasan sin cambios. Búsqueda de `split(`, `indexOf('-')` y `slice(` sobre identificadores de ficha en `src/app/`: solo en `piece-id.ts` (RF-003, CE-10).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-01.1 (fondo suavizado repetido) | 1, 3 | `app.spec.ts` (ya comprueba `bg-jungle` y `bg-jungle-tile`); revisión en navegador de la loseta nueva a 320 × 568 y 1920 × 1080 |
| HU-01.2 (color salvia de carga) | 1, 3 | `e2e/ambience.spec.ts`: imágenes bloqueadas con `page.route` → color de fondo `rgb(169, 177, 140)` |
| HU-01.3 (Caprasimo y Figtree sin servicios externos) | 2, 3 | `e2e/ambience.spec.ts`: `font-family` calculada del título y de la línea, `document.fonts.check` y ninguna petición a otro origen |
| RF-001 | 1, 3 | Ver HU-01.1 y HU-01.2 |
| RF-002 | 2, 3 | Ver HU-01.3 |
| RF-003 | 4, 5 | `piece-id.spec.ts`: `RF-003: …` con las 16 fichas; `board.spec.ts` y `last-play.spec.ts` siguen pasando con los mismos nombres y frases |
| RNF-006 | 1, 2 | Búsqueda de `#[0-9a-fA-F]{3,8}\b` en `src/app/` sin resultados; el salvia vive en `src/styles.css` |
| RNF-008 | 2, 3 | `e2e/ambience.spec.ts`: ninguna petición a otro origen (CE-08) |
| CE-08 | 3 | `e2e/ambience.spec.ts` |
| CE-10 | 5 | Búsqueda en `src/app/`; los nombres accesibles de `board.spec.ts` no cambian |
| Hecho cuando: pruebas de SPEC 006 sin cambios en sus textos | 1-5 | `pnpm test:e2e`: `game.spec.ts`, `board.spec.ts` y `screen.spec.ts` sin tocar |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- `run` o `claude-in-chrome`: revisión en navegador del fondo y de las tipografías.
- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte, si el usuario la pide.

### Decisiones técnicas

- **Sí:** las imágenes nuevas sustituyen a las antiguas con el mismo nombre. La utilidad `bg-jungle-tile` y sus tests no cambian, y no quedan imágenes sin usar en `public/`.
- **Sí:** el token conserva el nombre `--color-jungle` y solo cambia su valor. Sigue siendo el color de carga del fondo de jungla.
- **Sí:** fuentes en WOFF2 copiadas a `public/fonts/` desde los paquetes de Fontsource (`@fontsource/caprasimo`, `@fontsource/figtree`), descargadas una vez en su versión 5.3.0 (jsDelivr, `files/*-latin-*-normal.woff2` y `LICENSE`). `OFL.txt` une el aviso de copyright de las dos, con el mismo texto de licencia. No se añade ninguna dependencia (RNF-009, P-17).
- **No:** añadir `@fontsource/*` como dependencia. Traería todos los pesos y subconjuntos para usar dos archivos.
- **No:** Google Fonts. Pide recursos a otro origen al cargar (RNF-008, P-16).
- **Sí:** solo Caprasimo 400 (es su único peso) y Figtree 600 (el del diseño), subconjunto latino (U+0000-00FF y algunos signos), que incluye á, é, í, ó, ú, ü, ñ, ¡ y ¿.
- **Sí:** Figtree como `--font-sans`, la tipografía por defecto de Tailwind, para que todo texto que no sea el cartel la use sin marcarlo uno a uno.
- **Sí:** `font-display: swap` y precarga. El texto se ve desde el principio con la tipografía de respaldo, y la precarga reduce el cambio a la tipografía final. Que ese cambio no mueva el tablero lo garantiza RNF-010, en PARTE-03.
- **Sí:** `piece-id.ts` en `src/app/shared/`, porque lo usan el tablero y la partida. `pieceIndex` empieza en 0, como el número del identificador y los huecos de la casa; `pieceName` suma 1 para los jugadores.
- **Sí:** el título del cartel deja `font-bold`. Caprasimo solo tiene peso 400, como en el diseño, y la negrita la sintetizaría el navegador deformando la letra.
- **Sí:** el texto con peso normal usa también Figtree 600, la única cara servida; el diseño usa 600 en todos los textos que no son el cartel.

## PARTE-02: Mascotas en fichas y casas

**Estado:** Hecha

### Enfoque

Un componente nuevo, `Mascot` (`src/app/shared/mascot.ts`), dibuja en SVG la mascota de un equipo. Lo usa el tablero en esta parte y lo usarán el cartel y la pestaña en PARTE-03, por eso va en `shared/`. Su selector es de atributo sobre un `<g>` (`g[jp-mascot]`), para meterlo dentro del SVG del tablero y, en PARTE-03, dentro de un `<svg>` pequeño en el cartel. Cada mascota se reconstruye a mano desde `docs/design/mascotas/componentes`, con la variante elegida (jaguar `e`, loro `b`, hipopótamo `g`, rana `a`) y con clases en las piezas que mueve su animación (jaguar `c`, loro `c`, hipopótamo `b`, rana `c`). La animación solo corre con la entrada `animated` y con movimiento permitido; en reposo, la mascota animada es igual que la quieta. Sus colores son tokens nuevos `--color-mascot-*` en `src/styles.css`.

La ficha-mascota sustituye al disco de color de SPEC 006. Conserva el borde blanco, el halo, la atenuación, el crecimiento al seleccionar y la réplica discontinua, y dibuja dentro la mascota recortada al círculo. Fuera de casa mide lo mismo que ahora (radio 17); en casa ocupa su hueco (radio 28), como en el diseño. Las áreas táctiles no cambian.

Las casas pasan a la variante `e` del diseño: cada una con su escena de fondo (ramas y hojas del loro, olas del hipopótamo, manchas del jaguar, juncos y ondas de la rana) y su decorado bajo cada hueco (nido, toalla, nido de paja, nenúfar). La geometría de las escenas es un cálculo puro en `src/app/board/home-scenes.ts`, como el decorado del tablero en `board-decor.ts`.

Qué casa se resalta y qué fichas se animan sale del estado del motor, en funciones puras nuevas en `src/app/board/board-turn.ts`. La casa en turno es la de `state.turn`, también en la tirada inicial, salvo con ganador, que no hay ninguna. Las fichas animadas son las de ese equipo que están en casa. El resalte es un borde claro y un brillo fijos, que se ven igual sin movimiento (RNF-002), más un pulso que solo corre con movimiento permitido.

### Archivos

- `src/styles.css`: tokens `--color-mascot-*` de las cuatro mascotas y de las escenas de las casas, agrupados por equipo; tokens del resalte de la casa en turno; `@keyframes` y `--animate-*` del pulso de la casa.
- `eslint.config.js`: la regla `@angular-eslint/component-selector` admite también selectores de atributo, con el mismo prefijo y estilo.
- `src/app/shared/mascot.ts`, `mascot.html`, `mascot.css` (nuevos): componente `Mascot` con entradas `color`, `radius` y `animated`; `MASCOTS`, equipo → animal (RF-004); animaciones de 3 s con pausa, solo con movimiento permitido.
- `src/app/shared/mascot.spec.ts` (nuevo): animal de cada equipo, decorativo para el lector y animado solo con `animated`.
- `src/app/board/board-turn.ts`, `board-turn.spec.ts` (nuevos): `homeInTurn(state)` y `animatedPieces(state)`.
- `src/app/board/home-scenes.ts`, `home-scenes.spec.ts` (nuevos): geometría de la escena y del decorado de cada hueco de cada casa.
- `src/app/board/board-geometry.ts`: constante `HOME_PIECE_RADIUS` (28).
- `src/app/board/board-palette.ts`: `TEAM_STROKE`, borde del color del equipo.
- `src/app/board/board.ts`, `board.html`: fichas y réplica con `Mascot`; radio según estén en casa o no; fichas animadas; casas con escena, decorado de huecos y resalte de la casa en turno (`data-turn`).
- `src/app/board/board.spec.ts`: tests de las fichas-mascota y de las casas; los de SPEC 006 se mantienen.
- `e2e/mascots.spec.ts` (nuevo): animaciones según el turno y con movimiento reducido.

### Pasos

- [x] 1. Tokens de las mascotas, las escenas y el resalte de la casa en `src/styles.css`, con los colores del diseño; búsqueda de hexadecimales en `src/app/` sin resultados (RNF-006).
- [x] 2. Tests de `board-turn.ts`, con un esqueleto que compila y los hace fallar: casa en turno en un turno normal, en la tirada inicial y con tirada o premio pendientes, y ninguna con ganador; fichas animadas: solo las que están en casa del equipo en turno, ninguna si todas han salido y ninguna con ganador (RF-007, CE-04).
- [x] 3. `board-turn.ts`, hasta que pasen los tests del paso 2.
- [x] 4. Componente `Mascot`: las cuatro mascotas con sus variantes y animaciones, recortadas a un círculo con un id único por instancia, `aria-hidden`, y animadas solo con `animated` y movimiento permitido. Tests en `mascot.spec.ts` en el mismo paso, porque es dibujo. Revisión en navegador de las cuatro a tamaño grande frente a `docs/design/mascotas/ejemplo.html` (RF-004, RNF-003).
- [x] 5. Fichas-mascota en el tablero: fichas y réplica con `Mascot` sobre el tono oscuro de su equipo y con el borde del color del equipo; radio 28 en casa; `animated` en las fichas de `animatedPieces`. Tests en `board.spec.ts`: cada ficha lleva la mascota de su equipo en el recorrido, el pasillo, la meta y la casa; halo, atenuación, crecimiento y réplica como en SPEC 006; una ficha roja comida vuelve a su hueco con el loro; solo se animan las fichas en casa del equipo en turno (RF-005, HU-02).
- [x] 6. Tests de `home-scenes.ts`, con un esqueleto que compila y los hace fallar: escena dentro de su casa, un decorado por hueco centrado en él, y la misma geometría en cada llamada (RF-006).
- [x] 7. `home-scenes.ts`, hasta que pasen los tests del paso 6, y casas en `board.html`: escena, decorado de huecos y resalte de `homeInTurn` (borde y brillo fijos, pulso con movimiento permitido). Tests en `board.spec.ts`: solo la casa en turno lleva `data-turn` y las otras no se atenúan; con ganador, ninguna; los huecos vacíos no muestran ficha (RF-006, RF-007, HU-03, CE-04).
- [x] 8. Pruebas en navegador en `e2e/mascots.spec.ts`: al empezar, solo las fichas en casa amarillas tienen animaciones en marcha; tras pasar el turno, solo las del nuevo equipo; con `reducedMotion: 'reduce'`, ninguna animación de mascota en marcha y la casa en turno sigue marcada (HU-03, RNF-002, CE-07). Revisión en navegador a 320 × 568 y 1920 × 1080 (RNF-005).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-02.1 (cada ficha con la mascota de su equipo) | 5 | `board.spec.ts`: `RF-005: …` con la mascota de cada ficha en una partida nueva |
| HU-02.2 (halo, atenuación, crecimiento y réplica con mascota) | 5 | `board.spec.ts`: estados de SPEC 006 con la ficha-mascota, y réplica con mascota |
| HU-02.3 (ficha roja comida vuelve a su hueco) | 5 | `board.spec.ts`: estado tras comer una ficha roja, pintada con el loro en su hueco de la casa roja |
| HU-03.1 (casa azul resaltada, solo fichas azules en casa animadas) | 2, 3, 5, 7 | `board-turn.spec.ts` y `board.spec.ts`: `data-turn` solo en la casa azul y animación solo en sus fichas en casa |
| HU-03.2 (casa amarilla resaltada con los huecos vacíos) | 2, 3, 7 | `board-turn.spec.ts`: ninguna ficha animada; `board.spec.ts`: casa amarilla con `data-turn` y sin fichas |
| HU-03.3 (movimiento reducido: casa resaltada, nada animado) | 8 | `e2e/mascots.spec.ts` con `reducedMotion: 'reduce'` |
| RF-004 | 4 | `mascot.spec.ts`: jaguar, loro, hipopótamo y rana según el equipo |
| RF-005 | 5 | Ver HU-02 |
| RF-006 | 6, 7 | `home-scenes.spec.ts`; `board.spec.ts`: escena y decorados en cada casa, huecos vacíos sin ficha |
| RF-007 | 2, 3, 5, 7 | Ver HU-03; `board-turn.spec.ts`: ninguna casa con ganador |
| RNF-002 | 4, 7, 8 | Animaciones solo con movimiento permitido; `e2e/mascots.spec.ts` |
| RNF-003 | 4, 8 | Bucles de 3 s con pausa en `mascot.css`; las animaciones van dentro de la mascota y no tocan la capa táctil: los tests de áreas táctiles de `board.spec.ts` no cambian |
| RNF-005 | 5, 8 | Revisión en navegador a 320 × 568: el color de cada ficha-mascota se distingue |
| RNF-006 | 1, 4, 7 | Búsqueda de `#[0-9a-fA-F]{3,8}\b` en `src/app/` sin resultados |
| CE-04 (casas) | 2, 7 | `board-turn.spec.ts` y `board.spec.ts` |
| CE-07 (casas) | 8 | `e2e/mascots.spec.ts` |
| Hecho cuando: criterios de HU-02 y HU-03, y CE-04 y CE-07 en las casas | 1-8 | `pnpm check` y `pnpm test:e2e` |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- `run`: revisión en navegador de las mascotas y del tablero.
- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte, si el usuario la pide.

### Decisiones técnicas

- **Sí:** `Mascot` en `src/app/shared/`, con selector de atributo sobre `<g>` (`g[jp-mascot]`) y plantilla con prefijo `svg:`. Sirve dentro del SVG del tablero y, en PARTE-03, dentro de un `<svg>` del cartel y de la pestaña.
- **No:** `<symbol>` y `<use>`. No permiten animar una sola ficha sin trucos de propiedades heredadas.
- **No:** copiar los componentes web ni los SVG del diseño. Lo impide RNF-009, y sus colores van en hexadecimal.
- **Sí:** la ficha-mascota va sobre el tono oscuro de su equipo, con el borde del color del equipo. El diseño usa un fondo oscuro con el aro del color, y sobre el tono base el jaguar, del mismo amarillo, no se distinguiría. Se sigue distinguiendo por color a 9 px (RNF-005).
- **Sí:** las fichas en casa ocupan su hueco (radio 28), como en la variante `e` del diseño; fuera de casa conservan el radio 17. Las áreas táctiles no cambian.
- **Sí:** el resalte de la casa en turno es un borde y un brillo fijos, más un pulso solo con movimiento permitido. El medallón de la esquina del diseño es una mascota decorativa fija, que el spec descarta.
- **Sí:** animaciones CSS en `mascot.css`, dentro de `@media (prefers-reduced-motion: no-preference)` y activadas con una clase del componente. Solo transforman partes de la mascota o cambian su opacidad, dentro de su `<g>`.
- **Sí:** id único por instancia para el recorte (`jp-mascot-N`), porque el tablero tiene hasta 17 mascotas a la vez.
- **Sí:** la geometría de escenas y decorados se calcula una vez, como `boardDecor()`, y tiene sus tests (P-07).
- **Sí:** los colores comunes a varias mascotas o escenas son un único token (tinta, pupila, dorado, gema, rubor) y los que repiten un color de equipo lo referencian con `var()`. Los `@keyframes` del pulso de la casa van con el resalte, en el paso 7.
- **Sí:** la regla `@angular-eslint/component-selector` admite selectores de elemento y de atributo, con el mismo prefijo `jp` y en kebab-case. Un elemento `<jp-mascot>` dentro de un `<svg>` no se pinta, y desactivar la regla en una línea iría contra P-09. Decisión del usuario en el paso 4.
- **Sí:** `Mascot` recibe el radio del círculo que llena y escala el dibujo del diseño (círculo de radio 44 centrado en (0, 3), el centro de su placa). Las puntas de las plumas del loro y las orejas del jaguar quedan recortadas por el círculo.
- **Sí:** las reglas fuera de la animación son el primer fotograma de cada bucle, que coincide con la mascota quieta: el reflejo de las gafas, la sonrisa abierta, las chispas, el pico abierto, las notas, las burbujas, las gotas y el guiño quedan ocultos.
- **Sí:** el rubor de la rana se anima en cada mejilla, de 0,5 a 0,95 de opacidad. En el diseño se anima el grupo sobre mejillas ya a 0,5, y en reposo quedaría más tenue que en la mascota quieta.
- **Sí:** la mascota llena el disco por dentro de su borde, de 3 de ancho, sobre el reborde blanco de 4 de SPEC 006. La réplica es igual, con el borde discontinuo y la mascota sin animar.
- **Sí:** los dos tests de RF-009 de SPEC 006 que pedían un disco del color del equipo con borde de tinta pasan a comprobar el tono oscuro y el borde del color del equipo, porque RF-005 sustituye ese aspecto. El resto de tests de SPEC 006 no cambia; el ayudante `centerOf` mira solo los círculos de la ficha, no los de su mascota.
- **Sí:** `homeScenes()` da, por equipo, las formas de la escena con su punto de anclaje en el tablero y un decorado por hueco con su centro, todo como trazos locales con sus clases de pintura. Los tests comprueban el anclaje dentro de la casa, el centro de cada hueco, que cada casa usa solo los tokens de su escena y que la geometría es estable.
- **Sí:** el decorado de cada hueco sustituye a los círculos del hueco de SPEC 006, que quedaban tapados; el grupo `data-home-slot` se mantiene.
- **Sí:** el resalte de la casa en turno es un brillo claro alrededor del cuadrado pintado y un borde blanco, fijos, más un anillo que crece hasta 1,12 y se desvanece en 1,6 s, solo con movimiento permitido. Sin movimiento, el anillo no se ve. El diseño escala 1,45 el anillo del medallón, que en un cuadrado de 260 se saldría de la casa.
- **Sí:** las rayas de la toalla del hipopótamo son trazos con las esquinas redondeadas en la primera y la última, en lugar de un recorte, para no añadir un `clipPath` por hueco. Los anillos discontinuos de las manchas del jaguar llevan `dash` y extremos rectos; el resto de trazos, extremos redondeados.
- **Sí:** en `e2e/mascots.spec.ts`, una mascota está animada si tiene alguna animación en marcha (`getAnimations({ subtree: true })`). Con movimiento reducido se comprueba además que el pulso de la casa no tiene animaciones y que el borde y el brillo se ven.

## PARTE-03: Cartel y pestaña de última jugada

**Estado:** Pendiente

### Enfoque

El cartel y la pestaña siguen saliendo de funciones puras sobre el motor, como en SPEC 006, pero con otra forma:

- `headline(state)` devuelve `{ color, action, turn }`:
  - `color`: el del equipo en turno, o el del ganador.
  - `action`: solo la acción («Toca el dado», «Elige una ficha», «Usa tu +N», «¡Gana X!»).
  - `turn`: el texto del turno para el lector de pantalla («Turno de Azul.», «Tirada inicial, turno de Amarillo.»), o `null` con ganador.
- `lastPlay(player, events)` devuelve `{ color, text }` o `null`. El color es el del equipo que actúa; la frase junta los eventos sin nombrarlo y sin el cambio de turno.

Para saber quién actúa, `GameStore` guarda el jugador de la última acción aceptada (`lastPlayer`) junto a sus eventos.

`TurnBanner` se redibuja como en el diseño:

- Tablón del color del equipo, con su borde oscuro.
- A la izquierda, la mascota animada en una placa redonda del tono oscuro: un `<svg>` pequeño con `g[jp-mascot]`.
- La acción en Caprasimo, con el contorno de tinta.
- Antes de la acción, el turno en un `sr-only`.

Un componente nuevo, `LastPlayTab`, pinta la pestaña: un tablón más pequeño del color oscurecido (`bg-team-*-dark`, el mismo tono de las fichas-mascota), colgado bajo el cartel, con la mascota quieta y la frase en Figtree.

El hueco de la pestaña se reserva siempre (RNF-010). En `app.html`, la pestaña real y una copia invisible con la frase más larga (`LONGEST_PLAY`, con `aria-hidden` e `invisible`) ocupan la misma celda de una rejilla. Así el hueco mide lo mismo que la pestaña más larga en cada ancho de ventana, haya pestaña o no. La región `aria-live` es el contenedor fijo del hueco, para que el lector de pantalla anuncie cada frase nueva.

### Textos de la pestaña (RF-012)

| Evento | Texto |
| --- | --- |
| `initial-roll` | saca 5 |
| `initial-roll-tie` | empate entre Amarillo y Rojo |
| `first-player` | — (es el cambio de turno de la tirada inicial) |
| `piece-left-home` | saca una ficha de casa |
| `piece-advanced` | mueve una ficha |
| `piece-captured` | se come una ficha de Azul |
| `piece-reached-goal` | llega a la meta |
| `bonus-earned` | cuenta 20 |
| `bonus-lost` | pierde el +10 |
| `roll-lost` | saca 4 y pierde la tirada |
| `roll-again` | repite |
| `three-sixes` | tres seises; si su ficha vuelve, «tres seises y su ficha vuelve a casa» |
| `turn-changed` | — |
| `game-over` | gana la partida |

Los textos se unen con «, », con mayúscula inicial y punto final: «Mueve una ficha, se come una ficha de Verde, cuenta 20.». No hay pestaña si todavía no hay ninguna acción o si la última acción solo cambió el turno.

### Archivos

- `src/app/game/headline.ts`, `headline.spec.ts`: nueva forma `{ color, action, turn }` (RF-009, RF-010).
- `src/app/game/last-play.ts`, `last-play.spec.ts`: `lastPlay(player, events)` devuelve `{ color, text } | null`, con los textos nuevos y `LONGEST_PLAY` (RF-011, RF-012).
- `src/app/game/game-store.ts`, `game-store.spec.ts`: señal `lastPlayer`.
- `src/app/game/turn-banner.ts`, `turn-banner.html`, `turn-banner.spec.ts`: cartel nuevo con `Mascot` (RF-008, RF-010).
- `src/app/game/last-play-tab.ts`, `last-play-tab.html`, `last-play-tab.spec.ts` (nuevos): pestaña (RF-011).
- `src/app/app.ts`, `app.html`, `app.spec.ts`: hueco reservado con la pestaña y su copia invisible; los tests de SPEC 006 del cartel y de la línea, adaptados a los textos nuevos.
- `e2e/game.spec.ts`, `e2e/ambience.spec.ts`, `e2e/screen.spec.ts`: textos y selectores nuevos (RF-013).
- `e2e/notices.spec.ts` (nuevo): contraste en los cuatro colores y tablero quieto al aparecer la pestaña (CE-05, CE-11).
- `e2e/mascots.spec.ts`: la mascota del cartel se anima, y con movimiento reducido queda quieta (CE-07).
- `docs/design/README.md`: las filas de `mascotas/` y `avisos-y-campeon/` pasan a SPEC 007 (la pantalla de campeón sigue pendiente).

### Pasos

- [ ] 1. Tests de `headline.ts`, con un esqueleto que compila y los hace fallar. Un test por estado, con su color, su acción y su texto de turno: tirar, tirada inicial y desempate, elegir ficha, premio pendiente de 10 y de 20, y ganador. Con ganador, `turn` es `null` (RF-009, RF-010, CE-02, CE-03).
- [ ] 2. `headline.ts`, hasta que pasen los tests del paso 1.
- [ ] 3. Tests de `last-play.ts` y de `lastPlayer`, con un esqueleto que compila y los hace fallar (RF-011, RF-012):
  - Un test por tipo de evento con su texto de la tabla, sin nombrar al equipo que actúa ni el turno (CE-01).
  - Varios eventos en una frase, en el orden del motor.
  - Sin jugador, o con solo el cambio de turno: `null`.
  - El color es el del equipo que actúa.
  - Tres seises en una sola frase (HU-05.4).
  - En 200 partidas aleatorias, con dados de una semilla fija, ninguna frase es más larga que `LONGEST_PLAY`.
  - En `game-store.spec.ts`: `lastPlayer` empieza en `null`, pasa al jugador de cada acción aceptada y no cambia con una acción rechazada.
- [ ] 4. `last-play.ts` y `lastPlayer` en `GameStore`, hasta que pasen los tests del paso 3.
- [ ] 5. `TurnBanner` nuevo: tablón del color con borde oscuro y clavos, placa con la mascota animada, acción con `font-display` y contorno de tinta, y turno en `sr-only` antes de la acción. Tests en `turn-banner.spec.ts` en el mismo paso (RF-008, RF-010, HU-04):
  - Color y mascota de cada equipo, con la mascota animada.
  - Acción visible, sin «Turno de».
  - Texto del turno antes de la acción, y sin él con ganador.
  - Mascota y clavos decorativos.
- [ ] 6. `LastPlayTab` y hueco reservado en `app.html`. Tests en `last-play-tab.spec.ts` y `app.spec.ts` en el mismo paso (RF-011, HU-05):
  - Pestaña en el tono oscuro y con la mascota quieta de quien actúa.
  - Antes de la primera acción no hay pestaña, pero sí el hueco y su copia invisible.
  - Región `aria-live` fija.
  - HU-04.1 a HU-04.4, HU-05.2 y HU-05.3 sobre la pantalla.
  - Los tests de SPEC 006 del cartel y de la línea pasan a los textos nuevos.
- [ ] 7. Pruebas en navegador de SPEC 006 adaptadas (RF-013, CE-06, CE-09, RNF-004):
  - `game.spec.ts`: los mismos escenarios, con las acciones y frases nuevas y el color de la pestaña.
  - `ambience.spec.ts` y `screen.spec.ts`: selectores nuevos y hueco reservado dentro de la ventana.
- [ ] 8. Pruebas en navegador nuevas:
  - `e2e/notices.spec.ts`, contraste (CE-05, RNF-001): recorriendo los cuatro colores en la tirada inicial, el texto mide al menos 4,5:1 contra su fondo inmediato. En el cartel, ese fondo es el contorno de tinta; en la pestaña, el tono oscuro.
  - `e2e/notices.spec.ts`, tablero quieto (CE-11, RNF-010): en las cuatro ventanas, la caja del tablero es la misma antes de la primera acción, con una pestaña corta y con un empate de cuatro.
  - `e2e/mascots.spec.ts` (CE-07, RNF-002): la mascota del cartel tiene animaciones en marcha, y con movimiento reducido no tiene ninguna.
  - Revisión en navegador a 320 × 568 y 1920 × 1080 frente a `docs/design/avisos-y-campeon/capturas/avisos.png`.
  - Filas de `docs/design/README.md`.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-04.1 (amarillo, jaguar animado, «Toca el dado») | 1, 2, 5, 6 | `headline.spec.ts`; `turn-banner.spec.ts`; `app.spec.ts` en una partida nueva |
| HU-04.2 (rojo, loro, «Elige una ficha») | 1, 2, 6, 7 | `headline.spec.ts`; `app.spec.ts`; `game.spec.ts` |
| HU-04.3 («Usa tu +20» tras comer) | 1, 2, 6, 7 | `headline.spec.ts`; `app.spec.ts`; `game.spec.ts` (escenario de comer) |
| HU-04.4 (verde, rana, «¡Gana Verde!») | 1, 2, 6 | `headline.spec.ts`; `app.spec.ts` con ganador verde |
| HU-04.5 (lector: turno antes de la acción) | 1, 2, 5 | `turn-banner.spec.ts`: `sr-only` «Turno de Azul.» antes de `[data-action]` |
| HU-05.1 (sin pestaña, hueco reservado) | 6, 8 | `app.spec.ts`; `notices.spec.ts` |
| HU-05.5 (tablero quieto al aparecer la pestaña) | 6, 8 | `notices.spec.ts` (CE-11) |
| HU-05.2 (rojo saca ficha, pasa a verde) | 3, 4, 6, 7 | `last-play.spec.ts`; `app.spec.ts`; `game.spec.ts`: cartel verde, pestaña roja con el loro, «Saca una ficha de casa.» |
| HU-05.3 (verde se come una azul) | 3, 4, 6 | `last-play.spec.ts`; `last-play-tab.spec.ts`: verde oscuro y rana, «…se come una ficha de Azul, cuenta 20.» |
| HU-05.4 (tercer 6) | 3, 4, 7 | `last-play.spec.ts`; `game.spec.ts` (escenario de tres seises) |
| RF-008 | 5 | Ver HU-04 |
| RF-009 | 1, 2 | `headline.spec.ts` (CE-02) |
| RF-010 | 1, 2, 5 | `headline.spec.ts`, `turn-banner.spec.ts` (CE-03); mascotas con `aria-hidden` |
| RF-011 | 3, 4, 6 | `last-play.spec.ts`, `game-store.spec.ts`, `last-play-tab.spec.ts`, `app.spec.ts` |
| RF-012 | 3, 4 | `last-play.spec.ts` (CE-01) |
| RF-013 | 7 | `game.spec.ts`, `ambience.spec.ts`, `screen.spec.ts` (CE-06) |
| RNF-001 | 5, 6, 8 | `notices.spec.ts` (CE-05) |
| RNF-002 | 5, 8 | `mascots.spec.ts` con movimiento reducido (CE-07) |
| RNF-004 | 7 | `screen.spec.ts` con el hueco reservado (CE-09) |
| RNF-006 | 5, 6 | Búsqueda de hexadecimales en `src/app/` sin resultados |
| RNF-007 | 1-4 | El cartel y la pestaña salen solo de `GameState`, de los eventos y del jugador de la acción; el motor no cambia |
| RNF-010 | 3, 6, 8 | `last-play.spec.ts`: `LONGEST_PLAY` acota las frases; `notices.spec.ts` (CE-11) |
| Hecho cuando: HU-04, HU-05 y CE-01, 02, 03, 05, 06, 07, 09, 11 | 1-8 | `pnpm check` y `pnpm test:e2e` |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- `run`: revisión en navegador del cartel y de la pestaña.
- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte, si el usuario la pide.

### Decisiones técnicas

- **Sí:** `GameStore.lastPlayer` guarda el jugador de la última acción aceptada. El spec define al equipo que actúa como quien envió la acción, y no todos los eventos lo llevan.
- **Sí:** `first-player` no aparece en la pestaña, igual que `turn-changed`: es el cambio de turno con el que acaba la tirada inicial, y ya lo dice el cartel. La pestaña dice el valor y, si lo hay, el empate, como pide el caso límite.
- **Sí:** «llega a la meta» y «se come una ficha de Azul», como en el diseño. Para `game-over`, «gana la partida», sin nombrar al ganador, que es quien actúa.
- **Sí:** en la tirada inicial, el texto del turno es «Tirada inicial, turno de Amarillo.», para que el lector de pantalla no pierda lo que el cartel de SPEC 006 mostraba a la vista.
- **Sí:** el hueco se reserva con una copia invisible de `LONGEST_PLAY` en la misma celda de rejilla que la pestaña. Mide lo mismo que la frase más larga en cada ancho y con la tipografía cargada, sin alturas fijas. Un test de 200 partidas aleatorias comprueba que ninguna frase la supera en caracteres. La copia usa letras anchas, porque dos frases con los mismos caracteres pueden ocupar anchos distintos.
- **Sí:** la pestaña usa los tokens `team-*-dark` que ya existen, los del fondo de las fichas-mascota, en lugar de los tonos del diseño. Son algo más oscuros, así que el contraste con el blanco es mayor; el más justo, el amarillo, da unos 4,8:1. No hacen falta tokens nuevos.
- **Sí:** la mascota del cartel y de la pestaña va en una placa redonda del tono oscuro con aro del color, como las fichas-mascota, en lugar del cuadrado redondeado del diseño. `Mascot` ya recorta a un círculo.
- **Sí:** el contraste del cartel se mide contra el contorno de tinta, que es su fondo inmediato, como en SPEC 006. El de la pestaña se mide contra su tono oscuro, sin las vetas de la madera.
- **Sí:** cambian los textos esperados de los tests de SPEC 006 del cartel y de la línea (`headline.spec.ts`, `turn-banner.spec.ts`, `last-play.spec.ts`, `app.spec.ts` y las pruebas en navegador), porque RF-008, RF-009, RF-011 y RF-012 sustituyen a los requisitos que probaban. Los escenarios no cambian.
