# Diseño

Referencias visuales exportadas de Claude Design para los specs de interfaz. No son código de producción: la aplicación las reconstruye con sus propios componentes, y las reglas del juego las define siempre el motor (`src/engine/`).

| Carpeta | Contenido | Spec |
|---|---|---|
| [`tablero/`](tablero/) | Tablero de la jungla, variantes «claro» y «suave» | SPEC 005 |
| [`movimientos/`](movimientos/) | Estados de las fichas al elegir y mover | SPEC 006 |
| [`dado-arbol/`](dado-arbol/) | Las seis caras del dado | SPEC 006 |
| [`fondo-jungla/`](fondo-jungla/) | Fondo de la página, en loseta repetible; versión suavizada | SPEC 006; la versión suavizada, SPEC 007 |
| [`mascotas/`](mascotas/) | Mascotas de los equipos: fichas, casas y animaciones | SPEC 007 |
| [`avisos-y-campeon/`](avisos-y-campeon/) | Aviso de turno con la última jugada debajo, con las mascotas, y pantalla de campeón | SPEC 007; la pantalla de campeón, pendiente |
| [`inicio-y-menu/`](inicio-y-menu/) | Pantalla de inicio «¿Quién juega?» y menú del engranaje | SPEC 008 |
