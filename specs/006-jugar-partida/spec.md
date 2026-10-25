# SPEC 006 — Jugar una partida

> **Estado:** Aprobado
> **Depende de:** SPEC 001, SPEC 002, SPEC 003, SPEC 004, SPEC 005
> **Fecha:** 2026-10-25
> **Autor:** Christian Garcia
> **Objetivo:** Que cuatro personas jueguen en el mismo dispositivo una partida completa, de la tirada inicial al ganador, tocando el dado y las fichas sobre el tablero de la jungla.

## 1. Resumen

Primer spec jugable: convierte el tablero de SPEC 005 en una pantalla de partida con el fondo de jungla, una cabecera que dice de quién es el turno y qué hay que hacer, y un dado sobre el tronco del centro. Cuatro personas se pasan el dispositivo: tiran, ven resaltadas las fichas que pueden moverse, eligen una, ven en su destino qué pasará y confirman. Todo lo que se resalta o se anuncia sale de los movimientos legales y de los eventos del motor, y las tiradas las genera la aplicación, nunca el motor. Unas pruebas en navegador real juegan partidas con el dado controlado desde los tests.

## 2. Contexto y problema

Tras SPEC 005 la aplicación pinta el tablero con una partida nueva, pero no se puede jugar: no hay dado, ni forma de elegir ficha, ni indicación de turno. El motor ya aplica el reglamento completo, y existen diseños de referencia para los estados de las fichas, el dado, los avisos y el fondo (`docs/design/movimientos`, `dado-arbol`, `alerta-info` y `fondo-jungla`). En móvil una ficha mide unos 9 px, así que tocarla con precisión no es viable sin un área táctil mayor. Las pruebas en navegador necesitan un dado predecible para jugar partidas reales sin meter en la aplicación código ni parámetros solo para tests.

## 3. Objetivos y alcance

### Objetivos

- Que cuatro personas en el mismo dispositivo puedan jugar una partida de principio a fin, aplicando todas las reglas del motor.
- Que en cada momento la cabecera diga de quién es el turno, qué ha sacado y qué tiene que hacer.
- Que antes de mover se vea dónde acabará la ficha y si come, llega a meta o forma pareja.
- Que la interfaz no decida ninguna regla: todo sale de los movimientos legales y los eventos del motor (P-05).
- Que unas pruebas en navegador real jueguen partidas con el dado controlado desde el test.

### Entra

- Pantalla de partida con el fondo de jungla en loseta repetible, la cabecera y el tablero de SPEC 005.
- Imágenes del fondo servidas por la aplicación, con su color de carga como token de la paleta.
- Cabecera con el cartel de madera del color del jugador en turno, con el estado actual: turno, valor del dado e instrucción.
- Línea de última jugada debajo del cartel, con todos los eventos de la última acción en una sola frase.
- Dado sobre el tronco del centro del tablero con las caras del diseño: late en el color del jugador cuando toca tirar, gira medio segundo al tocarlo y muestra la cara resultante hasta la siguiente tirada.
- Respeto a `prefers-reduced-motion` en el giro del dado y en los latidos.
- Tiradas generadas por la aplicación con un generador sustituible, nunca por el motor (P-04).
- Tirada inicial y desempate con el mismo dado.
- Resaltado con halo de las fichas con movimiento legal y atenuación de las demás.
- Selección de ficha: crece y aparece su réplica transparente en el destino, con su indicador de destino.
- Confirmación tocando la réplica en el destino; cancelación tocando de nuevo la ficha seleccionada o fuera; cambio de selección tocando otra ficha resaltada.
- Área táctil de cada ficha resaltada de al menos el tablón de su casilla.
- Premios con el mismo flujo de selección, sin poder tirar hasta usarlos o perderlos.
- Cartel de ganador con la partida detenida.
- Estado de la partida en un único almacén de la aplicación que aplica las acciones con el motor.
- Contraste WCAG AA del texto de la cabecera y de la línea de última jugada (P-15).
- Pruebas en navegador real de partidas con el dado controlado desde los tests.

### Fuera de alcance (para specs futuros)

