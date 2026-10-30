# Plan técnico — SPEC 008 — Equipos y campeón

> **Spec:** `specs/008-equipos-y-campeon/spec.md`
> **Rama:** `feat/spec-008-equipos-y-campeon`
> **Fecha:** 2026-10-30

## PARTE-01: Pantalla de campeón

**Estado:** Pendiente

### Enfoque

Un componente nuevo, `Champion` (`src/app/game/champion.ts`), reconstruye la pantalla de `docs/design/avisos-y-campeon` con la paleta y los componentes de la aplicación: capa oscura fija sobre toda la pantalla, rayos de sol detrás, tablón del color del ganador con su mascota flotando y el trofeo, «¡Campeón!» y, debajo, el botón «Nueva partida» de madera natural. El trofeo, los rayos y el confeti se dibujan en SVG y HTML propios, con colores de tokens nuevos. La posición, el tamaño y el ritmo de cada trozo de confeti salen de una función pura con semilla fija, como en el diseño, para que el confeti sea el mismo en cada partida y se pueda probar.

`App` pinta la pantalla de campeón fuera de `<main>` en cuanto el estado del motor tiene ganador, y marca `<main>` como `inert` mientras tanto: la partida sigue visible detrás, pero no la alcanzan ni el teclado ni el lector. La pantalla es un diálogo modal propio (`role="dialog"`, `aria-modal="true"`), sin manejadores de Escape ni de toque fuera, y el foco pasa al botón al crearse. Su único control es «Nueva partida», que llama a un método nuevo del almacén, `restart()`, que crea con el motor otra partida con los mismos equipos y vuelve todo lo de la pantalla (última jugada, cara del dado, selección) a su estado inicial. En PARTE-02 ese botón pasará a llevar a la pantalla de inicio.

Con movimiento reducido no se pinta el confeti, los rayos quedan quietos, la mascota no se anima y el trofeo no brilla. El componente lo lee al crearse con una función compartida, la misma que pasa a usar el almacén para el giro del dado; además, cada animación va con `motion-safe:` o dentro de `@media (prefers-reduced-motion: no-preference)`. En ventanas bajas (`max-height: 480px`) el botón se coloca al lado del tablón y la mascota, el trofeo y el título se reducen; por debajo de 520 px de ancho se reduce todo como en el diseño.

### Archivos

- `src/styles.css`: tokens de la capa, el trofeo, los rayos, el confeti y el botón de madera (`--color-champion-*`, `--color-trophy-*`); `@keyframes` y `--animate-*` del flotado de la mascota, el giro y el brillo de los rayos y la caída del confeti.
- `src/app/shared/reduced-motion.ts`, `reduced-motion.spec.ts` (nuevos): `REDUCED_MOTION` y `prefersReducedMotion(window)`.
- `src/app/game/game-store.ts`: usa `prefersReducedMotion`; método `restart()`.
- `src/app/game/game-store.spec.ts`: tests de `restart()`.
- `src/app/game/confetti.ts`, `confetti.spec.ts` (nuevos): `confettiPieces(color)` (función pura con semilla fija), `CONFETTI_COLORS` (clases de token por equipo) y el componente `Confetti`.
- `src/app/game/trophy.ts`, `trophy.html` (nuevos): componente `g[jp-trophy]`, trofeo con su brillo y destellos.
- `src/app/game/sun-rays.ts` (nuevo): componente `g[jp-sun-rays]`, 16 rayos y halo.
- `src/app/game/champion.ts`, `champion.html`, `champion.css`, `champion.spec.ts` (nuevos): pantalla de campeón con la salida `newGame`.
- `src/app/app.ts`, `app.html`: pinta `Champion` con ganador, `inert` en `<main>` y `restart()` al pulsar «Nueva partida».
- `src/app/app.spec.ts`: tests de la pantalla de campeón sobre la partida; `restart` en el almacén de prueba.

### Pasos

