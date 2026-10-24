# Plan técnico — SPEC 005 — Tablero de la jungla

> **Spec:** `specs/005-tablero-jungla/spec.md`
> **Rama:** `feat/spec-005-tablero-jungla`
> **Fecha:** 2026-10-24

## PARTE-01: Colores y tablero

**Estado:** Hecha

### Enfoque

La paleta de la variante «claro» se define una sola vez como tokens `@theme` de Tailwind en `src/styles.css`. Tailwind los expone como variables CSS (`--color-*`) y genera sus utilidades `fill-*`, `stroke-*` y `bg-*`, así que la página y el SVG usan los mismos colores (RNF-005). Los tonos derivados del diseño (`shade(color, ±0,38)`) se definen con `color-mix()` sobre el token base, sin hex duplicados. La geometría del tablero vive en `src/app/board/board-geometry.ts`, un módulo puro que reproduce las coordenadas del diseño (brazo inferior en coordenadas locales y rotaciones de −90° por brazo) y decide qué es seguro, salida, entrada y pasillo solo con lo que exporta el motor (`TRACK_LENGTH`, `LANE_LENGTH`, `START_SQUARE`, `ENTRY_SQUARE`, `isSafe`, `COLORS`), nunca con `SAFE` ni `EXIT` del diseño (RF-006). El brazo de cada pasillo y de cada triángulo de meta se deduce de la casilla de entrada del motor. El componente `jp-board` pinta un único SVG con dos grupos: la capa decorativa, oculta con `aria-hidden`, y la capa de juego, ambas a partir de datos calculados en TypeScript y recorridos con `@for`, sin `innerHTML`. Las texturas aleatorias del diseño (hierba, veta, nudos, mechones de los seguros, hojas) se generan en `board-decor.ts` con el mismo generador con semilla del diseño, de modo que el dibujo es estable entre repintados.

### Archivos

