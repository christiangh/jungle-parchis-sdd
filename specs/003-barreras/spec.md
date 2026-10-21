# SPEC 003 — Barreras

> **Estado:** Implementado
> **Depende de:** SPEC 001, SPEC 002
> **Fecha:** 2026-10-18
> **Autor:** Christian Garcia
> **Objetivo:** Que el motor de reglas aplique las barreras, de un color o mixtas en un seguro, impidiendo atravesarlas o terminar en ellas en los movimientos de tirada y de premio, salvo al salir de casa comiendo.

## 1. Resumen

Tercer spec del motor de reglas: añade las barreras del recorrido común, que ninguna ficha puede atravesar ni ocupar, tampoco las de su dueño, con la única excepción de salir de casa comiendo. Sustituye la regla provisional RF-012 de SPEC 001 y revisa de forma explícita el test que cambia de comportamiento. Aporta el principal recurso defensivo del parchís sin entrar todavía en abrir barreras con un 6.

## 2. Contexto y problema

Tras SPEC 001 y SPEC 002 el motor come, da premios y llega a meta, pero una ficha atraviesa cualquier casilla con 2 fichas (RF-012 de SPEC 001), regla marcada como provisional a la espera de este spec. Sin barreras, bloquear el paso a un rival no tiene ningún efecto, los premios de 20 nunca se pierden por un bloqueo y las partidas simuladas no se parecen al parchís real.

## 3. Objetivos y alcance

### Objetivos

- Que ningún movimiento del motor, de tirada o de premio, atraviese ni termine en una barrera, salvo al salir de casa comiendo.
- Tener un test con su identificador por cada regla del reglamento que entra en este spec.
- Sustituir la regla provisional RF-012 de SPEC 001 dejando rastro del test que cambia.
- Ampliar los tests de propiedades para que cubran las barreras.

### Entra

- Qué es una barrera: 2 fichas de un color en una casilla del recorrido común, o de colores distintos en un seguro (R-060).
- Ninguna ficha atraviesa ni termina en una barrera, tampoco las de su dueño (R-042, R-061).
- Excepción de salir de casa comiendo con una barrera en la casilla de salida (R-023).
- Sin barreras en el pasillo (R-063).
- Barreras aplicadas por igual a los movimientos de tirada y de premio, incluida la pérdida del premio bloqueado (R-080).
- Consulta de las barreras de un estado.
- Revisión de los tests de SPEC 001 y SPEC 002 afectados por RF-012 de SPEC 001.
- Tests de propiedades sobre partidas aleatorias con barreras.

### Fuera de alcance (para specs futuros)

- Abrir barrera con un 6 (R-062), que irá con el spec del seis.
- El resto del seis: repetir tirada, seis vale siete y tres seises (R-030, R-031, R-032).
- Tirada inicial para decidir quién empieza (R-010).
- Eventos de barrera formada o abierta.
- Interfaz Angular: tablero visual, interacción con teclado o ratón y accesibilidad.
- Guardado de partidas en el navegador.
- Modificar los documentos de SPEC 001 y SPEC 002.

## 4. Usuarios y actores

- **Jugador**: forma barreras para cortar el paso a los rivales y sufre las suyas y las de los demás.
- **Capa de presentación**: consumidor futuro del motor; consulta qué casillas tienen barrera para pintarlas y anunciarlas, y los movimientos legales que ya las tienen en cuenta.

## 5. Glosario

Se reutilizan los glosarios de SPEC 001 (recorrido común, casa, casilla de salida, casilla de entrada, pasillo, meta, tirada, movimiento legal, acción y evento) y SPEC 002 (seguro, comer, premio, premio pendiente, movimiento de premio y rebote múltiple).