- Elegir el número de jugadores: siempre son 4.
- Pantalla final y nueva partida.
- Jugadores controlados por la máquina.
- Animaciones de movimiento de las fichas.
- Sonido.
- Accesibilidad completa con teclado y lector de pantalla (spec de accesibilidad).
- Variante «suave» del diseño.
- Guardar la partida.
- Cambios en el motor.
- Mover sin confirmar cuando solo hay un movimiento legal.

## 4. Usuarios y actores

- **Jugador**: una de las cuatro personas que comparten el dispositivo; en su turno tira el dado, elige ficha y confirma el movimiento.
- **Desarrollador**: comprueba en navegador real partidas con el dado controlado, sin tocar el código de la aplicación.
- **Motor de reglas**: fuente única del estado, de los movimientos legales y de los eventos de cada acción.
- **Generador de tiradas**: da el valor de cada tirada; en la aplicación es aleatorio y en las pruebas lo fija el test.

## 5. Glosario

Se reutilizan los glosarios de SPEC 001 (tirada, movimiento legal, acción y evento), SPEC 002 (seguro, comer, premio y premio pendiente), SPEC 003 (barrera y barrera mixta), SPEC 004 (tirada inicial, ronda de tirada inicial y fase de tirada inicial) y SPEC 005 (tablón, puesto, pareja y paleta del diseño).

- **Pantalla de partida**: la página de la aplicación, con el fondo, la cabecera y el tablero.
- **Cartel de turno**: cartel de madera de la cabecera, pintado del color del jugador en turno, con el estado actual de la partida.
- **Instrucción**: parte del cartel que dice qué hay que hacer ahora: tirar, elegir una ficha o usar el premio.
- **Línea de última jugada**: frase bajo el cartel que resume los eventos de la última acción, en el orden en que ocurrieron.
- **Ficha resaltada**: ficha con un movimiento legal, marcada con un halo.
- **Ficha atenuada**: ficha sin movimiento legal mientras hay que elegir ficha.
- **Ficha seleccionada**: ficha resaltada que el jugador ha tocado; crece y muestra su réplica.
- **Réplica**: copia transparente de la ficha seleccionada en la casilla de destino de su movimiento.
- **Indicador de destino**: marca junto a la réplica: diana «+20» si el movimiento come, sol «+10» si llega a meta y marca de pareja si forma barrera o comparte seguro.
- **Previsualización de pareja**: mientras dura la selección, la ficha que ya ocupa el destino se coloca en su lado del tablón y la réplica en el otro, como quedarán tras mover.
- **Área táctil**: zona que responde al toque de una ficha resaltada o de una réplica, mayor que el dibujo.
- **Generador de tiradas**: fuente de los valores del dado, separada del motor y sustituible.

## 6. Historias de usuario

### HU-01: Ver la pantalla de partida (P1)

**Como** jugador, **quiero** ver el fondo de jungla, la cabecera y el tablero al abrir la aplicación, **para** saber que empieza una partida y quién tira primero.

**Criterios de aceptación**

1. **Dado** una pantalla de móvil o de escritorio, **cuando** abro la aplicación, **entonces** veo el fondo de jungla repetido, la cabecera y el tablero entero, sin scroll.
2. **Dado** la imagen del fondo todavía sin cargar, **cuando** se pinta la página, **entonces** se ve el color de carga de la paleta.
3. **Dado** una partida nueva, **cuando** se muestra, **entonces** el cartel es amarillo, indica la tirada inicial y pide a amarillo que tire (R-010).

### HU-02: Decidir quién empieza con el dado (P1)

**Como** jugador, **quiero** tirar el mismo dado de la partida para decidir quién empieza, **para** que el primer turno no lo elija nadie a dedo.

**Criterios de aceptación**

1. **Dado** la fase de tirada inicial con turno de azul, **cuando** se muestra, **entonces** el dado late en azul y el cartel es azul.
2. **Dado** la fase de tirada inicial, **cuando** los cuatro sacan 3, 5, 2 y 1, **entonces** el cartel pasa a azul con la instrucción de tirar (R-010).
3. **Dado** la fase de tirada inicial, **cuando** amarillo y rojo empatan con el valor más alto, **entonces** el cartel pide a amarillo que tire de nuevo y solo tiran amarillo y rojo (R-010).

