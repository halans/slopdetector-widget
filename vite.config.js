import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'SlopDetector',
      fileName: 'widget',
      formats: ['iife'],
    },
    // Prevent externalizing css, we will inject it.
    cssCodeSplit: false,
    rollupOptions: {
      // Ensure everything is bundled
      external: [],
    }
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  }
});
