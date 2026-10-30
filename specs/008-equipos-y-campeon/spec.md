# SPEC 008 — Equipos y campeón

> **Estado:** Aprobado
> **Depende de:** SPEC 006, SPEC 007
> **Fecha:** 2026-10-30
> **Autor:** Christian Garcia
> **Objetivo:** Que antes de cada partida se elijan de 2 a 4 equipos, que al terminar la pantalla de campeón celebre al ganador y que, desde un menú, se pueda empezar otra partida en cualquier momento.

## 1. Resumen

Cierra el ciclo de una partida. Al abrir la aplicación, la pantalla de inicio «¿Quién juega?» de `docs/design/inicio-y-menu` muestra los cuatro equipos con su mascota y deja activar de 2 a 4; al activar un equipo, su mascota hace su animación. Al terminar, la pantalla de campeón de `docs/design/avisos-y-campeon` cubre la partida con la mascota del ganador, el trofeo y «¡Campeón!», y su botón de nueva partida vuelve a la pantalla de inicio con los mismos equipos. Solo hay un ganador: el resto no se clasifica. Durante la partida, el botón de engranaje del diseño abre un menú lateral con «Nueva partida», que pide confirmación si hay una partida en curso; el menú es el sitio donde irán las opciones de specs futuros. Además, la tirada inicial se distingue de una tirada normal: el cartel dice «Tirada inicial: Toca el dado» y la pestaña de última jugada muestra la mascota de cada equipo con lo que ha sacado en la ronda. Cuando se decide quién empieza, una notificación con el tablón y la mascota del equipo, sin trofeo, confeti ni rayos, anuncia «Empieza el equipo X» y la partida arranca al pulsar «¡Vamos!».

## 2. Contexto y problema

Tras SPEC 007 la partida se juega entera con las mascotas, pero siempre con los cuatro equipos, y al terminar solo cambia el cartel: para jugar otra hay que recargar la página. El motor ya admite partidas de 2 a 4 jugadores (R-001, R-010), pero la aplicación no deja elegirlos. Existen los diseños de la pantalla de campeón, sin botón para seguir jugando, y de la pantalla de inicio y el menú. La pantalla de partida ya ocupa toda la altura en móvil, así que las acciones nuevas no pueden añadir botones fijos que roben espacio.

## 3. Objetivos y alcance

### Objetivos

- Jugar partidas de 2, 3 o 4 equipos eligiendo cuáles.
- Celebrar al ganador con la pantalla de campeón del diseño.
- Empezar otra partida, al terminar o a mitad de una, sin recargar la página.
- Tener un menú donde añadir más opciones en el futuro sin ocupar altura en la pantalla de partida.
- Distinguir la tirada inicial de una tirada normal y ver lo que ha sacado cada equipo.

### Entra

- Pantalla de campeón del diseño sobre la partida terminada, solo con el ganador.
- Botón de nueva partida en la pantalla de campeón.
- Pantalla de inicio con los cuatro equipos y su mascota, activables de forma individual, con un mínimo de 2, y la mascota animada al activar su equipo.
- Partidas de 2 y 3 equipos, con las casas de los equipos que no juegan vacías y atenuadas.
- Botón de engranaje y menú lateral del diseño, con «Nueva partida».
- Confirmación antes de descartar una partida en curso.
- Recordar los equipos de la partida anterior mientras la página siga abierta.
- «Tirada inicial: Toca el dado» en el cartel durante la tirada inicial.
- Tiradas de la ronda inicial en la pestaña de última jugada, con la mascota de cada equipo y su valor.
- Pantalla «Empieza el equipo X» con el botón «¡Vamos!» al terminar la tirada inicial.

### Fuera de alcance (para specs futuros)

- Clasificación u orden de los equipos que no ganan.
- Seguir jugando tras el primer ganador.
- Opciones del menú más allá de «Nueva partida»: configuración, sonido, accesibilidad y guardar partida.
- Elegir la mascota de un equipo con independencia de su color.
- Nombres de jugadores personalizados.
- Jugadores controlados por la máquina.
- Guardar en el navegador la partida o la última selección de equipos.
- Cerrar la pantalla de campeón para ver el tablero final.
- Estadísticas e historial de partidas.
- Evento del motor al formar barrera («Forma un puente»).

