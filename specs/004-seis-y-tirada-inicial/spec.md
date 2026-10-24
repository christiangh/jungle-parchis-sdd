# SPEC 004 — El seis y la tirada inicial

> **Estado:** Implementado
> **Depende de:** SPEC 001, SPEC 002, SPEC 003
> **Fecha:** 2026-10-21
> **Autor:** Christian Garcia
> **Objetivo:** Que el motor de reglas aplique todas las reglas del seis (repetir, valer siete, tres seises y abrir barrera) y decida quién empieza con una tirada inicial con desempate.

## 1. Resumen

Cuarto spec del motor de reglas: añade la repetición de tirada con un 6, el seis que vale siete sin fichas en casa, la penalización de tres seises, la obligación de abrir barrera propia con un 6 y la tirada inicial que decide quién empieza. Define cómo se combinan la repetición con los premios pendientes y con la salida obligatoria con un 5. Revisa de forma explícita los tests de SPEC 001 que cambian y corrige los tests de propiedades para que usen las casillas reales de cada movimiento. Con él, el reglamento queda completo en el motor.

## 2. Contexto y problema

Tras SPEC 003 el motor come, da premios y aplica barreras, pero un 6 se comporta como cualquier otro valor: cuenta 6 casillas y pasa el turno (SPEC 001, casos límite). Una barrera puede mantenerse indefinidamente porque nada obliga a abrirla, y el jugador inicial lo elige quien crea la partida en lugar de decidirlo una tirada. Además, el plan de SPEC 003 dejó anotado que los tests de propiedades calculan las casillas de un movimiento con el valor de la tirada; cuando un 6 valga 7, ese cálculo recorrería una casilla de menos y no detectaría una barrera en la séptima.

## 3. Objetivos y alcance

### Objetivos

- Que una partida simulada con el motor aplique todas las reglas del seis y empiece con una tirada inicial, según el reglamento.
- Tener un test con su identificador por cada regla del reglamento que entra en este spec.
- Dejar rastro de cada test de SPEC 001 a SPEC 003 que cambia de comportamiento.
- Que los tests de propiedades usen las casillas reales de cada movimiento y cubran las reglas nuevas.

### Entra

- Repetir tirada al sacar un 6, también cuando no hay movimiento legal (R-030).
- El seis vale siete cuando el jugador no tiene fichas en casa; las de meta cuentan como fuera de casa (R-031).
- Tres seises seguidos: la última ficha movida en el turno, con tirada o con premio, vuelve a casa salvo si está en el pasillo o en meta, y el turno termina (R-032).
- Abrir barrera propia con un 6 cuando alguna de sus fichas puede moverse, sin aplicarse a barreras mixtas (R-062).
- Tirada inicial por rondas para decidir quién empieza, con desempate entre los empatados (R-010).
- Interacción de la repetición de tirada con los premios pendientes (R-051, R-072, R-081) y con la salida obligatoria con un 5 (R-021).
- Eventos de tirada inicial, de repetir por 6 y de tres seises.
- Revisión de los tests de SPEC 001 a SPEC 003 que cambian de comportamiento.
- Tests de propiedades con casillas reales, partidas desde la tirada inicial y propiedades de R-062 y R-032.

### Fuera de alcance (para specs futuros)

- Interfaz Angular: tablero visual, interacción con teclado o ratón y accesibilidad.
- Guardado de partidas en el navegador.
- Crear una partida con un jugador inicial elegido, sin tirada inicial.
- Evento de barrera obligada a abrirse.
- Modificar los documentos de SPEC 001, SPEC 002 y SPEC 003.

## 4. Usuarios y actores

- **Jugador**: tira para decidir quién empieza, repite con cada 6, sufre los tres seises y abre sus barreras cuando un 6 le obliga.
- **Capa de presentación**: consumidor futuro del motor; envía las tiradas iniciales, consulta los movimientos legales, que ya reflejan el seis que vale siete y la barrera obligada, y anuncia los eventos nuevos.

## 5. Glosario

Se reutilizan los glosarios de SPEC 001 (recorrido común, casa, casilla de salida, casilla de entrada, pasillo, meta, tirada, movimiento legal, acción y evento), SPEC 002 (seguro, comer, premio, premio pendiente, movimiento de premio y rebote múltiple) y SPEC 003 (barrera, barrera de un color, barrera mixta y atravesar).

