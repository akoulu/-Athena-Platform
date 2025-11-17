import nx from '@nx/eslint-plugin';
import baseConfig from '../../../../eslint.base.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-inject': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
];
