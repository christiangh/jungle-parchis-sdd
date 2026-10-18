# SPEC 002 — Comer y premios

> **Estado:** Aprobado
> **Depende de:** SPEC 001
> **Fecha:** 2026-10-17
> **Autor:** Christian Garcia
> **Objetivo:** Que el motor de reglas permita comer fichas rivales, también al salir de casa, y aplique los premios de contar 20 y contar 10 con su uso, pérdida, encadenamiento y rebote múltiple.

## 1. Resumen

Segundo spec del motor de reglas: añade comer en el recorrido común y al salir de casa, los seguros compartidos y los premios por comer y por llegar a meta. Sustituye las reglas provisionales RF-008 y RF-013 de SPEC 001 y revisa de forma explícita los tests que cambian de comportamiento. Aporta la interacción entre jugadores, que es el núcleo táctico del parchís, sin entrar todavía en barreras ni en el seis.

## 2. Contexto y problema

SPEC 001 dejó un motor jugable de principio a fin, pero sin interacción entre jugadores: una ficha que termina sobre una rival convive con ella (RF-013 de SPEC 001) y la salida se bloquea con cualquier par de fichas (RF-008 de SPEC 001). Ambas reglas se marcaron como provisionales a la espera de este spec. Sin comer ni premios, las partidas no se parecen al parchís real y el rebote múltiple de R-071 no se puede alcanzar ni probar.

## 3. Objetivos y alcance

### Objetivos

- Que una partida simulada con el motor coma fichas, gane premios y los use según el reglamento.
- Tener un test con su identificador por cada regla del reglamento que entra en este spec.
- Sustituir las reglas provisionales RF-008 y RF-013 de SPEC 001 dejando rastro de cada test que cambia.
- Ampliar los tests de propiedades para que cubran comer y premios.

### Entra

- Comer en el recorrido común (R-050).
- Seguros compartidos sin comerse (R-052).
- Salir de casa comiendo aunque la salida sea un seguro, con una o dos fichas rivales (R-023), y salida bloqueada solo por 2 fichas propias (R-022).
- Premio de contar 20 al comer (R-051).
- Premio de contar 10 al llegar a meta (R-072).
- Uso y pérdida de los premios (R-080).
- Premios encadenados (R-081).
- Rebote múltiple, alcanzable con los premios (R-071).
- Eventos de ficha comida, premio ganado y premio perdido.
- Revisión de los tests de SPEC 001 afectados por RF-008 y RF-013.
- Tests de propiedades sobre partidas aleatorias que comen y usan premios.

### Fuera de alcance (para specs futuros)

- Barreras (R-042, R-060, R-061, R-062, R-063), incluida la regla provisional RF-012 de SPEC 001, que sigue vigente.
- El seis: repetir tirada, seis vale siete y tres seises (R-030, R-031, R-032).
- Tirada inicial para decidir quién empieza (R-010).
- Interfaz Angular: tablero visual, interacción con teclado o ratón y accesibilidad.
- Guardado de partidas en el navegador.
- Modificar el documento de SPEC 001.

## 4. Usuarios y actores

- **Jugador**: come fichas rivales, elige con qué ficha usar cada premio y sufre que le coman las suyas.
- **Capa de presentación**: consumidor futuro del motor; consulta los movimientos legales de tiradas y premios, envía las acciones del jugador y anuncia los eventos.

## 5. Glosario

Se reutiliza el glosario de SPEC 001 (recorrido común, casa, casilla de salida, casilla de entrada, pasillo, meta, tirada, movimiento legal, acción y evento).