- [x] 1. Tokens de la capa, el trofeo, los rayos, el confeti y el botón en `src/styles.css`, con los colores del diseño (reutilizando los que ya existen, como `--color-wood`, `--color-wood-edge`, `--color-ink`, `--color-mascot-gold` o `--color-home-turn-glow`), y sus animaciones; búsqueda de hexadecimales en `src/app/` sin resultados (RNF-007).
- [x] 2. Tests de `reduced-motion.ts`, con un esqueleto que compila y los hace fallar: `true` si `prefers-reduced-motion: reduce` coincide, `false` si no, y `false` sin ventana o sin `matchMedia` (RNF-002).
- [ ] 3. `reduced-motion.ts`, hasta que pasen los tests del paso 2, y el almacén lo usa en lugar de su método privado; los tests del almacén pasan sin cambios.
- [ ] 4. Tests de `confettiPieces`, con un esqueleto que compila y los hace fallar: 46 trozos; colores solo de la paleta del equipo y todos usados; posición horizontal entre 0 y 100 %; duración entre 3,6 y 6,6 s con retardo negativo, para que caiga desde el primer instante; mismo resultado en cada llamada (RF-001).
- [ ] 5. `confettiPieces` y `CONFETTI_COLORS`, hasta que pasen los tests del paso 4.
- [ ] 6. Tests de `restart()` en `game-store.spec.ts`, con un esqueleto que no hace nada: tras unas tiradas y con una ficha seleccionada, `restart()` deja el estado igual a `createGame` con los mismos equipos (tirada inicial, turno de Amarillo), sin eventos ni último jugador, el dado en su cara inicial y que responde, y sin selección (RF-002, «Hecho cuando»).
- [ ] 7. `restart()`, hasta que pasen los tests del paso 6.
- [ ] 8. Componentes `Trophy`, `SunRays`, `Confetti` y `Champion`, con sus tests en `champion.spec.ts` en el mismo paso, porque son dibujo y plantilla: tablón del color del ganador con su mascota animada, trofeo, «¡Campeón!», rayos y confeti con su paleta, para los cuatro colores; ningún otro equipo ni puesto; `role="dialog"`, `aria-modal` y nombre accesible «¡Campeón! Gana Verde»; foco en «Nueva partida» al abrirse; Escape no emite nada; pulsar el botón emite `newGame`; con movimiento reducido, sin confeti, mascota sin animar y sin clases de animación (HU-01, RF-001, RF-002, RF-003, RNF-002, CE-01, CE-02).
- [ ] 9. Pantalla de campeón en `App`, con sus tests en `app.spec.ts`: con un estado ganador aparece sobre la partida, fuera de `<main>`, y `<main>` es `inert`; sin ganador, ni pantalla ni `inert`; tocar la capa fuera del tablón y pulsar Escape no la quitan; «Nueva partida» llama a `restart()`; con el almacén real, tras `restart()` el cartel vuelve a la tirada inicial de Amarillo con 16 fichas en casa y sin pestaña (HU-01, RF-002, RF-003, «Hecho cuando»).
- [ ] 10. Revisión manual en navegador de la pantalla de campeón a 320 × 568, 568 × 320, 768 × 1024 y 1920 × 1080, con y sin movimiento reducido, frente a las capturas del diseño: el tablón y el botón caben enteros, el confeti y los rayos no tapan el botón, y el contraste del texto se mantiene con los cuatro colores. La partida se lleva al ganador con un script de Playwright en el directorio temporal de la sesión, sin código en el proyecto. Resultado registrado en «Decisiones técnicas» (RF-001, RNF-003, RNF-004, CE-06 en lo que toca a esta pantalla).

### Pruebas y trazabilidad

