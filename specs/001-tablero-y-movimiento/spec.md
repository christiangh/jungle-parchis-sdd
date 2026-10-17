# SPEC 001 — Tablero y movimiento básico

> **Estado:** Implementado
> **Depende de:** —
> **Fecha:** 2026-10-17
> **Autor:** Christian Garcia
> **Objetivo:** Que el motor de reglas permita jugar una partida completa de parchís con salida, avance, pasillo, meta y turnos, sin comer, barreras, seises especiales ni premios.

## 1. Resumen

Primer spec del motor de reglas: modela el tablero, crea partidas de 2 a 4 jugadores y resuelve tiradas y movimientos hasta que un jugador mete sus 4 fichas en meta. Deja fuera comer, barreras, el seis y los premios, que llegarán en specs propios. Aporta una base jugable de principio a fin, probada regla a regla y con invariantes globales, sobre la que añadir el resto del reglamento.

## 2. Contexto y problema

El proyecto tiene constitución y reglamento, pero ningún código de juego. Sin un motor que represente el tablero y resuelva movimientos no se puede construir la interfaz ni añadir reglas avanzadas. Empezar por el subconjunto mínimo jugable permite fijar el modelo del tablero, el flujo de turnos y los tests de propiedades (P-08) antes de que el reglamento completo complique el diseño.

## 3. Objetivos y alcance

### Objetivos

- Poder simular una partida completa, de la creación al ganador, solo con acciones enviadas al motor.
- Tener un test con su identificador por cada regla del reglamento que entra en este spec.
- Dejar en marcha los tests de propiedades de los invariantes, para que los specs siguientes los amplíen.

### Entra

- Tablero: recorrido común, casas, casillas de salida, seguros, entradas, pasillos y metas (R-001 a R-009).
- Creación de partida con 2 a 4 colores distintos y jugador inicial indicado.
- Salida de casa con 5, salida obligatoria y salida bloqueada (R-020, R-021, R-022).
- Avance por el recorrido común y el pasillo, una ficha por tirada y número exacto de casillas (R-011, R-012, R-013, R-040, R-041).
- Llegada a meta y rebote simple (R-070, R-071).
- Turnos con rotación simple en el orden amarillo, azul, rojo, verde, saltando los colores ausentes.
- Cálculo de los movimientos legales para una tirada.
- Fin de partida y rechazo de acciones posteriores (R-090, I-06).
- Tests de propiedades de los invariantes I-01 a I-06 sobre partidas aleatorias.

### Fuera de alcance (para specs futuros)

- Interfaz Angular: tablero visual, interacción con teclado o ratón y accesibilidad.
- Tirada inicial para decidir quién empieza (R-010).
- Comer y sus premios (R-023, R-050, R-051, R-052).
- Barreras (R-042, R-060, R-061, R-062, R-063).
- El seis: repetir tirada, seis vale siete y tres seises (R-030, R-031, R-032).
- Premios por comer o llegar a meta y su encadenamiento (R-051, R-072, R-080, R-081).
- Rebote múltiple (solo alcanzable con premios).
- Guardado de partidas en el navegador.

## 4. Usuarios y actores

- **Jugador**: participa con un color, tira el dado y elige qué ficha mover entre las legales.
- **Capa de presentación**: consumidor futuro del motor; crea la partida, consulta el estado y los movimientos legales, y envía las acciones del jugador.

## 5. Glosario

- **Recorrido común**: las 68 casillas numeradas que comparten todos los colores (R-003).
- **Casa**: lugar fuera del tablero donde empiezan las fichas de un color (R-004).
- **Casilla de salida**: casilla del recorrido común donde entra una ficha al salir de casa (R-005).
- **Casilla de entrada**: última casilla del recorrido común de un color antes de su pasillo (R-008).
- **Pasillo**: las 7 casillas propias de un color entre su casilla de entrada y su meta (R-007).
- **Meta**: casilla final de un color, situada a continuación de la séptima casilla de su pasillo, sin límite de fichas.
- **Tirada**: valor del dado, de 1 a 6, que llega al motor desde fuera (P-04).
- **Movimiento legal**: movimiento de una ficha concreta permitido por las reglas para una tirada.
- **Acción**: petición enviada al motor (crear partida, tirar o mover) que produce un estado nuevo y una lista de eventos.
- **Evento**: hecho producido por una acción, como que una ficha sale, avanza, llega a meta, se pierde una tirada, cambia el turno o termina la partida.

## 6. Historias de usuario

### HU-01: Crear una partida (P1)

**Como** capa de presentación, **quiero** crear una partida eligiendo los colores participantes y el jugador inicial, **para** empezar a jugar desde un estado válido.

