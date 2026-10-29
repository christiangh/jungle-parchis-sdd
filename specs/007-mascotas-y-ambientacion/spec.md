# SPEC 007 — Mascotas y ambientación

> **Estado:** Implementado
> **Depende de:** SPEC 005, SPEC 006
> **Fecha:** 2026-10-27
> **Autor:** Christian Garcia
> **Objetivo:** Que cada equipo se reconozca por su mascota en las fichas, las casas y los avisos, sobre un fondo más suave y con las tipografías del diseño.

## 1. Resumen

Da personalidad a la partida de SPEC 006 con los diseños de `docs/design/mascotas`, `avisos-y-campeon` y `fondo-jungla`. Cada equipo tiene su mascota: el jaguar amarillo, el loro rojo, el hipopótamo azul y la rana verde. Las fichas y las casas las muestran, cada casa lleva el medallón de su mascota en la esquina exterior, y la casa del equipo en turno y su medallón se resaltan y se animan. El cartel de turno pasa a decir solo la acción, con la mascota del equipo en turno, y la última jugada se muestra en una pestaña colgada debajo, con la mascota de quien la hizo. El fondo se suaviza, las tipografías Caprasimo y Figtree pasan a formar parte de la aplicación, y el equipo y el nombre de una ficha se obtienen de su identificador en un único punto compartido. La aplicación estrena además su favicon, sus iconos y su manifiesto.

## 2. Contexto y problema

Tras SPEC 006 la partida se juega entera, pero los equipos solo se distinguen por el color, el cartel repite «Turno de…» en cada estado y la línea de última jugada es una frase oscura y suelta que nombra a todos los que actúan. El fondo de jungla es oscuro y pesa alrededor del tablero. Ya existen los diseños de las mascotas, de los avisos en dos niveles y de una versión suavizada del fondo. Además, el tablero y la línea de última jugada sacan cada uno por su cuenta el equipo y el número de una ficha de su identificador, y la pestaña nueva necesitará lo mismo. La pestaña del navegador muestra el icono por defecto de Angular, y no hay iconos para la pantalla de inicio del móvil.

## 3. Objetivos y alcance

### Objetivos

- Que cada equipo se reconozca por su mascota, además de por su color.
- Que el cartel diga qué hacer y la pestaña qué pasó y quién lo hizo, sin repetir información.
- Que el fondo no compita con el tablero y que los textos usen las tipografías del diseño.
- Que el equipo y el nombre de una ficha se obtengan siempre del mismo modo.
- Que la aplicación se reconozca por su icono en la pestaña del navegador y en la pantalla de inicio.

### Entra

- Mascota de cada equipo, reconstruida con la paleta del tablero a partir de las variantes elegidas en el diseño.
- Fichas con la mascota de su equipo en el recorrido, el pasillo, la meta y la casa, con todos los estados de SPEC 006.
- Casas decoradas con su escena, con la del equipo en turno resaltada y sus fichas animadas.
- Medallón con la mascota de cada equipo en la esquina exterior de su casa, resaltado y animado el del equipo en turno.
- Cartel de turno nuevo: mascota animada del equipo en turno y solo la acción, con el turno como texto para el lector de pantalla.
- Pestaña de última jugada: color oscurecido y mascota de quien hizo la jugada, con los eventos sin nombrar a quien actúa ni el cambio de turno.
- Fondo suavizado y su color de carga como token de la paleta.
- Tipografías Caprasimo y Figtree incluidas en la aplicación.
- Un único punto que obtiene el equipo y el nombre de una ficha a partir de su identificador.
- Adaptación de las pruebas en navegador de SPEC 006 a los textos nuevos.
- Favicon, icono para la pantalla de inicio y manifiesto de la aplicación, con rutas relativas.

### Fuera de alcance (para specs futuros)

- Pantalla de campeón, con trofeo, confeti y rayos de sol.
- Nueva partida al terminar.
- Accesibilidad completa de la partida con teclado y lector de pantalla (P-15).
- Aviso «Forma un puente», que necesita un evento nuevo en el motor.
- Animación de las fichas que están fuera de casa.
- Aplicación instalable sin conexión (service worker) y despliegue en GitHub Pages.

## 4. Usuarios y actores

- **Jugador**: una de las cuatro personas que se pasan el dispositivo; reconoce su equipo por el color y la mascota, lee en el cartel qué hacer y en la pestaña qué pasó.
- **Motor**: aporta el estado, los movimientos legales y los eventos de cada acción, de los que salen la casa resaltada, el cartel y la pestaña.

