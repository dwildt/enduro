// Game version, injected from package.json by Vite (see vite.config.js); 'dev' outside Vite (Node tests)
/* global __APP_VERSION__ */
export const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
