# Jungle Parchís

Parchís inspirado en la jungla, para el navegador, hecho con Angular 22 mediante desarrollo guiado por specs (SDD). Funciona en local, sin backend ni cuentas.

## Documentación

- [`specs/constitucion.md`](specs/constitucion.md): principios no negociables del proyecto (arquitectura, calidad, proceso y producto).
- `specs/reglamento.md`: reglas del juego.
- `specs/`: specs de cada funcionalidad. Solo se implementa lo que está en estado `Aprobado`.

## Estructura

- `src/engine/`: motor de reglas en TypeScript puro, sin dependencias de Angular. Se importa solo desde `src/engine/index.ts`.
- `src/app/`: capa Angular que solo presenta el estado y envía las acciones del jugador al motor.

## Desarrollo

Requiere [pnpm](https://pnpm.io/).

```bash
pnpm i          # instalar dependencias
pnpm start      # servidor de desarrollo en http://localhost:4200/
pnpm test       # tests unitarios (Vitest)
pnpm build      # build de producción en dist/
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), un propósito por commit. Las features hechas a partir de un spec usan `feat(spec-NNN)`.