- **Tirada inicial**: tirada que solo sirve para decidir quién empieza; no mueve fichas (R-010).
- **Ronda de tirada inicial**: una tirada inicial de cada jugador que sigue optando a empezar, en el orden de R-010.
- **Fase de tirada inicial**: estado de una partida recién creada, que dura hasta que un único jugador saca el valor más alto de una ronda.
- **Casillas de una tirada**: casillas que mueve la tirada: su valor, salvo un 6 sin fichas en casa, que mueve 7 (R-031).
- **Seises seguidos**: número de 6 sacados uno tras otro en el turno en curso, hayan movido o no.
- **Última ficha movida**: ficha del último movimiento hecho en el turno en curso, de tirada o de premio (R-032).

## 6. Historias de usuario

### HU-01: Decidir quién empieza (P1)

**Como** jugador, **quiero** que una tirada inicial decida quién empieza, **para** que el primer turno no lo elija nadie a dedo.

**Criterios de aceptación**

1. **Dado** una partida nueva de amarillo, azul y rojo, **cuando** se crea, **entonces** está en fase de tirada inicial y el primero en tirar es amarillo (R-010).
2. **Dado** la fase de tirada inicial de amarillo, azul y rojo, **cuando** sacan 3, 5 y 2, **entonces** empieza azul, sin tirada pendiente (R-010).
3. **Dado** la fase de tirada inicial de amarillo, azul y rojo, **cuando** sacan 6, 2 y 6, **entonces** hay una nueva ronda solo con amarillo y rojo, empezando por amarillo (R-010).
4. **Dado** una nueva ronda de amarillo y rojo, **cuando** sacan 1 y 4, **entonces** empieza rojo aunque azul sacara más en la ronda anterior (R-010).
5. **Dado** la fase de tirada inicial con turno de tirar de azul, **cuando** amarillo tira, intenta mover o tira un color que no participa, **entonces** la acción se rechaza y el estado no cambia.

### HU-02: Repetir tirada con un 6 (P1)

**Como** jugador, **quiero** volver a tirar después de sacar un 6, **para** aprovechar la buena tirada.

**Criterios de aceptación**

1. **Dado** amarillo con una ficha en la casilla 10 y otra en casa, **cuando** saca un 6 y la mueve, **entonces** termina en la 16 y el turno sigue siendo de amarillo, sin tirada pendiente (R-030).
2. **Dado** amarillo con un 6 sin ningún movimiento legal, **cuando** se registra la tirada, **entonces** la pierde y vuelve a tirar (R-030, R-012).
3. **Dado** amarillo saca un 6 y come una ficha roja, **cuando** usa el premio de 20, **entonces** vuelve a tirar; antes de usarlo, cualquier tirada se rechaza (R-030, R-051).
4. **Dado** amarillo saca un 6 y llega a meta con la ficha que gana su cuarta ficha en meta, **cuando** se resuelve, **entonces** la partida termina y no hay repetición (R-090).
5. **Dado** amarillo con fichas en casa y salida libre que repite por un 6, **cuando** saca un 5, **entonces** debe sacar una ficha de casa (R-021).

### HU-03: El seis vale siete (P1)

**Como** jugador, **quiero** mover 7 casillas con un 6 cuando no tengo fichas en casa, **para** compensar que ya no puedo sacar fichas.

**Criterios de aceptación**

1. **Dado** amarillo con fichas en las casillas 10, 30 y 40 y una en meta, **cuando** saca un 6, **entonces** los movimientos legales llevan cada ficha 7 casillas (R-031).
2. **Dado** amarillo con una ficha en la casilla 10 y otra en casa, **cuando** saca un 6, **entonces** la ficha de la 10 mueve 6 (R-031).
3. **Dado** amarillo sin fichas en casa, una ficha en la casilla 10 y dos rojas en la 17, **cuando** saca un 6, **entonces** esa ficha no puede moverse (R-031, R-061).
4. **Dado** amarillo sin fichas en casa y una ficha en la segunda casilla de su pasillo, **cuando** saca un 6, **entonces** avanza 6 hasta la meta, retrocede 1 y termina en la séptima casilla del pasillo (R-031, R-071).

