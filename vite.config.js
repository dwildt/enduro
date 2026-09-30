import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// base './' keeps asset URLs relative so the build works under the GitHub Pages sub-path
export default defineConfig({
  base: './',
  // shown on the About screen (src/version.js)
  define: { __APP_VERSION__: JSON.stringify(version) },
  build: {
    outDir: 'dist',
    assetsDir: 'bundle'
  }
});
