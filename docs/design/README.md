# Diseño

Referencias visuales exportadas de Claude Design para los specs de interfaz. No son código de producción: la aplicación las reconstruye con sus propios componentes, y las reglas del juego las define siempre el motor (`src/engine/`).

| Carpeta | Contenido | Spec |
|---|---|---|
| [`tablero/`](tablero/) | Tablero de la jungla, variantes «claro» y «suave» | SPEC 005 |
| [`movimientos/`](movimientos/) | Estados de las fichas al elegir y mover | SPEC 006 |
| [`dado-arbol/`](dado-arbol/) | Las seis caras del dado | SPEC 006 |
| [`fondo-jungla/`](fondo-jungla/) | Fondo de la página, en loseta repetible; versión suavizada | SPEC 006; la versión suavizada, pendiente |
| [`mascotas/`](mascotas/) | Mascotas de los equipos: fichas, casas y animaciones | Pendiente |
| [`avisos-y-campeon/`](avisos-y-campeon/) | Aviso de turno con la última jugada debajo, con las mascotas, y pantalla de campeón | Pendiente |
