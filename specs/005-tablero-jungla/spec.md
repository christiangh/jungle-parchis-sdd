# SPEC 005 — Tablero de la jungla

> **Estado:** Aprobado
> **Depende de:** SPEC 001, SPEC 002, SPEC 003, SPEC 004
> **Fecha:** 2026-10-24
> **Autor:** Christian Garcia
> **Objetivo:** Que la aplicación pinte el tablero de la jungla con el diseño de referencia y coloque cada ficha donde dice el estado del motor, sin interacción.

## 1. Resumen

Primer spec de interfaz: sustituye la página de bienvenida por el tablero de la jungla en su variante «claro» de `docs/design/tablero`, con una capa decorativa (hierba, madera, hojas) y una capa de juego (casillas, seguros, salidas, pasillos y metas). Sobre él se colocan las fichas de un estado del motor, en casa, en el recorrido común, en el pasillo y en la meta, de modo que una pareja en la misma casilla, y por tanto una barrera, se reconozca a simple vista. Todavía no se juega: el tablero solo presenta el estado que recibe. Es la base visual sobre la que se montarán el dado y la interacción.

## 2. Contexto y problema

Tras SPEC 004 el motor aplica el reglamento completo, pero la aplicación sigue mostrando la página de bienvenida de Angular: no hay forma de ver una partida. El diseño del tablero ya existe como referencia exportada (`docs/design/tablero`), con su aspecto, su paleta y las coordenadas de cada casilla, pero trae su propia copia de los seguros y las salidas, que no debe convertirse en una segunda fuente de verdad frente al motor (P-05). Antes de añadir dado e interacción hace falta un tablero fiel al diseño que pinte cualquier estado del motor de forma correcta y comprobable.

## 3. Objetivos y alcance

### Objetivos

- Que al abrir la aplicación se vea el tablero de la jungla completo, con las 16 fichas de una partida nueva en sus casas.
- Que cualquier estado válido del motor se pinte con cada ficha en su sitio y sin fichas solapadas.
- Que la geometría del juego venga solo del motor y el diseño aporte solo aspecto y coordenadas.
- Que la correspondencia entre posiciones del motor y lugares del tablero esté cubierta por tests unitarios.
- Tener una prueba de humo en navegador real, en local y en el CI.

### Entra

- Sustituir la página de bienvenida por el tablero, que muestra una partida nueva de 4 jugadores creada por el motor.
- Tablero que cabe entero en pantalla, sin scroll, en móvil y escritorio.
- Capa decorativa de la variante «claro»: marco de madera, hierba, hojas de las esquinas y tronco del centro.
- Capa de juego: las 68 casillas del recorrido común numeradas, seguros, salidas, los 4 pasillos de 7 casillas, las 4 metas y las 4 casas.
- Seguros, salidas y entradas tomados del motor; del diseño solo el aspecto y las coordenadas.
- Fichas como discos en el color de su equipo, con borde oscuro y reborde claro, en casa, recorrido común, pasillo y meta.
- Ficha sola en el centro de su casilla; dos fichas en la misma casilla, una al lado de la otra dentro del tablón, por orden de llegada.
- Hasta 4 fichas en la meta de su color, en puestos fijos sin solaparse.
- Colores del diseño definidos una sola vez y compartidos por los estilos de la página y el tablero.
- Nombre accesible del tablero y contraste WCAG AA en los números de casilla y en las fichas (P-15).
- Traducción de posiciones del motor a lugares del tablero como cálculo puro con tests unitarios.
- Tests de componente que pintan estados construidos y comprueban dónde queda cada ficha.
- Playwright como prueba de humo en navegador real, con comando propio y ejecutado en el CI.

### Fuera de alcance (para specs futuros)