### HU-03: Tirar el dado en mi turno (P1)

**Como** jugador, **quiero** tocar el dado y ver qué sale, **para** saber cuántas casillas puedo mover.

**Criterios de aceptación**

1. **Dado** mi turno sin tirada pendiente, **cuando** toco el dado, **entonces** gira medio segundo y muestra la cara del valor que da el generador de tiradas.
2. **Dado** el sistema con movimiento reducido activado, **cuando** toco el dado, **entonces** muestra la cara resultante sin girar.
3. **Dado** una tirada con movimientos legales, **cuando** termina el giro, **entonces** la cara sigue visible, el dado deja de latir y el cartel muestra el valor y la instrucción de elegir ficha.
4. **Dado** una ficha por elegir, un premio pendiente o el dado girando, **cuando** toco el dado, **entonces** no pasa nada.

### HU-04: Elegir y mover una ficha (P1)

**Como** jugador, **quiero** ver qué fichas puedo mover, elegir una y confirmarla, **para** mover sin equivocarme.

**Criterios de aceptación**

1. **Dado** una tirada con movimientos legales, **cuando** termina el giro, **entonces** las fichas de esos movimientos tienen halo y todas las demás, también las de casa sin movimiento, se ven atenuadas.
2. **Dado** una ficha resaltada, **cuando** la toco, **entonces** crece y aparece su réplica transparente en la casilla de destino.
3. **Dado** una ficha seleccionada, **cuando** toco su réplica en el destino, **entonces** la ficha se mueve al destino y desaparecen el halo, la réplica y la atenuación.
4. **Dado** una ficha seleccionada, **cuando** toco otra ficha resaltada, **entonces** la selección pasa a la nueva ficha, con su réplica.
5. **Dado** una ficha seleccionada, **cuando** la toco de nuevo o toco fuera de las fichas resaltadas y de la réplica, **entonces** la selección se cancela, la réplica desaparece y las fichas resaltadas siguen resaltadas.
6. **Dado** un único movimiento legal, **cuando** termina el giro, **entonces** hay que seleccionar la ficha y confirmar igual que con varios.
7. **Dado** un móvil de 320 px de ancho, **cuando** toco en cualquier punto del tablón de una ficha resaltada, **entonces** la ficha se selecciona.

### HU-05: Ver qué pasará antes de confirmar (P1)

**Como** jugador, **quiero** ver en el destino si voy a comer, llegar a meta o formar pareja, **para** decidir con toda la información.

**Criterios de aceptación**

1. **Dado** un movimiento legal que come, **cuando** selecciono su ficha, **entonces** junto a la réplica aparece la diana con «+20» (R-050, R-051).
2. **Dado** un movimiento legal que termina en meta, **cuando** selecciono su ficha, **entonces** en la meta aparece el sol con «+10» (R-070, R-072).
3. **Dado** un movimiento legal que termina junto a otra ficha propia o junto a una rival en un seguro, **cuando** selecciono su ficha, **entonces** la ficha que ya estaba se coloca en su lado de la pareja, la réplica en el otro y aparece la marca de pareja (R-052, R-060).
4. **Dado** esa previsualización de pareja con la ficha que ya estaba resaltada, **cuando** la toco, **entonces** la selección pasa a ella, vuelve al centro de su casilla porque ya no hay réplica llegando y aparece su propia réplica en su destino.
5. **Dado** esa previsualización de pareja, **cuando** toco la réplica, **entonces** la ficha seleccionada se mueve y queda en pareja con la otra.
4. **Dado** una salida de casa con un 5 sobre una rival en la casilla de salida, **cuando** selecciono la ficha, **entonces** la réplica está en la casilla de salida con la diana «+20» (R-023).

### HU-06: Usar un premio (P1)

**Como** jugador, **quiero** usar el premio con el mismo gesto que una tirada, **para** no tener que aprender otro flujo.

**Criterios de aceptación**