- `src/styles.css`: tokens `@theme static` de la paleta (con los del tronco del centro, paso 6) y fondo de la página.
- `src/index.html`: `lang="es"` y título «Parchís de la jungla».
- `src/app/app.ts`, `src/app/app.html`, `src/app/app.css`: sustituir la página de bienvenida por el contenedor del tablero, centrado y del tamaño de RNF-001.
- `src/app/app.spec.ts`: tests del contenedor en lugar de los de la página de bienvenida.
- `src/app/board/board-geometry.ts` (nuevo): casillas del recorrido común, pasillos, metas y casas con su rectángulo, su rotación y su tipo; cálculo puro.
- `src/app/board/board-palette.ts` (nuevo): clases de Tailwind de la paleta por color y tono. Medidas y tipos de cada concepto viven en su propio archivo (`board-geometry.ts`, `board-decor.ts`, `board.ts`); ver «Decisiones técnicas».
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
- [x] 3. Implementar `board-geometry.ts`; `pnpm test:once` en verde.
- [x] 4. Tests de componente en `board.spec.ts` con el esqueleto de `jp-board` (SVG vacío con su nombre): 68 casillas pintadas con su número visible; 12 seguros, 4 de ellos de salida en el color de su equipo; 4 pasillos de 7 casillas en su color; 4 triángulos de meta; 4 casas con 4 puestos; nombre accesible «Tablero de parchís de la jungla»; capa decorativa con `aria-hidden="true"`. Ejecutar y ver que fallan.
- [x] 5. Implementar la capa de juego de `jp-board` (tablones, seguros, salidas, pasillos, metas, casas y números) con las utilidades de color de la paleta y montarlo en `app.html`; `pnpm test:once` en verde.
- [x] 6. Tests de `board-decor.spec.ts` (misma semilla, mismos datos; número de briznas, vetas y hojas del diseño) e implementación de `board-decor.ts`; texturas de hierba y madera, ruido de luz y sombra, mechones de los seguros, hojas de las esquinas y tronco del centro en `jp-board`. `pnpm check` en verde.
- [x] 7. Medir el contraste de los números (RNF-003) en tablón, seguro y salida de cada color, ajustar lo mínimo y anotar los valores en «Decisiones técnicas»; revisar en el navegador las ventanas de CE-06 con `pnpm start`. `pnpm check` en verde.

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
- **Sí:** esquina de cada casa deducida del brazo de su `START_SQUARE`, igual que pasillo y meta con `ENTRY_SQUARE`. Del diseño solo queda la casa del brazo inferior; las demás salen de girarla.
- **Sí:** giros de cuarto de vuelta con coordenadas enteras y rotación SVG en grados positivos (0, 90, 180, 270). Evitan los `-0` y decimales de `Math.cos`, y `rotate(270 500 500)` equivale al `rotate(-90 …)` del diseño.
- **Sí:** los tests de componente localizan los elementos con atributos `data-*` (`data-layer`, `data-square`, `data-kind`, `data-color`, `data-lane`, `data-step`, `data-goal`, `data-home`, `data-home-slot`) y comprueban el color por la utilidad de Tailwind (`fill-team-*`, `fill-canopy-dark`). Son el contrato estable del SVG; no dependen de coordenadas ni del orden de los elementos.
- **No (revertida):** constantes exportadas en `board.constants.ts` y tipos en `board.models.ts`. Se adoptó tras el paso 3 y se deshizo después del paso 6 a petición del usuario.
- **Sí:** archivos de `src/app/board/` organizados por concepto, como recomienda la guía de estilo de Angular: medidas y tipos geométricos en `board-geometry.ts`; tipos de la decoración y `DECOR_SEED` en `board-decor.ts`; clases de la paleta y `CanopyTone` en `board-palette.ts`; tipos de vista (`PlankView`, `SafeView`, `TuftView`, `GoalView`, `HomeView`) en `board.ts`. Cada archivo reúne lo que cambia junto. Sin cambios de comportamiento: mismos tests y mismo CSS generado. Decisión del usuario.
- **Sí:** números con `system-ui, sans-serif` en lugar de Figtree. Cargar Figtree exigiría una petición a Google Fonts o una dependencia nueva (P-16, P-17); `system-ui` da una negrita legible en todas las plataformas.
- **Sí:** sombras y brillos del diseño (`rgba(0,0,0,…)`, `#fff` con opacidad, `#1a240c`, `#14200a`) con utilidades de opacidad de Tailwind sobre negro, blanco o `grass-shade` (`fill-black/30`, `stroke-white/20`, `fill-grass-shade/40`). Valores aproximados al diseño, sin hex nuevos.
- **Sí:** la capa decorativa del paso 5 solo tiene marco, hierba lisa y la sombra de la cruz; las texturas llegan en el paso 6.
- **Sí:** decoración con el mismo generador (mulberry32), la misma semilla (`'claro'.length * 977 + 13`) y el mismo orden de tiradas que el diseño: briznas, vetas, nudos, matiz de cada tablón y copa de cada seguro en el orden del recorrido, y hojas. El dibujo sale igual que el de referencia y no cambia entre repintados.
- **Sí:** tokens nuevos `log-bark`, `log-wood`, `log-ring` y `log-crack` para el tronco del centro. Sus colores no estaban en la paleta del paso 1 y RNF-005 pide los colores solo en `@theme`.
- **Sí:** ruido de luz y sombra con `feFlood` coloreado por la variable del token (`grass-shade`, `sun`) y la máscara del ruido, en lugar de la matriz de color con los canales del hex que usa el diseño. Mismo resultado sin copiar la paleta.
- **Sí:** hojas de las esquinas en la capa decorativa, debajo de las casas, en lugar de encima de todo como en el diseño. Encima taparían los puestos de casa donde irán las fichas (RF-005). Asoman sobre el marco y el borde de hierba.
- **Sí:** tronco del centro en la capa de juego, justo después de las metas y con `aria-hidden`. Debajo de las metas no se vería; no tapa casillas ni los centros de meta.
- **Sí:** patrones, filtros y recortes con `id` fijos (`jp-board-*`). Solo hay un tablero por página; si algún día hay dos, habrá que generar ids únicos.
- **Observación:** como en el diseño, las hojas de la copa de un seguro sobresalen hasta 17 unidades por encima de su casilla y asoman sobre el tablón vecino; las más altas pueden rozar la parte baja de su número. Se revisa en el paso 7 junto al contraste.
- **Sí (paso 7, RNF-003):** contraste medido con la fórmula de WCAG 2.2 sobre los tokens. Tablones: tinta sobre madera 5,72:1; con el matiz oscuro del 10 %, 4,68:1; con el claro, 6,35:1; pero sobre una veta (`wood-line` al 90 %) baja a 3,45:1, y con el matiz oscuro a 2,89:1. Ajuste mínimo: el número del tablón lleva contorno opaco `stroke-wood` de 2,4 (como los seguros), así que su fondo inmediato es madera lisa: 5,72:1. Seguros: blanco sobre contorno `canopy-dark` 10,24:1. Salidas: blanco sobre el contorno del tono oscuro, amarillo 4,77, azul 8,92, rojo 9,48 y verde 8,60. Todas ≥ 4,5:1.
- **Medido (paso 7):** las puntas más altas de la copa de los seguros 5 y 63, y de sus equivalentes en cada brazo, llegan como mucho a 1 unidad por encima de la línea base del número del tablón vecino (6 y 64, y así en cada brazo). Son puntas sin grosor que no tapan el número; se deja como en el diseño.
- **Sí (paso 7, CE-06):** revisión con Chrome headless y emulación de pantalla por el protocolo de DevTools (Chrome no baja de 504 px de ancho de ventana sin emulación). En 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080 el tamaño de desplazamiento del documento es igual al de la ventana (sin scroll) y el tablero queda entero dentro: 308, 308, 738 y 900 px de lado. Aspecto «claro» comprobado en las capturas.
- **Observación:** a 320 px de ancho los números miden unos 4 px de alto. El contraste se cumple, pero la legibilidad a ese tamaño depende del zoom; queda para el SPEC de accesibilidad.