- **Barrera**: casilla del recorrido común con 2 fichas, del mismo color o, en un seguro, de colores distintos (R-060).
- **Barrera de un color**: barrera cuyas 2 fichas son del mismo color.
- **Barrera mixta**: barrera de un seguro cuyas 2 fichas son de colores distintos.
- **Atravesar**: pasar por una casilla durante un movimiento sin terminar en ella. La casilla de origen no se atraviesa.

## 6. Historias de usuario

### HU-01: Cortar el paso con una barrera (P1)

**Como** jugador, **quiero** que ninguna ficha pueda atravesar ni terminar en una barrera, **para** bloquear el avance de los rivales.

**Criterios de aceptación**

1. **Dado** una ficha amarilla en la casilla 10 y dos rojas en la 12, **cuando** se calculan los movimientos de un 4, **entonces** ese movimiento no es legal (R-061).
2. **Dado** una ficha amarilla en la casilla 10 y dos amarillas en la 12, **cuando** se calculan los movimientos de un 4, **entonces** la ficha de la 10 no puede moverse, y las de la 12 sí (R-061).
3. **Dado** una ficha azul en la casilla 10 y en la 12, que es un seguro, una amarilla y una roja, **cuando** se calculan los movimientos de un 4, **entonces** ese movimiento no es legal (R-060, R-061).
4. **Dado** una ficha amarilla en la casilla 66 y dos rojas en la 68, entrada de amarillo, **cuando** se calculan los movimientos de un 4, **entonces** no puede entrar en su pasillo (R-061).
5. **Dado** una ficha amarilla en la casilla 10 y dos rojas en la 13, **cuando** se calculan los movimientos de un 3, **entonces** ese movimiento no es legal (R-042).
6. **Dado** una ficha amarilla cuya única tirada posible atraviesa una barrera y el resto de sus fichas en casa sin un 5 o en meta, **cuando** tira, **entonces** pierde la tirada (R-012, R-061).

### HU-02: Salir de casa comiendo a través de una barrera (P1)

**Como** jugador, **quiero** poder salir de casa comiendo aunque en mi salida haya una barrera, **para** que nadie me encierre en casa.

**Criterios de aceptación**

1. **Dado** amarillo con fichas en casa y dos fichas rojas en la casilla 5, **cuando** saca un 5, **entonces** sale comiendo a una de ellas (R-023).
2. **Dado** amarillo con fichas en casa y en la casilla 5 una ficha amarilla y una roja, **cuando** saca un 5, **entonces** sale comiendo a la roja (R-023).
3. **Dado** una ficha azul en la casilla 3 y en la 5 una amarilla y una roja, **cuando** se calculan los movimientos de un 4, **entonces** ese movimiento no es legal, porque la excepción solo vale al salir de casa (R-061, R-023).

### HU-03: Barreras en los movimientos de premio (P1)

**Como** jugador, **quiero** que los premios respeten las barreras igual que las tiradas, **para** que una barrera también corte un contar 20 o un contar 10.

**Criterios de aceptación**

1. **Dado** amarillo con un premio de 20 pendiente, una ficha en la casilla 10 y dos rojas en la 20, **cuando** se calculan los movimientos de premio, **entonces** esa ficha no puede usarlo (R-061, R-080).
2. **Dado** amarillo con un premio de 20 pendiente y como única ficha en juego una cuyo recorrido de 20 atraviesa una barrera, **cuando** se resuelve, **entonces** el premio se pierde (R-080).
3. **Dado** amarillo con un premio de 10 pendiente, una ficha en la casilla 30 y dos rojas en la 35, **cuando** se calculan los movimientos de premio, **entonces** esa ficha no puede usarlo (R-061, R-080).

### HU-04: Pasillo sin barreras (P2)

**Como** jugador, **quiero** que mis fichas se adelanten entre sí en el pasillo, **para** que dos fichas del pasillo no bloqueen a las demás.

**Criterios de aceptación**

