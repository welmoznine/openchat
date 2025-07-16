import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test'
    },
    setupFiles: ['./src/test/setup.js'],
    // 並列実行を制限してデータベース競合を防ぐ（完全な順次化ではない）
    poolOptions: {
      threads: {
        maxThreads: 1,
        minThreads: 1,
      },
      forks: {
        maxForks: 1,
        minForks: 1,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'prisma/',
        '*.config.js',
      ],
    },
  },
})