1. **Dado** que acabo de comer, **cuando** se aplica el movimiento, **entonces** el cartel pide usar el +20, las fichas que pueden moverse 20 casillas quedan resaltadas y el dado no responde (R-051).
2. **Dado** un premio pendiente, **cuando** selecciono y confirmo una ficha, **entonces** avanza las casillas del premio y, si no gano otro, el cartel vuelve a pedir tirar o pasa al siguiente jugador.
3. **Dado** un premio que al usarse gana otro, **cuando** se aplica, **entonces** el cartel pide usar el nuevo premio antes de tirar (R-081).

### HU-07: Saber qué pasó en la última jugada (P2)

**Como** jugador, **quiero** leer qué ha pasado en la última acción, **para** entender por qué cambió el turno o volvió una ficha a casa.

**Criterios de aceptación**

1. **Dado** una tirada sin movimientos legales, **cuando** termina el giro, **entonces** la línea de última jugada dice que el jugador perdió la tirada y el cartel pasa al siguiente jugador (R-012).
2. **Dado** un 6, **cuando** se mueve la ficha, **entonces** la línea dice que el jugador repite y el cartel le pide tirar otra vez (R-030).
3. **Dado** un tercer 6 seguido, **cuando** termina el giro, **entonces** la línea dice, en una sola frase, que son tres seises, qué ficha vuelve a casa si vuelve alguna y quién juega ahora (R-032).
4. **Dado** un movimiento que come, **cuando** se aplica, **entonces** la línea dice qué ficha comió a cuál y que se cuenta 20.
5. **Dado** cualquier acción nueva, **cuando** se aplica, **entonces** su frase sustituye a la anterior, sin temporizadores.

### HU-08: Ver al ganador (P1)

**Como** jugador, **quiero** que la pantalla diga quién ha ganado, **para** saber que la partida ha terminado.

**Criterios de aceptación**

1. **Dado** la cuarta ficha roja que llega a meta, **cuando** se aplica el movimiento, **entonces** el cartel dice «Gana Rojo» en rojo (R-090).
2. **Dado** una partida terminada, **cuando** toco el dado o una ficha, **entonces** no pasa nada: el dado no late, ninguna ficha se resalta y el tablero conserva la posición final.

### HU-09: Comprobar partidas reales en navegador (P2)

**Como** desarrollador, **quiero** jugar partidas en navegador real con el dado controlado desde el test, **para** comprobar el flujo completo sin código de pruebas en la aplicación.

**Criterios de aceptación**

1. **Dado** un test que fija los valores del dado antes de cargar la página, **cuando** toca el dado, **entonces** sale el valor fijado.
2. **Dado** la aplicación, **cuando** se revisa su código, **entonces** no lee parámetros de la URL ni tiene ramas solo para tests.
3. **Dado** un pull request, **cuando** corre el CI, **entonces** las pruebas de partidas se ejecutan y su fallo hace fallar el CI.

## 7. Requisitos funcionales

