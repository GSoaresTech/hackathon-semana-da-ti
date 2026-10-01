import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    testTimeout: 30000,
    // As specs compartilham o mesmo banco de teste: uma por vez evita que a
    // limpeza de uma apague as fixtures da outra.
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
});