## 4. Usuarios y actores

- **Jugadores**: de 2 a 4 personas que comparten un mismo dispositivo; eligen los equipos, juegan, ven al ganador y deciden si empiezan otra.

## 5. Glosario

Se mantienen los términos de SPEC 006 y SPEC 007 (pantalla de partida, cartel de turno, pestaña de última jugada, mascota, medallón, casa en turno, generador de tiradas). «Equipo» es cada jugador de R-001, con su color y su mascota.

- **Pantalla de inicio**: pantalla «¿Quién juega?» previa a la partida, en la que se activan los equipos que juegan.
- **Equipo activado**: equipo marcado para jugar en la pantalla de inicio.
- **Casa inactiva**: casa de un equipo que no juega la partida.
- **Pantalla de campeón**: capa sobre la partida terminada con el ganador y el botón de nueva partida.
- **Menú**: panel lateral que abre el botón de engranaje de la pantalla de partida.
- **Partida en curso**: partida empezada y sin ganador.

## 6. Historias de usuario

### HU-01: Ver al campeón (P1)

**Como** jugador, **quiero** una pantalla de campeón con la mascota del ganador, **para** celebrar el final de la partida.

**Criterios de aceptación**

1. **Dado** el último movimiento de una partida, **cuando** el motor da ganador a verde, **entonces** sobre la partida aparece la pantalla de campeón con el tablón verde, la rana animada, el trofeo, «¡Campeón!», rayos y confeti con la paleta verde.
2. **Dado** la pantalla de campeón, **cuando** se abre, **entonces** el lector de pantalla anuncia qué equipo ha ganado y el foco está en el botón de nueva partida.
3. **Dado** la pantalla de campeón, **cuando** pulso Escape o toco fuera del tablón, **entonces** la pantalla no se cierra.
4. **Dado** la pantalla de campeón, **cuando** se muestra, **entonces** no aparece ningún otro equipo ni puesto: solo el ganador.

### HU-02: Empezar otra partida al terminar (P1)

**Como** jugador, **quiero** un botón para empezar otra partida al terminar, **para** no tener que recargar la página.

**Criterios de aceptación**

1. **Dado** la pantalla de campeón de una partida de amarillo y verde, **cuando** pulso nueva partida, **entonces** se va a la pantalla de inicio con amarillo y verde activados y los demás desactivados.
2. **Dado** la pantalla de campeón, **cuando** recargo la página, **entonces** se va a la pantalla de inicio con los cuatro equipos activados.

### HU-03: Elegir los equipos (P1)

**Como** grupo de jugadores, **quiero** elegir qué equipos juegan antes de empezar, **para** jugar aunque no seamos cuatro.

**Criterios de aceptación**

1. **Dado** que abro la aplicación, **cuando** se muestra la pantalla de inicio, **entonces** aparecen los cuatro equipos con su mascota y su nombre, en la posición de su casa y todos activados.
2. **Dado** la pantalla de inicio, **cuando** activo un equipo desactivado, **entonces** su mascota hace su animación; con movimiento reducido, se activa sin animación.
3. **Dado** la pantalla de inicio, **cuando** desactivo azul y rojo y pulso «¡A jugar!», **entonces** la partida es de amarillo y verde y la tirada inicial es solo entre ellos (R-001, R-010).
4. **Dado** la pantalla de inicio con dos equipos activados, **cuando** desactivo uno, **entonces** «¡A jugar!» no responde y se indica que hacen falta al menos 2 equipos.
5. **Dado** la pantalla de inicio, **cuando** la recorro con el teclado, **entonces** puedo activar y desactivar cada equipo y empezar, y el lector de pantalla anuncia si cada equipo está activado.

### HU-04: Jugar con menos de cuatro equipos (P1)

**Como** jugador de una partida de 2 o 3 equipos, **quiero** distinguir en el tablero qué equipos no juegan, **para** no confundirlos con un equipo que tiene todas sus fichas fuera.

