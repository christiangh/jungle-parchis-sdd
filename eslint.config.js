// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier/flat');

// Frontera del motor (specs/constitucion.md, P-01 y P-02).
const IMPORT_FROM_APP = {
  regex: '(^|/)app(/|$)',
  message: 'P-01: el motor no puede importar nada de src/app.',
};

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'jp',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          // Attribute selectors let a component render inside an SVG, as `g[jp-mascot]`.
          type: ['element', 'attribute'],
          prefix: 'jp',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
  {
    // Código del motor: solo importa archivos del propio motor.
    files: ['src/engine/**/*.ts'],
    ignores: ['src/engine/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^[^.]',
              message:
                'P-01: el motor es TypeScript puro y solo importa archivos del propio motor (sin Angular ni librerías).',
            },
            IMPORT_FROM_APP,
          ],
        },
      ],
    },
  },
  {
    // Tests del motor: pueden usar librerías de test, pero tampoco Angular ni la app.
    files: ['src/engine/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@angular/',
              message: 'P-01: los tests del motor no pueden depender de Angular.',
            },
            IMPORT_FROM_APP,
          ],
        },
      ],
    },
  },
  {
    // La app solo usa el motor a través de su puerta de entrada, con el alias @engine.
    files: ['src/app/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@engine/',
              message: 'P-02: importa el motor solo desde @engine (src/engine/index.ts).',
            },
            {
              regex: '^\\.{1,2}/(.*/)?engine(/|$)',
              message: 'P-02: importa el motor con el alias @engine, no con una ruta relativa.',
            },
          ],
        },
      ],
    },
  },
  // Siempre al final: desactiva las reglas de estilo que chocan con Prettier.
  prettier,
]);