- Dado y tirada.
- Cualquier interacción: pulsar casillas o fichas, cursor de selección y eventos de clic del diseño.
- Resaltar movimientos legales.
- Indicadores de turno, de tirada o premio pendiente y de ganador.
- Animaciones y sonido.
- Personajes de los equipos.
- Variante «suave» del diseño.
- Pantallas de configuración de partida y de resultado.
- Escenarios de estado elegibles por la URL.
- Números en las casillas del pasillo.
- Accesibilidad completa con teclado y lector de pantalla, incluida la descripción textual de la posición de las fichas (spec de accesibilidad).
- Cambios en el motor.

## 4. Usuarios y actores

- **Jugador**: abre la aplicación y ve el tablero con las fichas; todavía no juega.
- **Desarrollador**: pinta estados construidos en tests de componente y comprueba en navegador real que la aplicación carga.
- **Motor de reglas**: fuente única del estado de la partida y de la geometría del juego (casillas, seguros, salidas y entradas).

## 5. Glosario

Se reutilizan los glosarios de SPEC 001 (recorrido común, casa, casilla de salida, casilla de entrada, pasillo y meta), SPEC 002 (seguro) y SPEC 003 (barrera y barrera mixta).

- **Diseño de referencia**: el tablero exportado en `docs/design/tablero`, variante «claro».
- **Capa decorativa**: elementos del tablero sin significado de juego: marco, hierba, hojas y tronco del centro.
- **Capa de juego**: elementos del tablero con significado de juego: casillas, seguros, salidas, pasillos, metas y casas.
- **Tablón**: casilla rectangular del recorrido común o del pasillo, más ancha que alta en el sentido del dibujo.
- **Puesto**: lugar fijo para una ficha dentro de una casa o de una meta; cada casa y cada meta tienen 4.
- **Pareja**: dos fichas en la misma casilla del recorrido común o del pasillo.
- **Paleta del diseño**: colores de la variante «claro», incluidos los cuatro colores de equipo.

## 6. Historias de usuario

### HU-01: Ver el tablero de la jungla (P1)

**Como** jugador, **quiero** ver el tablero de la jungla completo al abrir la aplicación, **para** reconocer el recorrido, los seguros, las salidas, los pasillos y las metas.

**Criterios de aceptación**

1. **Dado** una pantalla de móvil o de escritorio, **cuando** abro la aplicación, **entonces** veo el tablero entero, sin scroll, con el aspecto de la variante «claro» del diseño.
2. **Dado** el tablero, **cuando** lo recorro, **entonces** hay 68 casillas numeradas del 1 al 68, 4 pasillos de 7 casillas, 4 metas y 4 casas.
3. **Dado** el tablero, **cuando** miro las casillas 12, 17, 29, 34, 46, 51, 63 y 68, **entonces** tienen el aspecto de seguro del diseño (R-006).
4. **Dado** el tablero, **cuando** miro las casillas 5, 22, 39 y 56, **entonces** tienen el aspecto de salida en amarillo, azul, rojo y verde respectivamente (R-005).
5. **Dado** un lector de pantalla, **cuando** llega al tablero, **entonces** anuncia su nombre accesible y no anuncia los elementos decorativos.

### HU-02: Ver cada ficha donde dice el estado (P1)

**Como** jugador, **quiero** ver cada ficha en su casa, casilla, pasillo o meta, **para** saber cómo va la partida.

**Criterios de aceptación**

1. **Dado** una partida nueva de 4 jugadores, **cuando** abro la aplicación, **entonces** veo 16 fichas, 4 en cada casa, cada una en un puesto distinto.
2. **Dado** un estado con una ficha roja sola en la casilla 30, **cuando** se pinta, **entonces** el disco rojo está en el centro de la casilla 30.
3. **Dado** un estado con una ficha azul en la casilla 3 de su pasillo, **cuando** se pinta, **entonces** el disco azul está en el centro de la tercera casilla del pasillo azul, contando desde su casilla de entrada.
4. **Dado** un estado con una ficha amarilla en su casilla de salida, **cuando** se pinta, **entonces** el disco se distingue de la salida amarilla gracias a su borde.
5. **Dado** un estado que cambia la posición de una ficha, **cuando** el tablero recibe el estado nuevo, **entonces** la ficha aparece en su nueva posición, sin animación.