**Criterios de aceptación**

1. **Dado** una partida de amarillo, rojo y verde, **cuando** se muestra el tablero, **entonces** la casa azul no tiene fichas y su escena y su medallón se ven atenuados y quietos.
2. **Dado** una partida de amarillo y verde, **cuando** pasa el turno, **entonces** nunca se resalta una casa inactiva y el turno pasa de amarillo a verde y de verde a amarillo (R-010).

### HU-05: Empezar otra partida desde el menú (P2)

**Como** jugador, **quiero** un menú con «Nueva partida» a mano durante la partida, **para** cambiar de equipos o volver a empezar sin recargar la página.

**Criterios de aceptación**

1. **Dado** la pantalla de partida, **cuando** toco el engranaje, **entonces** se abre el menú lateral con «Nueva partida» como única opción.
2. **Dado** el menú abierto, **cuando** pulso Escape, toco fuera o toco cerrar, **entonces** se cierra y el foco vuelve al engranaje.
3. **Dado** una partida en curso, **cuando** pulso «Nueva partida», **entonces** se pide confirmación antes de descartarla.
4. **Dado** la confirmación, **cuando** confirmo, **entonces** se va a la pantalla de inicio con los equipos de la partida descartada activados.
5. **Dado** la confirmación, **cuando** cancelo, **entonces** vuelvo a la partida en el mismo estado, con la selección de ficha que hubiera.

### HU-06: Seguir la tirada inicial (P2)

**Como** jugador, **quiero** ver que estamos en la tirada inicial y lo que ha sacado cada equipo, **para** distinguirla de una tirada normal y saber quién va ganando la ronda.

**Criterios de aceptación**

1. **Dado** la tirada inicial con el turno de rojo, **cuando** se muestra el cartel, **entonces** dice «Tirada inicial: Toca el dado» en rojo y con el loro.
2. **Dado** una ronda de la tirada inicial en la que amarillo saca 5 y azul 3, **cuando** le toca a rojo, **entonces** la pestaña muestra el jaguar con un 5 y el hipopótamo con un 3, en ese orden.
3. **Dado** una ronda que termina en empate entre amarillo y rojo, **cuando** se aplica la última tirada, **entonces** la pestaña muestra todas las tiradas de la ronda y el empate entre Amarillo y Rojo, y la ronda siguiente empieza sin tiradas.
4. **Dado** la última tirada de la tirada inicial, **cuando** el motor decide que empieza azul, **entonces** sobre la partida aparece solo una notificación con el tablón azul, el hipopótamo animado, «Empieza el equipo Azul» y el botón «¡Vamos!», sin trofeo, confeti ni rayos; detrás, la pestaña muestra las tiradas de esa ronda.
5. **Dado** la pantalla «Empieza el equipo Azul», **cuando** pulso «¡Vamos!», **entonces** se cierra, el cartel pasa a «Toca el dado» en azul y el dado responde.
6. **Dado** la pestaña con las tiradas de la ronda, **cuando** la lee el lector de pantalla, **entonces** dice qué ha sacado cada equipo, nombrándolo («Amarillo saca 5, Azul saca 3»).

## 7. Requisitos funcionales

