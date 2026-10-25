# Constitución del proyecto

Principios no negociables de `jungle-parchis-sdd`. Todo spec, plan y cambio de código debe cumplirlos. Si un spec necesita saltarse alguno, primero se modifica esta constitución en su propio commit, con el motivo.

Las reglas del juego no están aquí: viven en `specs/reglamento.md`.

## 1. Arquitectura

- **P-01 · Motor puro.** El motor de reglas (`src/engine/`) es TypeScript sin dependencias de Angular ni de ninguna otra librería de ejecución. No importa nada de `@angular/*` ni de `src/app/`.
- **P-02 · Una sola puerta de entrada.** La aplicación solo importa del motor a través de `src/engine/index.ts`.
- **P-03 · Transiciones puras.** El motor no tiene estado propio ni efectos secundarios: recibe un estado y una acción, y devuelve un estado nuevo y la lista de eventos producidos. Nunca modifica el estado recibido.
- **P-04 · Azar desde fuera.** El motor no genera números aleatorios. El valor del dado llega como parte de la acción, de modo que cualquier partida se puede reproducir.
- **P-05 · Angular solo presenta.** La capa Angular pinta el estado, recoge las intenciones del jugador y las envía al motor. Ninguna regla del juego se decide en un componente o servicio.

Criterio para decidir dónde va algo: si seguiría siendo cierto jugando en un tablero de cartón, va en el motor; si solo existe porque hay una pantalla, va en Angular.

## 2. Calidad

- **P-06 · Toda regla tiene test.** Cada regla del reglamento que se implementa tiene al menos un test, y el nombre del test incluye su identificador (`R-012`).
- **P-07 · Tests primero.** En el motor y en la lógica de la aplicación (estado, derivaciones y funciones puras), los tests de los escenarios del spec se escriben antes que el código y se ejecutan para comprobar que fallan en sus aserciones, no por errores de compilación. Solo entonces se implementa. Las plantillas, los estilos y los recursos puramente visuales pueden probarse después, en el mismo paso.
- **P-08 · Invariantes globales.** Existe un conjunto de invariantes del juego probados con tests basados en propiedades (fast-check) sobre partidas aleatorias. Ninguna feature puede romperlos.
- **P-09 · Sin trampas.** Nunca se desactivan, saltan ni debilitan tests, aserciones o reglas de lint para que algo pase.
- **P-10 · La frontera se comprueba.** Los principios P-01 y P-02 se hacen cumplir con reglas de lint, no solo con revisión.

## 3. Proceso

- **P-11 · Nada sin spec.** No se implementa ninguna funcionalidad sin un spec en estado `Aprobado`.
- **P-12 · Aprueba una persona.** Solo una persona cambia el estado de un spec a `Aprobado` o `Implementado`.
- **P-13 · Commits humanos.** Los commits los hace siempre una persona, después de revisar el diff.
- **P-14 · Historial legible.** Cada commit tiene un único propósito y sigue Conventional Commits. Las features implementadas desde un spec usan `feat(spec-NNN)`.

## 4. Producto

- **P-15 · Accesible.** La partida se puede jugar entera con teclado y lector de pantalla, y cumple WCAG 2.2 AA.
- **P-16 · Local y sin cuentas.** El juego funciona sin backend ni registro. Los datos solo se guardan en el navegador del jugador.
- **P-17 · Dependencias justificadas.** No se añade ninguna dependencia sin justificarla en el plan de la parte que la necesita.