### HU-03: Reconocer parejas y barreras (P1)

**Como** jugador, **quiero** que dos fichas en la misma casilla se vean una al lado de la otra, **para** reconocer una barrera a simple vista.

**Criterios de aceptación**

1. **Dado** un estado con dos fichas verdes en la casilla 40, **cuando** se pinta, **entonces** los dos discos están uno al lado del otro dentro del tablón de la casilla 40, sin solaparse.
2. **Dado** un estado con una ficha roja y una azul en el seguro 29, **cuando** se pinta, **entonces** ambos discos se ven completos dentro del tablón, la que llegó antes a la izquierda según el sentido de avance.
3. **Dado** un estado con dos fichas amarillas en la misma casilla de su pasillo, **cuando** se pinta, **entonces** se ven una al lado de la otra dentro del tablón.

### HU-04: Ver las fichas en meta (P2)

**Como** jugador, **quiero** ver todas las fichas que han llegado a la meta, **para** saber cuántas le faltan a cada equipo.

**Criterios de aceptación**

1. **Dado** un estado con 4 fichas azules en meta, **cuando** se pinta, **entonces** se ven 4 discos azules completos dentro del triángulo azul del centro, sin solaparse.
2. **Dado** un estado con 1 ficha roja en meta, **cuando** se pinta, **entonces** ocupa el primer puesto del triángulo rojo.

### HU-05: Comprobar el tablero en un navegador real (P2)

**Como** desarrollador, **quiero** una prueba de humo en navegador real, **para** saber que la aplicación carga y pinta el tablero fuera del entorno de tests unitarios.

**Criterios de aceptación**

1. **Dado** la aplicación servida, **cuando** se ejecuta la prueba de humo, **entonces** comprueba que el tablero es visible, tiene su nombre accesible y muestra 16 fichas en sus casas.
2. **Dado** un pull request, **cuando** corre el CI, **entonces** la prueba de humo se ejecuta y su fallo hace fallar el CI.

## 7. Requisitos funcionales

- **RF-001**: El sistema debe pintar las 68 casillas del recorrido común como tablones en las coordenadas del diseño de referencia, cada una con su número.
- **RF-002**: El sistema debe pintar con el aspecto de seguro del diseño las casillas que el motor considera seguro y con el aspecto de salida, en el color de su equipo, las casillas de salida del motor.
- **RF-003**: El sistema debe pintar, para cada color, su pasillo de 7 tablones en su color, que empieza junto a su casilla de entrada según el motor, y su meta como el triángulo de su color en el centro.
- **RF-004**: El sistema debe pintar las 4 casas en las esquinas del diseño, cada una en su color y con 4 puestos.
- **RF-005**: El sistema debe pintar la capa decorativa de la variante «claro» (marco de madera, hierba, hojas de las esquinas y tronco del centro) debajo o alrededor de la capa de juego, sin tapar casillas ni fichas.
- **RF-006**: Los seguros, las salidas, las entradas y el número de casillas de recorrido y pasillo deben tomarse del motor; ningún dato de geometría del juego puede tomarse del diseño de referencia.
- **RF-007**: El tablero debe pintar siempre los 4 colores, aunque participen menos; las casas de los colores que no participan quedan vacías.
- **RF-008**: Al abrir la aplicación, el sistema debe mostrar el tablero con una partida nueva de 4 jugadores creada por el motor, en lugar de la página de bienvenida.
- **RF-009**: Cada ficha debe pintarse como un disco en el color de su equipo tomado de la paleta del diseño, con borde oscuro y reborde claro.
- **RF-010**: Cada ficha en casa debe ocupar un puesto de la casa de su color, distinto del de las demás fichas en esa casa.
- **RF-011**: Una ficha sola en una casilla del recorrido común o del pasillo debe pintarse en el centro de esa casilla.
- **RF-012**: Dos fichas en la misma casilla del recorrido común o del pasillo deben pintarse una al lado de la otra dentro del tablón, sin solaparse ni salirse de él; la que llegó antes, según el orden de llegada del estado, a la izquierda según el sentido de avance; en los tablones centrales (68, 17, 34 y 51), donde se avanza a lo largo del tablón, en el extremo de donde se viene.
- **RF-013**: Las fichas en meta deben ocupar los 4 puestos fijos del triángulo de su color, por orden de llegada, sin solaparse ni salirse del triángulo.
- **RF-014**: La traducción de una posición del motor (con su color, su casilla y su lugar en la casilla) al punto del tablero donde se pinta debe ser un cálculo puro, comprobable sin pintar el tablero: la misma entrada da siempre el mismo punto.
- **RF-015**: El tablero debe pintar el estado que recibe y, cuando recibe uno nuevo, reflejarlo sin animación.
- **RF-016**: Debe existir una prueba de humo en navegador real, con comando propio y ejecutada en el CI, que compruebe que la aplicación carga, el tablero es visible, tiene su nombre accesible y muestra 16 fichas en sus casas.

