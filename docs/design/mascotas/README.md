# Mascotas

Una mascota por equipo, con sus propios colores y una animación básica. Exportado de Claude Design.

| Equipo | Mascota | Detalle | Animación |
|---|---|---|---|
| Amarillo | Jaguar | Gafas de sol | Sonrisa de anuncio y reflejo en las gafas |
| Rojo | Loro | Micro antiguo | Se mueve al ritmo |
| Azul | Hipopótamo | Flotador rosa | Chapuzón |
| Verde | Rana | Corona | La corona se le ladea |

- `estaticas/svg/`: las cuatro fichas en vectorial.
- `estaticas/png/`: las mismas fichas a 1024 y 256 px, con fondo transparente.
- `componentes/`: componentes web sin dependencias, con las animaciones (bucles de 3 s con pausa):
  - `fichas-animales.js`: `<ficha-animal animal="jaguar" variant="e">`. Variantes elegidas: jaguar `e`, loro `b`, hipopótamo `g` y rana `a`. Con `context="tablon"`, la ficha sobre su tablón.
  - `mascotas-animadas.js`: `<mascota-animada animal="jaguar" anim="c">`. Animaciones elegidas: jaguar `c`, loro `c`, hipopótamo `b` y rana `c`. Con `bob="true"`, flota.
  - `casas-personajes.js`: `<casas-personajes variant="e" turn="yellow">`, las mascotas en las casas del tablero. Necesita `fichas-animales.js`.
- `ejemplo.html`: las cuatro mascotas animadas y sus fichas sobre el fondo. Ábrelo desde esta carpeta.

La aplicación reconstruye las mascotas con la paleta del tablero y sus propios componentes, no con estos ficheros. Las animaciones respetan `prefers-reduced-motion`.