## 5. Glosario

Se mantienen los términos de SPEC 006 (pantalla de partida, cartel de turno, instrucción, réplica, halo, área táctil, generador de tiradas), salvo «línea de última jugada», que se sustituye por «pestaña de última jugada».

- **Mascota**: animal que representa a un equipo: jaguar amarillo con gafas de sol, loro rojo con micro antiguo, hipopótamo azul con flotador rosa y rana verde con corona.
- **Ficha-mascota**: ficha pintada con la cara de la mascota de su equipo, sobre el color del equipo.
- **Animación de la mascota**: bucle corto con pausa propio de cada mascota: sonrisa y reflejo en las gafas del jaguar, el loro que se mueve al ritmo, el chapuzón del hipopótamo y la corona que se le ladea a la rana.
- **Casa en turno**: casa del equipo al que le toca jugar o tirar, incluida la tirada inicial.
- **Medallón**: círculo con la mascota de un equipo en la esquina exterior de su casa, fuera de sus huecos; se ve siempre, haya o no fichas en casa.
- **Pestaña de última jugada**: tablón más pequeño colgado debajo del cartel, en el color oscurecido de quien hizo la última acción y con su mascota, que resume los eventos de esa acción.
- **Equipo que actúa**: jugador que envió al motor la última acción.

## 6. Historias de usuario

### HU-01: Jugar sobre un fondo suave y con las tipografías del diseño (P2)

**Como** jugador, **quiero** un fondo de jungla claro y los textos con las tipografías del diseño, **para** que el tablero destaque y la partida tenga un aspecto propio.

**Criterios de aceptación**

1. **Dado** una pantalla de móvil o de escritorio, **cuando** abro la aplicación, **entonces** veo el fondo de jungla suavizado repetido alrededor del tablero.
2. **Dado** la imagen del fondo todavía sin cargar, **cuando** se pinta la página, **entonces** se ve el color salvia de carga de la paleta.
3. **Dado** la aplicación sin conexión a otros servicios, **cuando** se carga, **entonces** el cartel usa Caprasimo y el resto de textos Figtree.

### HU-02: Reconocer mis fichas por su mascota (P1)

**Como** jugador, **quiero** ver la mascota de mi equipo en cada una de mis fichas, **para** distinguirlas de un vistazo y no solo por el color.

**Criterios de aceptación**

1. **Dado** una partida nueva, **cuando** se muestra el tablero, **entonces** cada ficha es la ficha-mascota de su equipo: jaguar en amarillo, loro en rojo, hipopótamo en azul y rana en verde.
2. **Dado** una tirada con movimientos legales, **cuando** hay que elegir ficha, **entonces** las ficha-mascotas que pueden moverse tienen halo, las demás se atenúan y al seleccionar una crece y aparece su réplica transparente con su mascota, como en SPEC 006.
3. **Dado** una ficha roja comida, **cuando** se aplica el movimiento, **entonces** su ficha-mascota vuelve a su hueco de la casa roja.

### HU-03: Ver en las casas a quién le toca (P2)

**Como** jugador, **quiero** que la casa del equipo en turno destaque y sus mascotas se muevan, **para** saber a quién le toca sin leer el cartel.

**Criterios de aceptación**

1. **Dado** el turno de azul, **cuando** se muestra el tablero, **entonces** la casa azul está resaltada, las otras tres no se atenúan y solo las fichas en casa azules se animan.
2. **Dado** el turno de amarillo con todas sus fichas fuera de casa, **cuando** se muestra el tablero, **entonces** la casa amarilla está resaltada, sus huecos están vacíos y su medallón muestra el jaguar resaltado y animado.
3. **Dado** movimiento reducido activado en el sistema, **cuando** es el turno de verde, **entonces** la casa verde y su medallón están resaltados y ninguna mascota se anima.
4. **Dado** el turno de rojo, **cuando** se muestra el tablero, **entonces** cada casa lleva el medallón de su mascota en su esquina exterior, sin tapar ningún hueco, y solo el medallón rojo está resaltado y animado.
5. **Dado** una partida terminada, **cuando** se muestra el tablero, **entonces** los cuatro medallones se ven sin resaltar y sin animar.

### HU-04: Saber qué tengo que hacer (P1)

