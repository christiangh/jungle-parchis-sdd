# Movimientos

Estados de las fichas durante un turno, exportados de Claude Design.

- `parchis-fichas-movimientos.html`: prototipo interactivo. Necesita conexión, porque carga React desde unpkg.
- `parchis-fichas-movimientos.jpg`: captura de los cinco estados, por si el prototipo no carga.

## Estados

1. **Fichas movibles:** las que pueden moverse laten con un halo; las demás, también las de casa, se atenúan.
2. **Selección:** la ficha pulsada crece y aparece una réplica transparente en su destino.
3. **Comer:** diana con «+20» en el destino.
4. **Dos fichas en una casilla:** un tablón une a las dos fichas de una barrera; una hoja marca el seguro compartido.
5. **Llegar a meta:** sol con «+10» en la meta.

Los indicadores de destino («+20», «+10», pareja) salen de los movimientos legales del motor, nunca de la interfaz.
