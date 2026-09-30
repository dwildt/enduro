import { defineConfig } from 'vite';

// base './' keeps asset URLs relative so the build works under the GitHub Pages sub-path
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'bundle'
  }
});