## PARTE-02: Fichas

**Estado:** En curso

### Enfoque

La traducción de posiciones es un módulo puro, `src/app/board/board-pieces.ts`, que recibe el estado del motor y devuelve, para cada ficha, su color y el punto del tablero donde se pinta (RF-014). Se apoya en la geometría de PARTE-01, que se amplía con dos datos: el eje de pareja de cada tablón (vector unitario hacia el lado de la ficha que llegó antes) y los 4 puestos de cada meta. El orden dentro de una casilla y en la meta sale de `arrivalOrder` del estado; en casa, del número de la ficha. `jp-board` recibe el estado con `input.required<GameState>()` y pinta las fichas en un grupo propio al final de la capa de juego, encima de todo, con un `computed()` que se recalcula al recibir un estado nuevo, sin animación (RF-015). `App` crea la partida nueva de 4 jugadores con `createGame` y se la pasa al tablero (RF-008).

### Archivos

- `src/app/board/board-geometry.ts`: eje de pareja en `TrackSquare` y `LaneSquare`, puestos en `Goal`, radio de ficha y separación de pareja.
- `src/app/board/board-geometry.spec.ts`: tests del eje de pareja y de los puestos de meta.
- `src/app/board/board-pieces.ts` (nuevo): traducción pura de posiciones del motor a puntos del tablero.
- `src/app/board/board-pieces.spec.ts` (nuevo): tests de la traducción para cada casilla, pasillo, casa y meta.
- `src/app/board/board-palette.ts`: clases del borde y del reborde de las fichas.
- `src/app/board/board.ts`, `src/app/board/board.html`: entrada `state` y grupo de fichas.
- `src/app/board/board.spec.ts`: helper `render(state)` con `setInput` y tests de fichas con estados construidos.
- `src/app/app.ts`, `src/app/app.html`, `src/app/app.spec.ts`: partida nueva de 4 jugadores pasada al tablero.

