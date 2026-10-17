# Reglamento del parchís

Reglas del juego de `jungle-parchis-sdd`, basadas en el parchís español clásico. Los specs citan estas reglas por su identificador (`R-NNN`) y no las redefinen. Si una regla cambia, se modifica aquí en su propio commit y los specs afectados se revisan.

El reglamento no habla de pantallas ni de temática: describe el juego como si fuera un tablero de cartón.

Cada apartado usa su propia decena de identificadores (salida en R-02x, el seis en R-03x…), para poder añadir reglas sin renumerar.

## 1. Material y tablero

- **R-001 · Jugadores.** Juegan de 2 a 4 jugadores. Cada jugador tiene un color (amarillo, azul, rojo o verde) y 4 fichas de ese color.
- **R-002 · Dado.** Se juega con un único dado de seis caras.
- **R-003 · Recorrido común.** El tablero tiene un recorrido común de 68 casillas numeradas del 1 al 68, en el que el 68 va seguido del 1.
- **R-004 · Casa.** Cada color tiene una casa donde empiezan sus 4 fichas. Las fichas en casa no están en el tablero.
- **R-005 · Casillas de salida.** Cada color tiene una casilla de salida en el recorrido común: amarillo la 5, azul la 22, rojo la 39 y verde la 56.
- **R-006 · Seguros.** Son seguros las casillas 5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63 y 68. Las casillas de salida también son seguros.
- **R-007 · Pasillo y meta.** Cada color tiene un pasillo propio de 7 casillas que termina en su meta. Solo las fichas de ese color pueden entrar en él.
- **R-008 · Entrada al pasillo.** Cada ficha da casi una vuelta completa y entra en su pasillo desde la casilla de entrada de su color: amarillo la 68, azul la 17, rojo la 34 y verde la 51. Desde ahí, el siguiente paso es la primera casilla de su pasillo, no la siguiente del recorrido común.
- **R-009 · Ocupación máxima.** En una casilla del recorrido común o del pasillo puede haber como mucho 2 fichas. La meta no tiene límite.

## 2. Turnos

- **R-010 · Orden.** Empieza el jugador que saque el número más alto en una tirada inicial; si hay empate, repiten los empatados. Después se juega en el sentido de las agujas del reloj.
- **R-011 · Turno.** En su turno, el jugador tira el dado y mueve una ficha según el resultado.
- **R-012 · Movimiento obligatorio.** Si hay al menos un movimiento legal, el jugador debe hacer uno. Si no hay ninguno, pierde la tirada.
- **R-013 · Una ficha por tirada.** Cada tirada mueve una única ficha, el número exacto de casillas. No se puede repartir entre varias fichas.

## 3. Salir de casa

- **R-020 · Salida con 5.** Una ficha solo sale de casa con un 5, y se coloca en la casilla de salida de su color.
- **R-021 · Salida obligatoria.** Si un jugador saca un 5, tiene fichas en casa y su casilla de salida lo permite, debe sacar una ficha.
- **R-022 · Salida bloqueada.** No se puede salir si en la casilla de salida ya hay 2 fichas del propio color.
- **R-023 · Comer al salir.** Si al salir hay una o dos fichas rivales en la casilla de salida, la ficha que sale come a una de ellas aunque la salida sea un seguro: la ficha comida vuelve a su casa y se gana el premio de R-051. Si hay dos rivales, come a la que llegó en último lugar.

## 4. El seis

- **R-030 · Repetir tirada.** Quien saca un 6 mueve y vuelve a tirar.
- **R-031 · El seis vale siete.** Si un jugador no tiene fichas en casa, cada 6 cuenta como 7 casillas. Las fichas en meta no cuentan como fichas en casa.
- **R-032 · Tres seises.** Si un jugador saca tres seises seguidos en el mismo turno, no mueve con el tercero: la última ficha que movió vuelve a casa y su turno termina. La última ficha movida es la del último movimiento hecho, sea con una tirada o con un premio. Si esa ficha está en el pasillo o en la meta, no vuelve a casa, pero el turno termina igualmente.

## 5. Movimiento