- **Seguro**: casilla del recorrido común donde no se come, salvo al salir de casa (R-006, R-052).
- **Comer**: devolver a su casa una ficha rival al terminar un movimiento en su casilla (R-050, R-023).
- **Premio**: número de casillas que el jugador debe mover con una sola de sus fichas antes de su siguiente tirada: 20 al comer y 10 al llegar a meta (R-051, R-072).
- **Premio pendiente**: premio ganado que el jugador todavía no ha usado ni perdido.
- **Movimiento de premio**: movimiento de una ficha la cantidad exacta de un premio pendiente.
- **Rebote múltiple**: rebote en el que la ficha pasa por la meta o por la primera casilla de su pasillo más de una vez antes de agotar el movimiento (R-071).

## 6. Historias de usuario

### HU-01: Comer una ficha rival (P1)

**Como** jugador, **quiero** comer la ficha rival de la casilla donde termino mi movimiento, **para** devolverla a su casa.

**Criterios de aceptación**

1. **Dado** una ficha amarilla en la casilla 10 y una roja sola en la 14, **cuando** amarillo mueve 4 esa ficha, **entonces** la roja vuelve a su casa y la amarilla queda en la 14 (R-050).
2. **Dado** una ficha amarilla en la casilla 10 y una roja sola en la 12, que es un seguro, **cuando** amarillo mueve 2 esa ficha, **entonces** ambas conviven en la 12 (R-052).
3. **Dado** una ficha amarilla en la casilla 20 y una roja sola en la 22, salida de azul, **cuando** amarillo mueve 2 esa ficha, **entonces** ambas conviven en la 22, porque no sale de casa (R-052).
4. **Dado** una ficha amarilla en la casilla 10 y dos rojas en la 13, **cuando** se calculan los movimientos de un 3, **entonces** ese movimiento no es legal (R-041).

### HU-02: Salir de casa comiendo (P1)

**Como** jugador, **quiero** que mi ficha coma al salir de casa aunque la salida sea un seguro, **para** que nadie pueda ocupar mi salida impunemente.

**Criterios de aceptación**

1. **Dado** amarillo con fichas en casa y una ficha roja sola en la casilla 5, **cuando** saca un 5 y sale, **entonces** la roja vuelve a su casa (R-023).
2. **Dado** amarillo con fichas en casa, una ficha amarilla y una roja en la casilla 5, **cuando** saca un 5, **entonces** el único movimiento legal es salir, y al hacerlo come la roja (R-021, R-023).
3. **Dado** amarillo con fichas en casa y en la casilla 5 una ficha azul y una roja, la roja llegada después, **cuando** saca un 5 y sale, **entonces** come la roja y la azul se queda (R-023).
4. **Dado** amarillo con fichas en casa y 2 fichas amarillas en la casilla 5, **cuando** saca un 5, **entonces** no puede salir (R-022).

### HU-03: Contar 20 al comer (P1)

**Como** jugador, **quiero** mover 20 casillas con una de mis fichas después de comer, **para** aprovechar la ventaja ganada.

**Criterios de aceptación**

1. **Dado** amarillo acaba de comer, **cuando** consulto los movimientos legales, **entonces** son los de 20 casillas de cada ficha que pueda moverlos, incluida la que ha comido (R-051, R-080).
2. **Dado** amarillo con un premio de 20 pendiente, **cuando** intenta tirar, **entonces** la acción se rechaza.
3. **Dado** amarillo con un premio de 20 pendiente y una sola ficha que pueda usarlo, **cuando** consulto los movimientos legales, **entonces** aparece ese único movimiento y el turno no pasa hasta que amarillo lo envía.
4. **Dado** amarillo usa el premio de 20 sin ganar otro, **cuando** termina el movimiento, **entonces** el turno pasa al siguiente color.

### HU-04: Contar 10 al llegar a meta (P1)

**Como** jugador, **quiero** mover 10 casillas con otra de mis fichas al meter una en meta, **para** que llegar a meta tenga recompensa.

**Criterios de aceptación**

1. **Dado** amarillo mete una ficha en meta y tiene otra en la casilla 30, **cuando** consulto los movimientos legales, **entonces** incluyen mover 10 la ficha de la 30 (R-072).
2. **Dado** amarillo con 3 fichas en meta, **cuando** mete la cuarta, **entonces** la partida termina y no se gana premio (R-090).