**Como** jugador, **quiero** que el cartel muestre la mascota del equipo en turno y solo la acción, **para** saber qué hacer sin leer de más.

**Criterios de aceptación**

1. **Dado** una partida nueva, **cuando** se muestra, **entonces** el cartel es amarillo, lleva el jaguar animado y dice «Toca el dado» (R-010).
2. **Dado** una tirada con movimientos legales del turno de rojo, **cuando** termina el giro, **entonces** el cartel es rojo, lleva el loro y dice «Elige una ficha».
3. **Dado** que acabo de comer, **cuando** se aplica el movimiento, **entonces** el cartel dice «Usa tu +20» (R-051).
4. **Dado** la cuarta ficha verde que llega a meta, **cuando** se aplica el movimiento, **entonces** el cartel es verde, lleva la rana y dice «¡Gana Verde!» (R-090).
5. **Dado** el turno de azul, **cuando** un lector de pantalla lee el cartel, **entonces** anuncia el turno de Azul antes de la acción.

### HU-05: Saber qué pasó y quién lo hizo (P1)

**Como** jugador, **quiero** ver debajo del cartel la última jugada con la mascota de quien la hizo, **para** seguir la partida aunque no estuviera mirando.

**Criterios de aceptación**

1. **Dado** una partida nueva, **cuando** se muestra, **entonces** no hay pestaña de última jugada, pero su hueco está reservado bajo el cartel.
5. **Dado** el tablero de una partida nueva, **cuando** se aplica la primera acción y aparece la pestaña, **entonces** el tablero no cambia de tamaño ni de posición.
2. **Dado** que rojo saca una ficha de casa y el turno pasa a verde, **cuando** se aplica el movimiento, **entonces** el cartel es verde y la pestaña, en rojo oscurecido y con el loro, dice que saca una ficha de casa, sin nombrar a Rojo ni el turno de Verde.
3. **Dado** que verde come una ficha azul, **cuando** se aplica el movimiento, **entonces** la pestaña, en verde oscurecido y con la rana, dice que se come una ficha de Azul y que cuenta 20.
4. **Dado** un tercer 6 seguido de amarillo, **cuando** termina el giro, **entonces** la pestaña, con el jaguar, dice en una sola frase que son tres seises y si su ficha vuelve a casa, y el cartel pasa al siguiente equipo (R-032).

### HU-06: Reconocer la aplicación por su icono (P3)

**Como** jugador, **quiero** ver el icono del parchís de la jungla en la pestaña del navegador y al añadir la aplicación a la pantalla de inicio, **para** encontrarla entre otras pestañas y aplicaciones.

**Criterios de aceptación**

1. **Dado** un navegador de escritorio, **cuando** abro la aplicación, **entonces** la pestaña muestra el favicon del diseño.
2. **Dado** un móvil, **cuando** añado la aplicación a la pantalla de inicio, **entonces** se usa el icono del diseño y el nombre «Parchís».
3. **Dado** la aplicación servida en una subruta, como en GitHub Pages, **cuando** se carga, **entonces** el favicon, los iconos y el manifiesto se encuentran igual.

## 7. Requisitos funcionales

