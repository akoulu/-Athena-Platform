import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync } from 'fs';

/**
 * Jest configuration for Angular application
 * Extends the global preset with Angular-specific settings
 */
const tsConfig = JSON.parse(readFileSync('./tsconfig.spec.json', 'utf-8'));

const config: Config = {
  displayName: 'org',
  preset: './jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: './coverage/org',
  // Angular-specific transform configuration
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@angular|@ngrx|rxjs)'],
  // Angular snapshot serializers
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
  ],
  // Module name mapper for path aliases
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfig.compilerOptions?.paths || {}, {
      prefix: '<rootDir>/',
    }),
  },
  // Coverage settings specific to Angular app
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts',
    '!src/test-setup.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.routes.ts',
  ],
  // Coverage thresholds for Angular app
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  // Test environment
  testEnvironment: 'jsdom',
};

export default config;
