import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages deploy時のみ /mermaid-designer/ を使用（GITHUB_PAGES環境変数で制御）
  base: process.env.GITHUB_PAGES ? '/mermaid-designer/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@mermaid-er-editor/core': resolve(__dirname, '../core/src'),
    },
  },
  server: {
    port: 1837,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