- **RF-001**: La pantalla de partida debe mostrar el fondo de jungla suavizado del diseño como loseta repetible, con una versión para pantallas estrechas y otra para anchas, y con el color salvia de carga mientras la imagen no ha cargado. Sustituye las imágenes y el color de carga de RF-001 de SPEC 006.
- **RF-002**: El texto del cartel de turno debe usar Caprasimo y el resto de textos de la aplicación, Figtree, ambas servidas por la propia aplicación.
- **RF-003**: El equipo y el nombre legible de una ficha («1 de Amarillo») deben obtenerse de su identificador en un único punto compartido, que usan el tablero y la pestaña de última jugada; ningún otro punto de la aplicación descompone el identificador.
- **RF-004**: Cada equipo debe tener su mascota, con la variante elegida en el diseño: jaguar `e` para amarillo, loro `b` para rojo, hipopótamo `g` para azul y rana `a` para verde.
- **RF-005**: Cada ficha debe pintarse como la ficha-mascota de su equipo en el recorrido, el pasillo, la meta y la casa, conservando el halo, la atenuación, el crecimiento al seleccionar, la réplica transparente, los indicadores de destino, las parejas y las áreas táctiles de SPEC 006.
- **RF-006**: Cada casa debe mostrar la escena decorada de su equipo según la variante `e` del diseño, con un hueco por ficha: el hueco muestra su ficha-mascota si esa ficha está en casa y queda vacío si no.
- **RF-007**: La casa en turno debe resaltarse sin atenuar las demás, y sus fichas en casa deben mostrar la animación de su mascota; ninguna otra ficha se anima. Con la partida terminada, ninguna casa se resalta.
- **RF-008**: El cartel de turno debe pintarse como un tablón del color del equipo en turno, con su mascota animada a la izquierda y solo la acción, sin «Turno de…». Sustituye RF-003 de SPEC 006.
- **RF-009**: La acción del cartel debe derivarse solo del estado del motor: «Toca el dado» cuando hay que tirar, también en la tirada inicial y sus desempates; «Elige una ficha» con una tirada pendiente; «Usa tu +N» con un premio pendiente de N; y, con ganador, «¡Gana X!» en el color y con la mascota del ganador. Sustituye RF-004 y la parte del cartel de RF-020 de SPEC 006.
- **RF-010**: El cartel debe incluir un texto solo para el lector de pantalla con el turno del equipo antes de la acción, salvo con ganador; las mascotas del cartel y de la pestaña son decorativas para el lector.
- **RF-011**: Tras cada acción, debajo del cartel debe colgar la pestaña de última jugada, en el color oscurecido del equipo que actúa y con su ficha-mascota sin animar; antes de la primera acción no hay pestaña, pero su hueco se mantiene reservado. Sustituye la línea de última jugada de RF-005 de SPEC 006.
- **RF-012**: La pestaña debe resumir en una sola frase todos los eventos de la última acción, en el orden en que el motor los produjo, sin nombrar al equipo que actúa y sin el cambio de turno, y nombrando a los demás equipos afectados («Se come una ficha de Azul»). Cada tipo de evento de RF-006 de SPEC 006 conserva su texto, adaptado a esta regla. Sustituye RF-006 de SPEC 006.
- **RF-013**: Las pruebas en navegador de SPEC 006 deben seguir jugando los mismos escenarios y comprobar los textos nuevos del cartel y de la pestaña.
- **RF-014**: Cada casa debe mostrar en su esquina exterior el medallón con la mascota de su equipo, como en la variante `e` del diseño, sin tapar los huecos y aunque no haya fichas en casa. El medallón de la casa en turno se resalta y su mascota se anima; los demás quedan quietos y sin resaltar, y con la partida terminada ninguno se resalta ni se anima. Los medallones son decorativos para el lector de pantalla.
- **RF-015**: La aplicación debe declarar el favicon, el icono para la pantalla de inicio y el manifiesto del diseño, con su nombre y sus iconos, todo con rutas relativas a la base de la aplicación.

## 8. Requisitos no funcionales

- **RNF-001**: El texto del cartel y de la pestaña tiene un contraste de al menos 4,5:1 con su fondo inmediato, con cada uno de los cuatro colores (WCAG 1.4.3, P-15).
- **RNF-002**: Con movimiento reducido activado en el sistema, ninguna mascota se anima; la casa en turno y el cartel se reconocen igual sin movimiento.
- **RNF-003**: Las animaciones son bucles de unos 3 s con pausa y no desplazan las fichas de su casilla ni cambian sus áreas táctiles.
- **RNF-004**: La pantalla de partida, con el cartel y la pestaña más larga, cabe entera sin scroll en ventanas de 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080.
- **RNF-005**: En una ventana de 320 × 568, las fichas de cada equipo se distinguen por el color de la ficha-mascota aunque no se aprecie la cara de la mascota.
- **RNF-006**: Los colores de las mascotas, las escenas de las casas, el cartel, la pestaña y el color de carga del fondo son tokens de la paleta; en la aplicación no hay colores en hexadecimal.
- **RNF-007**: Ningún archivo de la aplicación decide reglas del juego: la casa en turno, el cartel y la pestaña salen del estado y de los eventos del motor, y el motor no cambia (P-01, P-02, P-05).
- **RNF-008**: La aplicación no pide tipografías ni otros recursos a servicios externos al cargarse (P-16).
- **RNF-009**: Las mascotas se reconstruyen con componentes propios de la aplicación y no se usan los archivos de `docs/design` en producción; no se añade ninguna dependencia nueva salvo que se justifique en el plan de la parte que la necesite (P-17).
- **RNF-010**: El tablero no cambia de tamaño ni de posición cuando la pestaña aparece, cambia de texto o no tiene mensaje: su hueco se reserva siempre con la altura de la pestaña más larga, en cada una de las ventanas de RNF-004.
- **RNF-011**: El favicon, los iconos y el manifiesto se sirven desde la propia aplicación y se encuentran tanto en la raíz del dominio como en una subruta, sin cambiar sus rutas (P-16).

