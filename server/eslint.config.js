import neostandard from 'neostandard'

export default [
  ...neostandard(),
  {
    ignores: ['dist/', 'node_modules/']
  },
  {
    files: ['**/*.js'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-process-exit': 'warn',
      'camelcase': 'off'
    }
  }
] 