1. **Dado** una ficha amarilla en la primera casilla de su pasillo y dos amarillas en la tercera, **cuando** mueve 4, **entonces** termina en la quinta casilla del pasillo (R-063).
2. **Dado** una ficha amarilla en la séptima casilla de su pasillo y dos amarillas en la sexta, **cuando** mueve 6 y rebota, **entonces** termina en la tercera casilla del pasillo (R-063, R-071).

### HU-05: Consultar las barreras (P2)

**Como** capa de presentación, **quiero** saber qué casillas tienen barrera, **para** pintarlas y anunciarlas sin decidir yo las reglas (P-05, P-15).

**Criterios de aceptación**

1. **Dado** dos fichas rojas en la casilla 14, **cuando** consulto las barreras, **entonces** aparece la 14 con esas dos fichas (R-060).
2. **Dado** una ficha amarilla y una roja en la casilla 12, que es un seguro, **cuando** consulto las barreras, **entonces** aparece la 12 con esas dos fichas (R-060).
3. **Dado** dos fichas amarillas en la misma casilla de su pasillo, **cuando** consulto las barreras, **entonces** esa casilla no aparece (R-063).

## 7. Requisitos funcionales

- **RF-001**: El sistema debe considerar barrera toda casilla del recorrido común con 2 fichas, sean del mismo color o, en un seguro, de colores distintos (R-060).
- **RF-002**: El sistema debe impedir que un movimiento atraviese una barrera, sea cual sea el color de sus fichas y el de la ficha que se mueve (R-042, R-061). Sustituye RF-012 de SPEC 001.
- **RF-003**: El sistema debe impedir que un movimiento termine en una barrera, salvo al salir de casa comiendo (R-041, R-042, R-061, R-023).
- **RF-004**: El sistema debe permitir que una ficha que forma parte de una barrera salga de ella, porque la casilla de origen no se atraviesa.
- **RF-005**: El sistema debe aplicar en el pasillo solo la ocupación máxima de su casilla de destino, sin barreras, también durante el rebote (R-063, R-041, R-071).
- **RF-006**: El sistema debe aplicar las barreras por igual a los movimientos de tirada y de premio, y hacer perder el premio cuando ninguna ficha puede usarlo por ellas (R-080).
- **RF-007**: El sistema debe permitir consultar, para cualquier estado, las casillas del recorrido común con barrera y las 2 fichas que la forman (R-060).

### Cambios de comportamiento respecto a SPEC 001 y SPEC 002

Los tests de la regla provisional sustituida se reescriben en su sitio: mismo escenario, nuevo resultado esperado y nombre con la regla definitiva, sin «provisional».

| Test | Comportamiento anterior | Comportamiento nuevo | Nuevo nombre |
|------|-------------------------|----------------------|--------------|
| «RF-012 (provisional): atraviesa una casilla con 2 fichas» (SPEC 001) | La ficha amarilla de la 10 atraviesa las dos rojas de la 12 y termina en la 14 | No hay movimientos legales: las dos rojas de la 12 son una barrera | «R-061: no atraviesa una barrera de otro color» |

Ningún test de SPEC 002 cambia de comportamiento: ninguno atraviesa una casilla con 2 fichas, y los que terminan en una ya eran ilegales por R-041. Los tests de propiedades de SPEC 002 siguen comprobando lo mismo, ahora sobre partidas con barreras. El resto de tests de SPEC 001 y SPEC 002 debe pasar sin modificarse; si alguno más cambia de comportamiento, se revisa igual que este y se añade a esta tabla antes de cerrar la parte.

## 8. Requisitos no funcionales

