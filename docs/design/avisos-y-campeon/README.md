# Avisos y pantalla de campeón

Carteles de madera pintada del color de cada equipo, con su mascota, y la pantalla del equipo que gana. Exportado de Claude Design. Sustituye al cartel anterior, que solo tenía un círculo de color.

- `ejemplo.html`: los avisos y la pantalla de campeón funcionando. Usa los componentes de [`../mascotas/`](../mascotas/), así que se abre desde esta carpeta, dentro de `docs/design/`.
- `estilos.css`: el tablón pintado de los avisos y del campeón, y los colores de cada equipo.
- `componentes/ganador-fx.js`: trofeo con brillos, confeti y rayos de sol (`<ganador-trofeo>`, `<ganador-confeti>`, `<ganador-rayos>`).
- `componentes/campeon.js`: `mostrarCampeon(equipo, texto?)` y `ocultarCampeon()`.
- `capturas/`: avisos de turno, avisos de jugada y pantalla de campeón en escritorio y en móvil.

## Avisos

Tablón del color del equipo con la ficha de su mascota y el texto en Caprasimo, blanco con contorno oscuro. Hay dos niveles, como define SPEC 006 al separar estado y eventos:

- **De turno, primer nivel:** el cartel de turno, con el **estado** actual: «Turno de Rojo», el valor del dado y la instrucción. Un premio pendiente es estado, así que «Usa tu +20» va aquí.
- **De jugada, segundo nivel** (`pj-alerta--pequena`): los **eventos** de la última acción, por ejemplo «¡Te comes una ficha! +20», «¡A la meta! +10» o «¡Sacas un 6! Repites». Es el aspecto de la línea de última jugada: van debajo del cartel de turno y nunca lo sustituyen.

En el diseño, los avisos de jugada usan el mismo tablón que el de turno, solo más pequeño. Al implementarlos, el spec debe hacer que se distingan claramente como segundo nivel.

«Puente formado» no tiene evento en el motor: el motor no avisa al formar barrera, y la aplicación no puede deducirlo por su cuenta (RNF-005 de SPEC 006). Queda como posible evento nuevo para un spec del motor.

## Pantalla de campeón

Capa oscura translúcida sobre la partida. En el centro, el tablón del color del equipo con su mascota animada flotando, el trofeo y «¡Campeón!». Detrás giran rayos de sol y cae confeti con la paleta del equipo. Por debajo de 520 px, todo se reduce.

La aplicación lo reconstruye con la paleta del tablero y sus propios componentes. Los textos de los avisos salen de los eventos del motor, y las animaciones respetan `prefers-reduced-motion`.
