import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // 8-bit game (unchanged) and the 3D prototype build as separate
        // pages with separate bundles — three.js is only loaded by /3d/.
        main: resolve(__dirname, 'index.html'),
        '3d': resolve(__dirname, '3d/index.html'),
        '3d-lineup': resolve(__dirname, '3d/lineup.html'),
        '3d-portraits': resolve(__dirname, '3d/portraits.html'),
      },
    },
  },
  server: {
    hmr: false, // Always full-reload so singleton state (player, etc.) reinitializes
  },
});