### Pasos

- [x] 1. Tests de geometría en `board-geometry.spec.ts` con el esqueleto (eje `{ x: 0, y: 0 }` y metas sin puestos): en cada casilla del recorrido y del pasillo, el eje es unitario y paralelo al lado largo del tablón; en los tablones de columna apunta a la izquierda según el sentido de avance (de la casilla anterior a la siguiente); en los tablones centrales (68, 17, 34, 51) apunta a la casilla anterior; cada meta tiene 4 puestos dentro del triángulo, sin solaparse, en fila paralela a la base, y el primero a la izquierda según el avance del pasillo. Ejecutar y ver que fallan.
- [x] 2. Implementar el eje de pareja y los puestos de meta en `board-geometry.ts`; `pnpm test:once` en verde.
- [x] 3. Tests de `board-pieces.spec.ts` con el esqueleto (devuelve vacío): para cada casilla del recorrido y de cada pasillo, una ficha sola cae en su centro y una pareja queda dentro del tablón sin solaparse, la que llegó antes según `arrivalOrder` del lado del eje (CE-02); fichas en casa en el puesto de su número; fichas en meta en los puestos por orden de llegada; misma entrada, mismo punto. Ejecutar y ver que fallan.
- [x] 4. Implementar `board-pieces.ts`; `pnpm test:once` en verde.
- [x] 5. Tests de componente en `board.spec.ts` con el esqueleto de la entrada `state` (grupo de fichas vacío): `render(state)` con `setInput`; los tests de PARTE-01 pasan una partida nueva; escenarios de HU-02, HU-03 y HU-04 y casos límite (2 jugadores, estado nuevo tras otro). Localizan cada ficha por `data-piece` y comprueban su centro, su color y su borde. Ejecutar y ver que fallan.
- [x] 6. Implementar las fichas en `jp-board` (disco del color con borde oscuro y reborde claro) y la partida nueva en `App`; `app.spec.ts` con 16 fichas en casa. `pnpm test:once` en verde.
- [x] 7. Medir el contraste del borde de la ficha (RNF-004) sobre madera, seguro, salida, pasillo, casa y meta de cada color, ajustar lo mínimo y anotar los valores en «Decisiones técnicas»; revisar en el navegador con `pnpm start`. `pnpm check` en verde.

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
|----------|------|--------|
| HU-02 c1 / RF-008 / RF-010 | 3-6 | «RF-008: la aplicación muestra una partida nueva de 4 jugadores» (`app.spec.ts`: 16 fichas, 4 por casa, puestos distintos); «RF-010: cada ficha en casa ocupa el puesto de su número» |
| HU-02 c2 / RF-011 | 3-6 | «RF-011: una ficha sola cae en el centro de su casilla» (todas las casillas); componente: ficha roja sola en la 30, en el centro de la 30 |
| HU-02 c3 / RF-011 | 3-6 | «RF-011: una ficha en el pasillo cae en el centro de su casilla»; componente: ficha azul en el paso 3 de su pasillo, en el centro del tercer tablón azul desde la entrada |
| HU-02 c4 / RF-009 / RNF-004 | 5-7 | Componente: ficha amarilla en la 5 pintada con `fill-team-yellow`, borde oscuro y reborde claro; medición del paso 7 |
| HU-02 c5 / RF-015 | 5, 6 | «RF-015: al recibir un estado nuevo la ficha aparece en su nueva posición» (`setInput` dos veces; sin animaciones ni transiciones) |
| HU-03 c1 / RF-012 | 1-6 | «RF-012: una pareja queda dentro del tablón sin solaparse» (todas las casillas); componente: dos verdes en la 40 |
| HU-03 c2 / RF-012 | 1-6 | «RF-012: la ficha que llegó antes va a la izquierda según el avance»; componente: roja y azul en el seguro 29, completas dentro del tablón y la que llegó antes del lado del eje |
| HU-03 c3 / RF-012 | 1-6 | Unitario de pareja en cada casilla de cada pasillo; componente: dos amarillas en la misma casilla de su pasillo |
| HU-04 c1 / RF-013 | 1-6 | «RF-013: hasta 4 fichas en meta, en puestos fijos, sin solaparse y dentro del triángulo»; componente: 4 azules en meta |
| HU-04 c2 / RF-013 | 3-6 | «RF-013: la primera ficha en llegar ocupa el primer puesto»; componente: 1 roja en meta, en el primer puesto |
| RF-009 | 5, 6 | Componente: cada ficha con la utilidad de su color, borde oscuro y reborde claro |
| RF-014 | 3, 4 | «RF-014: la misma posición da siempre el mismo punto»; `board-pieces.ts` sin Angular |
| RF-007 (caso límite) | 5, 6 | Componente: partida de 2 jugadores, casas de los ausentes vacías |
| RNF-004 / CE-05 | 7 | Medición del contraste del borde con cada fondo, anotada en «Decisiones técnicas» |
| RNF-006 | 1-7 | Lint de la frontera; diff sin cambios en `src/engine/` |
| CE-02 | 3, 4 | Tests unitarios de ficha sola y pareja en cada casilla del recorrido y de cada pasillo |
| CE-03 | 5, 6 | Tests de componente en casa, recorrido, pasillo, meta y pareja |
| Hecho cuando | 7 | HU-02, HU-03 y HU-04 en verde; CE-02, CE-03 y CE-05 |