### HU-04: Tres seises (P1)

**Como** jugador, **quiero** que el tercer 6 seguido castigue la última ficha movida, **para** que la racha de seises tenga un límite.

**Criterios de aceptación**

1. **Dado** amarillo ha sacado dos 6 en el turno y su último movimiento llevó una ficha a la casilla 30, **cuando** saca el tercer 6, **entonces** no mueve, esa ficha vuelve a casa y el turno pasa al siguiente color (R-032).
2. **Dado** amarillo ha sacado dos 6 y su último movimiento fue un premio de 20 con otra ficha, **cuando** saca el tercer 6, **entonces** vuelve a casa la ficha que usó el premio (R-032).
3. **Dado** amarillo ha sacado dos 6 y su último movimiento terminó en su pasillo o en meta, **cuando** saca el tercer 6, **entonces** ninguna ficha vuelve a casa y el turno pasa (R-032).
4. **Dado** amarillo ha sacado dos 6 sin ningún movimiento legal, **cuando** saca el tercer 6, **entonces** ninguna ficha vuelve a casa y el turno pasa.
5. **Dado** amarillo saca 6, 6 y 4, **cuando** termina el movimiento del 4, **entonces** el turno pasa y el siguiente turno de amarillo empieza sin seises seguidos (R-032).

### HU-05: Abrir barrera con un 6 (P1)

**Como** jugador, **quiero** estar obligado a abrir mi barrera al sacar un 6, **para** que nadie bloquee el tablero indefinidamente.

**Criterios de aceptación**

1. **Dado** amarillo con dos fichas en la casilla 20, una en la 40 y una en casa, **cuando** saca un 6, **entonces** los únicos movimientos legales son los de las fichas de la 20 (R-062).
2. **Dado** amarillo con dos fichas en la casilla 20 y dos rojas en la 24, una en la 40 y una en casa, **cuando** saca un 6, **entonces** puede mover la ficha de la 40, porque ninguna de la barrera puede moverse (R-062, R-061).
3. **Dado** amarillo con una ficha amarilla y una roja en la casilla 12, una en la 40 y el resto en casa, **cuando** saca un 6, **entonces** puede mover cualquiera de sus dos fichas, porque la barrera es mixta (R-062).
4. **Dado** amarillo con barreras propias en las casillas 20 y 40, **cuando** saca un 6, **entonces** los movimientos legales incluyen las fichas de ambas barreras que puedan moverse y ninguna otra (R-062).
5. **Dado** amarillo sin fichas en casa, con dos fichas en la casilla 20, **cuando** saca un 6, **entonces** abre la barrera moviendo 7 casillas (R-062, R-031).
6. **Dado** amarillo con dos fichas en la casilla 20 y un premio de 20 pendiente, **cuando** se calculan los movimientos de premio, **entonces** cualquier ficha que pueda usarlo es legal (R-062, R-080).

## 7. Requisitos funcionales

