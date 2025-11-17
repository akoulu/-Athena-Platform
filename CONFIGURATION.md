# Nx Workspace Configuration Guide

This document describes the complete configuration setup for Prettier, ESLint, Jest, and Playwright in this Nx monorepo.

## Table of Contents

- [Prettier Configuration](#prettier-configuration)
- [ESLint Configuration](#eslint-configuration)
- [Jest Configuration](#jest-configuration)
- [Playwright Configuration](#playwright-configuration)
- [Domain-Driven Design Tags](#domain-driven-design-tags)
- [Usage](#usage)

## Prettier Configuration

**Location:** `.prettierrc` (root)

### Key Settings

- **Single quotes**: Enabled for consistency
- **Trailing commas**: ES5 compatible
- **Print width**: 100 characters
- **Tab width**: 2 spaces
- **Semicolons**: Required
- **Line endings**: LF (Unix-style)

### Ignored Files

See `.prettierignore` for complete list. Key exclusions:

- Build outputs (`dist`, `coverage`)
- Dependencies (`node_modules`)
- Nx cache (`.nx/cache`)
- Generated files

## ESLint Configuration

### Architecture

ESLint uses a **layered configuration** approach:

1. **Base Config** (`eslint.base.config.mjs`)

   - Core rules for all projects
   - Domain-driven design boundary enforcement
   - TypeScript and JavaScript rules

2. **Root Config** (`eslint.config.mjs`)

   - Extends base config
   - Adds Angular-specific rules
   - Template linting rules

3. **Project Configs** (e.g., `org/api/eslint.config.mjs`)
   - Extends base config
   - Adds framework-specific rules (NestJS, Angular, etc.)

### Domain-Driven Design Boundaries

The ESLint configuration enforces strict dependency rules using tags:

#### Tag Structure

- `scope:org` - Organization domain scope
- `type:app` - Application projects
- `type:lib` - Library projects
- `type:core` - Core/shared libraries (can be imported by anyone)
- `type:data-access` - Data access layer libraries
- `type:feature` - Feature libraries (business logic)
- `type:ui` - UI component libraries

#### Dependency Rules

1. **Core libraries** (`type:core`)

   - Can be imported by anyone
   - Should not depend on other libraries

2. **Data access libraries** (`type:data-access`)

   - Can depend on: `core`
   - Can be imported by: `feature`, `app`

3. **Feature libraries** (`type:feature`)

   - Can depend on: `core`, `data-access`, `ui`, `feature`
   - Can be imported by: `app`

4. **UI libraries** (`type:ui`)

   - Can depend on: `core`, `ui`
   - Can be imported by: `feature`, `app`

5. **Applications** (`type:app`)
   - Can depend on: `core`, `data-access`, `feature`, `ui`
   - Cannot be imported by other projects

### Key Rules

- **Module boundaries**: Enforced via `@nx/enforce-module-boundaries`
- **TypeScript**: Strict type checking with reasonable defaults
- **Angular**: Component/directive selector rules, lifecycle hooks
- **NestJS**: Decorator-friendly rules, console logging allowed
- **Code quality**: No debugger, prefer const, no unused vars

## Jest Configuration

### Global Preset

**Location:** `jest.preset.js`

- Base configuration for all Jest projects
- Global timeout: 30 seconds
- Coverage thresholds: 70% (global default)
- Coverage reporters: text, lcov, html, json-summary

### Angular App Configuration

**Location:** `jest.config.app.ts`

- Uses `jest-preset-angular`
- Coverage threshold: 75%
- Excludes: modules, routes, test setup files
- Supports path aliases via TypeScript paths

### NestJS API Configuration

**Location:** `org/api/jest.config.ts`

- Node environment
- Coverage threshold: 80%
- Excludes: DTOs, entities, interfaces, modules
- Auto-clears and restores mocks

### Coverage Reports

Coverage reports are generated in:

- `coverage/{projectName}/` - HTML reports
- `coverage/{projectName}/lcov.info` - LCOV format (for CI)

## Playwright Configuration

**Location:** `e2e/playwright.config.ts`

### Features

- **Multi-browser testing**: Chromium, Firefox, WebKit
- **Mobile testing**: Pixel 5, iPhone 12
- **Backend API testing**: Separate project for API tests
- **CI/CD optimized**: Different settings for CI vs local

### Projects

1. **Frontend E2E** (chromium, firefox, webkit, mobile)

   - Tests Angular application
   - Viewport: 1280x720 (desktop), device-specific (mobile)

2. **Backend API** (`api` project)
   - Tests NestJS API endpoints
   - Uses `APIRequestContext` for HTTP requests
   - Test files: `*.api.spec.ts`

### Web Servers

Automatically starts both servers before tests:

- Frontend: `http://localhost:4200` (Angular app)
- Backend: `http://localhost:3000/api` (NestJS API)

### Environment Variables

- `BASE_URL`: Frontend URL (default: `http://localhost:4200`)
- `API_URL`: Backend URL (default: `http://localhost:3000`)
- `CI`: Set to `true` in CI environments

## Domain-Driven Design Tags

### Tagging Projects

Add tags to `project.json`:

```json
{
  "tags": ["scope:org", "type:app"]
}
```

### Example Tag Combinations

- **Angular App**: `["scope:org", "type:app"]`
- **NestJS API**: `["scope:org", "type:app"]`
- **Core Library**: `["scope:org", "type:lib", "type:core"]`
- **Data Access Library**: `["scope:org", "type:lib", "type:data-access"]`
- **Feature Library**: `["scope:org", "type:lib", "type:feature"]`
- **UI Library**: `["scope:org", "type:lib", "type:ui"]`

## Usage

### Format Code

```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Lint Code

```bash
# Lint all projects
npx nx run-many -t lint

# Lint specific project
npx nx lint org
npx nx lint api
```

### Run Tests

```bash
# Run all tests
npx nx run-many -t test

# Run specific project tests
npx nx test org
npx nx test api

# Run with coverage
npx nx test org --coverage
```

### Run E2E Tests

```bash
# Install Playwright browsers (first time only, or after Playwright update)
npm run e2e:install
# or
npx playwright install

# Run all E2E tests
npm run e2e
# or
npx nx e2e e2e

# Run only frontend tests
npx playwright test --project=chromium

# Run only API tests
npx playwright test --project=api

# Run in UI mode
npx playwright test --ui

# Run in headed mode
npx playwright test --headed
```

### View Coverage

```bash
# Open coverage report
open coverage/org/index.html  # macOS
start coverage/org/index.html  # Windows
```

## File Structure

```
org/
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Prettier ignore patterns
├── .eslintignore               # ESLint ignore patterns
├── eslint.base.config.mjs      # Base ESLint config
├── eslint.config.mjs           # Root ESLint config
├── jest.preset.js              # Global Jest preset
├── jest.config.ts              # Root Jest config
├── jest.config.app.ts          # Angular app Jest config
├── nx.json                     # Nx workspace configuration
├── org/
│   ├── api/
│   │   ├── eslint.config.mjs   # NestJS ESLint config
│   │   └── jest.config.ts      # NestJS Jest config
│   └── ...
└── e2e/
    ├── playwright.config.ts    # Playwright configuration
    └── src/
        ├── example.spec.ts     # Frontend E2E test
        └── api/
            └── api.spec.ts     # Backend API test
```

## Best Practices

1. **Always tag new projects** with appropriate scope and type tags
2. **Run linting before commits** to catch boundary violations early
3. **Maintain coverage thresholds** - don't lower them without discussion
4. **Write E2E tests** for critical user flows and API endpoints
5. **Use Prettier** to maintain consistent code formatting
6. **Respect module boundaries** - ESLint will enforce them automatically

## Troubleshooting

### ESLint Boundary Errors

If you see `@nx/enforce-module-boundaries` errors:

1. Check project tags in `project.json`
2. Verify dependency direction follows DDD rules
3. Consider if the dependency is necessary

### Jest Coverage Issues

If coverage is below threshold:

1. Check `collectCoverageFrom` patterns
2. Verify test files are being executed
3. Review excluded patterns

### Playwright Timeouts

If tests timeout:

1. Increase timeout in `playwright.config.ts`
2. Check if servers are starting correctly
3. Verify `BASE_URL` and `API_URL` are correct

### Playwright Browser Not Found

If you see "Executable doesn't exist" errors:

```bash
npm run e2e:install
# or
npx playwright install
```

### API Tests Getting HTML Instead of JSON

If API tests return HTML responses:

1. Verify the API server is running on the correct port (default: 3000)
2. Check that the baseURL in Playwright config includes the API prefix (`/api`)
3. Ensure the test paths are relative to the baseURL (use `/` not `/api` when baseURL already includes `/api`)

### Port Already in Use

If you see `EADDRINUSE` errors:

1. Stop any running servers manually
2. The `reuseExistingServer` option should handle this automatically in non-CI environments
3. In CI, ensure only one test run executes at a time

## Additional Resources

- [Nx Documentation](https://nx.dev)
- [ESLint Documentation](https://eslint.org)
- [Jest Documentation](https://jestjs.io)
- [Playwright Documentation](https://playwright.dev)
- [Prettier Documentation](https://prettier.io)