## 9. Entidades clave

- **Equipo**: color del jugador; tiene una mascota, un color de cartel y un color oscurecido de pestaña.
- **Mascota**: animal de un equipo, con su ficha-mascota y su animación.
- **Ficha**: identificada por su equipo y su número; se pinta como ficha-mascota.
- **Casa**: zona de salida de un equipo, con su escena, un hueco por ficha y el medallón de su mascota.

## 10. Casos límite

- Primera pantalla de la partida → cartel amarillo con «Toca el dado» y sin pestaña.
- Tirada inicial → la casa resaltada es la del equipo que tira; la pestaña dice el valor que sacó el equipo que actúa y, si hay, el empate entre los equipos implicados, que sí se nombran.
- Repetir con un 6 → el cartel y la pestaña son del mismo equipo, en su color y en su color oscurecido.
- Tirada sin movimientos legales → la pestaña dice el valor y que se pierde la tirada, sin el turno siguiente, y el cartel pasa al siguiente equipo (R-012).
- Tres seises sin ficha que volver a casa → la pestaña solo dice que son tres seises (R-032).
- Última acción cuyo único evento es el cambio de turno → no se muestra pestaña y su hueco sigue reservado.
- Premio perdido porque ninguna ficha puede usarlo → la pestaña lo dice y el cartel sigue con la acción que toque (R-080).
- Partida terminada → cartel del ganador con su mascota animada, ninguna casa ni medallón resaltados, ningún medallón animado y la pestaña con la última jugada.
- Equipo en turno con todas sus fichas fuera de casa → su casa se resalta con los huecos vacíos, y en el tablero solo se anima la mascota de su medallón.
- Tipografías todavía sin cargar → los textos se ven con una tipografía de respaldo y cambian al cargar, sin desplazar el tablero.
- Pestaña con muchos eventos en una pantalla estrecha → el texto ocupa varias líneas dentro del hueco reservado y la pantalla sigue sin scroll.

## 11. Criterios de éxito

- **CE-01**: Cada tipo de evento del motor tiene un test que comprueba su texto en la pestaña, y ninguno nombra al equipo que actúa ni el cambio de turno.
- **CE-02**: Un test por estado comprueba la acción del cartel: tirar, tirada inicial, elegir ficha, premio pendiente y ganador.
- **CE-03**: Un test comprueba que el texto para el lector de pantalla del cartel nombra el equipo en turno.
- **CE-04**: Un test comprueba que solo la casa en turno se resalta y que, con ganador, no se resalta ninguna.
- **CE-05**: El contraste medido del texto del cartel y de la pestaña es de al menos 4,5:1 con los cuatro colores.
- **CE-06**: Las pruebas en navegador de SPEC 006, con los textos nuevos, pasan en local y en el CI.
- **CE-07**: Una prueba en navegador con movimiento reducido emulado comprueba que no hay ninguna animación de mascota en marcha.
- **CE-08**: Una prueba en navegador comprueba que al cargar la página no se pide nada a otro origen.
- **CE-09**: La pantalla se ve entera sin scroll en las cuatro ventanas de RNF-004.
- **CE-10**: Solo un punto de la aplicación descompone el identificador de una ficha, y los nombres accesibles de las fichas siguen siendo los de SPEC 006.
- **CE-11**: Una prueba en navegador comprueba, en las cuatro ventanas de RNF-004, que el tamaño y la posición del tablero son los mismos antes de la primera acción, con una pestaña corta y con la pestaña más larga.
- **CE-12**: Un test comprueba que hay un medallón por casa con la mascota de su equipo, que no se solapa con ningún hueco, que solo el de la casa en turno se resalta y se anima, y que con ganador ninguno; la prueba en navegador de CE-07 incluye los medallones.
- **CE-13**: Una prueba en navegador comprueba que el favicon, el icono para la pantalla de inicio, el manifiesto y los iconos del manifiesto se declaran con rutas relativas y se cargan desde el mismo origen.