- **RF-001**: Cuando el motor da ganador, sobre la pantalla de partida debe aparecer la pantalla de campeón del diseño: capa oscura translúcida con la partida visible detrás, tablón del color del ganador con su mascota animada flotando, trofeo con brillos, «¡Campeón!», rayos de sol girando detrás y confeti con la paleta del ganador. Por debajo de 520 px de ancho, todo se reduce como en el diseño, y en ventanas bajas se compacta para que el tablón y el botón de nueva partida quepan enteros (RNF-004). Solo muestra al ganador: ni puestos ni otros equipos.
- **RF-002**: La pantalla de campeón debe tener el botón «Nueva partida» del diseño, de madera natural con el icono de reiniciar, debajo del tablón, que es la única forma de salir de ella sin recargar: ni Escape ni tocar fuera la cierran.
- **RF-003**: La pantalla de campeón debe comportarse como un diálogo modal: su nombre accesible dice qué equipo ha ganado, el foco pasa al botón de nueva partida al abrirse y no sale de la pantalla, y la partida de detrás no es alcanzable con el teclado ni con el lector.
- **RF-004**: Al abrir la aplicación y al recargarla, debe mostrarse la pantalla de inicio del diseño con los cuatro equipos, cada uno con su mascota y su nombre, en la posición de su casa y todos activados. Sustituye el caso límite de SPEC 006 por el que recargar empieza una partida nueva.
- **RF-005**: En la pantalla de inicio, cada equipo debe poder activarse y desactivarse por separado; «¡A jugar!» solo responde con al menos 2 equipos activados, y con menos se indica que hacen falta al menos 2.
- **RF-006**: Al activar un equipo en la pantalla de inicio, su mascota debe hacer su animación de SPEC 007 una vez; con movimiento reducido, no se anima.
- **RF-007**: «¡A jugar!» debe crear con el motor una partida con los equipos activados, que juegan en el orden de R-010 y hacen la tirada inicial solo entre ellos, con la pestaña de última jugada vacía. Sustituye la creación de la partida de 4 jugadores de RF-021 de SPEC 006.
- **RF-008**: El botón de nueva partida de la pantalla de campeón y «Nueva partida» del menú deben llevar a la pantalla de inicio con activados los equipos de la partida anterior y solo ellos. La selección se conserva mientras la página siga abierta y no se guarda en el navegador.
- **RF-009**: En una partida de 2 o 3 equipos, la casa de cada equipo que no juega debe verse vacía, con su escena y su medallón atenuados y sin animar, y nunca resaltada como casa en turno. Amplía RF-007 y RF-014 de SPEC 007.
- **RF-010**: La pantalla de partida debe mostrar el botón de engranaje del diseño, fijo en la esquina superior derecha, que abre el menú lateral del diseño desde la derecha. El menú contiene solo «Nueva partida»; las entradas «Configuración» y «Pronto» del diseño no se implementan en este spec.
- **RF-011**: El menú debe cerrarse con Escape, tocando fuera y con su botón de cerrar, y al cerrarse el foco vuelve al engranaje. Mientras está abierto, la partida de detrás no es alcanzable con el teclado ni con el lector.
- **RF-012**: «Nueva partida» del menú, con una partida en curso, debe pedir confirmación con dos opciones, descartar la partida o seguir jugando; seguir jugando devuelve la partida en el mismo estado, selección incluida. Con la partida terminada, la pantalla de campeón tapa el engranaje y su botón es la única salida.
- **RF-013**: Durante la tirada inicial y sus desempates, la acción del cartel debe ser «Tirada inicial: Toca el dado». Sustituye, para la tirada inicial, la acción «Toca el dado» de RF-009 de SPEC 007.
- **RF-014**: Durante la tirada inicial, la pestaña de última jugada debe mostrar las tiradas de la ronda en curso, o de la ronda que acaba de terminar, en el orden en que se hicieron: por cada equipo que ha tirado, su mascota y el valor que sacó; si la ronda termina en empate, añade el empate entre los equipos implicados. Sustituye, para la tirada inicial, la frase de una sola tirada de SPEC 007.
- **RF-015**: Las tiradas de la ronda salen solo del estado y de los eventos del motor (`initial-roll`, `initial-roll-tie`); la aplicación las acumula para mostrarlas, pero el motor sigue decidiendo los empates y quién empieza. La pestaña con las tiradas cabe en el hueco reservado de RNF-010 de SPEC 007, sin mover el tablero, y su texto accesible nombra a cada equipo con su valor.
- **RF-016**: Cuando el motor decide quién empieza (evento `first-player`), sobre la pantalla de partida debe aparecer la pantalla de inicio de turno: la capa oscura de la de campeón de RF-001 con solo el tablón del color del equipo que empieza, su mascota animada y el título «Empieza el equipo X», con el nombre del color, y un botón «¡Vamos!» con el estilo del botón de nueva partida; sin trofeo, confeti ni rayos de sol. Se comporta como un diálogo modal, como en RF-003: el foco pasa a «¡Vamos!», que es la única forma de cerrarla, y mientras está abierta el dado no responde. Al cerrarla, la partida sigue en el turno de ese equipo. Se compacta en ventanas bajas como la de campeón.

