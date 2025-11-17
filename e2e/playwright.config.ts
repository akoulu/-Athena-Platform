import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

/**
 * Playwright E2E Test Configuration
 * Supports testing both Angular frontend and NestJS backend
 *
 * Environment Variables:
 * - BASE_URL: Frontend application URL (default: http://localhost:4200)
 * - API_URL: Backend API URL (default: http://localhost:3000)
 * - CI: Set to 'true' in CI environments
 */

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';
const apiURL = process.env['API_URL'] || 'http://localhost:3000';
const isCI = process.env['CI'] === 'true';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Test directory */
  testDir: './src',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI
    ? [
        ['html'],
        ['json', { outputFile: 'playwright-report.json' }],
        ['junit', { outputFile: 'playwright-report.xml' }],
      ]
    : [['html'], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    /* API URL for backend testing */
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure */
    video: 'retain-on-failure',
  },
  /* Configure projects for major browsers */
  projects: [
    // Frontend E2E tests - Angular app (temporarily ignore API tests and UI example)
    {
      name: 'chromium',
      testIgnore: [/.*\.api\.spec\.ts$/, /src\/api\/.*\.spec\.ts$/],
      use: {
        baseURL: 'http://localhost:4200',
        ...devices['Desktop Chrome'],
        // Custom context options
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      testIgnore: [/.*\.api\.spec\.ts$/, /src\/api\/.*\.spec\.ts$/],
      use: {
        baseURL: 'http://localhost:4200',
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      testIgnore: [/.*\.api\.spec\.ts$/, /src\/api\/.*\.spec\.ts$/],
      use: {
        baseURL: 'http://localhost:4200',
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    // Mobile viewport tests
    {
      name: 'Mobile Chrome',
      testIgnore: [/.*\.api\.spec\.ts$/, /src\/api\/.*\.spec\.ts$/],
      use: {
        baseURL: 'http://localhost:4200',
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      testIgnore: [/.*\.api\.spec\.ts$/, /src\/api\/.*\.spec\.ts$/],
      use: {
        baseURL: 'http://localhost:4200',
        ...devices['iPhone 12'],
      },
    },
    // Backend API tests (using APIRequestContext)
    {
      name: 'api',
      use: {
        // Use raw API host; tests include '/api' in paths
        baseURL: `${apiURL}`,
      },
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: [
    // Frontend Angular app
    {
      command: 'npx nx run org:serve-static',
      url: 'http://localhost:4200',
      reuseExistingServer: !isCI,
      timeout: 120000,
      cwd: workspaceRoot,
      env: {
        NODE_OPTIONS: '--no-deprecation',
      },
    },
    // Backend NestJS API
    {
      command: 'npx nx run api:serve',
      url: 'http://localhost:3000/api/v1/health',
      reuseExistingServer: !isCI,
      timeout: 120000,
      cwd: workspaceRoot,
      env: {
        NODE_OPTIONS: '--no-deprecation',
        DB_DIALECT: process.env['DB_DIALECT'] || 'postgres',
        DB_HOST: process.env['DB_HOST'] || 'localhost',
        DB_PORT: process.env['DB_PORT'] || '5432',
        DB_NAME: process.env['DB_NAME'] || 'org_test',
        DB_USER: process.env['DB_USER'] || 'postgres',
        DB_PASS: process.env['DB_PASS'] || 'postgres',
        DB_SSL: process.env['DB_SSL'] || 'false',
        JWT_SECRET: process.env['JWT_SECRET'] || 'test-secret-key-for-e2e',
        JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '15m',
        REFRESH_TOKEN_EXPIRES_IN: process.env['REFRESH_TOKEN_EXPIRES_IN'] || '7d',
        NODE_ENV: process.env['NODE_ENV'] || 'test',
        PORT: process.env['PORT'] || '3000',
        FRONTEND_URL: process.env['FRONTEND_URL'] || 'http://localhost:4200',
      },
    },
  ],
  /* Global setup and teardown */
  globalSetup: undefined,
  globalTeardown: undefined,
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  /* Maximum time to wait for expect() assertions */
  expect: {
    timeout: 5000,
  },
  /* Output directory for test artifacts */
  outputDir: 'test-results/',
});