- **RNF-001**: El motor sigue sin depender de Angular ni de otras librerías de ejecución, no modifica el estado recibido y no genera azar (P-01 a P-04, P-10).
- **RNF-002**: Cada regla del reglamento que entra en este spec tiene al menos un test cuyo nombre incluye su identificador, escrito antes que el código y visto fallar (P-06, P-07).
- **RNF-003**: El test de SPEC 001 que cambia se reescribe según la tabla de la sección 7; ninguno se desactiva, salta ni debilita (P-09).
- **RNF-004**: Los tests de propiedades simulan partidas aleatorias de 2, 3 y 4 jugadores con barreras, y comprueban tras cada acción I-01 a I-06, la propiedad de RNF-004 de SPEC 002 y que ningún movimiento atraviesa ni termina en una barrera, salvo al salir de casa comiendo (P-08).

## 9. Entidades clave

- **Barrera**: casilla del recorrido común y las 2 fichas que la forman; se deduce de la posición de las fichas, no se guarda aparte.

## 10. Casos límite

- Barrera de un color en la casilla de entrada de otro color → nadie la atraviesa; el dueño de la entrada no llega a su pasillo hasta que se abra.
- Barrera del propio color delante de una ficha propia → la bloquea igual que una rival (R-061).
- Barrera mixta en la casilla de salida de un color → nadie la atraviesa; el dueño de la salida aún puede salir comiendo a la rival (R-023).
- Ficha que forma parte de una barrera → puede salir de ella; la otra ficha queda sola y la barrera desaparece.
- Destino justo antes de una barrera → legal; la barrera no se atraviesa.
- Una ficha que come en la casilla anterior a una barrera → legal.
- Dos fichas de colores distintos fuera de un seguro → no ocurre, porque se come (R-050).
- Dos fichas del mismo color en una casilla del pasillo → no es barrera; se pueden adelantar, pero no se puede terminar en ella (R-063, R-041).
- Rebote en el pasillo que pasa por una casilla con 2 fichas → legal; solo cuenta el destino (R-063).
- Premio de 20 o de 10 cuyo recorrido atraviesa una barrera y sin otra ficha que pueda usarlo → se pierde (R-080).
- Tirada de 6 con una barrera propia → no obliga a abrirla mientras R-062 no esté implementada; sigue contando 6 casillas.
- Todas las fichas en juego bloqueadas por barreras y sin un 5 con fichas en casa → se pierde la tirada (R-012).

## 11. Criterios de éxito

- **CE-01**: Existe al menos un test con su identificador para cada una de R-042, R-060, R-061 y R-063, y uno de R-023 con una barrera en la casilla de salida.
- **CE-02**: Los tests de propiedades simulan al menos 1000 partidas aleatorias de 2, 3 y 4 jugadores sin que ninguna incumpla I-01 a I-06, la propiedad de RNF-004 de SPEC 002 ni la de RNF-004 de este spec.
- **CE-03**: En esas partidas aleatorias se produce al menos una vez cada uno de estos hechos: barrera de un color, barrera mixta, movimiento descartado por atravesar una barrera, salida comiendo con barrera en la salida y premio perdido por una barrera, además de los hechos de CE-03 de SPEC 002.
- **CE-04**: El test de la tabla de la sección 7 lleva su nombre nuevo y ningún test menciona RF-012 como provisional.
- **CE-05**: La comprobación completa del proyecto (formato, lint y tests) pasa sin errores.

## 12. Supuestos y dependencias

- Depende de SPEC 001 (tablero, salida, avance, meta, rebote, turnos) y de SPEC 002 (comer, salir comiendo, premios y tests de propiedades).
- Sin R-062 implementada, una barrera solo se abre cuando su dueño decide mover una de sus fichas o cuando le comen una al salir de casa.
- Sin el seis implementado, una tirada de 6 sigue contando 6 casillas y no repite turno.
- La casilla de origen de un movimiento no se atraviesa, así que una ficha siempre puede salir de su barrera.
- Salir de casa no atraviesa ninguna casilla: la ficha se coloca directamente en su salida (R-020).
- Depende de `specs/constitucion.md` y `specs/reglamento.md`.

## 13. Decisiones tomadas y descartadas

