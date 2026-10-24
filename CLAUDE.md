# jungle-parchis-sdd

Parchís con temática de jungla hecho con spec-driven design, como proyecto de portfolio. Partida local, sin backend.

@specs/constitucion.md

Las reglas del juego están en [`specs/reglamento.md`](specs/reglamento.md), con identificadores `R-NNN` e invariantes `I-NN`. Los specs que tocan el motor parten de él y citan sus reglas por identificador.

## Convenciones

- La constitución (`P-NN`) prevalece sobre todo lo demás. Los specs citan las reglas del reglamento por su identificador (`R-NNN`, `I-NN`) y no las redefinen.
- Los specs se crean con `/cgh-sdd:cgh-spec` y se implementan con `/cgh-sdd:cgh-spec-impl`. Cada uno vive en `specs/NNN-slug/`, con su `spec.md` y su `plan.md`.
- En el plan, cada paso de código del motor va precedido de su paso de tests (P-07). Los tests llevan en el nombre el identificador de la regla o del requisito que prueban, por ejemplo `R-050: …` o `RF-005: …`.
- El código del motor solo importa archivos del propio motor; sus tests pueden usar además `vitest` y `fast-check`. La aplicación importa el motor solo con el alias `@engine`. Lo comprueba ESLint.
- En `src/app/`, cada archivo agrupa un concepto con sus tipos y constantes, como recomienda la guía de estilo de Angular; lo compartido entre dominios va en `src/app/shared/`. Los componentes llevan el prefijo `jp-`.
- La paleta se define como tokens `@theme` de Tailwind en `src/styles.css`; en `src/app/` no hay colores en hexadecimal.
- Documentación en castellano. Código, comentarios y commits en inglés (Conventional Commits, con ámbito `spec-NNN`).
- Los mensajes de commit son de una sola línea, sin cuerpo ni `Co-Authored-By`.

## Comandos

El gestor de paquetes es pnpm, nunca npm.

- `pnpm start`: servidor de desarrollo en `http://localhost:4200/`.
- `pnpm check`: formato, lint y todos los tests, incluidos los de propiedades. Cierra cada parte de un spec.
- `pnpm test:once`: todos los tests menos los de propiedades; tarda segundos. Es el que se usa en cada paso.
- `pnpm test:properties`: solo los tests de propiedades (`src/engine/invariants.spec.ts`, 1000 partidas aleatorias).
- `pnpm test:e2e`: prueba de humo en Chromium con Playwright (`e2e/`), tras comprobar sus tipos (`tsconfig.e2e.json`). Levanta su propio `ng serve` con la configuración de producción en el puerto 4300; no ejecuta `ng build`. Fuera de `pnpm check`; corre en el CI. La primera vez: `pnpm exec playwright install chromium`.
- `pnpm test:coverage`, `pnpm lint:fix`, `pnpm format`.

## Angular 22

- Componentes standalone, sin `standalone: true` ni `ChangeDetectionStrategy.OnPush` explícitos: son el valor por defecto.
- Estado con signals: `input()`, `output()`, `model()`, `computed()` y `linkedSignal()`; se cambian con `set` o `update`, nunca con `mutate`.
- Host bindings en el objeto `host` del decorador, no con `@HostBinding` ni `@HostListener`.
- Plantillas simples con `@if`, `@for` y `@switch`; bindings `class` y `style`, sin `ngClass`, `ngStyle` ni `CommonModule`.
- Servicios con `@Service` e `inject()`. Formularios con Signal Forms. Rutas con lazy loading. `NgOptimizedImage` para imágenes estáticas.
- Pasa todas las comprobaciones de AXE y WCAG 2.2 AA: foco, contraste y ARIA.
