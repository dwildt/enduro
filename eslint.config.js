// ESLint 9 flat config (replaces .eslintrc.json and .eslintignore)
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'dist/', 'docs/', '.github/', '**/*.min.js'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  },
  {
    // legacy testable units and the tests folder are CommonJS
    files: ['**/*.cjs', 'tests/**/*.js'],
    languageOptions: { sourceType: 'commonjs' }
  }
];