### HU-05: Perder un premio (P1)

**Como** jugador, **quiero** que un premio sin ningún movimiento posible se pierda, **para** que la partida siga.

**Criterios de aceptación**

1. **Dado** amarillo mete en meta su única ficha en juego y el resto está en casa, **cuando** se resuelve el movimiento, **entonces** el premio de 10 se pierde y el turno pasa (R-080).
2. **Dado** un premio cuyo único movimiento terminaría en una casilla con 2 fichas, **cuando** se resuelve, **entonces** el premio se pierde (R-041, R-080).

### HU-06: Encadenar premios (P2)

**Como** jugador, **quiero** usar también el premio que gano al usar otro, **para** aprovechar una jugada encadenada.

**Criterios de aceptación**

1. **Dado** amarillo con un premio de 20 pendiente y una ficha roja sola a 20 casillas de una amarilla, fuera de seguro, **cuando** amarillo usa el premio con esa ficha, **entonces** come la roja y tiene un nuevo premio de 20 pendiente (R-080, R-081).
2. **Dado** amarillo con un premio de 20 pendiente y una ficha amarilla en la casilla 56, **cuando** la usa para llegar a meta, **entonces** tiene un premio de 10 pendiente (R-080, R-081).

### HU-07: Rebote múltiple con un premio (P2)

**Como** jugador, **quiero** que una ficha del pasillo pueda usar un premio rebotando las veces que haga falta, **para** no perder premios por estar cerca de la meta.

**Criterios de aceptación**

1. **Dado** una ficha amarilla en la quinta casilla de su pasillo con un premio de 20, **cuando** lo usa, **entonces** termina en la quinta casilla del pasillo tras pasar dos veces por la meta (R-071).
2. **Dado** una ficha amarilla en la casilla 66 con un premio de 10, **cuando** lo usa, **entonces** llega a meta (R-070, R-071).
3. **Dado** un rebote que pasa por la meta y termina en el pasillo, **cuando** se resuelve, **entonces** no cuenta como llegar a meta ni da premio (R-071).

## 7. Requisitos funcionales

- **RF-001**: El sistema debe hacer que una ficha que termina su movimiento en una casilla del recorrido común que no es seguro, ocupada por una única ficha rival, la coma y la devuelva a su casa (R-050). Sustituye RF-013 de SPEC 001.
- **RF-002**: El sistema debe dejar convivir sin comerse a dos fichas de distinto color en un seguro, salvo al salir de casa (R-052).
- **RF-003**: El sistema debe impedir la salida de casa solo cuando la casilla de salida ya tiene 2 fichas del propio color (R-022). Sustituye RF-008 de SPEC 001.
- **RF-004**: El sistema debe permitir salir de casa con un 5 cuando en la casilla de salida hay una o dos fichas rivales, aunque la casilla tenga ya 2 fichas, y la ficha que sale come a una de ellas (R-023, R-041).
- **RF-005**: El sistema debe comer, cuando hay dos fichas rivales en la casilla de salida, la que llegó a ella en último lugar (R-023).
- **RF-006**: El sistema debe dar un premio de 20 al jugador que come, también al salir de casa (R-051, R-023).
- **RF-007**: El sistema debe dar un premio de 10 al jugador que mete una ficha en meta, salvo que con ella termine la partida (R-072, R-090).
- **RF-008**: El sistema debe mantener el turno del jugador mientras tenga un premio pendiente, y rechazar cualquier tirada hasta que lo use o lo pierda (R-051, R-072).
- **RF-009**: El sistema debe devolver, con un premio pendiente, los movimientos legales de una sola ficha la cantidad exacta del premio, y exigir que el jugador envíe uno de ellos aunque solo haya uno (R-080).
- **RF-010**: El sistema debe aplicar a los movimientos de premio las mismas reglas que a los de tirada: comer, seguros, ocupación máxima, entrada al pasillo, llegada a meta y rebote (R-080).
- **RF-011**: El sistema debe hacer perder un premio, y pasar el turno si no queda otro pendiente, cuando ninguna ficha del jugador puede moverse la cantidad exacta del premio (R-080).
- **RF-012**: El sistema debe dejar pendiente el premio ganado al usar otro, para usarlo antes de que pase el turno (R-081).
- **RF-013**: El sistema debe aplicar el rebote tantas veces como haga falta: al llegar a la meta con casillas sobrantes la ficha retrocede por su pasillo, al llegar a la primera casilla del pasillo vuelve a avanzar, y solo cuenta como llegar a meta terminar en ella (R-071).
- **RF-014**: El sistema debe producir un evento de ficha comida, que indica la ficha comida y la casilla donde estaba.
- **RF-015**: El sistema debe producir un evento de premio ganado, con el jugador y la cantidad, y un evento de premio perdido, con el jugador y la cantidad.

