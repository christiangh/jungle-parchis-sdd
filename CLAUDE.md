# jungle-parchis-sdd

Parchís con temática de jungla hecho con spec-driven design, como proyecto de portfolio. Partida local, sin backend.

@specs/constitucion.md

Las reglas del juego están en [`specs/reglamento.md`](specs/reglamento.md), con identificadores `R-NNN` e invariantes `I-NN`. Los specs que tocan el motor parten de él y citan sus reglas por identificador.

## Convenciones

- La constitución (`P-NN`) prevalece sobre todo lo demás. Los specs citan las reglas del reglamento por su identificador (`R-NNN`, `I-NN`) y no las redefinen.
- Los specs se crean con `/cgh-sdd:cgh-spec` y se implementan con `/cgh-sdd:cgh-spec-impl`. Cada uno vive en `specs/NNN-slug/`, con su `spec.md` y su `plan.md`.
- En el plan, cada paso de código del motor o de la lógica de la app (estado, derivaciones y funciones puras) va precedido de su propio paso de tests, que se ejecutan y se ven fallar antes de implementar (P-07). Plantillas, estilos y recursos visuales pueden probarse en el mismo paso. Los tests llevan en el nombre el identificador de la regla o del requisito que prueban, por ejemplo `R-050: …` o `RF-005: …`.
- El código del motor solo importa archivos del propio motor; sus tests pueden usar además `vitest` y `fast-check`. La aplicación importa el motor solo con el alias `@engine`. Lo comprueba ESLint.
- En `src/app/`, cada archivo agrupa un concepto con sus tipos y constantes, como recomienda la guía de estilo de Angular; lo compartido entre dominios va en `src/app/shared/`.
- La paleta se define como tokens `@theme` de Tailwind en `src/styles.css`; en `src/app/` no hay colores en hexadecimal.
- Documentación en castellano. Código, comentarios y commits en inglés (Conventional Commits, con ámbito `spec-NNN`).
- Los mensajes de commit son de una sola línea, sin cuerpo ni `Co-Authored-By`.

## Comandos

El gestor de paquetes es pnpm, nunca npm.

- `pnpm check`: formato, lint y todos los tests, incluidos los de propiedades. Cierra cada parte de un spec.
- `pnpm test:once`: todos los tests menos los de propiedades; tarda segundos. Es el que se usa en cada paso.
- `pnpm test:properties`: solo los tests de propiedades (`src/engine/invariants.spec.ts`, 1000 partidas aleatorias).
- `pnpm test:e2e`: pruebas en navegador con Playwright en Chromium (`e2e/`): humo, escenarios de partida y pantalla sin scroll, tras comprobar sus tipos (`tsconfig.e2e.json`). Usa `ng serve` con la configuración de producción en el puerto 4300: en local reutiliza el que ya esté levantado en ese puerto y en el CI levanta siempre el suyo; no ejecuta `ng build`. Fuera de `pnpm check`; corre en el CI. La primera vez: `pnpm exec playwright install chromium`.