## 8. Requisitos no funcionales

- **RNF-001**: El tablero cabe entero en la ventana, sin scroll horizontal ni vertical, desde 320 px de ancho, en vertical y en apaisado; su lado es el menor entre el ancho y el alto disponibles, con un máximo de 900 px.
- **RNF-002**: El tablero tiene el nombre accesible «Tablero de parchís de la jungla» y los elementos decorativos quedan ocultos para las tecnologías de apoyo.
- **RNF-003**: Los números de casilla tienen un contraste de al menos 4,5:1 con su fondo inmediato en todos los tipos de casilla: tablón, seguro y salida de cada color (WCAG 1.4.3).
- **RNF-004**: El borde de cada ficha tiene un contraste de al menos 3:1 con el fondo sobre el que se pinta, incluido el de su propio color (WCAG 1.4.11).
- **RNF-005**: Los colores del diseño se definen una sola vez y los comparten los estilos de la página y el dibujo del tablero.
- **RNF-006**: El motor no cambia y la aplicación solo lo usa a través de su puerta de entrada (P-01, P-02, P-05).
- **RNF-007**: Playwright es la única dependencia nueva y se justifica en el plan de la parte que la añade (P-17).

## 9. Entidades clave

- **Estado de la partida**: el del motor; aporta los jugadores, cada ficha con su color y su posición, y el orden de llegada.
- **Lugar del tablero**: punto donde se pinta una ficha, resultado de traducir su posición y su lugar dentro de la casilla.
- **Paleta del diseño**: colores de equipo, de madera, de hierba y de tinta de la variante «claro».

## 10. Casos límite

- Partida de 2 o 3 jugadores → se pintan los 4 colores; las casas de los ausentes, vacías.
- Barrera mixta en un seguro → los dos discos, de colores distintos, uno al lado del otro y completos.
- Pareja en el pasillo, aunque no sea barrera (R-063) → se pinta igual que en el recorrido común, una al lado de la otra.
- Ficha en su propia casilla de salida, pasillo o meta, del mismo color que la ficha → se distingue por su borde (RNF-004).
- Pareja en la casilla 68 o en la 1, donde el recorrido da la vuelta → dentro de su tablón, como en cualquier otra casilla.
- 4 fichas en meta → ocupan los 4 puestos del triángulo, sin solaparse.
- Estado en fase de tirada inicial o con la partida terminada → se pinta igual, sin indicadores de fase ni de ganador.
- Pantalla de 320 px de ancho o apaisada y baja → el tablero se reduce hasta caber entero.
- Más de 2 fichas en una casilla del recorrido o del pasillo → no puede darse (I-02); no se contempla.

