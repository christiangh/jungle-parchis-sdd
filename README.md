# Jungle Parchís

[![CI](https://github.com/christiangh/jungle-parchis-sdd/actions/workflows/ci.yml/badge.svg)](https://github.com/christiangh/jungle-parchis-sdd/actions/workflows/ci.yml)

Parchís inspirado en la jungla, para el navegador, hecho con Angular 22 mediante desarrollo guiado por specs (SDD). Funciona en local, sin backend ni cuentas.

## Cómo se desarrolla

Cada funcionalidad sigue el mismo ciclo, con el plugin [cgh-sdd](https://github.com/christiangh/cgh-spec-driven-design) para Claude Code:

1. **Spec:** se describe qué se construye y por qué, citando las reglas del reglamento. Nace en estado `Borrador`.
2. **Aprobación:** una persona lo revisa y lo cambia a `Aprobado`. Sin spec aprobado no se escribe código.
3. **Plan por partes:** cada parte se planifica antes de implementarla, con la trazabilidad de cada requisito hasta su test.
4. **Tests primero:** en el motor, los tests se escriben y se ven fallar antes que el código.
5. **Pull request:** la rama del spec entra en `master` con un PR y el CI en verde.

El [PR del spec 001](https://github.com/christiangh/jungle-parchis-sdd/pull/2) muestra el ciclo completo: en sus commits se ve cada parte planificada y cada `test(...)` antes de su `feat(...)`.

## Documentación

- [`specs/constitucion.md`](specs/constitucion.md): principios no negociables del proyecto (arquitectura, calidad, proceso y producto).
- [`specs/reglamento.md`](specs/reglamento.md): reglas del juego, numeradas (`R-NNN`), e invariantes (`I-NN`).
- [`specs/`](specs/): specs de cada funcionalidad, cada uno con su `spec.md` y su `plan.md`.

La documentación está en castellano. El código y los mensajes de commit, en inglés.

## Estructura

- `src/engine/`: motor de reglas en TypeScript puro, sin dependencias de Angular. Se importa solo desde `src/engine/index.ts`.
- `src/app/`: capa Angular que solo presenta el estado y envía las acciones del jugador al motor.

El lint hace cumplir esa frontera.

## Desarrollo

Requiere [pnpm](https://pnpm.io/).

```bash
pnpm i               # instalar dependencias
pnpm start           # servidor de desarrollo en http://localhost:4200/
pnpm check           # formato, lint y todos los tests: lo que comprueba el CI
pnpm test            # tests unitarios (Vitest) en modo watch, sin los de propiedades
pnpm test:properties # tests de propiedades: 1000 partidas aleatorias
pnpm test:coverage   # tests con informe de cobertura
pnpm build           # build de producción en dist/
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), un propósito por commit. Las features hechas a partir de un spec usan `feat(spec-NNN)`. Todo cambio entra en `master` mediante pull request.