## 8. Requisitos no funcionales

- **RNF-001**: La pantalla de inicio, el menú, la confirmación y la pantalla de campeón se manejan enteros con teclado y lector de pantalla y cumplen WCAG 2.2 AA (P-15); el estado activado o desactivado de cada equipo no depende solo del color ni de la atenuación.
- **RNF-002**: Con movimiento reducido activado en el sistema, la pantalla de campeón no muestra confeti, ni rayos girando, ni la mascota animada, la pantalla de inicio no anima mascotas, el menú aparece sin deslizarse, y todo se reconoce igual sin movimiento.
- **RNF-003**: Los textos del tablón de campeón, de los botones, del menú y de la pantalla de inicio tienen un contraste de al menos 4,5:1 con su fondo inmediato, o de 3:1 si son texto grande, con cada uno de los cuatro colores (WCAG 1.4.3).
- **RNF-004**: La pantalla de partida con el engranaje, la pantalla de inicio y la pantalla de campeón caben enteras sin scroll en ventanas de 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, como la pantalla de partida en RNF-004 de SPEC 007. El engranaje no añade altura ni tapa el cartel, el dado ni las fichas.
- **RNF-005**: El engranaje, los controles de la pantalla de inicio, los del menú, el botón de nueva partida y los de la confirmación tienen un área táctil de al menos 24 × 24 px (WCAG 2.5.8).
- **RNF-006**: El motor no cambia: `git diff master -- src/engine` vacío (P-01, P-02).
- **RNF-007**: Los colores nuevos son tokens de la paleta, la aplicación no pide recursos a servicios externos, los archivos de `docs/design` no se usan en producción y no se añade ninguna dependencia sin justificarla en el plan de la parte que la necesite (P-16, P-17).

## 9. Entidades clave

- **Equipo**: jugador de R-001, con su color y su mascota fija.
- **Selección de equipos**: equipos activados en la pantalla de inicio; vive mientras la página sigue abierta.
- **Partida**: el estado del motor de SPEC 006, ahora con los equipos de la selección.

## 10. Casos límite

- Partida de 2 equipos → la pantalla de campeón es igual que con 4: solo el ganador.
- Móvil en horizontal (568 × 320) → el diseño no cabe: el tablón mide 332 px de alto y el botón de nueva partida queda entre 354 y 410 px, fuera de la pantalla. La pantalla se compacta, con la mascota y el trofeo más pequeños o el botón al lado del tablón, y el botón sigue siempre visible y alcanzable.
- Desactivar equipos hasta dejar uno o ninguno → «¡A jugar!» no responde y se indica que hacen falta al menos 2.
- Desactivar un equipo → su mascota no se anima; solo se anima al activarlo.
- Casa inactiva → su casilla de salida y su pasillo siguen siendo casillas del tablero sin cambios; nadie entra en su pasillo (R-007).
- Recargar durante la partida, con el menú o la confirmación abiertos o con la pantalla de campeón → pantalla de inicio con los cuatro equipos activados, sin aviso.
- Partida terminada → la pantalla de campeón tapa el engranaje; la única salida es su botón de nueva partida.
- Abrir el menú y pedir «Nueva partida» con una ficha seleccionada, y seguir jugando → la selección, la réplica y los resaltados siguen igual.
- Abrir el menú mientras el dado gira → el giro termina y la tirada se aplica igual detrás del menú.
- Pantalla de inicio abierta → no hay engranaje ni menú: no hay partida que descartar.
- Primera tirada de la tirada inicial → antes de tirar, la pestaña está vacía, como en SPEC 007.
- Recargar con la pantalla «Empieza el equipo X» abierta → pantalla de inicio con los cuatro equipos activados, como cualquier recarga.
- Movimiento reducido → la pantalla «Empieza el equipo X» aparece con la mascota quieta.
- Ronda de desempate → solo aparecen las tiradas de los equipos empatados; las de la ronda anterior desaparecen al tirar el primero.
- Partida de 4 equipos → la pestaña puede mostrar cuatro mascotas con su valor y el empate, y tiene que caber igual en el hueco reservado.