- **RF-001**: La pantalla de partida debe mostrar el fondo de jungla como loseta repetible, con una versión para pantallas estrechas y otra para anchas, y con el color de carga de la paleta mientras la imagen no ha cargado.
- **RF-002**: La pantalla de partida debe mostrar la cabecera encima del tablero de SPEC 005, y ambos deben caber sin scroll.
- **RF-003**: El cartel de turno debe pintarse del color del jugador en turno, con un círculo de su color y el texto del estado actual, según el patrón de cartel de madera del diseño.
- **RF-004**: El cartel de turno debe derivar su texto solo del estado del motor: en la fase de tirada inicial, que es la tirada inicial y quién tira; en partida, de quién es el turno, el valor del dado si hay tirada pendiente y la instrucción (tirar, elegir una ficha o usar el premio con su valor); con ganador, quién ha ganado.
- **RF-005**: La línea de última jugada debe resumir en una sola frase todos los eventos de la última acción, en el orden en que el motor los produjo, y sustituirse al aplicar la siguiente acción; antes de la primera acción está vacía.
- **RF-006**: Cada tipo de evento del motor debe tener su texto en la línea de última jugada: tirada inicial, empate, primer jugador, salida de casa, avance, comer, llegada a meta, premio ganado, premio perdido, tirada perdida, repetir, tres seises, cambio de turno y fin de la partida.
- **RF-007**: El dado debe pintarse sobre el tronco del centro del tablero con las caras del diseño de referencia y mostrar en todo momento la cara de la última tirada; antes de la primera, una cara fija.
- **RF-008**: Cuando el jugador en turno debe tirar, el dado debe latir en el color de ese jugador y responder al toque; en cualquier otro momento no late y no responde.
- **RF-009**: Al tocar el dado, el sistema debe pedir un valor al generador de tiradas, hacer girar el dado medio segundo, mostrar la cara del valor y aplicar después la tirada al motor; durante el giro no se acepta ningún otro toque.
- **RF-010**: Las tiradas deben generarse fuera del motor, con un generador de tiradas que da valores del 1 al 6 y que se puede sustituir sin cambiar el resto de la aplicación (P-04).
- **RF-011**: En la fase de tirada inicial el dado debe funcionar igual que en partida, aplicando tiradas iniciales al motor, incluidas las rondas de desempate.
- **RF-012**: Cuando hay que elegir ficha, el sistema debe resaltar con halo exactamente las fichas de los movimientos legales del motor y atenuar todas las demás.
- **RF-013**: Al tocar una ficha resaltada, el sistema debe seleccionarla: la ficha crece y aparece su réplica transparente en la casilla de destino de su movimiento legal.
- **RF-014**: Junto a la réplica, el sistema debe mostrar la diana «+20» si el movimiento legal come, el sol «+10» si su destino es la meta y la marca de pareja si en el destino ya hay una ficha que no se come, con lo que se forma barrera o se comparte seguro.
- **RF-015**: Si el destino de la ficha seleccionada ya tiene una ficha que no se come, mientras dure la selección esa ficha debe pintarse en su lado de la pareja y la réplica en el otro, con el orden de llegada de SPEC 005: la que ya estaba, primero. Al cancelar o cambiar la selección, esa ficha vuelve al centro de su casilla.
- **RF-016**: Con una ficha seleccionada, tocar su réplica debe aplicar su movimiento al motor; tocar de nuevo la ficha seleccionada debe cancelar la selección; tocar otra ficha resaltada debe pasar la selección a esa ficha; tocar en cualquier otro punto debe cancelar la selección. Cancelar no cambia los resaltados.
- **RF-017**: El sistema debe pedir seleccionar y confirmar también cuando solo hay un movimiento legal.
- **RF-018**: El área táctil de cada ficha resaltada debe cubrir al menos el tablón de su casilla; si dos fichas comparten casilla, también la ficha que ya estaba y la réplica de una previsualización de pareja, cada una cubre la mitad del tablón de su lado. El área táctil de una réplica sola debe cubrir al menos su casilla de destino.
- **RF-019**: Con un premio pendiente, el sistema debe usar el mismo flujo de resaltado, selección y confirmación, con las fichas de los movimientos legales del premio, y el dado no debe responder hasta que el premio se use o se pierda.
- **RF-020**: Con la partida terminada, el cartel debe mostrar al ganador en su color, y el dado y las fichas no deben responder ni resaltarse.
- **RF-021**: El estado de la partida debe vivir en un único almacén de la aplicación, que crea la partida de 4 jugadores con el motor, aplica cada acción con él y expone el estado, los movimientos legales y los eventos de la última acción a la pantalla.
- **RF-022**: Si el motor rechaza una acción, el estado no debe cambiar y la pantalla debe seguir mostrando el estado anterior.
- **RF-023**: Debe haber pruebas en navegador real que, sustituyendo el generador aleatorio del navegador antes de cargar la página, jueguen estos escenarios: salir con un 5, mover, cambiar la selección, cancelarla y confirmar tocando la réplica, empezando con una tirada inicial con empate; comer, no poder tirar con el premio pendiente y usarlo; y tirada perdida, repetir con un 6 y tres seises, con su línea de última jugada.
- **RF-024**: La aplicación no debe leer parámetros de la URL ni contener código que solo sirva para las pruebas.

## 8. Requisitos no funcionales