## 11. Criterios de éxito

- **CE-01**: El tablero pintado tiene 68 casillas numeradas, 12 con aspecto de seguro (4 de ellas de salida, cada una en su color), 4 pasillos de 7 casillas, 4 metas y 4 casas, y los números coinciden con los del motor.
- **CE-02**: Para cada casilla del recorrido común y de cada pasillo, los tests unitarios comprueban que una ficha sola cae en el centro de la casilla y que una pareja queda dentro del tablón sin solaparse.
- **CE-03**: Los tests de componente comprueban, con estados construidos, que hay fichas en el lugar esperado en casa, recorrido común, pasillo, meta y en una pareja.
- **CE-04**: Ningún archivo de la aplicación contiene una lista propia de seguros, salidas o entradas.
- **CE-05**: El contraste de los números de casilla es de al menos 4,5:1 en tablón, seguro y salida de cada color, y el del borde de las fichas de al menos 3:1 con cualquier fondo de su color.
- **CE-06**: El tablero se ve entero sin scroll en ventanas de 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080.
- **CE-07**: La prueba de humo pasa en local y en el CI, y `pnpm check` pasa sin cambios en el motor.

## 12. Supuestos y dependencias

- Depende del estado del motor de SPEC 001 a SPEC 004, en especial de la geometría de `src/engine/board.ts` y del orden de llegada de las fichas.
- La orientación del tablero es fija, la del diseño: amarillo abajo, azul a la derecha, rojo arriba y verde a la izquierda.
- Las coordenadas del diseño casan con la numeración del motor: salidas en 5, 22, 39 y 56, entradas en 68, 17, 34 y 51.
- Las fichas en casa ocupan los puestos en el orden de su número de ficha.
- «Izquierda según el sentido de avance» se refiere a una ficha que mira hacia donde avanza en esa casilla.
- Si los colores de los números del diseño no alcanzan el contraste AA, se ajustan lo mínimo para alcanzarlo, conservando el aspecto.
- La comprobación de contraste es una medición de los colores usados, no una herramienta automática en los tests.

## 13. Decisiones tomadas y descartadas

- **Sí:** variante «claro» del diseño. Es la de referencia; la «suave» queda para otro spec.
- **Sí:** el diseño aporta aspecto y coordenadas; seguros, salidas y entradas vienen del motor. Evita dos fuentes de verdad (P-05).
- **No:** usar las constantes de seguros y salidas del diseño. Duplicarían reglas fuera del motor.
- **Sí:** la aplicación muestra solo una partida nueva de 4 jugadores. Sin pantalla de configuración, es el estado más honesto.
- **No:** escenarios de estado elegibles por la URL ni estado de demostración fijo. Las posiciones se prueban con tests de componente sobre estados construidos.
- **Sí:** Playwright solo como prueba de humo en navegador real. Las posiciones ya las cubren los tests unitarios y de componente.
- **Sí:** la prueba de humo con comando propio y en el CI, fuera de `pnpm check`. `pnpm check` sigue rápido y sin navegador.
- **No:** Playwright dentro de `pnpm check` ni solo en local. Lo primero lo hace lento; lo segundo da menos garantía.
- **Sí:** disco del color del equipo con borde oscuro y reborde claro. Se distingue sobre cualquier fondo, también el de su color.
- **No:** tono más oscuro del color ni disco claro con centro de color. El primero tiene contraste dudoso; el segundo se aleja de la paleta.
- **Sí:** tablero que cabe entero sin scroll, con un máximo de 900 px. Se ve completo en móvil y escritorio, como el diseño.
- **Sí:** pareja ordenada por orden de llegada. Posición estable entre repintados y con significado de juego.
- **No:** orden por identificador de ficha. Estable, pero sin significado.
- **Sí:** puestos fijos en el triángulo de meta. Evita solapes y mantiene a cada ficha en su sitio.
- **No:** fila centrada o fichas apiladas en meta. La fila se recoloca al llegar cada ficha; apilarlas las solapa.
- **Sí:** números solo en las 68 casillas del recorrido común. Como el diseño; numerar el pasillo añade ruido.
- **Sí:** colores del diseño como variables compartidas por los estilos de la página y el tablero. Una sola definición de la paleta.
- **Sí:** traducción de posiciones como cálculo puro con tests unitarios. Se comprueba cada casilla sin navegador.

