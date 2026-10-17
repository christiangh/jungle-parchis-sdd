# jungle-parchis-sdd

Parchís con temática de jungla, desarrollado con spec-driven design (SDD) como proyecto de portfolio. Partida local, sin backend.

## Documentos de referencia

Los principios del proyecto están en `specs/constitucion.md` (identificadores `P-NN`), y todo spec, plan y cambio de código debe cumplirlos. Las reglas del juego están en `specs/reglamento.md` (identificadores `R-NNN`, invariantes `I-NN`). Los specs citan las reglas por su identificador y no las redefinen.

@specs/constitucion.md
@specs/reglamento.md

## Flujo de trabajo

- Las funcionalidades se especifican con `/cgh-sdd:spec` y se implementan con `/cgh-sdd:spec-impl` a partir de specs en estado `Aprobado`. Cada spec vive en `specs/NNN-slug/` con su `spec.md` y su `plan.md`.
- En el motor (`src/engine/`) los tests se escriben primero y se ejecutan para comprobar que fallan en sus aserciones antes de implementar (P-07). En el plan, cada paso de código va precedido de su paso de tests.
- Cada test de una regla incluye su identificador en el nombre, por ejemplo `R-050: come una ficha rival fuera de un seguro`.

## Arquitectura

- `src/engine/`: motor de reglas en TypeScript puro. No importa Angular ni ninguna librería; solo archivos del propio motor. Los tests del motor pueden usar `vitest` y `fast-check`.
- `src/app/`: capa Angular. Solo importa el motor desde `src/engine/index.ts`.
- Ambas fronteras las comprueba ESLint (`eslint.config.js`).

## Comandos

El gestor de paquetes es pnpm; no se usa npm.

- `pnpm check`: formato, lint y tests de una vez. Es la comprobación para cerrar cada parte de un spec.
- `pnpm test:once`: tests sin modo watch.
- `pnpm test:coverage`: tests con informe de cobertura.
- `pnpm lint` / `pnpm lint:fix`: lint.
- `pnpm format` / `pnpm format:check`: formato con Prettier.

## Idioma y commits

- Specs, planes, constitución y reglamento se escriben en castellano. El código, los identificadores y los comentarios técnicos, en inglés.
- Los mensajes de commit van en inglés y siguen Conventional Commits. Las partes implementadas desde un spec usan `feat(spec-NNN): PARTE-NN <title in English>`.
- Los commits los hace siempre una persona (P-13).

---

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