- **RNF-001**: El texto del cartel de turno y de la línea de última jugada tiene un contraste de al menos 4,5:1 con su fondo inmediato, con el cartel de cada uno de los cuatro colores (WCAG 1.4.3, P-15).
- **RNF-002**: Con movimiento reducido activado en el sistema, el dado no gira y ni el dado ni los halos laten; el estado se reconoce igual sin movimiento.
- **RNF-003**: Desde que se toca el dado hasta que se ve la cara final y los resaltados pasan como máximo 0,6 s, y la pantalla responde a cada toque en menos de 100 ms.
- **RNF-004**: La pantalla de partida cabe entera, sin scroll, en ventanas de 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080.
- **RNF-005**: Ningún archivo de la aplicación decide reglas del juego: resaltados, indicadores de destino, instrucciones y frases salen de los movimientos legales, del estado y de los eventos del motor (P-05).
- **RNF-006**: El motor no cambia y la aplicación solo lo usa a través de su puerta de entrada (P-01, P-02).
- **RNF-007**: El color de carga del fondo y los colores de la cabecera, el dado, los halos y los indicadores son tokens de la paleta; en la aplicación no hay colores en hexadecimal.
- **RNF-008**: No se añade ninguna dependencia nueva salvo que se justifique en el plan de la parte que la necesite (P-17).
- **RNF-009**: Las imágenes del fondo se sirven en formato ligero con respaldo para navegadores que no lo admiten, y la fuente vectorial pesada del diseño no se usa.

## 9. Entidades clave

- **Partida**: el estado del motor, con jugadores, fichas, turno, tirada y premio pendientes, ganador y fase de tirada inicial.
- **Última jugada**: lista de eventos que produjo la última acción aplicada.
- **Selección**: la ficha resaltada que ha tocado el jugador, con su movimiento legal; no existe en el motor.
- **Tirada**: valor del 1 al 6 que da el generador de tiradas.

## 10. Casos límite

- Tirada sin movimientos legales → se ve la cara, la línea dice que la tirada se pierde y el cartel pasa al siguiente jugador sin pedir nada más (R-012).
- 6 sin movimientos legales → la tirada se pierde y el mismo jugador vuelve a tirar (R-030).
- Tercer 6 seguido → no se resalta nada; la línea lo cuenta y el turno pasa (R-032).
- Premio que ninguna ficha puede usar → el motor lo da por perdido, la línea lo dice y el juego sigue sin pedir selección (R-080).
- Con un 5 y varias fichas en casa → solo se resalta la ficha de casa que da el motor; las demás de casa se ven atenuadas (R-020, R-021).
- Dos fichas propias en la misma casilla, ambas resaltadas → cada una responde en su mitad del tablón.
- Previsualización de pareja sobre una ficha no resaltada (rival en un seguro o propia sin movimiento) → tocar su mitad cuenta como tocar fuera y cancela la selección.
- Movimiento con rebote → la réplica está en la casilla final tras el rebote (R-071).
- Movimiento que llega a meta y come a la vez → no puede darse: la meta no tiene rivales.
- Toque en una ficha atenuada o en el fondo con una ficha seleccionada → cancela la selección.
- Toque en el dado mientras gira o en el tablero con la partida terminada → no tiene efecto.
- Recargar la página → empieza una partida nueva, sin aviso.
- Acción rechazada por el motor → el estado no cambia y no hay frase nueva.
- Pantalla apaisada y baja → la cabecera y el tablero se reducen hasta caber.

## 11. Criterios de éxito

- **CE-01**: Las pruebas en navegador de los tres escenarios de RF-023 pasan en local y en el CI, con el dado controlado solo desde los tests.
- **CE-02**: Ningún archivo de la aplicación lee parámetros de la URL ni contiene código usado solo por las pruebas.
- **CE-03**: Los tests de componente comprueban, con estados construidos, que las fichas resaltadas coinciden con los movimientos legales del motor y que cada indicador de destino aparece solo cuando su movimiento legal lo justifica.
- **CE-04**: Cada tipo de evento del motor tiene un test que comprueba su texto en la línea de última jugada.
- **CE-05**: Un test de componente comprueba, con un estado con ganador, el cartel de ganador y que el dado y las fichas no responden.
- **CE-06**: El contraste medido del texto del cartel y de la línea de última jugada es de al menos 4,5:1 con los cuatro colores.
- **CE-07**: A 320 px de ancho, el área táctil de cada ficha resaltada cubre al menos su tablón, medida en un test.
- **CE-08**: La pantalla se ve entera sin scroll en las cuatro ventanas de RNF-004.
- **CE-09**: `pnpm check` y las pruebas en navegador pasan sin cambios en el motor.

