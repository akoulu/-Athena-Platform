# Quick Start Guide

## Running Commands

### Format Code

```bash
npx prettier --write .
```

### Lint

```bash
# All projects
npx nx run-many -t lint

# Specific project
npx nx lint org
npx nx lint api
```

### Test

```bash
# All projects
npx nx run-many -t test

# With coverage
npx nx test org --coverage
npx nx test api --coverage
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npm run e2e:install
# or
npx playwright install

# All E2E tests
npm run e2e
# or
npx nx e2e e2e

# Frontend only
npx playwright test --project=chromium

# Backend API only
npx playwright test --project=api
```

## Project Tags

When creating new projects, add appropriate tags:

```json
{
  "tags": ["scope:org", "type:lib", "type:core"]
}
```

**Tag Types:**

- `scope:org` - Domain scope
- `type:app` - Application
- `type:lib` - Library
- `type:core` - Core/shared library
- `type:data-access` - Data access layer
- `type:feature` - Feature library
- `type:ui` - UI component library

## Dependency Rules

- **Core** → Can be imported by anyone
- **Data Access** → Can import: Core
- **Feature** → Can import: Core, Data Access, UI, Feature
- **UI** → Can import: Core, UI
- **App** → Can import: Everything

See `CONFIGURATION.md` for detailed documentation.
