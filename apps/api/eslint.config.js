import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      // Type-aware linting, needed only for no-floating-promises below.
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Express identifies middleware by parameter count (e.g. error handlers need
      // all 4 params present even when some go unused) — leading underscore marks
      // "intentionally unused for the signature", matching TypeScript's own convention.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // The database layer is async: a forgotten `await` would silently hand a Promise
      // to code expecting the value (postgres-persistence design, D2).
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    // node:test's top-level test()/before()/after() return Promises by design.
    files: ['tests/**/*.ts'],
    rules: { '@typescript-eslint/no-floating-promises': 'off' },
  },
])