### Cambios de comportamiento respecto a SPEC 001

Los tests de las reglas provisionales sustituidas se reescriben en su sitio: mismo escenario, nuevo resultado esperado y nombre con la regla definitiva, sin «provisional».

| Test de SPEC 001 | Comportamiento anterior | Comportamiento nuevo | Nuevo nombre |
|------------------|-------------------------|----------------------|--------------|
| «RF-013 (provisional): sale con una sola ficha rival en la salida, sin comerla» | Sale y convive con la rival | Sale y come la rival | «R-023: sale con una sola ficha rival en la salida y la come» |
| «R-022 (provisional RF-008): no se sale con una ficha propia y una rival en la salida» | No puede salir; mueve otras fichas | El único movimiento legal es salir, comiendo la rival | «R-023: con una ficha propia y una rival en la salida, sale comiendo la rival» |
| «RF-013 (provisional): termina junto a una sola ficha rival fuera de un seguro» | Termina y convive con la rival | Termina y come la rival | «R-050: termina sobre una sola ficha rival fuera de un seguro y la come» |
| «RF-021: llegar a meta produce los eventos de avance y llegada» | Tras llegar a meta, el turno pasa | Tras llegar a meta se gana un premio de 10 que otra ficha puede usar, y el turno no pasa (R-072) | «R-072: llegar a meta produce los eventos de avance, llegada y premio» |

El test «RF-012 (provisional): atraviesa una casilla con 2 fichas» no cambia. El resto de tests de SPEC 001 debe pasar sin modificarse; si alguno más cambia de comportamiento, se revisa igual que estos y se añade a esta tabla antes de cerrar la parte.

## 8. Requisitos no funcionales

- **RNF-001**: El motor sigue sin depender de Angular ni de otras librerías de ejecución, no modifica el estado recibido y no genera azar (P-01 a P-04, P-10).
- **RNF-002**: Cada regla del reglamento que entra en este spec tiene al menos un test cuyo nombre incluye su identificador, escrito antes que el código y visto fallar (P-06, P-07).
- **RNF-003**: Los tests de SPEC 001 que cambian se reescriben según la tabla de la sección 7; ninguno se desactiva, salta ni debilita (P-09).
- **RNF-004**: Los tests de propiedades simulan partidas aleatorias de 2, 3 y 4 jugadores que comen y usan premios, y comprueban tras cada acción I-01 a I-06 y que, fuera de un seguro, nunca conviven fichas de dos colores en una casilla (P-08).

## 9. Entidades clave

- **Partida**: se amplía con el premio pendiente del jugador en turno, si lo hay.
- **Ficha**: se amplía con el momento en que llegó a su casilla, necesario para saber cuál llegó en último lugar (R-023).
- **Premio**: cantidad de casillas (20 o 10) que un jugador debe mover con una de sus fichas.
- **Evento**: se amplía con ficha comida, premio ganado y premio perdido.