## 12. Supuestos y dependencias

- Parte del tablero de SPEC 005 y de la pantalla de partida de SPEC 006, que siguen en vigor salvo en lo que este spec sustituye.
- El equipo que actúa es el jugador que envió la última acción al motor.
- Los textos exactos de la pestaña se fijan en el plan, en castellano y con los nombres de los colores, partiendo de los de SPEC 006.
- Las imágenes del fondo suavizado sustituyen a las actuales, con formato ligero y respaldo como en SPEC 006.
- Caprasimo y Figtree tienen una licencia libre que permite incluirlas en el proyecto.
- Las animaciones de cada mascota son las elegidas en el diseño: jaguar `c`, loro `c`, hipopótamo `b` y rana `c`.
- El valor del dado no aparece en el cartel: lo muestra la cara del dado.
- El favicon, los iconos y el manifiesto vienen ya hechos del diseño; la aplicación solo los incluye y los declara.

## 13. Decisiones tomadas y descartadas

- **Sí:** la mascota se anima en el cartel y en las fichas en casa del equipo en turno; el resto, quieto. Una ficha mide unos 9 px en móvil: animada no se aprecia y distrae al elegir.
- **No:** animar todas las fichas o solo el cartel. Lo primero distrae; lo segundo desaprovecha las casas para indicar el turno.
- **Sí:** la pestaña resume todos los eventos de la última acción, sin el equipo que actúa ni el cambio de turno. Ningún evento se pierde, quien actúa lo dice su mascota y el turno lo dice el cartel.
- **No:** mostrar solo el evento principal. Oculta eventos, como hacía el aviso por prioridad descartado en SPEC 006.
- **Sí:** el cartel dice solo la acción mínima («Toca el dado», «Elige una ficha», «Usa tu +20», «¡Gana Verde!»). Fiel al diseño; el valor está en el dado y el turno en el color y la mascota.
- **No:** acciones con dato, como «Mueve 5: elige una ficha». Alargan el cartel y repiten lo que ya se ve.
- **Sí:** casas con su escena y la casa en turno resaltada sin atenuar las demás. Indica el turno sin apagar el tablero.
- **No:** atenuar las casas que no tienen el turno, ni casas sin indicar el turno.
- **Sí:** los huecos de la casa siguen al estado: muestran las fichas que están en casa. El tablero nunca enseña fichas que no existen.
- **Sí:** el medallón de la mascota en la esquina exterior de cada casa, como en la variante `e` del diseño. No tapa los huecos y mantiene la mascota visible aunque la casa esté vacía. Revierte la decisión inicial, que descartaba una mascota decorativa fija en la casa por duplicar la mascota y dejar pequeñas las fichas en casa: el medallón queda fuera de los huecos y las fichas conservan su tamaño.
- **Sí:** el turno sigue como texto oculto para el lector de pantalla. Quitar «Turno de…» del cartel no debe empeorar lo que había en SPEC 006.
- **Sí:** el hueco de la pestaña se reserva siempre, aunque no haya mensaje. Si aparece y desaparece, el tablero cambia de tamaño y las fichas saltan.
- **Sí:** SPEC 006 no se modifica; este spec dice qué requisitos suyos sustituye. SPEC 006 queda como registro de lo que se implementó.
- **Sí:** el refactor del identificador de ficha entra aquí, porque la pestaña necesita el equipo de la ficha igual que el tablero.
- **No:** el aviso «Forma un puente» del diseño. El motor no produce ese evento y la aplicación no puede deducirlo sin decidir reglas (RNF-007).
- **Sí:** tres partes: ambientación y refactor, mascotas en el tablero, y cartel y pestaña. Cada una se entrega y prueba sola.
- **Sí:** una cuarta parte, añadida tras cerrar las tres primeras, con el medallón y los iconos. Son detalles del diseño que no cambian lo ya entregado.
- **Sí:** rutas relativas para el favicon, los iconos y el manifiesto. Así funcionan igual en la raíz y en una subruta como la de GitHub Pages; el despliegue en sí queda fuera.

