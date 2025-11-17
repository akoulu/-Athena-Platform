import baseConfig from '../../../../eslint.base.config.mjs';
import prettier from 'eslint-config-prettier';

export default [
  ...baseConfig,
  prettier,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-inject': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