- **R-040 · Sentido.** Las fichas avanzan siempre hacia delante por el recorrido común y después por su pasillo. Nunca retroceden, salvo en el rebote (R-071).
- **R-041 · Casillas ocupadas.** Una ficha no puede terminar su movimiento en una casilla que ya tiene 2 fichas, salvo al salir de casa comiendo (R-023).
- **R-042 · Barreras.** No se puede atravesar ni terminar en una casilla con barrera (R-060), salvo al salir de casa comiendo (R-023).

## 6. Comer

- **R-050 · Comer.** Una ficha que termina su movimiento en una casilla del recorrido común ocupada por una única ficha rival la come, salvo que la casilla sea un seguro. La ficha comida vuelve a su casa.
- **R-051 · Premio por comer.** Quien come cuenta 20: mueve 20 casillas con una de sus fichas, a su elección, antes de su siguiente tirada.
- **R-052 · Seguros compartidos.** En un seguro pueden convivir dos fichas de distinto color sin comerse. La única excepción es la casilla de salida al sacar ficha (R-023).

## 7. Barreras

- **R-060 · Qué es una barrera.** Hay barrera en una casilla del recorrido común cuando en ella hay 2 fichas, sean del mismo color o, en un seguro, de colores distintos.
- **R-061 · Nadie atraviesa una barrera.** Ninguna ficha puede atravesar una barrera ni terminar en ella, tampoco las del propio dueño. La única excepción es salir de casa comiendo (R-023).
- **R-062 · Abrir barrera con seis.** Si un jugador saca un 6 y tiene una barrera de su color, debe mover una de las fichas de esa barrera, siempre que alguna pueda moverse. Esta regla no aplica a las barreras mixtas de un seguro.
- **R-063 · Sin barreras en el pasillo.** En el pasillo las fichas pueden adelantarse entre sí; las barreras solo existen en el recorrido común.

## 8. Meta

- **R-070 · Llegar a meta.** Una ficha llega a meta cuando termina su movimiento justo en la meta de su color. Una ficha en meta no vuelve a moverse.
- **R-071 · Rebote.** Si a una ficha le sobran casillas para llegar a meta, avanza hasta la meta y retrocede por su pasillo las casillas sobrantes. Si llega al principio del pasillo y aún sobran, vuelve a avanzar hacia la meta, y así hasta agotar el movimiento. El rebote se aplica a cualquier movimiento, también a los premios. Pasar por la meta durante un rebote no cuenta como llegar: solo cuenta terminar en ella.
- **R-072 · Premio por llegar a meta.** Quien mete una ficha en meta cuenta 10: mueve 10 casillas con otra de sus fichas, a su elección, antes de su siguiente tirada.

## 9. Premios

- **R-080 · Uso de los premios.** Un premio (contar 20 o contar 10) se usa entero con una sola ficha, y se puede usar para comer o llegar a meta. Si ninguna ficha puede moverse esa cantidad, el premio se pierde; no se usa a medias. Gracias al rebote (R-071), una ficha del pasillo siempre puede usar un premio, salvo que termine en una casilla con 2 fichas (R-041).
- **R-081 · Premios encadenados.** Si al usar un premio se gana otro, se usa también antes de la siguiente tirada.

## 10. Fin de la partida

- **R-090 · Ganador.** Gana el primer jugador que mete sus 4 fichas en meta, y en ese momento termina la partida.

## Invariantes

Se cumplen en cualquier momento de cualquier partida. Son la base de los tests de propiedades (constitución, P-08).

- **I-01.** Cada jugador tiene siempre exactamente 4 fichas, sumando las que están en casa, en el tablero y en meta.
- **I-02.** Ninguna casilla del recorrido común ni del pasillo tiene más de 2 fichas.
- **I-03.** Solo hay fichas de un color en el pasillo de ese color.
- **I-04.** Una ficha que ha llegado a meta no sale de ella.
- **I-05.** El turno es siempre de un jugador que participa en la partida.
- **I-06.** Cuando la partida ha terminado, no se aceptan más acciones.

## Preguntas abiertas

Ninguna.