- **Sí:** el motor expone una consulta de las barreras de un estado. Angular las pinta y anuncia sin decidir qué es una barrera (P-05, P-15).
- **No:** eventos de barrera formada o abierta. Más superficie sin necesidad; la consulta basta para la presentación.
- **No:** que la presentación deduzca las barreras del estado. Llevaría una regla del juego a Angular (P-05).
- **Sí:** reescribir en su sitio el test de RF-012 de SPEC 001. El diff deja ver el cambio de comportamiento sobre el mismo escenario, como en SPEC 002.
- **No:** borrarlo y crear tests nuevos. Se pierde el rastro directo del cambio.
- **Sí:** no tocar los documentos de SPEC 001 y SPEC 002. Quedan como histórico; este spec declara la sustitución.
- **Sí:** propiedad propia de barreras en los tests de propiedades y hechos de CE-03 que demuestren que las barreras aparecen y bloquean. Sin ellos, una barrera atravesada pasaría desapercibida.
- **No:** limitarse a I-01 a I-06. No detectaría una barrera atravesada.
- **Sí:** abrir barrera con un 6 (R-062) fuera de este spec. Depende del seis, que irá en su propio spec.
- **Sí:** dos partes: reglas de barreras y propiedades. Cada una se prueba sola, como en SPEC 002.
- **No:** separar tirada y premio en partes distintas. Comparten la misma regla de movimiento.

## 14. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Sin R-062, las barreras se mantienen indefinidamente y las partidas aleatorias no terminan dentro del límite de acciones | Medir en PARTE-02 cuántas partidas se detienen por el límite; si alguna lo hace, ajustar el límite o la elección de movimientos, nunca la comprobación |
| Hechos raros de CE-03, como el premio perdido por una barrera o la salida comiendo con barrera, no aparecen en las partidas aleatorias | Contarlos con el mismo test que los de SPEC 002; si falta alguno, ajustar la elección de movimientos de las partidas simuladas, nunca la comprobación |
| Otros tests de SPEC 001 o SPEC 002 atraviesan sin decirlo casillas con 2 fichas | Ejecutar todos los tests al cerrar PARTE-01 y revisar los que fallen según la sección 7 |

## 15. Partes / incrementos

### PARTE-01: Reglas de barreras

- **Objetivo**: aplicar las barreras a los movimientos de tirada y de premio.
- **Alcance**: definición de barrera, prohibición de atravesarla y de terminar en ella, excepción de salir comiendo, pasillo sin barreras, pérdida del premio bloqueado, consulta de barreras y reescritura del test de SPEC 001.
- **Cubre**: HU-01, HU-02, HU-03, HU-04, HU-05 · RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007 · RNF-003
- **Depende de**: —
- **Hecho cuando**: se cumplen los criterios de HU-01 a HU-05, CE-01 y CE-04.

### PARTE-02: Propiedades con barreras

- **Objetivo**: comprobar invariantes y la propiedad de barreras en partidas aleatorias.
- **Alcance**: propiedad de RNF-004 y recuento de los hechos nuevos de CE-03.
- **Cubre**: RNF-004
- **Depende de**: PARTE-01
- **Hecho cuando**: se cumplen CE-02 y CE-03.

**Transversales**: RNF-001, RNF-002
**Orden sugerido**: PARTE-01 → PARTE-02

## 16. Preguntas abiertas

Ninguna.

## 17. Qué NO entra en este spec

- Abrir barrera con un 6 (R-062), que irá con el spec del seis.
- El resto del seis: repetir tirada, seis vale siete y tres seises (R-030, R-031, R-032).
- Tirada inicial para decidir quién empieza (R-010).
- Eventos de barrera formada o abierta.
- Interfaz Angular: tablero visual, interacción con teclado o ratón y accesibilidad.
- Guardado de partidas en el navegador.
- Modificar los documentos de SPEC 001 y SPEC 002.

Cada uno de estos, si llega, irá en su propio spec.