- **RF-001**: El sistema debe crear la partida en fase de tirada inicial, con todos los participantes optando a empezar y el primero de ellos en el orden de R-010 como primero en tirar (R-010).
- **RF-002**: El sistema debe aceptar en la fase de tirada inicial solo la tirada, de 1 a 6, del jugador al que le toca tirar en la ronda, y rechazar cualquier otra acción sin cambiar el estado (R-002, R-010).
- **RF-003**: El sistema debe, al completarse una ronda, dar el turno al jugador con el valor más alto si es único, o empezar una nueva ronda solo con los empatados en el valor más alto, en el orden de R-010 (R-010).
- **RF-004**: El sistema debe empezar el turno del jugador que gana la tirada inicial sin tirada pendiente; la tirada inicial no mueve fichas.
- **RF-005**: El sistema debe mantener el turno del jugador que saca un 6, sin tirada pendiente, una vez resuelta la tirada y todos sus premios pendientes, también cuando el 6 no tiene movimiento legal (R-030, R-012, R-051, R-072, R-081).
- **RF-006**: El sistema debe tratar la tirada que sigue a un 6 como cualquier otra, incluida la salida obligatoria con un 5 (R-021).
- **RF-007**: El sistema debe hacer que un 6 mueva 7 casillas si, al tirar, el jugador no tiene fichas en casa, contando las fichas en meta como fuera de casa (R-031).
- **RF-008**: El sistema debe aplicar las casillas de la tirada a todas las reglas de movimiento: barreras, ocupación máxima, comer, entrada al pasillo, llegada a meta y rebote (R-031).
- **RF-009**: El sistema debe llevar la cuenta de los seises seguidos del turno en curso y ponerla a cero al cambiar el turno (R-032).
- **RF-010**: El sistema debe, al sacar el tercer 6 seguido, no aceptar movimiento con él, devolver a casa la última ficha movida si está en el recorrido común y pasar el turno (R-032).
- **RF-011**: El sistema debe considerar última ficha movida la del último movimiento del turno en curso, de tirada o de premio, y no devolver ninguna si en el turno no se ha movido ninguna (R-032).
- **RF-012**: El sistema debe, con una tirada de 6 y alguna barrera de un color propia en la que alguna ficha pueda moverse, limitar los movimientos legales a las fichas de esas barreras que puedan moverse (R-062).
- **RF-013**: El sistema no debe aplicar la obligación de abrir barrera a las barreras mixtas ni a los movimientos de premio (R-062, R-080).
- **RF-014**: El sistema debe producir eventos de tirada inicial, con el jugador y el valor; de empate, con los jugadores que repiten; y de jugador que empieza.
- **RF-015**: El sistema debe producir un evento de repetir tirada por 6, con el jugador.
- **RF-016**: El sistema debe producir un evento de tres seises, con el jugador y la ficha devuelta a casa, si la hay.

### Cambios de comportamiento respecto a SPEC 001 a SPEC 003

Los tests que cambian se revisan en su sitio conservando la regla que prueban: se ajusta el escenario o el resultado esperado lo justo para que la sigan probando, y el nombre cambia solo si cambia lo que prueban. Todos son de SPEC 001.

| Test | Por qué cambia | Revisión | Nombre tras la revisión |
|------|----------------|----------|-------------------------|
| «HU-01: crea una partida de amarillo y rojo con turno de amarillo» | La partida ya no recibe jugador inicial y nace en fase de tirada inicial (R-010) | Mismo escenario sin jugador inicial; se espera la fase de tirada inicial con amarillo como primero en tirar | «R-010: crea una partida de amarillo y rojo en fase de tirada inicial, empezando a tirar amarillo» |
| «HU-01: rechaza un jugador inicial que no participa» | Ya no hay jugador inicial que rechazar | Partida de azul y verde en fase de tirada inicial; se rechaza una tirada inicial de rojo y el estado no cambia | «R-010: rechaza la tirada inicial de un color que no participa» |
| «R-011: con un 6 se mueve 6 y el turno pasa como con cualquier valor» | Con un 6 se repite tirada (R-030) | Mismo escenario, con fichas en casa; se espera la ficha en la 16 y el turno aún de amarillo, sin tirada pendiente | «R-030: con un 6 se mueve 6 y se vuelve a tirar» |
| «R-040: avanza siempre hacia delante el número exacto de casillas» | Sin fichas en casa, el 6 mueve 7 (R-031) | Mismo escenario; para el 6 se espera la casilla 17 | «R-040, R-031: avanza siempre hacia delante las casillas de la tirada» |
| «HU-06: una ficha en meta nunca aparece entre los movimientos legales» | Sin fichas en casa, el 6 mueve 7 (R-031) | Mismo escenario; para el 6 se espera la casilla 27 | Sin cambios |
| «R-070: desde la segunda casilla del pasillo con un 6 llega justo a meta» | Sin fichas en casa, el 6 mueve 7 y rebotaría (R-031) | Una de las fichas en meta pasa a casa, para que el 6 mueva 6 | Sin cambios |
| «R-071: desde la quinta casilla del pasillo con un 6 rebota y termina en la quinta» | Ídem | Ídem | Sin cambios |
| «R-071: desde la séptima casilla del pasillo con un 6 rebota hasta la tercera, sin quedarse en meta» | Ídem | Ídem | Sin cambios |
| «R-071: un rebote que termina en una casilla del pasillo con 2 fichas no es legal» | Ídem | La ficha en meta pasa a casa | Sin cambios |