| Elemento | Paso | Prueba |
| --- | --- | --- |
| HU-01.1 (pantalla de campeón verde con la rana, trofeo, rayos y confeti) | 4, 5, 8, 9 | `champion.spec.ts`: `HU-01.1: …` con verde y los otros tres colores; `confetti.spec.ts`: paleta del equipo; `app.spec.ts`: aparece con el estado ganador |
| HU-01.2 (anuncia el ganador, foco en nueva partida) | 8 | `champion.spec.ts`: nombre accesible «¡Campeón! Gana Verde» y `document.activeElement` en el botón |
| HU-01.3 (Escape y tocar fuera no la cierran) | 8, 9 | `champion.spec.ts`: Escape no emite `newGame`; `app.spec.ts`: tras Escape y un toque en la capa sigue la pantalla |
| HU-01.4 (solo el ganador) | 8 | `champion.spec.ts`: una sola mascota, la del ganador, y ningún nombre de otro equipo |
| RF-001 | 1, 4, 5, 8, 10 | Ver HU-01.1; revisión manual de la reducción por debajo de 520 px y de la variante baja |
| RF-002 | 6, 7, 8, 9 | `game-store.spec.ts`: `RF-002: …` de `restart()`; `champion.spec.ts`: el botón emite `newGame`; `app.spec.ts`: llama a `restart()` |
| RF-003 | 8, 9 | `champion.spec.ts`: `role`, `aria-modal`, nombre y foco; `app.spec.ts`: `<main>` `inert` |
| RNF-002 | 2, 3, 8, 10 | `reduced-motion.spec.ts`; `champion.spec.ts` con `matchMedia` simulado; revisión manual con movimiento reducido |
| RNF-001 (transversal) | 8, 9 | Ver RF-003; el botón es un `<button>` con texto visible |
| RNF-003 (transversal) | 1, 10 | Texto blanco con contorno de tinta, como el cartel de SPEC 007; botón con `--color-ink` sobre `--color-wood` (5,7:1 en el diseño); revisión manual |
| RNF-004 (transversal, solo esta pantalla) | 10 | Revisión manual en las cuatro ventanas |
| RNF-005 (botón ≥ 24 × 24 px) | 8 | `champion.spec.ts`: el botón lleva `min-h-14` |
| RNF-006 (transversal) | 1-10 | `git diff master -- src/engine` vacío |
| RNF-007 (transversal) | 1, 8 | Búsqueda de `#[0-9a-fA-F]{3,8}\b` en `src/app/` sin resultados; ningún archivo de `docs/design` importado; sin dependencias nuevas |
| CE-01 | 8 | `champion.spec.ts` |
| CE-02 | 8 | `champion.spec.ts`: `CE-02: …` con movimiento reducido |
| Hecho cuando: nueva partida empieza otra de 4 equipos desde la tirada inicial | 6, 7, 9 | `game-store.spec.ts` y `app.spec.ts` con el almacén real |

Comandos: `pnpm test:once` en cada paso; `pnpm check` y `pnpm test:e2e` al cerrar la parte.

### Skills y agentes

- MCP `angular-cli` (`get_best_practices`): convenciones de Angular 22 antes de escribir los componentes.
- `run` o `claude-in-chrome`: revisión manual del paso 10.
- `caveman:cavecrew-reviewer`: revisión del diff al cerrar la parte, si el usuario la pide.

### Decisiones técnicas

- **Sí:** diálogo modal propio con `role="dialog"`, `aria-modal="true"` e `inert` en `<main>`. Deja la partida fuera del alcance del teclado y del lector, y como «Nueva partida» es el único control, el foco no tiene adónde salir.
- **No:** `<dialog>` nativo con `showModal()`. El entorno de los tests unitarios (jsdom) no implementa `showModal`, y habría que simularlo; además, Escape lo cerraría por defecto y habría que cancelarlo.
- **Sí:** nombre accesible «¡Campeón! Gana Verde», con el título visible y el nombre del equipo como texto solo para el lector. Dice qué equipo ha ganado sin añadir texto visible que no está en el diseño.
- **Sí:** el tablón reutiliza el del cartel de turno (`TEAM_BG`, `TEAM_DARK_BORDER`, `bg-plank`, `text-outline-ink`) en lugar del borde y la sombra propios de cada color del diseño. Mismo aspecto que el cartel y contraste ya comprobado en SPEC 007, sin ocho tokens nuevos.
- **Sí:** la mascota va en una placa redonda del tono oscuro del equipo, como en el cartel y los medallones, flotando arriba y abajo. El diseño usa el fondo cuadrado de los componentes de `docs/design/mascotas`, que la aplicación no tiene.
- **Sí:** confeti de 46 trozos con la misma semilla y fórmula que el diseño, en una función pura. Es determinista y se prueba sin el navegador.
- **Sí:** movimiento reducido leído al crear la pantalla, con una función compartida en `src/app/shared/reduced-motion.ts` que también usa el almacén. Así el confeti ni se pinta y el test lo comprueba simulando `matchMedia`; las clases `motion-safe:` cubren además un cambio del ajuste con la pantalla abierta.
- **Sí:** `restart()` en el almacén crea la partida con los equipos de la actual (`state.players`). En PARTE-02 el botón llevará a la pantalla de inicio con esos mismos equipos.
- **Sí:** variante baja con `max-height: 480px`, el mismo umbral que ya pone la pantalla de partida en fila en horizontal: botón al lado del tablón y mascota, trofeo y título más pequeños.
- **Sí:** trofeo, rayos y confeti en archivos propios de `src/app/game/`, porque solo los usa la pantalla de campeón; PARTE-04 reutilizará la capa y el tablón, no estos efectos.
