import baseConfig from '../../eslint.base.config.mjs';
import prettier from 'eslint-config-prettier';

export default [
  ...baseConfig,
  prettier,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@angular-eslint/prefer-inject': 'off',
      'no-console': ['warn', { allow: ['log', 'warn', 'error', 'debug'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
