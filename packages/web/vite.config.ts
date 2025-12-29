import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/mermaid-designer/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@mermaid-er-editor/core': resolve(__dirname, '../core/src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
