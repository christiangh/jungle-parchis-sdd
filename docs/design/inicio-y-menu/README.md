# Pantalla de inicio y menú

Pantalla «¿Quién juega?» para elegir los equipos, y botón de engranaje con su menú lateral. Exportado de Claude Design.

- `ejemplo.html`: la pantalla de inicio y el menú funcionando. Usa las fichas de [`../mascotas/`](../mascotas/), así que se abre desde esta carpeta, dentro de `docs/design/`.
- `inicio-menu.css` e `inicio-menu.js`: estilos y funciones `mostrarInicio`, `ocultarInicio` y `crearMenu`.
- `capturas/`: pantalla de inicio en escritorio y en móvil, y menú abierto.

## Pantalla de inicio

Capa oscura sobre el tablero con una tarjeta por equipo, en una cuadrícula de 2 × 2 con la misma posición que su casa. Cada tarjeta lleva la ficha de su mascota y su nombre; tocarla activa o desactiva el equipo (botón con `aria-pressed`), y las desactivadas se ven punteadas y apagadas, con un «+». «¡A jugar!» solo se activa con 2 equipos o más, y debajo se indica cuántos hay listos.

## Menú

Botón redondo de madera con un engranaje, fijo arriba a la derecha, que abre un panel lateral desde la derecha. Se cierra con Escape, tocando fuera o con su botón. El diseño incluye «Nueva partida», «Configuración» y un hueco «Pronto» para sonido, accesibilidad y guardar partida.

## Cómo lo usa SPEC 008

- La pantalla de inicio abre con los cuatro equipos activados, no con rojo y verde como en el ejemplo.
- Al activar un equipo, su mascota hace su animación de [`../mascotas/`](../mascotas/); con movimiento reducido, no se anima.
- El menú solo tiene «Nueva partida», con confirmación si hay una partida en curso. «Configuración» y las entradas «Pronto» llegarán con los specs que les den contenido.
- El texto de «¡A jugar!» tiene un contraste de 3,03:1 con su fondo naranja: solo es suficiente porque es texto grande (20 px en negrita).
- Las tipografías se sirven desde la propia aplicación, no desde Google Fonts como en el ejemplo.