## 14. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| La cara de la mascota no se distingue en fichas de 9 px | La ficha-mascota conserva el color de su equipo como fondo (RNF-005) |
| La ficha-mascota tapa el halo o los indicadores de SPEC 006 | Comprobar los estados de SPEC 006 con la ficha nueva en sus tests (RF-005) |
| El texto blanco del cartel amarillo no llega a 4,5:1 | Medir los cuatro colores y ajustar el contorno del texto lo mínimo (RNF-001) |
| La pestaña larga empuja el tablero y aparece el scroll | Medir la pestaña más larga en las cuatro ventanas (RNF-004, CE-09) |
| El tablero se redimensiona al aparecer o cambiar la pestaña | Hueco de la pestaña siempre reservado con la altura de la más larga (RNF-010, CE-11) |
| Muchos colores nuevos en las escenas de las casas | Agruparlos como tokens de la paleta por equipo (RNF-006) |

## 15. Partes / incrementos

### PARTE-01: Ambientación y nombre de ficha compartido

- **Objetivo**: suavizar el fondo, incluir las tipografías y unificar cómo se obtienen el equipo y el nombre de una ficha.
- **Alcance**: fondo suavizado con su color de carga, Caprasimo y Figtree servidas por la aplicación, y punto único para el equipo y el nombre de una ficha usado por el tablero y la línea de última jugada actual.
- **Cubre**: HU-01 · RF-001, RF-002, RF-003 · RNF-008
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-01, CE-08 y CE-10, y las pruebas de SPEC 006 siguen pasando sin cambios en sus textos.

### PARTE-02: Mascotas en fichas y casas

- **Objetivo**: que cada equipo se reconozca por su mascota en el tablero y que la casa en turno lo indique.
- **Alcance**: mascotas de los cuatro equipos, ficha-mascota en todos los estados de SPEC 006, casas con su escena y sus huecos, casa en turno resaltada y fichas en casa animadas.
- **Cubre**: HU-02, HU-03 · RF-004, RF-005, RF-006, RF-007 · RNF-002, RNF-003, RNF-005
- **Depende de**: PARTE-01
- **Hecho cuando**: se cumplen los criterios de HU-02 y HU-03, y CE-04 y CE-07 en lo que toca a las casas.

### PARTE-03: Cartel y pestaña de última jugada

- **Objetivo**: que el cartel diga qué hacer y la pestaña qué pasó y quién lo hizo.
- **Alcance**: cartel con mascota animada y acción, texto del turno para el lector de pantalla, pestaña con el color oscurecido y la mascota del equipo que actúa, textos nuevos de los eventos y pruebas en navegador adaptadas.
- **Cubre**: HU-04, HU-05 · RF-008, RF-009, RF-010, RF-011, RF-012, RF-013 · RNF-001, RNF-002, RNF-004, RNF-010
- **Depende de**: PARTE-01, PARTE-02
- **Hecho cuando**: se cumplen los criterios de HU-04 y HU-05, y CE-01, CE-02, CE-03, CE-05, CE-06, CE-07, CE-09 y CE-11.

### PARTE-04: Medallones de las casas e iconos de la aplicación

- **Objetivo**: que la mascota de cada equipo se vea siempre en su casa y que la aplicación tenga su propio icono.
- **Alcance**: medallón de cada casa con su resalte y su animación en el turno, y favicon, icono para la pantalla de inicio y manifiesto con rutas relativas.
- **Cubre**: HU-03, HU-06 · RF-014, RF-015 · RNF-002, RNF-011
- **Depende de**: PARTE-02
- **Hecho cuando**: se cumplen los criterios de HU-03 y HU-06, y CE-07, CE-12 y CE-13.

**Transversales**: RNF-006, RNF-007, RNF-009

**Orden sugerido**: PARTE-01 → PARTE-02 → PARTE-03 → PARTE-04

## 16. Preguntas abiertas

- ¿Se echa en falta el valor del dado en el cartel al elegir ficha? Se decidió no mostrarlo; si al jugar resulta confuso, se añade en un ajuste posterior.
- ¿Merece «Forma un puente» un evento nuevo en el motor? Lo pide el diseño, pero cambia el motor y necesita su propio spec.

## 17. Qué NO entra en este spec

- Pantalla de campeón, con trofeo, confeti y rayos de sol.
- Nueva partida al terminar.
- Accesibilidad completa de la partida con teclado y lector de pantalla (P-15).
- Aviso «Forma un puente», que necesita un evento nuevo en el motor.
- Animación de las fichas que están fuera de casa.
- Aplicación instalable sin conexión (service worker) y despliegue en GitHub Pages.

Cada uno de estos, si llega, irá en su propio spec.