## 12. Supuestos y dependencias

- Depende del motor de SPEC 001 a SPEC 004 (estado, movimientos legales, acciones y eventos) y del tablero de SPEC 005.
- La partida es siempre de 4 jugadores, en el orden y la orientación del tablero de SPEC 005.
- La cara que se ve antes de la primera tirada es fija y la elige el plan.
- El área táctil de una ficha resaltada en casa es al menos del tamaño de un tablón, centrada en su puesto.
- La marca de pareja y la previsualización de pareja solo dependen de que el destino ya tenga una ficha que el movimiento no come: el motor no permite terminar en una casilla con 2 (R-041).
- Los textos exactos del cartel y de la línea de última jugada se fijan en el plan, en castellano y con los nombres de los colores.
- Las imágenes de producción del fondo y las caras del dado en vectorial se copian de `docs/design` a la aplicación.
- La comprobación de contraste es una medición de los colores usados, como en SPEC 005.

## 13. Decisiones tomadas y descartadas

- **Sí:** separar estado y eventos. El cartel muestra siempre el estado actual derivado del motor, y la línea de última jugada resume los eventos de la última acción. Nunca se pierde un evento ni se tapa el tablero.
- **No:** un único aviso por prioridad, cola de avisos o cartel flotante sobre el tablero. El primero oculta eventos; la cola necesita temporizadores; el flotante tapa fichas.
- **Sí:** la línea de última jugada se sustituye con la siguiente acción, sin temporizadores. Se lee con calma y su contenido es predecible en las pruebas.
- **Sí:** seleccionar y confirmar también con un solo movimiento legal. Flujo predecible y el jugador ve el destino antes de mover.
- **Sí:** se confirma solo tocando la réplica en el destino, y tocar de nuevo la ficha seleccionada la deselecciona. El gesto de mover apunta a donde va la ficha, y un doble toque accidental no mueve.
- **No:** confirmar tocando otra vez la ficha seleccionada. Un doble toque sin querer movería sin haber mirado el destino.
- **No:** selección automática ni mover solo con un único movimiento. Rompen el flujo; mover solo queda para otro spec.
- **Sí:** área táctil de al menos el tablón y, en una pareja resaltada, la mitad de cada lado. En móvil la ficha mide unos 9 px, y las dos de una pareja se pueden tocar sin ambigüedad.
- **No:** tocar el tablón para alternar entre las dos fichas de una pareja. Choca con «tocar la ficha de nuevo cancela la selección».
- **Sí:** con ganador, cartel en su color y todo quieto; para jugar otra, se recarga. La pantalla final y la nueva partida son otro spec.
- **No:** botón de otra partida. Roza la nueva partida, fuera de alcance.
- **Sí:** el dado lo genera la aplicación con un generador sustituible. El motor no genera azar (P-04) y las pruebas pueden fijar los valores.
- **Sí:** las pruebas en navegador fijan el dado sustituyendo el generador aleatorio del navegador antes de cargar la página. Sin parámetros de URL ni código solo para tests en la aplicación.
- **Sí:** tres escenarios de pruebas en navegador, con la tirada inicial con empate al principio del de mover. Cubren el flujo sin un test aparte para la tirada inicial.
- **No:** llegar al ganador en una prueba en navegador. Exigiría una partida entera; el ganador se prueba con tests de componente sobre estados construidos.
- **Sí:** tres partes: pantalla y dado, mover y premios, última jugada y pruebas en navegador. Cada una se entrega y prueba sola.
- **Sí:** estado en un único almacén que aplica las acciones con el motor. Una sola fuente de verdad para toda la pantalla.

## 14. Riesgos

