# jungle-parchis-sdd

Parchís con temática de jungla hecho con spec-driven design, como proyecto de portfolio. Partida local, sin backend.

@specs/constitucion.md
@specs/reglamento.md

## Convenciones

- La constitución (`P-NN`) prevalece sobre todo lo demás. Los specs citan las reglas del reglamento por su identificador (`R-NNN`, `I-NN`) y no las redefinen.
- Los specs se crean con `/cgh-sdd:cgh-spec` y se implementan con `/cgh-sdd:cgh-spec-impl`. Cada uno vive en `specs/NNN-slug/`, con su `spec.md` y su `plan.md`.
- En el plan, cada paso de código del motor va precedido de su paso de tests (P-07). Los tests de una regla llevan su identificador en el nombre, por ejemplo `R-050: …`.
- El código del motor solo importa archivos del propio motor; sus tests pueden usar además `vitest` y `fast-check`. Lo comprueba ESLint.
- En `src/app/`, las constantes exportadas van en `<dominio>.constants.ts` y los tipos e interfaces en `<dominio>.models.ts`, dentro de la carpeta de su dominio (por ejemplo `src/app/board/board.constants.ts`) si solo las usa ese dominio, o en `src/app/shared/` si las usan varios. Componentes y módulos de funciones no los declaran; solo se quedan junto a su uso las constantes privadas de un módulo.
- Documentación en castellano. Código, comentarios y commits en inglés (Conventional Commits, con ámbito `spec-NNN`).

## Comandos

El gestor de paquetes es pnpm, nunca npm.

- `pnpm check`: formato, lint y todos los tests, incluidos los de propiedades. Cierra cada parte de un spec.
- `pnpm test:once`: todos los tests menos los de propiedades; tarda segundos. Es el que se usa en cada paso.
- `pnpm test:properties`: solo los tests de propiedades (`src/engine/invariants.spec.ts`, 1000 partidas aleatorias).
- `pnpm test:coverage`, `pnpm lint:fix`, `pnpm format`.

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
