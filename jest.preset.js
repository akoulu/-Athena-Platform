const nxPreset = require('@nx/jest/preset').default;

/**
 * Global Jest preset for Nx workspace
 * Provides base configuration for all Jest projects
 */
module.exports = {
  ...nxPreset,
  // Global test timeout (30 seconds)
  testTimeout: 30000,
  // Optimize test execution
  maxWorkers: '50%',
  // Cache for faster test runs
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Coverage thresholds (can be overridden per project)
  // Note: Integration tests may have lower coverage, so thresholds are checked
  // only for full test runs, not for integration-only runs
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Coverage collection settings
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.config.{ts,js}',
    '!**/jest.config.{ts,js}',
    '!**/jest.preset.js',
    '!**/test-setup.ts',
    '!**/src/test-setup.ts',
  ],
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  // Module name mapper for path aliases (if needed)
  moduleNameMapper: {},
};