## 11. Criterios de éxito

- **CE-01**: Tests de componente sobre estados construidos comprueban que la pantalla de campeón muestra el color y la mascota del ganador y ningún otro equipo, el nombre accesible con el ganador, el foco en el botón de nueva partida y que Escape no la cierra.
- **CE-02**: Un test comprueba que, con movimiento reducido, la pantalla de campeón no tiene animaciones.
- **CE-03**: Tests de componente comprueban que la pantalla de inicio empieza con los cuatro activados, que no deja empezar con menos de 2, que la mascota se anima al activar su equipo y no con movimiento reducido, y que tras nueva partida desde la pantalla de campeón o desde el menú conserva los equipos de la partida anterior.
- **CE-04**: Tests de componente comprueban que el menú se abre con el engranaje, tiene solo «Nueva partida», se cierra con Escape, tocando fuera y con su botón, y devuelve el foco al engranaje; y que la confirmación conserva el estado al cancelar.
- **CE-05**: Una prueba en navegador configura una partida de amarillo y verde, comprueba que la tirada inicial y los turnos son solo entre ellos y que las casas azul y roja están atenuadas, y empieza otra partida desde el menú tras cancelar una vez la confirmación.
- **CE-06**: La prueba en navegador de pantalla sin scroll incluye la pantalla de inicio y la pantalla de partida con el engranaje en las cuatro ventanas de RNF-004; la pantalla de campeón se comprueba en esas ventanas con una revisión manual registrada en el plan.
- **CE-07**: Tests del cartel comprueban «Tirada inicial: Toca el dado» en la tirada inicial y en los desempates; tests de la pestaña comprueban las tiradas de una ronda en orden, el empate, el vaciado al empezar una ronda nueva y el texto accesible; tests de componente comprueban que la pantalla «Empieza el equipo X» aparece con el color y la mascota del equipo que empieza, sin trofeo, confeti ni rayos, con el foco en «¡Vamos!», y que el dado no responde hasta pulsarlo; y las pruebas en navegador de SPEC 006 y SPEC 007 que pasan por la tirada inicial se actualizan a los textos nuevos y pulsan «¡Vamos!».
- **CE-08**: `pnpm check` pasa al cerrar cada parte, `pnpm test:e2e` pasa al cerrar la última y `git diff master -- src/engine` está vacío.

## 12. Supuestos y dependencias

- Requiere SPEC 006 (partida jugable, almacén, cartel y ganador) y SPEC 007 (mascotas, sus animaciones, medallones, tablón y paleta).
- Los diseños están en `docs/design/avisos-y-campeon` (pantalla de campeón) y `docs/design/inicio-y-menu` (pantalla de inicio, engranaje y menú), ya exportados.
- El motor ya admite partidas de 2 a 4 jugadores y salta en el turno a los colores que no participan (R-001, R-010); no necesita cambios.
- La pantalla de campeón aparece en cuanto el motor da ganador; el cartel «¡Gana X!» de SPEC 007 sigue debajo de la capa.
- La confirmación de «Nueva partida» no tiene diseño propio y se hace con el estilo del menú.
- Las tiradas de la ronda en la pestaña no tienen diseño propio: usan la pestaña de `docs/design/avisos-y-campeon` con una mascota pequeña y un valor por equipo.
- El ejemplo del diseño de la pantalla de inicio abre con rojo y verde activados; aquí abre con los cuatro, que es la partida completa de SPEC 007.

## 13. Decisiones tomadas y descartadas