Los demás tests de creación de partida de SPEC 001 solo dejan de indicar el jugador inicial; su comportamiento no cambia. Ningún test de SPEC 002 ni de SPEC 003 cambia de comportamiento: ninguno tira un 6 ni tiene una barrera propia con una tirada de 6. Los tests de propiedades cambian como indica RNF-004. Si algún otro test cambia de comportamiento, se revisa igual y se añade a esta tabla antes de cerrar la parte.

## 8. Requisitos no funcionales

- **RNF-001**: El motor sigue sin depender de Angular ni de otras librerías de ejecución, no modifica el estado recibido y no genera azar, tampoco en la tirada inicial (P-01 a P-04, P-10).
- **RNF-002**: Cada regla del reglamento que entra en este spec tiene al menos un test cuyo nombre incluye su identificador, escrito antes que el código y visto fallar (P-06, P-07).
- **RNF-003**: Los tests de SPEC 001 que cambian se revisan según la tabla de la sección 7; ninguno se desactiva, salta ni debilita (P-09).
- **RNF-004**: Los tests de propiedades simulan partidas aleatorias de 2, 3 y 4 jugadores desde la fase de tirada inicial, calculan las casillas de cada movimiento con las casillas reales de la tirada o del premio, y comprueban tras cada acción I-01 a I-06, las propiedades de RNF-004 de SPEC 002 y SPEC 003, y además: que con un 6 y una barrera de un color propia con alguna ficha movible, la ficha movida es de una barrera propia (R-062); y que ningún turno hace más de dos movimientos de tirada seguidos con un 6 (R-032) (P-08).

## 9. Entidades clave

- **Partida**: se amplía con la fase de tirada inicial (jugadores que siguen optando, tiradas de la ronda en curso), los seises seguidos del turno y la última ficha movida en él.
- **Evento**: se amplía con tirada inicial, empate, jugador que empieza, repetir tirada por 6 y tres seises.

## 10. Casos límite

- Todos empatan en la tirada inicial → nueva ronda con todos.
- Empate en un valor que no es el más alto → no cuenta; solo desempatan los empatados en el más alto.
- 6 sin movimiento legal → pierde la tirada, repite y cuenta para los tres seises (R-030).
- 6 que come → se usa el premio de 20 y después se repite tirada (R-030, R-051).
- 6 que lleva una ficha a meta → se usa el premio de 10 y después se repite tirada (R-030, R-072).
- Premios encadenados tras un 6 → se usan todos y después se repite tirada (R-081).
- 6 que mete la cuarta ficha en meta → la partida termina; no hay premio ni repetición (R-090).
- Premio perdido tras un 6 → se repite tirada igualmente (R-080).
- Repetición con un 5, fichas en casa y salida libre → salir es obligatorio (R-021).
- Ficha devuelta a casa por tres seises → en el siguiente turno el 6 vuelve a valer 6 y un 5 obliga a sacarla (R-031, R-021).
- Última ficha movida en su casilla de salida o formando barrera → vuelve a casa igualmente; la barrera desaparece (R-032).
- Última ficha movida en el pasillo o en meta → no vuelve; el turno termina (R-032).
- Tercer 6 con fichas que podrían moverse → no mueve ninguna (R-032).
- Los seises seguidos no pasan de un turno a otro, aunque el turno vuelva al mismo jugador en una partida de 2 (R-032).
- Todas las fichas fuera de casa salvo las de meta → el 6 vale 7 (R-031).
- 6 que vale 7 y cuya séptima casilla es una barrera o la atraviesa → no es legal (R-031, R-061).
- Barrera propia en la casilla de salida → el 6 obliga a abrirla (R-062).
- Barrera propia cuyas dos fichas están bloqueadas → el 6 se mueve con cualquier otra ficha legal (R-062).
- Barrera propia bloqueada y ninguna otra ficha movible → se pierde la tirada y se repite (R-012, R-030).
- Abrir una barrera y formar otra con la misma ficha → legal (R-062).
- Barrera mixta en un seguro → no obliga a abrirla (R-062).
- Tirada de 5 con barrera propia → no obliga a abrirla; sigue mandando la salida obligatoria (R-021, R-062).