**Criterios de aceptación**

1. **Dado** los colores amarillo y rojo con amarillo como inicial, **cuando** creo la partida, **entonces** hay 2 jugadores con sus 4 fichas en casa y el turno es de amarillo.
2. **Dado** un solo color o un color repetido, **cuando** intento crear la partida, **entonces** se rechaza indicando el motivo.
3. **Dado** los colores azul y verde con rojo como inicial, **cuando** intento crear la partida, **entonces** se rechaza porque rojo no participa.

### HU-02: Sacar una ficha de casa (P1)

**Como** jugador, **quiero** sacar una ficha de casa al sacar un 5, **para** empezar a recorrer el tablero.

**Criterios de aceptación**

1. **Dado** amarillo con sus 4 fichas en casa, **cuando** saca un 5, **entonces** el único movimiento legal es sacar una ficha a la casilla 5.
2. **Dado** amarillo con todas sus fichas en casa, **cuando** saca un 3, **entonces** no tiene movimientos legales.
3. **Dado** amarillo con fichas en casa, una ficha en la casilla 20 y la casilla 5 libre, **cuando** saca un 5, **entonces** solo puede sacar ficha, no avanzar la de la 20 (R-021).
4. **Dado** amarillo con 2 fichas propias en la casilla 5 y fichas en casa, **cuando** saca un 5, **entonces** no puede sacar ficha y sí puede mover 5 casillas otra ficha (R-022).

### HU-03: Avanzar una ficha (P1)

**Como** jugador, **quiero** mover una ficha exactamente el número de casillas de la tirada, **para** acercarla a mi meta.

**Criterios de aceptación**

1. **Dado** una ficha verde en la casilla 66, **cuando** mueve 5, **entonces** termina en la casilla 3.
2. **Dado** una ficha amarilla en la casilla 66, **cuando** mueve 4, **entonces** termina en la segunda casilla de su pasillo.
3. **Dado** una ficha azul en la casilla 66, **cuando** mueve 4, **entonces** termina en la casilla 2, porque la 68 no es su entrada.
4. **Dado** una casilla de destino con 2 fichas, **cuando** se calcula ese movimiento, **entonces** no es legal (R-041).

### HU-04: Llegar a meta (P1)

**Como** jugador, **quiero** que mis fichas lleguen a meta con la cuenta exacta o rebotando, **para** completar el recorrido.

**Criterios de aceptación**

1. **Dado** una ficha amarilla en la quinta casilla de su pasillo, **cuando** mueve 3, **entonces** llega a meta y no vuelve a moverse.
2. **Dado** una ficha amarilla en la quinta casilla de su pasillo, **cuando** mueve 6, **entonces** avanza hasta la meta, retrocede 3 y termina en la quinta casilla.
3. **Dado** que el rebote terminaría en una casilla del pasillo con 2 fichas, **cuando** se calcula ese movimiento, **entonces** no es legal.

### HU-05: Jugar un turno (P1)

**Como** jugador, **quiero** tirar y mover una ficha legal en mi turno, **para** que la partida avance de forma ordenada.

**Criterios de aceptación**

1. **Dado** el turno de amarillo y una tirada con movimientos legales, **cuando** mueve una de esas fichas, **entonces** el turno pasa al siguiente color participante.
2. **Dado** el turno de amarillo y una tirada sin movimientos legales, **cuando** se registra la tirada, **entonces** pierde la tirada y el turno pasa al siguiente color (R-012).
3. **Dado** una partida de amarillo y rojo con turno de rojo, **cuando** rojo termina su turno, **entonces** el turno es de amarillo.
4. **Dado** el turno de amarillo, **cuando** azul intenta tirar o mover, **entonces** la acción se rechaza y el estado no cambia.
5. **Dado** una tirada pendiente de mover, **cuando** el jugador intenta tirar otra vez o mover una ficha no legal, **entonces** la acción se rechaza.

### HU-06: Consultar movimientos legales (P1)

**Como** capa de presentación, **quiero** conocer los movimientos legales de la tirada actual, **para** ofrecer al jugador solo opciones válidas.

**Criterios de aceptación**

1. **Dado** una tirada pendiente, **cuando** consulto los movimientos legales, **entonces** obtengo cada ficha que puede moverse con su casilla de destino.
2. **Dado** una ficha en meta, **cuando** consulto los movimientos legales, **entonces** esa ficha nunca aparece.

### HU-07: Ganar la partida (P2)

**Como** jugador, **quiero** que la partida termine cuando meto mis 4 fichas en meta, **para** saber quién ha ganado.

