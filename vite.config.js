import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    hmr: false, // Always full-reload so singleton state (player, etc.) reinitializes
  },
});
