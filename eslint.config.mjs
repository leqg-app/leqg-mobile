import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Migrate from legacy .eslintrc to ESLint v9 flat config while preserving behavior
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      '**/node_modules/**',
      'android/**',
      'ios/**',
      'dist/**',
      'vendor/**',
      'Pods/**',
    ],
  },
  ...compat.config({
    env: {
      node: true,
      browser: true,
      es2021: true,
      jest: true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: ['react', 'jest', 'prettier'],
    rules: {
      'react/prop-types': 'off',
      'react/display-name': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  }),
];
