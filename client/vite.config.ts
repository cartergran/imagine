/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: []
  },
  build: {
    rollupOptions: {
      external: ['@welldone-software/why-did-you-render']
    }
  },
  server: {
    host: true,
    proxy: {
      '/puzzle': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/check': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/leaderboard': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    reporters: ['tree'],
    setupFiles: ['./src/__tests__/setup.ts']
  }
});