**Criterios de aceptación**

1. **Dado** amarillo con 3 fichas en meta, **cuando** mete la cuarta, **entonces** la partida termina con amarillo como ganador.
2. **Dado** una partida terminada, **cuando** se envía cualquier acción, **entonces** se rechaza y el estado no cambia (I-06).

## 7. Requisitos funcionales

- **RF-001**: El sistema debe permitir crear una partida con 2 a 4 colores distintos de entre amarillo, azul, rojo y verde, y rechazar cualquier otra combinación (R-001).
- **RF-002**: El sistema debe exigir al crear la partida un jugador inicial que participe en ella, y rechazar la creación si no participa (I-05).
- **RF-003**: El sistema debe empezar cada partida con las 4 fichas de cada jugador en su casa (R-004).
- **RF-004**: El sistema debe representar el recorrido común de 68 casillas en el que la 68 va seguida de la 1, las casillas de salida, los seguros, las casillas de entrada y, por color, un pasillo de 7 casillas seguido de su meta (R-003, R-005, R-006, R-007, R-008).
- **RF-005**: El sistema debe devolver, para el jugador en turno y su tirada, la lista de movimientos legales con la ficha y la casilla de destino de cada uno.
- **RF-006**: El sistema debe permitir sacar una ficha de casa solo con un 5, colocándola en la casilla de salida de su color (R-020).
- **RF-007**: El sistema debe considerar legales únicamente las salidas de casa cuando la tirada es un 5, el jugador tiene fichas en casa y su casilla de salida lo permite (R-021).
- **RF-008**: El sistema debe impedir la salida de casa cuando la casilla de salida ya tiene 2 fichas, sean del color que sean (R-022, R-041). Provisional: con fichas rivales en la salida, el spec de comer lo sustituirá por salir comiendo (R-023).
- **RF-009**: El sistema debe mover la ficha elegida exactamente el número de casillas de la tirada, siempre hacia delante (R-013, R-040).
- **RF-010**: El sistema debe llevar a una ficha desde su casilla de entrada a la primera casilla de su pasillo, y a las fichas de otros colores a la siguiente casilla del recorrido común (R-007, R-008).
- **RF-011**: El sistema debe impedir que un movimiento termine en una casilla del recorrido común o del pasillo que ya tiene 2 fichas (R-009, R-041).
- **RF-012**: El sistema debe permitir que una ficha atraviese casillas con 2 fichas mientras las barreras no estén implementadas. Provisional: lo sustituirá el spec de barreras (R-042, R-061).
- **RF-013**: El sistema debe permitir que una ficha termine en una casilla del recorrido común con una sola ficha rival, quedando ambas en ella, mientras comer no esté implementado. Provisional: lo sustituirá el spec de comer (R-050).
- **RF-014**: El sistema debe considerar que una ficha llega a meta solo cuando termina su movimiento justo en ella, y no volver a moverla después (R-070).
- **RF-015**: El sistema debe aplicar el rebote cuando a una ficha le sobran casillas para llegar a meta: avanza hasta la meta y retrocede por su pasillo las casillas sobrantes (R-071).
- **RF-016**: El sistema debe aceptar una tirada solo del jugador en turno, sin otra tirada pendiente, y con un valor entero de 1 a 6 (R-002, R-011).
- **RF-017**: El sistema debe hacer perder la tirada y pasar el turno cuando la tirada no tiene movimientos legales (R-012).
- **RF-018**: El sistema debe exigir, cuando la tirada tiene movimientos legales, que el jugador en turno mueva una de esas fichas antes de cualquier otra acción (R-012, R-013).
- **RF-019**: El sistema debe pasar el turno, tras cada tirada resuelta, al siguiente color participante en el orden amarillo, azul, rojo, verde, volviendo a amarillo después de verde (R-010).
- **RF-020**: El sistema debe rechazar toda acción inválida sin cambiar el estado e indicar el motivo.
- **RF-021**: El sistema debe devolver, por cada acción aceptada, un estado nuevo y la lista de eventos producidos: ficha sale de casa, ficha avanza, ficha llega a meta, tirada perdida, cambio de turno y fin de partida.
- **RF-022**: El sistema debe terminar la partida y declarar ganador al primer jugador con sus 4 fichas en meta (R-090).
- **RF-023**: El sistema debe rechazar cualquier acción sobre una partida terminada (I-06).

## 8. Requisitos no funcionales