| Riesgo                                                                  | Mitigación                                                                                     |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Texto blanco sobre el cartel amarillo sin contraste AA                  | Medir los cuatro colores y ajustar el texto o su contorno lo mínimo (RNF-001)                   |
| Áreas táctiles de fichas vecinas que se solapan                         | Repartir el tablón en las parejas y medir a 320 px (RF-018, CE-07)                             |
| Pruebas en navegador frágiles por el giro del dado                      | Esperar a la cara final y a los resaltados; las pruebas pueden activar el movimiento reducido |
| Frases de varios eventos demasiado largas en móvil                      | Textos cortos fijados en el plan y revisión visual a 320 px                                    |
| Lógica de reglas que se cuela en la interfaz al montar los indicadores | Indicadores solo a partir del movimiento legal y del estado del motor (RNF-005, CE-03)         |

## 15. Partes / incrementos

### PARTE-01: Pantalla, dado y tirada inicial

- **Objetivo**: mostrar la pantalla de partida y poder tirar el dado, incluida la tirada inicial.
- **Alcance**: fondo de jungla, cabecera con el cartel de turno y su instrucción, almacén de la partida, generador de tiradas, dado con latido, giro y cara final, y tirada inicial con desempate.
- **Cubre**: HU-01, HU-02, HU-03 · RF-001, RF-002, RF-003, RF-004, RF-007, RF-008, RF-009, RF-010, RF-011, RF-021, RF-022 · RNF-001, RNF-002, RNF-003, RNF-004, RNF-007, RNF-009
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-01, HU-02 y HU-03, y una partida pasa de la tirada inicial a la primera tirada de un jugador con el cartel correcto.

### PARTE-02: Mover fichas y premios

- **Objetivo**: elegir, previsualizar y confirmar movimientos y premios.
- **Alcance**: halo y atenuación, selección con réplica, indicadores de destino, confirmación, cambio y cancelación de selección, áreas táctiles, premios con el mismo flujo y cartel de ganador con la partida detenida.
- **Cubre**: HU-04, HU-05, HU-06, HU-08 · RF-012, RF-013, RF-014, RF-015, RF-016, RF-017, RF-018, RF-019, RF-020 · RNF-002, RNF-003
- **Depende de**: PARTE-01
- **Hecho cuando**: se cumplen los criterios de HU-04, HU-05, HU-06 y HU-08, CE-03, CE-05 y CE-07.

### PARTE-03: Última jugada y pruebas en navegador

- **Objetivo**: contar qué pasó en cada acción y comprobar partidas reales en navegador.
- **Alcance**: línea de última jugada con un texto por tipo de evento, y pruebas en navegador de los tres escenarios con el dado controlado.
- **Cubre**: HU-07, HU-09 · RF-005, RF-006, RF-023, RF-024 · RNF-001, RNF-004
- **Depende de**: PARTE-02
- **Hecho cuando**: se cumplen los criterios de HU-07 y HU-09, CE-01, CE-02, CE-04, CE-06, CE-08 y CE-09.

**Transversales**: RNF-005, RNF-006, RNF-008
**Orden sugerido**: PARTE-01 → PARTE-02 → PARTE-03

## 16. Preguntas abiertas

- ¿Se añade una comprobación AXE automática a las pruebas en navegador? Sigue pendiente desde SPEC 005: las instrucciones del proyecto exigen pasar AXE, pero requiere una dependencia más (P-17).
- ¿Las pruebas en navegador activan el movimiento reducido para no esperar al giro? Acelera y estabiliza las pruebas, pero deja el giro sin cubrir en navegador real; se decide en el plan de PARTE-03.

## 17. Qué NO entra en este spec

- Elegir el número de jugadores: siempre son 4.
- Pantalla final y nueva partida.
- Jugadores controlados por la máquina.
- Animaciones de movimiento de las fichas.
- Sonido.
- Accesibilidad completa con teclado y lector de pantalla (spec de accesibilidad).
- Variante «suave» del diseño.
- Guardar la partida.
- Cambios en el motor.
- Mover sin confirmar cuando solo hay un movimiento legal.

Cada uno de estos, si llega, irá en su propio spec.
