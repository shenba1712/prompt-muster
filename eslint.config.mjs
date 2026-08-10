import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    // ADR-001: core/ is framework-free and imports nothing from src/ or
    // the app's UI dependencies — enforced here, not just by convention.
    // Covers .tsx too (a framework-free lib shouldn't have one, but if it
    // ever did, it should still be caught) and both static and dynamic
    // import forms, plus require() — no-restricted-imports alone only
    // catches static imports.
    files: ['core/**/*.ts', 'core/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'next', 'next/*', '@/*'],
              message:
                'core/ is framework-free (ADR-001) — it must not import React, Next.js, or anything from src/.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ImportExpression[source.value=/^(react|react-dom)(\\/.*)?$|^next(\\/.*)?$|^@\\/.*$/]",
          message:
            'core/ is framework-free (ADR-001) — no dynamic import() of React, Next.js, or anything from src/ either.',
        },
        {
          selector: "CallExpression[callee.name='require']",
          message:
            'core/ is framework-free (ADR-001) — use ES imports, not require() (which also bypasses the no-restricted-imports guard above).',
        },
      ],
    },
  },
]);

export default eslintConfig;