Comandos: `pnpm test:once` durante cada paso, `pnpm check` al cerrar el paso 7 y la parte.

### Skills y agentes

- `frontend-design`: aspecto del disco, coherente con el diseño de referencia.
- `run` / navegador: revisión del tablero con las fichas en el paso 7.
- `context7`: documentación de `input()` y `setInput` en Angular 22 al escribir los pasos 5 y 6.
- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte.

### Decisiones técnicas

- **Sí:** pareja a lo largo del lado largo del tablón (120), con el eje de pareja calculado en la geometría. En el lado corto (40) no caben dos discos.
- **Sí:** en los tablones de columna, la ficha que llegó antes a la izquierda según el sentido de avance (RF-012). En los tablones centrales (68, 17, 34 y 51), donde se avanza a lo largo del tablón, la que llegó antes en el extremo de donde se viene. Decisión del usuario.
- **Sí:** un solo disco en casa, recorrido, pasillo y meta, de radio 17 con borde y reborde. Cabe en el tablón de 40 con margen. Decisión del usuario.
- **Sí:** 4 puestos de meta en fila paralela a la base del triángulo, cerca del final del pasillo, el primero a la izquierda según el avance. Decisión del usuario.
- **Sí (paso 2):** puestos de meta en coordenadas locales `x` = 440, 480, 520 y 560, `y` = 645: 38 unidades sobre la base, 55,9 de cada lado y 40 entre centros, todo por encima del radio 17 y del doble del radio. Quedan lejos del tronco del centro (radio 44). El triángulo pasa a definirse por sus esquinas y su trazado SVG sale de ellas, el mismo de antes.
- **Sí (paso 2):** eje de pareja en coordenadas locales del brazo inferior (hacia `+x` en la columna izquierda; hacia `−x` en la derecha, en el tablón central y en el pasillo) y girado con el brazo, igual que las casillas. Una sola regla para las 68 casillas y los 4 pasillos.
- **Sí (paso 3):** dos funciones en `board-pieces.ts`: `pieceCenter(color, posición, lugar)` traduce una posición del motor con su lugar dentro de ella (`index` y `count`: cuántas fichas la comparten) a un punto, y `piecePlaces(estado)` calcula ese lugar para cada ficha. RF-014 pide la traducción con color, casilla y lugar; el estado completo solo hace falta para el orden de llegada.
- **Sí (paso 3):** los tests construyen estados a partir de `createGame` cambiando posiciones y `arrivalOrder`; el orden de la lista es el de llegada. No usan los ayudantes de test del motor, que no salen por `@engine`.
- **Sí (paso 3):** esqueleto con constantes tipadas sin parámetros, en lugar de funciones con parámetros `_…` sin usar. La regla `no-unused-vars` no se toca (P-09).
- **Sí (paso 4):** pareja a 24 unidades del centro del tablón por cada lado del eje. Con radio 17 quedan 14 de hueco entre discos y 19 hasta cada extremo del tablón (60 − 24 − 17).
- **Sí (paso 4):** fichas agrupadas por lugar compartido (casilla del recorrido, casilla del pasillo de un color, casa o meta de un color); dentro del grupo, el lugar es el número de fichas que llegaron antes según `arrivalOrder`, y en casa, el número de la ficha. Las tablas de casillas, pasillos, casas y metas se calculan una vez al cargar el módulo; son constantes.
- **Sí (paso 5):** `App` ya crea la partida nueva y la pasa al tablero en el esqueleto, y el test RF-008 de `app.spec.ts` se escribe en este paso, no en el 6. Con la entrada obligatoria, `App` no compila sin pasarle un estado; el test falla igual porque el grupo de fichas está vacío.
- **Sí (paso 5):** ayudantes `newGame` y `stateWith` en `src/app/board/board-test-utils.ts`, compartidos por los tests de traducción y de componente, como `src/engine/test-utils.ts` en el motor. La aplicación no los importa.
- **Sí (paso 5):** contrato SVG de las fichas: grupo `data-pieces` al final de la capa de juego; cada ficha, un elemento `data-piece` con `data-color` y círculos con el mismo centro, el reborde (`data-part="rim"`, `fill-white`, radio `PIECE_RADIUS`) y el disco (`data-part="disc"`, `fill-team-*` con borde `stroke-*`). Los tests no fijan la clase del borde, que puede cambiar en el paso 7.
- **Sí (paso 7, RNF-004):** contraste medido con la fórmula de WCAG 2.2 sobre los tokens, contra cada fondo que puede quedar bajo una ficha: madera lisa, con matiz claro u oscuro del 9 %, veta (`wood-line` al 90 %) y canto; seguro (`canopy-dark`, `canopy`, `canopy-light` y su sombra); salida (tono oscuro y mechones base y claro); pasillo con y sin veta pintada (blanco o negro al 22 %); puesto de casa (color con negro al 10 %); meta. Con el borde en el tono oscuro de cada color, la amarilla no llega a 3:1 ni con el borde ni con el reborde blanco en madera (1,88 y 2,54), pasillo, casa y meta (borde contra su color 2,43); la verde, sobre la veta blanca de su pasillo (2,91 y 2,96). Ajuste (decisión del usuario): el borde de todas las fichas pasa a `stroke-ink`. Tinta y blanco distan 14,51:1 (≥ 9:1, técnica C40 de WCAG), así que en cualquier fondo uno de los dos llega a 3:1. Peores casos: madera con matiz oscuro, tinta 4,78; veta con matiz oscuro, blanco 4,92; canto, blanco 7,73; `canopy-light`, tinta 4,57; salida amarilla, tinta 3,04, y las demás, blanco ≥ 8,60; pasillo azul con veta blanca, tinta 4,75; pasillo amarillo, tinta 7,39; puesto de casa rojo, blanco 5,73. Todos ≥ 3:1. El tono oscuro sigue en las salidas y sus números (RNF-003 no cambia).
- **Sí:** orden de llegada leído de `arrivalOrder` del estado. Es el orden del motor (R-023), sin copia en la aplicación.
- **Sí:** fichas en un grupo propio al final de la capa de juego. Quedan encima de casillas, seguros y metas (RF-005).
- **Sí:** el estado entra al tablero con `input.required<GameState>()` y las fichas salen de un `computed()`. Sin animaciones ni transiciones (RF-015).
