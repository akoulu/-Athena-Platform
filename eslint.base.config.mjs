import nx from '@nx/eslint-plugin';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Base ESLint configuration for Nx workspace
 * This config enforces domain-driven design boundaries using tags
 *
 * Tag structure:
 * - scope:org - Organization domain scope
 * - type:app - Application projects
 * - type:lib - Library projects
 * - type:core - Core/shared libraries (can be imported by anyone)
 * - type:data-access - Data access layer libraries
 * - type:feature - Feature libraries (business logic)
 * - type:ui - UI component libraries
 */
export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  js.configs.recommended,
  {
    ignores: [
      '**/dist',
      '**/coverage',
      '**/.nx',
      '**/node_modules',
      '**/tmp',
      '**/out-tsc',
      '**/*.d.ts.map',
      '**/*.js.map',
    ],
  },
  // Apply TypeScript ESLint recommended config only to TS/JS files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
  })),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Enforce module boundaries with domain-driven design constraints
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            '^.*/jest(\\.config)?\\.[cm]?[jt]s$',
            '^.*/playwright\\.config\\.[cm]?[jt]s$',
            '^.*/webpack\\.config\\.[cm]?[jt]s$',
            '^@org/auth$',
            '^@org/users$',
          ],
          allowCircularSelfDependency: true,
          depConstraints: [
            // Core libraries can be imported by anyone and can depend on other core libraries
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: ['type:core', 'scope:org'],
            },
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['type:core', 'scope:org'],
            },
            // Data access libraries can depend on core
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:core', 'type:data-access', 'scope:org'],
            },
            // Feature libraries can depend on core, data-access, ui, and other features
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:data-access',
                'type:feature',
                'type:ui',
                'scope:org',
              ],
            },
            // UI libraries can depend on core and other UI components
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:core', 'type:ui', 'scope:org'],
            },
            // Utility libraries can depend on core
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:core', 'type:util', 'scope:org'],
            },
            // Applications can depend on everything
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:data-access',
                'type:feature',
                'type:ui',
                'type:util',
                'scope:org',
              ],
            },
          ],
        },
      ],
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // General code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      // Additional rules can be added here
    },
  },
  {
    files: [
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.cjs',
      '**/webpack.config.js',
      '**/jest.config.js',
      '**/jest.preset.js',
    ],
    rules: {
      // Allow require() in config files (webpack, jest, etc.)
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
