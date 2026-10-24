# Plan técnico — SPEC 005 — Tablero de la jungla

> **Spec:** `specs/005-tablero-jungla/spec.md`
> **Rama:** `feat/spec-005-tablero-jungla`
> **Fecha:** 2026-10-24

## PARTE-01: Colores y tablero

**Estado:** En curso

### Enfoque

La paleta de la variante «claro» se define una sola vez como tokens `@theme` de Tailwind en `src/styles.css`. Tailwind los expone como variables CSS (`--color-*`) y genera sus utilidades `fill-*`, `stroke-*` y `bg-*`, así que la página y el SVG usan los mismos colores (RNF-005). Los tonos derivados del diseño (`shade(color, ±0,38)`) se definen con `color-mix()` sobre el token base, sin hex duplicados. La geometría del tablero vive en `src/app/board/board-geometry.ts`, un módulo puro que reproduce las coordenadas del diseño (brazo inferior en coordenadas locales y rotaciones de −90° por brazo) y decide qué es seguro, salida, entrada y pasillo solo con lo que exporta el motor (`TRACK_LENGTH`, `LANE_LENGTH`, `START_SQUARE`, `ENTRY_SQUARE`, `isSafe`, `COLORS`), nunca con `SAFE` ni `EXIT` del diseño (RF-006). El brazo de cada pasillo y de cada triángulo de meta se deduce de la casilla de entrada del motor. El componente `jp-board` pinta un único SVG con dos grupos: la capa decorativa, oculta con `aria-hidden`, y la capa de juego, ambas a partir de datos calculados en TypeScript y recorridos con `@for`, sin `innerHTML`. Las texturas aleatorias del diseño (hierba, veta, nudos, mechones de los seguros, hojas) se generan en `board-decor.ts` con el mismo generador con semilla del diseño, de modo que el dibujo es estable entre repintados.

### Archivos

- `src/styles.css`: tokens `@theme static` de la paleta y fondo de la página.
- `src/index.html`: `lang="es"` y título «Parchís de la jungla».
- `src/app/app.ts`, `src/app/app.html`, `src/app/app.css`: sustituir la página de bienvenida por el contenedor del tablero, centrado y del tamaño de RNF-001.
- `src/app/app.spec.ts`: tests del contenedor en lugar de los de la página de bienvenida.
- `src/app/board/board-geometry.ts` (nuevo): casillas del recorrido común, pasillos, metas y casas con su rectángulo, su rotación y su tipo; cálculo puro.
- `src/app/board/board-geometry.spec.ts` (nuevo): tests de la geometría contra el motor.
- `src/app/board/board-decor.ts` (nuevo): generador con semilla y datos de la capa decorativa y de las texturas.
- `src/app/board/board-decor.spec.ts` (nuevo): tests de estabilidad de la decoración.
- `src/app/board/board.ts`, `src/app/board/board.html` (nuevos): componente `jp-board` con el SVG.
- `src/app/board/board.spec.ts` (nuevo): tests de componente del tablero pintado.
- `tsconfig.json`, `eslint.config.js`: alias `@engine` y regla de lint que lo exige (paso 2b, añadido durante la implementación).

### Pasos