- **Sí:** solo hay un ganador y la pantalla de campeón solo lo muestra a él. R-090 termina la partida con el primer equipo en llegar y el resto no se clasifica.
- **No:** clasificar al resto por fichas en meta y avance. Exigía una regla nueva en el reglamento y cambios en el motor para un dato que no se pidió.
- **No:** seguir jugando tras el primer ganador. Cambia R-090, el turno y los invariantes.
- **Sí:** mascota fija a su color. Las paletas del diseño, el cartel y la pestaña de SPEC 007 van ligados a esa pareja.
- **Sí:** activar cada equipo por separado, con un mínimo de 2. Permite cualquier combinación de R-001.
- **No:** elegir solo el número de equipos con colores fijos. Más simple, pero menos libre.
- **Sí:** la mascota se anima al activar su equipo. Confirma la elección y da vida a la pantalla de inicio con las animaciones que ya existen.
- **Sí:** nueva partida, desde la pantalla de campeón o desde el menú, lleva a la pantalla de inicio con los mismos equipos. Un único camino para empezar.
- **No:** revancha directa ni dos botones. Duplican caminos para ahorrar un toque.
- **Sí:** un menú tras el engranaje en lugar de botones fijos. La pantalla de partida ya ocupa toda la altura en móvil, y el menú deja sitio para opciones de specs futuros.
- **No:** acceder al menú solo con una tecla. En móvil y tablet no hay teclado y nadie la descubriría; Escape solo cierra el menú.
- **Sí:** el menú solo tiene «Nueva partida». «Configuración» y las entradas «Pronto» del diseño no se implementan aquí: llegarán con los specs que les den contenido.
- **Sí:** confirmar antes de descartar una partida en curso. Un toque accidental en el menú no debe perder la partida.
- **Sí:** recordar la selección solo mientras la página siga abierta. No guarda nada en el navegador ni introduce fallos de almacenamiento.
- **No:** guardar la selección en el navegador. P-16 lo permitiría, pero no compensa ahora.
- **Sí:** la pantalla de campeón no se cierra; la partida se ve atenuada detrás. Como el diseño.
- **Sí:** el diseño de la pantalla de campeón queda como referencia y la aplicación la compacta en ventanas bajas. Es un ajuste de tamaños, no un diseño nuevo.
- **No:** cerrar la capa para ver el tablero final. Exigiría un estado más y un acceso para reabrirla.
- **Sí:** casas inactivas vacías y atenuadas. El tablero no cambia de forma y se ve qué equipos no juegan.
- **No:** casas inactivas sin atenuar u ocultas. Sin atenuar se confunden con un equipo con todas sus fichas fuera; ocultas dejan un hueco en la esquina.
- **Sí:** «Tirada inicial: Toca el dado» en el cartel. Con solo «Toca el dado» no se distingue de una tirada normal.
- **Sí:** en la tirada inicial, la pestaña muestra todas las tiradas de la ronda con sus mascotas. Se ve quién va ganando y por qué hay desempate.
- **No:** mostrar solo la última tirada, como en SPEC 007. Obliga a recordar lo que sacaron los demás.
- **Sí:** una pantalla «Empieza el equipo X» con «¡Vamos!» al terminar la tirada inicial. Marca el paso de la tirada inicial a la partida, y reutiliza el tablón y la capa de la pantalla de campeón; el trofeo, el confeti y los rayos quedan para el final.
- **Sí:** «¡Vamos!» es la única forma de cerrarla, como el botón de la pantalla de campeón. Asegura que todos ven quién empieza antes de tirar.
- **Sí:** pruebas en navegador de la pantalla de inicio y del menú; la pantalla de campeón, con tests de componente sobre estados construidos. Llegar al ganador en navegador exige una partida entera, como ya decidió SPEC 006.
- **Sí:** orden campeón, inicio y menú. Cierra primero el final de partida, y el menú llega cuando ya existe la pantalla de inicio a la que lleva.