## 11. Criterios de éxito

- **CE-01**: Existe al menos un test con su identificador para cada una de R-010, R-030, R-031, R-032 y R-062.
- **CE-02**: Los tests de propiedades simulan al menos 1000 partidas aleatorias de 2, 3 y 4 jugadores, desde la tirada inicial, sin que ninguna incumpla I-01 a I-06, las propiedades de RNF-004 de SPEC 002 y SPEC 003, ni las de RNF-004 de este spec.
- **CE-03**: En esas partidas aleatorias se produce al menos una vez cada uno de estos hechos: repetir tirada por 6, 6 que vale 7, tres seises con ficha devuelta, tres seises sin ficha devuelta, barrera abierta por un 6 y empate en la tirada inicial, además de los hechos de CE-03 de SPEC 002 y SPEC 003.
- **CE-04**: Los tests de la tabla de la sección 7 llevan su revisión y su nombre, y ningún test crea una partida con jugador inicial.
- **CE-05**: La comprobación completa del proyecto (formato, lint y tests) pasa sin errores.

## 12. Supuestos y dependencias

- Depende de SPEC 001 (tablero, salida, avance, meta, rebote, turnos), SPEC 002 (comer, premios y tests de propiedades) y SPEC 003 (barreras).
- La tirada inicial solo decide quién empieza; el ganador empieza su turno tirando de nuevo.
- Se tiene en cuenta si hay fichas en casa en el momento de tirar; dentro de una misma tirada no cambia.
- Un 6 que vale 7 sigue siendo un 6 para R-030, R-032 y R-062; solo cambian sus casillas.
- Los premios mueven siempre 20 o 10 casillas; R-031 no los afecta.
- La ficha devuelta a casa por tres seises no da premio a nadie.
- Depende de `specs/constitucion.md` y `specs/reglamento.md`.

## 13. Decisiones tomadas y descartadas

- **Sí:** la tirada inicial es una fase de la partida, con tiradas enviadas como acciones. Es una regla del tablero de cartón, se reproduce con las tiradas recibidas y produce eventos (P-03, P-04, P-05).
- **No:** una consulta aparte que decida el jugador inicial a partir de tiradas. Deja el flujo de rondas fuera del motor.
- **No:** conservar la creación con jugador inicial elegido. Decisión del usuario; los tests de reglas siguen pudiendo construir estados a medida.
- **Sí:** en la tirada inicial se tira por rondas en el orden de R-010 y desempatan solo los empatados en el valor más alto. Determinista y fácil de anunciar.
- **No:** tiradas iniciales en cualquier orden. Más estados posibles sin aportar al juego.
- **Sí:** un 6 sin movimiento legal repite tirada y cuenta para los tres seises. Perder la tirada no quita el 6.
- **No:** que un 6 sin movimiento pierda la tirada y pase el turno.
- **Sí:** la repetición espera a que se usen o pierdan todos los premios pendientes. R-051 y R-072 los colocan antes de la siguiente tirada.
- **Sí:** la última ficha movida se limita al turno en curso; si no hay, ninguna vuelve a casa. Un turno no castiga movimientos de otro.
- **No:** buscar la última ficha movida en turnos anteriores.
- **Sí:** los tests que cambian conservan la regla que prueban, ajustando escenario o resultado, y se añaden tests propios de R-031. Un test de R-070 o R-071 no debe pasar a probar R-031 sin decirlo.
- **No:** cambiar solo el resultado esperado. Algunos tests dejarían de probar su regla original.
- **Sí:** no tocar los documentos de SPEC 001 a SPEC 003. Quedan como histórico; este spec declara los cambios.
- **Sí:** eventos de tirada inicial, de repetir por 6 y de tres seises. La presentación anuncia cada hecho al lector de pantalla (P-15) sin deducirlo del estado.
- **No:** evento de barrera obligada a abrirse. Los movimientos legales ya lo reflejan.
- **Sí:** las casillas reales en los tests de propiedades. Con el valor de la tirada no se detectaría una barrera en la séptima casilla, como anotó el plan de SPEC 003.
- **Sí:** propiedades propias de R-062 y R-032 y partidas desde la tirada inicial. Sin ellas, una barrera no abierta o un cuarto movimiento con 6 pasarían desapercibidos.
- **Sí:** cuatro partes: seis, abrir barrera, tirada inicial y propiedades. Las reglas del seis comparten la cuenta de seises; las demás se prueban solas.
- **No:** separar la tirada inicial en otro spec. Completa el reglamento en el motor con un alcance acotado.