## 10. Casos límite

- Terminar en la casilla de salida de otro color con una sola rival, sin salir de casa → conviven (R-052).
- Terminar en la propia casilla de salida con una sola rival, sin salir de casa → conviven; solo se come al salir (R-052).
- Salir con una ficha propia y una rival en la salida → se sale comiendo y quedan 2 fichas propias.
- Salir con 2 fichas rivales del mismo color en la salida → come la que llegó en último lugar.
- Premio de 20 con todas las demás fichas en casa o en meta → solo puede usarlo la ficha que ha comido, si puede moverse 20.
- Fichas en casa con un premio pendiente → no pueden usarlo; solo se sale con un 5 (R-020).
- Premio de 10 cuya única ficha en juego es la que acaba de llegar a meta → se pierde.
- Meter la cuarta ficha en meta con un movimiento de premio → la partida termina y no se gana el premio de 10 (R-090).
- Comer con un movimiento de premio cuyo destino es un seguro con una sola rival → conviven y no hay premio nuevo.
- Rebote que pasa por la meta y termina en el pasillo → no cuenta como llegar ni da premio (R-071).
- Rebote que llega a la primera casilla del pasillo con casillas sobrantes → vuelve a avanzar hacia la meta.
- Movimiento de premio de una ficha del pasillo que terminaría en una casilla con 2 fichas → no es legal; si no hay otro, el premio se pierde (R-080).
- Intentar mover una ficha que no está entre los movimientos de premio → se rechaza y el estado no cambia.
- Atravesar casillas con 2 fichas durante un movimiento de premio → se permite mientras no haya barreras (RF-012 de SPEC 001, provisional).

## 11. Criterios de éxito

- **CE-01**: Existe al menos un test con su identificador para cada una de R-022, R-023, R-050, R-051, R-052, R-071, R-072, R-080 y R-081.
- **CE-02**: Los tests de propiedades simulan al menos 1000 partidas aleatorias de 2, 3 y 4 jugadores sin que ninguna incumpla I-01 a I-06 ni la propiedad de RNF-004.
- **CE-03**: En esas partidas aleatorias se produce al menos una vez cada uno de estos hechos: comer en el recorrido común, salir comiendo, premio de 20, premio de 10, premio perdido, premio encadenado y rebote múltiple.
- **CE-04**: Los tres tests de la tabla de la sección 7 llevan su nombre nuevo y ningún test menciona RF-008 o RF-013 como provisionales.
- **CE-05**: La comprobación completa del proyecto (formato, lint y tests) pasa sin errores.

## 12. Supuestos y dependencias

- Depende de SPEC 001: tablero, salida, avance, meta, rebote simple, turnos y tests de propiedades.
- Sin el seis implementado, una tirada de 6 sigue contando 6 casillas y no repite turno; los premios no se ven afectados por R-030 a R-032.
- Sin barreras implementadas, sigue vigente RF-012 de SPEC 001: los movimientos, también los de premio, atraviesan casillas con 2 fichas.
- La «primera casilla del pasillo» de R-071 es el punto donde el rebote vuelve a avanzar; la ficha nunca vuelve al recorrido común.
- Depende de `specs/constitucion.md` y `specs/reglamento.md`.

## 13. Decisiones tomadas y descartadas