- **RNF-001**: El motor no depende de Angular ni de ninguna otra librería de ejecución, y la frontera la comprueba el lint (P-01, P-02, P-10).
- **RNF-002**: Ninguna acción modifica el estado recibido; siempre se devuelve uno nuevo (P-03).
- **RNF-003**: El motor no genera azar: la misma secuencia de acciones sobre la misma partida inicial produce siempre el mismo estado y los mismos eventos (P-04).
- **RNF-004**: Los invariantes I-01 a I-06 se comprueban con tests de propiedades sobre partidas aleatorias de 2, 3 y 4 jugadores (P-08).
- **RNF-005**: Cada regla del reglamento que entra en este spec tiene al menos un test cuyo nombre incluye su identificador (P-06).

## 9. Entidades clave

- **Partida**: jugadores participantes, posición de todas las fichas, turno actual, tirada pendiente y, si ha terminado, el ganador.
- **Jugador**: un color participante con sus 4 fichas.
- **Ficha**: pieza de un color que está en casa, en una casilla del recorrido común, en una casilla de su pasillo o en meta.
- **Casilla**: posición del tablero; del recorrido común (numerada del 1 al 68), del pasillo de un color o meta.
- **Movimiento legal**: ficha y casilla de destino válidas para una tirada.
- **Evento**: hecho producido por una acción aceptada.

## 10. Casos límite

- Casilla de salida con 1 ficha rival al sacar un 5 → se sale y conviven las dos fichas, sin comer (provisional, RF-013).
- Casilla de salida con 1 ficha propia y 1 rival al sacar un 5 → no se puede salir (2 fichas); vale cualquier otro movimiento de 5 (provisional, RF-008).
- 5 con fichas en casa y salida bloqueada → la salida obligatoria no aplica y son legales los demás movimientos de 5.
- Único movimiento legal → el jugador sigue teniendo que enviar la acción de mover; no se aplica solo.
- Tirada de 6 → cuenta 6 casillas y el turno pasa como con cualquier otro valor.
- Única ficha en juego con su destino ocupado por 2 fichas y el resto en casa sin un 5 o en meta → no hay movimientos legales y pierde la tirada.
- Ficha en la séptima casilla del pasillo con un 6 → avanza 1 a meta y retrocede 5, terminando en la tercera casilla del pasillo.
- Paso por la meta durante un rebote → no cuenta como llegar (R-071).
- Valor de tirada 0, 7, negativo o decimal → la acción se rechaza.
- Acción de mover sin tirada pendiente → se rechaza.
- Partida con 2 jugadores de colores no consecutivos (azul y verde) → el turno alterna solo entre ellos.

## 11. Criterios de éxito

- **CE-01**: Existe al menos un test con su identificador para cada una de R-001 a R-009, R-011, R-012, R-013, R-020, R-021, R-022, R-040, R-041, R-070, R-071 y R-090.
- **CE-02**: Los tests de propiedades simulan al menos 1000 partidas aleatorias de 2, 3 y 4 jugadores sin que ninguna incumpla I-01 a I-06.
- **CE-03**: Una partida aleatoria completa, repetida con la misma secuencia de acciones, produce un estado final y una lista de eventos idénticos.
- **CE-04**: Un test comprueba que, tras cada acción, el estado recibido sigue siendo igual al original.
- **CE-05**: La comprobación completa del proyecto (formato, lint y tests) pasa sin errores.

## 12. Supuestos y dependencias

- El orden de turnos es el de R-010 (amarillo, azul, rojo, verde); la tirada inicial de esa misma regla queda fuera de alcance.
- El jugador inicial lo indica quien crea la partida hasta que exista la tirada inicial (R-010).
- La meta está a 8 pasos de la casilla de entrada: 7 casillas de pasillo y la meta.
- El rebote múltiple de R-071 no se alcanza con un dado de 6 caras sin premios; se probará cuando lleguen los premios.
- Son provisionales el bloqueo de la salida por fichas rivales (RF-008), el paso a través de casillas con 2 fichas (RF-012) y la coexistencia con una ficha rival fuera de seguro (RF-013): los specs de comer y de barreras los sustituirán, revisando sus tests de forma explícita.
- Depende solo de `specs/constitucion.md` y `specs/reglamento.md`.

## 13. Decisiones tomadas y descartadas

