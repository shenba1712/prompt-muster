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
    files: ['core/**/*.ts'],
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
    },
  },
]);

export default eslintConfig;
