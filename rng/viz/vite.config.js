
import { defineConfig } from 'vite';

// vite.config.js
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext'
  },
  esbuild: {
    'top-level-await': true
  },
  // more config options ...
})


