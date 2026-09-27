import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// 單元測試只涵蓋不依賴 Quasar 的純邏輯（domain）
export default defineConfig({
  resolve: {
    alias: { src: fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
