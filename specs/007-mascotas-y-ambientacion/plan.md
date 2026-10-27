# Plan técnico — SPEC 007 — Mascotas y ambientación

> **Spec:** `specs/007-mascotas-y-ambientacion/spec.md`
> **Rama:** `feat/spec-007-mascotas-y-ambientacion`
> **Fecha:** 2026-10-27

## PARTE-01: Ambientación y nombre de ficha compartido

**Estado:** Pendiente

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