## 14. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| La pantalla de campeón del diseño no cabe en 568 × 320 (medido: 332 px de tablón y el botón hasta 410 px) | El plan de PARTE-01 define una variante compacta para ventanas bajas, a partir del diseño, y la revisa en las cuatro ventanas |
| El engranaje tapa el cartel o una esquina del tablero en móvil | Comprobarlo en la prueba de pantalla sin scroll y ajustar su posición en el plan |
| La pantalla de inicio con cuatro tarjetas no cabe en 568 × 320 | Comprobarla en la prueba de pantalla sin scroll y reducir las tarjetas en horizontal |
| «Tirada inicial: Toca el dado» no cabe en una línea del cartel en 320 px | Comprobarlo en la prueba de pantalla sin scroll y reducir el texto o partirlo en dos líneas sin mover el tablero |
| Todas las pruebas en navegador que pasan por la tirada inicial tienen que pulsar «¡Vamos!» | Incluirlo en el ayudante de tiradas de `e2e/` para no repetirlo en cada prueba |
| Cuatro tiradas y un empate no caben en el hueco reservado de la pestaña | Recalcular el hueco con el caso más largo de la tirada inicial |

## 15. Partes / incrementos

### PARTE-01: Pantalla de campeón

- **Objetivo**: celebrar al ganador y permitir empezar otra partida sin recargar.
- **Alcance**: capa de campeón del diseño solo con el ganador, botón de nueva partida que reinicia con los mismos equipos y comportamiento de diálogo modal.
- **Cubre**: HU-01 · RF-001, RF-002, RF-003 · RNF-002
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-01, CE-01 y CE-02, y nueva partida empieza otra de 4 equipos desde la tirada inicial.

### PARTE-02: Pantalla de inicio y partidas de 2 y 3 equipos

- **Objetivo**: elegir los equipos antes de cada partida.
- **Alcance**: pantalla de inicio del diseño con la mascota animada al activar, partidas de 2 y 3 equipos con casas inactivas, y nueva partida desde la pantalla de campeón pasando por la pantalla de inicio.
- **Cubre**: HU-02, HU-03, HU-04 · RF-004, RF-005, RF-006, RF-007, RF-008, RF-009
- **Depende de**: PARTE-01
- **Hecho cuando**: se cumplen los criterios de HU-02 a HU-04 y la parte de CE-03 y CE-06 que toca la pantalla de inicio.

### PARTE-03: Menú y nueva partida durante el juego

- **Objetivo**: empezar otra partida en cualquier momento sin ocupar altura en la pantalla de partida.
- **Alcance**: engranaje y menú lateral del diseño con «Nueva partida», confirmación con una partida en curso y vuelta a la pantalla de inicio.
- **Cubre**: HU-05 · RF-010, RF-011, RF-012 · RNF-005
- **Depende de**: PARTE-02
- **Hecho cuando**: se cumplen los criterios de HU-05, CE-04, CE-05 y CE-06.

### PARTE-04: Tirada inicial en el cartel y la pestaña

- **Objetivo**: distinguir la tirada inicial y ver lo que ha sacado cada equipo.
- **Alcance**: acción «Tirada inicial: Toca el dado» en el cartel, tiradas de la ronda con sus mascotas en la pestaña de última jugada y pantalla «Empieza el equipo X» con «¡Vamos!».
- **Cubre**: HU-06 · RF-013, RF-014, RF-015, RF-016
- **Depende de**: PARTE-01, por la pantalla de campeón que reutiliza
- **Hecho cuando**: se cumplen los criterios de HU-06 y CE-07.

**Transversales**: RNF-001, RNF-003, RNF-004, RNF-006, RNF-007
**Orden sugerido**: PARTE-01 → PARTE-02 → PARTE-03 → PARTE-04

## 16. Preguntas abiertas

- ¿Qué opciones irán primero en el menú? Se decidirá en el spec que añada la primera, junto con si vuelve la entrada «Configuración» del diseño.

## 17. Qué NO entra en este spec

- Clasificación u orden de los equipos que no ganan.
- Seguir jugando tras el primer ganador.
- Opciones del menú más allá de «Nueva partida»: configuración, sonido, accesibilidad y guardar partida.
- Elegir la mascota de un equipo con independencia de su color.
- Nombres de jugadores personalizados.
- Jugadores controlados por la máquina.
- Guardar en el navegador la partida o la última selección de equipos.
- Cerrar la pantalla de campeón para ver el tablero final.
- Estadísticas e historial de partidas.
- Evento del motor al formar barrera («Forma un puente»).

Cada uno de estos, si llega, irá en su propio spec.