- **Sí:** reescribir en su sitio los tests de RF-008 y RF-013 de SPEC 001. El diff deja ver el cambio de comportamiento sobre el mismo escenario.
- **No:** borrarlos y crear tests nuevos. Se pierde el rastro directo del cambio.
- **Sí:** no tocar el documento de SPEC 001. Queda como histórico; este spec declara la sustitución.
- **No:** anotar la sustitución en SPEC 001. Decisión del usuario.
- **Sí:** eventos de ficha comida, premio ganado y premio perdido. La presentación puede anunciar cada hecho al lector de pantalla (P-15) sin deducirlo del estado.
- **No:** deducir el premio pendiente solo del estado. Llevaría lógica a la presentación (P-05).
- **Sí:** el jugador envía el movimiento de premio aunque solo haya uno posible. Coherente con la tirada en SPEC 001.
- **No:** aplicar el premio solo si hay una única opción. Rompe la coherencia con SPEC 001.
- **Sí:** propiedad propia del spec en los tests de propiedades (fuera de seguro no conviven dos colores). Comprueba que comer siempre se aplica.
- **No:** añadirla como invariante I-07 del reglamento. Las barreras y otros specs podrían matizarla; el reglamento no debe cambiar por ello.
- **No:** limitarse a I-01 a I-06. No detectaría una comida que no se aplica.
- **Sí:** tres partes: comer, premios y propiedades. Cada una se prueba sola y comer no depende de premios.
- **No:** juntar premios y propiedades. La segunda parte quedaría demasiado grande.

## 14. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Las partidas aleatorias no producen algún hecho de CE-03, como premios encadenados o rebote múltiple, y los tests de propiedades no lo cubren | Comprobar CE-03 con un test que cuente los eventos producidos; si falta alguno, ajustar la elección de movimientos de las partidas simuladas, nunca la comprobación |
| Saber qué ficha llegó en último lugar exige historial que el estado actual no guarda | Revisar el modelo en el plan de PARTE-01 antes de escribir código |
| Otros tests de SPEC 001 dependen sin decirlo de la convivencia con rivales | Ejecutar todos los tests de SPEC 001 al cerrar PARTE-01 y revisar los que fallen según la sección 7 |

## 15. Partes / incrementos

### PARTE-01: Comer

- **Objetivo**: comer fichas rivales en el recorrido común y al salir de casa.
- **Alcance**: comer fuera de seguro, seguros compartidos, salir comiendo, salida bloqueada solo por fichas propias, elección de la última llegada, evento de ficha comida y reescritura de los tests de SPEC 001. Todavía sin premios.
- **Cubre**: HU-01, HU-02 · RF-001, RF-002, RF-003, RF-004, RF-005, RF-014 · RNF-003
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-01 y HU-02, y CE-04.

### PARTE-02: Premios

- **Objetivo**: ganar, usar, perder y encadenar premios.
- **Alcance**: premios de 20 y 10, premio pendiente, movimientos de premio, pérdida, encadenamiento, rebote múltiple y eventos de premio.
- **Cubre**: HU-03, HU-04, HU-05, HU-06, HU-07 · RF-006, RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-015
- **Depende de**: PARTE-01
- **Hecho cuando**: se cumplen los criterios de HU-03 a HU-07 y CE-01.

### PARTE-03: Propiedades con comer y premios

- **Objetivo**: comprobar invariantes y la propiedad nueva en partidas que comen y usan premios.
- **Alcance**: partidas aleatorias que resuelven premios, propiedad de RNF-004 y recuento de hechos de CE-03.
- **Cubre**: RNF-004
- **Depende de**: PARTE-02
- **Hecho cuando**: se cumplen CE-02 y CE-03.

**Transversales**: RNF-001, RNF-002
**Orden sugerido**: PARTE-01 → PARTE-02 → PARTE-03

## 16. Preguntas abiertas

Ninguna.

## 17. Qué NO entra en este spec

- Barreras (R-042, R-060, R-061, R-062, R-063), incluida la regla provisional RF-012 de SPEC 001, que sigue vigente.
- El seis: repetir tirada, seis vale siete y tres seises (R-030, R-031, R-032).
- Tirada inicial para decidir quién empieza (R-010).
- Interfaz Angular: tablero visual, interacción con teclado o ratón y accesibilidad.
- Guardado de partidas en el navegador.
- Modificar el documento de SPEC 001.

Cada uno de estos, si llega, irá en su propio spec.