- **Sí:** solo motor en este spec. Base testeable antes de la interfaz, que tendrá spec propio.
- **No:** motor más tablero visual o interfaz jugable. Hace el spec demasiado grande.
- **Sí:** salida, avance, pasillo, meta y rebote. Es el mínimo para jugar una partida de principio a fin.
- **No:** barreras, comer, seis y premios en este spec. Cada uno cambia el cálculo de movimientos y merece su propio spec.
- **Sí:** rotación simple de turnos con jugador inicial elegido. Permite jugar sin depender de la tirada inicial.
- **No:** tirada inicial R-010 ahora. Añade desempates sin aportar al movimiento.
- **Sí:** tests de propiedades de los invariantes desde el primer spec. Los specs siguientes los amplían en lugar de montarlos tarde (P-08).
- **Sí:** una ficha que termina sobre una sola rival convive con ella. Mantiene movimientos legales realistas hasta que exista comer.
- **No:** prohibir terminar sobre una ficha rival. Reduce opciones de forma artificial y también cambiaría después.
- **Sí:** meta como casilla aparte tras las 7 del pasillo. Lectura literal de R-007.
- **No:** la séptima casilla del pasillo es la meta. Contradice R-007.
- **Sí:** fin de partida (R-090, I-06). Con meta y rebote ya se puede ganar y cierra el ciclo.
- **Sí:** colores libres con 2 o 3 jugadores. Cualquier combinación es válida según R-001.
- **No:** colores fijos por número de jugadores. El reglamento no lo exige.

## 14. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Las reglas provisionales (RF-008, RF-012, RF-013) se tratan como definitivas y los specs de comer y barreras no las revisan | Los tests de esas reglas lo indican en su nombre y los supuestos de este spec lo dejan escrito |
| Las partidas aleatorias de los tests de propiedades no terminan o tardan demasiado | Limitar el número de acciones por partida simulada y comprobar los invariantes tras cada acción, termine o no |
| El modelo del tablero no admite bien barreras, comer o premios | Revisar el modelo en el plan contra todo el reglamento, aunque solo se implemente este subconjunto |

## 15. Partes / incrementos

### PARTE-01: Tablero y creación de partida

- **Objetivo**: representar el tablero y crear partidas válidas.
- **Alcance**: geometría del tablero, creación de partida y estado inicial.
- **Cubre**: HU-01 · RF-001, RF-002, RF-003, RF-004
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-01 y los tests de R-001 a R-009 pasan.

### PARTE-02: Salida y avance

- **Objetivo**: calcular y aplicar movimientos de salida y avance.
- **Alcance**: movimientos legales, salida con 5, avance por el recorrido común, entrada al pasillo y ocupación máxima.
- **Cubre**: HU-02, HU-03, HU-06 · RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013
- **Depende de**: PARTE-01
- **Hecho cuando**: se cumplen los criterios de HU-02, HU-03 y HU-06.

### PARTE-03: Meta y rebote

- **Objetivo**: llevar fichas a meta con cuenta exacta o rebote.
- **Alcance**: llegada a meta, inmovilidad en meta y rebote simple.
- **Cubre**: HU-04 · RF-014, RF-015
- **Depende de**: PARTE-02
- **Hecho cuando**: se cumplen los criterios de HU-04.

### PARTE-04: Turnos y fin de partida

- **Objetivo**: resolver tiradas y turnos hasta que haya ganador.
- **Alcance**: acciones de tirar y mover, tirada perdida, rotación de turno, rechazo de acciones inválidas, eventos y fin de partida.
- **Cubre**: HU-05, HU-07 · RF-016, RF-017, RF-018, RF-019, RF-020, RF-021, RF-022, RF-023
- **Depende de**: PARTE-03
- **Hecho cuando**: se cumplen los criterios de HU-05 y HU-07, y CE-03 y CE-04.

### PARTE-05: Invariantes con tests de propiedades

- **Objetivo**: comprobar los invariantes globales sobre partidas aleatorias.
- **Alcance**: generación de partidas aleatorias de 2 a 4 jugadores y comprobación de I-01 a I-06 tras cada acción.
- **Cubre**: RNF-004
- **Depende de**: PARTE-04
- **Hecho cuando**: se cumple CE-02.

**Transversales**: RNF-001, RNF-002, RNF-003, RNF-005
**Orden sugerido**: PARTE-01 → PARTE-02 → PARTE-03 → PARTE-04 → PARTE-05

## 16. Preguntas abiertas

Ninguna.

## 17. Qué NO entra en este spec

- Interfaz Angular: tablero visual, interacción con teclado o ratón y accesibilidad.
- Tirada inicial para decidir quién empieza (R-010).
- Comer y sus premios (R-023, R-050, R-051, R-052).
- Barreras (R-042, R-060, R-061, R-062, R-063).
- El seis: repetir tirada, seis vale siete y tres seises (R-030, R-031, R-032).
- Premios por comer o llegar a meta y su encadenamiento (R-051, R-072, R-080, R-081).
- Rebote múltiple (solo alcanzable con premios).
- Guardado de partidas en el navegador.

Cada uno de estos, si llega, irá en su propio spec.
