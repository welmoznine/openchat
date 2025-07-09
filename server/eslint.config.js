import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: ['dist/', 'node_modules/']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.es2020
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
] 