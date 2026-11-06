import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    // 主包含 78 张牌的牌义与 SVG 插画（gzip 后约 220KB），属于预期体积；Claude SDK 已按需拆分
    chunkSizeWarningLimit: 800,
  },
  server: { host: true, port: 5173 },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