- [x] 1. Paleta y contenedor: tokens `@theme static` en `styles.css` (equipos, hierba, briznas, sombra, sol, madera, veta, borde de madera, musgo, marco, borde del marco, tinta, tres tonos de copa y fondo de la página) y sus derivados con `color-mix()`; `index.html` en castellano; `app.html` sin la página de bienvenida, con un `main` centrado que reservará el sitio del tablero con lado `min(96vw, 96dvh, 900px)`; `app.spec.ts` actualizado. `pnpm check` en verde.
- [x] 2. Tests de la geometría en `board-geometry.spec.ts` con el esqueleto de `board-geometry.ts` (tipos y funciones que devuelven vacío): 68 casillas con los números del 1 al 68 sin repetir; seguros = casillas con `isSafe`; salidas = `START_SQUARE` con su color; cada pasillo tiene `LANE_LENGTH` casillas y su primera casilla es contigua a la casilla de entrada de su color en el sentido de avance; la séptima es contigua a su triángulo de meta; casas en las esquinas del diseño; centros de las casillas 1, 5, 22, 39, 56 y 68 iguales a los del diseño. Ejecutar y ver que fallan.
- [x] 2b. Alias `@engine` en `tsconfig.json` apuntando solo a `src/engine/index.ts`; ESLint de `src/app/` prohíbe `@engine/…` y las rutas relativas al motor; imports de la geometría con el alias. `pnpm check` en verde salvo los tests del paso 2, que siguen fallando hasta el paso 3.
- [ ] 3. Implementar `board-geometry.ts`; `pnpm test:once` en verde.
- [ ] 4. Tests de componente en `board.spec.ts` con el esqueleto de `jp-board` (SVG vacío con su nombre): 68 casillas pintadas con su número visible; 12 seguros, 4 de ellos de salida en el color de su equipo; 4 pasillos de 7 casillas en su color; 4 triángulos de meta; 4 casas con 4 puestos; nombre accesible «Tablero de parchís de la jungla»; capa decorativa con `aria-hidden="true"`. Ejecutar y ver que fallan.
- [ ] 5. Implementar la capa de juego de `jp-board` (tablones, seguros, salidas, pasillos, metas, casas y números) con las utilidades de color de la paleta y montarlo en `app.html`; `pnpm test:once` en verde.
- [ ] 6. Tests de `board-decor.spec.ts` (misma semilla, mismos datos; número de briznas, vetas y hojas del diseño) e implementación de `board-decor.ts`; texturas de hierba y madera, ruido de luz y sombra, mechones de los seguros, hojas de las esquinas y tronco del centro en `jp-board`. `pnpm check` en verde.
- [ ] 7. Medir el contraste de los números (RNF-003) en tablón, seguro y salida de cada color, ajustar lo mínimo y anotar los valores en «Decisiones técnicas»; revisar en el navegador las ventanas de CE-06 con `pnpm start`. `pnpm check` en verde.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-01 c1 | 1, 5, 6, 7 | Revisión en el navegador a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080: tablero entero, sin scroll, con el aspecto «claro» |
| HU-01 c2 / RF-001 | 2-5 | «RF-001: hay 68 casillas numeradas del 1 al 68» (geometría y componente); «RF-003: cada color tiene un pasillo de 7 casillas»; «RF-004: hay 4 casas con 4 puestos» |
| HU-01 c3 / RF-002 | 2-5 | «RF-002, R-006: los seguros son las casillas que el motor considera seguro» (12, con 12, 17, 29, 34, 46, 51, 63 y 68 sin color de equipo) |
| HU-01 c4 / RF-002 | 2-5 | «RF-002, R-005: las salidas 5, 22, 39 y 56 están en amarillo, azul, rojo y verde» |
| HU-01 c5 / RNF-002 | 4, 5, 6 | «RNF-002: el tablero se llama Tablero de parchís de la jungla»; «RNF-002: la capa decorativa está oculta para las tecnologías de apoyo» |
| RF-003 | 2-5 | «RF-003, R-008: el pasillo empieza junto a la casilla de entrada de su color»; «RF-003: la séptima casilla del pasillo da a la meta de su color»; triángulo de meta en el color del pasillo |
| RF-004 | 2-5 | «RF-004: las casas están en las esquinas del diseño con 4 puestos» |
| RF-005 | 6 | «RF-005: la decoración es estable con la misma semilla»; revisión visual de que no tapa casillas (capa de juego encima) |
| RF-006 | 2, 3 | Tests de seguros, salidas y entradas contra `isSafe`, `START_SQUARE` y `ENTRY_SQUARE`; revisión de que `src/app/` no contiene listas propias (CE-04) |
| RF-007 | 4, 5 | «RF-007: se pintan los 4 colores» (el tablero no depende de los jugadores) |
| RNF-001 | 1, 7 | Lado `min(96vw, 96dvh, 900px)`; revisión en el navegador de CE-06 |
| RNF-003 | 7 | Medición del contraste de cada combinación, anotada en «Decisiones técnicas» |
| RNF-005 | 1, 5 | Colores solo en `@theme`; el SVG usa utilidades `fill-*`/`stroke-*` de esos tokens; ningún hex de la paleta en `src/app/` |
| RNF-006 | 1-7 | Lint de la frontera (P-02); diff sin cambios en `src/engine/` |
| Hecho cuando | 7 | HU-01 en verde; CE-01 con los tests de geometría y componente; CE-04 revisado; CE-06 revisado en el navegador; números con 4,5:1 |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar los pasos 1, 6 y 7 y la parte.

### Skills y agentes

- `frontend-design`: guía visual al portar la decoración, sin salirse del diseño de referencia.
- `run` / navegador: revisión de CE-06 y del aspecto en el paso 7.
- `context7`: documentación de `@theme` de Tailwind v4 y de Angular 22 al escribir los pasos 1 y 5.
- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** tokens `@theme static` de Tailwind. Tailwind solo emite las variables usadas; `static` garantiza que todas existan como variables CSS para el SVG.
- **Sí:** colores en el SVG con utilidades `fill-*` y `stroke-*` escritas completas en el código (mapa por color en TypeScript). Tailwind detecta las clases sin listas de seguridad.
- **No:** atributos `fill="#…"` copiados del diseño. Duplicarían la paleta fuera de los tokens.
- **Sí:** tonos derivados con `color-mix()` sobre el token base. Equivale al `shade()` del diseño sin otro hex.
- **Sí:** geometría en un módulo puro aparte del componente. Se prueba sin pintar y la reutiliza la traducción de posiciones de PARTE-02.
- **Sí:** brazo de cada pasillo y meta deducido de `ENTRY_SQUARE`. El diseño solo aporta dónde está cada brazo, no qué color le toca.
- **No:** `innerHTML` con el SVG generado por el diseño. El saneado de Angular lo rompe y el motor no puede inyectar datos.
- **Sí:** números sobre seguros y salidas con contorno opaco del tono oscuro de su casilla, en lugar del contorno negro al 45 % del diseño. Los mechones claros de la copa quedan detrás del número; el contorno opaco fija su fondo inmediato. Medición previa: blanco sobre copa oscura 10,24:1; blanco sobre salida oscura: amarillo 4,79, rojo 9,46, azul 8,91, verde 8,62.
- **Sí:** números de los tablones con tinta opaca. Con la opacidad 0,8 del diseño dan 3,99:1 sobre la madera; opacos, 5,72:1.
- **Sí:** alias `@engine` exacto, sin `@engine/*`, en `tsconfig.json`. Los imports no dependen de la profundidad del archivo y el alias solo llega a la puerta de entrada (P-02). La regla de lint de `src/app/` pasa a prohibir `@engine/…` y cualquier ruta relativa al motor, así que es más estricta que la anterior (P-10). Añadido como paso 2b a petición del usuario.
