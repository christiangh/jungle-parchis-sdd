## Angular 22

- Componentes standalone, sin `standalone: true` ni `ChangeDetectionStrategy.OnPush` explícitos: son el valor por defecto.
- Estado con signals: `input()`, `output()`, `model()`, `computed()` y `linkedSignal()`; se cambian con `set` o `update`, nunca con `mutate`.
- Host bindings en el objeto `host` del decorador, no con `@HostBinding` ni `@HostListener`.
- Plantillas simples con `@if`, `@for` y `@switch`; bindings `class` y `style`, sin `ngClass`, `ngStyle` ni `CommonModule`.
- Servicios con `@Service` e `inject()`. Formularios con Signal Forms. Rutas con lazy loading. `NgOptimizedImage` para imágenes estáticas.
- Pasa todas las comprobaciones de AXE y WCAG 2.2 AA: foco, contraste y ARIA.