## 14. Riesgos

| Riesgo                                                                         | Mitigación                                                                                       |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Los números blancos del diseño sobre salidas claras (amarillo) no llegan a AA  | Medir cada combinación y ajustar el color o el contorno del número (RNF-003)                     |
| Coordenadas del diseño mal casadas con la numeración del motor                 | Tests unitarios de cada casilla, salida y entrada contra el motor (CE-01, CE-02)                 |
| Números ilegibles por tamaño en pantallas de 320 px                            | Revisión visual a 320 px; el tamaño del texto queda para el spec de accesibilidad si hace falta  |
| Instalar el navegador de Playwright alarga y rompe el CI                       | Paso propio en el CI, con caché del navegador si el plan lo justifica                            |

## 15. Partes / incrementos

### PARTE-01: Colores y tablero

- **Objetivo**: pintar el tablero de la jungla sin fichas.
- **Alcance**: paleta compartida, capa decorativa, capa de juego con casillas, seguros, salidas, pasillos, metas y casas tomando la geometría del motor, tamaño adaptable y nombre accesible.
- **Cubre**: HU-01 · RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007 · RNF-001, RNF-002, RNF-003, RNF-005
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-01, CE-01, CE-04 y CE-06, y los números de casilla alcanzan 4,5:1.

### PARTE-02: Fichas

- **Objetivo**: colocar las fichas de un estado del motor sobre el tablero.
- **Alcance**: traducción pura de posiciones con tests unitarios, discos con borde, casa, recorrido común, pasillo, meta y parejas, y la partida nueva al abrir la aplicación.
- **Cubre**: HU-02, HU-03, HU-04 · RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, RF-015 · RNF-004
- **Depende de**: PARTE-01
- **Hecho cuando**: se cumplen los criterios de HU-02, HU-03 y HU-04, CE-02, CE-03 y CE-05.

### PARTE-03: Prueba de humo en navegador

- **Objetivo**: comprobar en navegador real que la aplicación carga y pinta el tablero.
- **Alcance**: Playwright con comando propio, prueba de humo y su paso en el CI.
- **Cubre**: HU-05 · RF-016 · RNF-007
- **Depende de**: PARTE-02
- **Hecho cuando**: se cumplen los criterios de HU-05 y CE-07.

**Transversales**: RNF-006
**Orden sugerido**: PARTE-01 → PARTE-02 → PARTE-03

## 16. Preguntas abiertas

- ¿Se añade una comprobación AXE automática a la prueba de humo? Las instrucciones del proyecto exigen pasar AXE, pero requiere una dependencia más (P-17); puede ir aquí o en el spec de accesibilidad.

## 17. Qué NO entra en este spec

- Dado y tirada.
- Cualquier interacción: pulsar casillas o fichas, cursor de selección y eventos de clic del diseño.
- Resaltar movimientos legales.
- Indicadores de turno, de tirada o premio pendiente y de ganador.
- Animaciones y sonido.
- Personajes de los equipos.
- Variante «suave» del diseño.
- Pantallas de configuración de partida y de resultado.
- Escenarios de estado elegibles por la URL.
- Números en las casillas del pasillo.
- Accesibilidad completa con teclado y lector de pantalla, incluida la descripción textual de la posición de las fichas (spec de accesibilidad).
- Cambios en el motor.

Cada uno de estos, si llega, irá en su propio spec.
