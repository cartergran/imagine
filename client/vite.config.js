import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  build: {
    rollupOptions: {
      external: ['@welldone-software/why-did-you-render']
    }
  },
  server: {
    proxy: {
      '/puzzle': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/check': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
