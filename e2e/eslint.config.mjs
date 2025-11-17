import baseConfig from '../eslint.base.config.mjs';
import playwright from 'eslint-plugin-playwright';

export default [
  ...baseConfig,
  playwright.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.js'],
    // Override or add rules here
    rules: {
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-wait-for-timeout': 'warn',
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
      'playwright/expect-expect': 'warn',
    },
  },
];
