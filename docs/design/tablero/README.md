# Diseño del tablero

Exportado de Claude Design. Referencia visual del tablero de la jungla para los specs de interfaz.

- `parchis-jungla.pdf`: las variantes «claro» (normal) y «suave» (ligera, para móvil).
- `parchis-jungla-claro.html`: el componente que genera el SVG del tablero, con las paletas de los temas `claro` y `suave`, y las funciones de posición de casillas, pasillos, casas y metas.

Es una referencia, no código de producción. La geometría del juego (casillas, seguros, salidas, entradas) la define el motor en `src/engine/board.ts`.