## 14. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Hechos raros de CE-03, como tres seises sin ficha devuelta o empate en la tirada inicial con 4 jugadores, no aparecen en las partidas aleatorias | Contarlos con el mismo test que los de SPEC 002 y SPEC 003; si falta alguno, ajustar la elección de movimientos o las tiradas de las partidas simuladas, nunca la comprobación |
| La repetición por 6 alarga las partidas y alguna llega al límite de acciones de las partidas simuladas | Medir en PARTE-04 cuántas se detienen por el límite; si alguna lo hace, ajustar el límite, nunca la comprobación |
| Otros tests de SPEC 001 a SPEC 003 usan un 6 o una barrera propia sin decirlo | Ejecutar todos los tests al cerrar PARTE-01 y PARTE-02 y revisar los que fallen según la sección 7 |
| La propiedad de R-032 confunde dos turnos seguidos del mismo jugador en una partida de 2 con un mismo turno | Contar los seises por turno a partir de los eventos de cambio de turno |

## 15. Partes / incrementos

### PARTE-01: El seis

- **Objetivo**: repetir tirada con un 6, que valga 7 sin fichas en casa y castigar tres seises.
- **Alcance**: repetición tras resolver premios, también sin movimiento legal; casillas de la tirada; cuenta de seises seguidos y última ficha movida; tres seises; eventos de repetir y tres seises; revisión de los tests de SPEC 001 con un 6.
- **Cubre**: HU-02, HU-03, HU-04 · RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-011, RF-015, RF-016 · RNF-003
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-02 a HU-04 y las filas de la tabla de la sección 7 que tratan del 6 están revisadas.

### PARTE-02: Abrir barrera con un 6

- **Objetivo**: obligar a abrir las barreras propias con un 6.
- **Alcance**: limitación de los movimientos legales de un 6 a las fichas de barreras de un color propias, sin aplicarla a barreras mixtas ni a premios.
- **Cubre**: HU-05 · RF-012, RF-013
- **Depende de**: PARTE-01
- **Hecho cuando**: se cumplen los criterios de HU-05.

### PARTE-03: Tirada inicial

- **Objetivo**: decidir quién empieza con una tirada inicial.
- **Alcance**: fase de tirada inicial al crear la partida, rondas, desempate, rechazo de acciones fuera de lugar, eventos y revisión de los tests de creación de SPEC 001.
- **Cubre**: HU-01 · RF-001, RF-002, RF-003, RF-004, RF-014 · RNF-003
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-01 y las filas de la tabla de la sección 7 que tratan de la creación de partida están revisadas.

### PARTE-04: Propiedades con el seis y la tirada inicial

- **Objetivo**: comprobar invariantes y propiedades en partidas que empiezan con tirada inicial y aplican el seis.
- **Alcance**: partidas desde la tirada inicial, casillas reales en las propiedades de SPEC 003 y en el movimiento descartado, propiedades de R-062 y R-032 y recuento de los hechos nuevos de CE-03.
- **Cubre**: RNF-004
- **Depende de**: PARTE-01, PARTE-02, PARTE-03
- **Hecho cuando**: se cumplen CE-01 a CE-04.

**Transversales**: RNF-001, RNF-002
**Orden sugerido**: PARTE-01 → PARTE-02 → PARTE-03 → PARTE-04

## 16. Preguntas abiertas

Ninguna.

## 17. Qué NO entra en este spec

- Interfaz Angular: tablero visual, interacción con teclado o ratón y accesibilidad.
- Guardado de partidas en el navegador.
- Crear una partida con un jugador inicial elegido, sin tirada inicial.
- Evento de barrera obligada a abrirse.
- Modificar los documentos de SPEC 001, SPEC 002 y SPEC 003.

Cada uno de estos, si llega, irá en su propio spec.
