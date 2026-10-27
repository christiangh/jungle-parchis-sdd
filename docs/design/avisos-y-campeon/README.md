# Avisos y pantalla de campeón

Aviso de turno con la última jugada colgada debajo, y pantalla del equipo que gana. Exportado de Claude Design.

- `ejemplo.html`: los avisos y la pantalla de campeón funcionando. Usa los componentes de [`../mascotas/`](../mascotas/), así que se abre desde esta carpeta, dentro de `docs/design/`.
- `alertas.css` y `alertas.js`: el aviso de turno y la última jugada; `pintarAviso(contenedor, { turno, accion, ultimo?, ultimaJugada? })`.
- `campeon.css`: el tablón y la capa de la pantalla de campeón.
- `componentes/ganador-fx.js`: trofeo con brillos, confeti y rayos de sol (`<ganador-trofeo>`, `<ganador-confeti>`, `<ganador-rayos>`).
- `componentes/campeon.js`: `mostrarCampeon(equipo, texto?)` y `ocultarCampeon()`.
- `capturas/`: los avisos, y la pantalla de campeón en escritorio y en móvil.

## Avisos

Dos niveles, como define SPEC 006 al separar estado y eventos. **El cartel dice qué hacer; la pestaña, qué pasó y quién lo hizo.**

- **Cartel de turno, primer nivel:** tablón del color del equipo en turno, con su mascota a la izquierda y solo la acción, en Caprasimo: «Toca el dado», «Elige una ficha». Sin «Turno de…»: el turno se reconoce por el color y la mascota.
- **Última jugada, segundo nivel:** pestaña más pequeña colgada debajo del cartel, en el color oscurecido de quien hizo la jugada y con su mascota, en Figtree: «Saca una ficha de casa», «Llega a la meta». No nombra a quien actúa, porque lo dice su mascota; sí al equipo afectado («Se come una ficha de Azul»).

| Equipo | Mascota | Cartel | Pestaña |
|---|---|---|---|
| Amarillo | Jaguar `e` | `#e3b23a` | `#8a6514` |
| Rojo | Loro `b` | `#c8452d` | `#8e2f1f` |
| Azul | Hipopótamo `g` | `#3a7cb0` | `#2a5d86` |
| Verde | Rana `a` | `#2e8b57` | `#1f6440` |

El texto blanco de la pestaña tiene un contraste de entre 5,3:1 (amarillo) y 8,2:1 (rojo).

## Pendiente para el spec

- **Texto para el lector de pantalla:** sin «Turno de…» visible, el turno sigue existiendo como texto oculto.
- **Estados sin diseño:** el valor del dado al elegir ficha, el premio pendiente («Usa tu +20»), la tirada inicial y el ganador.
- **«Forma un puente»** no tiene evento en el motor: el motor no avisa al formar barrera, y la aplicación no puede deducirlo por su cuenta (RNF-005 de SPEC 006). Queda como posible evento nuevo para un spec del motor.

## Pantalla de campeón

Capa oscura translúcida sobre la partida. En el centro, el tablón del color del equipo con su mascota animada flotando, el trofeo y «¡Campeón!». Detrás giran rayos de sol y cae confeti con la paleta del equipo. Por debajo de 520 px, todo se reduce. No tiene botón de nueva partida, que hará falta en el spec de final de partida.

La aplicación lo reconstruye con la paleta del tablero y sus propios componentes. Los textos salen del estado y los eventos del motor, las tipografías se incluyen en el proyecto en lugar de cargarlas de Google Fonts, y las animaciones respetan `prefers-reduced-motion`.
