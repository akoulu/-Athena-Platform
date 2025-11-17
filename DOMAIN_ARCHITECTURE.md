# Domain-Driven Design Architecture Plan

## Overview

This document outlines the domain structure and library scaffolding plan for the `org` Nx monorepo, following Domain-Driven Design (DDD) principles with strict dependency boundaries.

## Domain Structure

```
libs/org/
├── core/                    # Shared business logic, types, utilities
│   ├── types/              # Shared TypeScript types/interfaces
│   ├── utils/              # Cross-domain utilities
│   └── constants/          # Shared constants
│
├── data-access/            # API clients, services, repository patterns
│   ├── api-client/         # Base HTTP client configuration
│   └── [domain]-api/       # Domain-specific API clients
│
├── feature-*/              # Domain-specific features
│   ├── demographics/       # Demographics domain
│   ├── welfare/            # Welfare domain
│   ├── migration/          # Migration domain
│   └── [other-domains]/    # Additional domains
│
├── ui/                     # Reusable Angular components
│   ├── components/         # Shared UI components
│   ├── layouts/            # Layout components
│   └── design-system/      # Design tokens, themes
│
└── util/                   # Cross-cutting helpers
    ├── validators/         # Form validators
    ├── formatters/         # Data formatters
    └── guards/             # Route guards
```

## Detailed Domain Specifications

### 1. Core Domain (`libs/org/core`)

**Purpose**: Foundation layer containing shared business logic, types, and utilities used across all domains.

**Library Type**: Shared TypeScript library (no framework dependencies)

**Tags**: `scope:org`, `type:lib`, `type:core`

**Dependencies**: None (foundation layer)

**Contents**:

- Shared TypeScript interfaces and types
- Business domain models
- Core utilities and helpers
- Constants and enums
- Validation schemas

**Rationale**: Provides a stable foundation that all other domains can depend on without creating circular dependencies.

---

### 2. Data Access Layer (`libs/org/data-access`)

**Purpose**: Abstracts API communication, provides repository patterns, and handles data transformation.

**Library Type**:

- Base: Shared TypeScript library
- Domain-specific: NestJS library (backend) or Angular service library (frontend)

**Tags**: `scope:org`, `type:lib`, `type:data-access`

**Dependencies**: `type:core`

**Contents**:

- HTTP client configuration
- API service interfaces
- Repository implementations
- Data transformation logic
- Error handling

**Rationale**: Separates data access concerns from business logic, making it easier to mock, test, and swap implementations.

---

### 3. Feature Domains (`libs/org/feature-*`)

**Purpose**: Encapsulates complete business capabilities for specific domains.

**Library Type**: Angular library (frontend) or NestJS module (backend)

**Tags**: `scope:org`, `type:lib`, `type:feature`, `domain:[domain-name]`

**Dependencies**: `type:core`, `type:data-access`, `type:ui`, `type:feature` (peer features)

**Contents**:

- Domain-specific components/pages
- Domain business logic
- Domain-specific services
- Domain routing configuration
- Domain state management

**Example Domains**:

- `feature-demographics`: Demographics management
- `feature-welfare`: Welfare programs and services
- `feature-migration`: Migration and immigration services

**Rationale**: Each feature domain is self-contained, making the codebase modular and allowing teams to work independently.

---

### 4. UI Library (`libs/org/ui`)

**Purpose**: Reusable Angular components, layouts, and design system elements.

**Library Type**: Angular library

**Tags**: `scope:org`, `type:lib`, `type:ui`

**Dependencies**: `type:core`, `type:ui` (peer UI components)

**Contents**:

- Reusable Angular components
- Layout components
- Design system tokens
- Theme configuration
- Shared styles

**Rationale**: Ensures UI consistency across the application and promotes component reuse.

---

### 5. Utility Library (`libs/org/util`)

**Purpose**: Cross-cutting utilities that don't belong to a specific domain.

**Library Type**: Shared TypeScript library

**Tags**: `scope:org`, `type:lib`, `type:util`

**Dependencies**: `type:core`

**Contents**:

- Form validators
- Data formatters
- Route guards
- Interceptors
- Pipes (Angular)
- Decorators

**Rationale**: Provides shared utilities without creating dependencies on business domains.

---

## Domain Map Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Applications Layer                        │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │  org/web     │                    │  org/api     │       │
│  │  (Angular)   │                    │  (NestJS)    │       │
│  └──────┬───────┘                    └──────┬───────┘       │
└─────────┼────────────────────────────────────┼───────────────┘
          │                                    │
          │                                    │
┌─────────┼────────────────────────────────────┼───────────────┐
│         │    Feature Domains Layer           │               │
│         │  ┌────────────┐  ┌────────────┐   │               │
│         │  │ Demographics│  │  Welfare   │   │               │
│         │  │  Feature    │  │  Feature   │   │               │
│         │  └──────┬─────┘  └──────┬─────┘   │               │
│         │         │               │         │               │
│         │         └───────┬───────┘         │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼───────────────┐
│         │    Supporting Layer               │               │
│         │  ┌────────────┐  ┌────────────┐   │               │
│         │  │     UI     │  │    Util    │   │               │
│         │  │  Library   │  │  Library   │   │               │
│         │  └──────┬─────┘  └──────┬─────┘   │               │
│         │         │               │         │               │
│         │         └───────┬───────┘         │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼───────────────┐
│         │    Data Access Layer              │               │
│         │  ┌─────────────────────────────┐  │               │
│         │  │    Data Access Libraries    │  │               │
│         │  │  (API Clients, Repositories)│  │               │
│         │  └──────────────┬──────────────┘  │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼───────────────┐
│         │    Foundation Layer               │               │
│         │  ┌─────────────────────────────┐  │               │
│         │  │      Core Library           │  │               │
│         │  │  (Types, Utils, Constants)  │  │               │
│         │  └─────────────────────────────┘  │               │
└─────────────────────────────────────────────────────────────┘

Dependency Flow: Applications → Features → Supporting/Data Access → Core
```

---

## Nx Generation Commands

### 1. Core Library

```bash
# Core types library
nx g @nx/js:lib core/types \
  --directory=libs/org/core/types \
  --tags=scope:org,type:lib,type:core \
  --unitTestRunner=jest \
  --bundler=esbuild

# Core utils library
nx g @nx/js:lib core/utils \
  --directory=libs/org/core/utils \
  --tags=scope:org,type:lib,type:core \
  --unitTestRunner=jest \
  --bundler=esbuild

# Core constants library
nx g @nx/js:lib core/constants \
  --directory=libs/org/core/constants \
  --tags=scope:org,type:lib,type:core \
  --unitTestRunner=jest \
  --bundler=esbuild
```

### 2. Data Access Libraries

```bash
# Base API client (shared)
nx g @nx/js:lib data-access/api-client \
  --directory=libs/org/data-access/api-client \
  --tags=scope:org,type:lib,type:data-access \
  --unitTestRunner=jest \
  --bundler=esbuild

# Demographics API (NestJS backend)
nx g @nx/nest:library data-access/demographics-api \
  --directory=libs/org/data-access/demographics-api \
  --tags=scope:org,type:lib,type:data-access,domain:demographics \
  --unitTestRunner=jest

# Demographics API (Angular frontend)
nx g @nx/angular:library data-access/demographics-api \
  --directory=libs/org/data-access/demographics-api \
  --tags=scope:org,type:lib,type:data-access,domain:demographics \
  --unitTestRunner=jest \
  --style=scss

# Welfare API (NestJS backend)
nx g @nx/nest:library data-access/welfare-api \
  --directory=libs/org/data-access/welfare-api \
  --tags=scope:org,type:lib,type:data-access,domain:welfare \
  --unitTestRunner=jest

# Welfare API (Angular frontend)
nx g @nx/angular:library data-access/welfare-api \
  --directory=libs/org/data-access/welfare-api \
  --tags=scope:org,type:lib,type:data-access,domain:welfare \
  --unitTestRunner=jest \
  --style=scss
```

### 3. Feature Libraries

```bash
# Demographics feature (Angular)
nx g @nx/angular:library feature-demographics \
  --directory=libs/org/feature-demographics \
  --tags=scope:org,type:lib,type:feature,domain:demographics \
  --unitTestRunner=jest \
  --style=scss

# Demographics feature (NestJS)
nx g @nx/nest:library feature-demographics \
  --directory=libs/org/feature-demographics \
  --tags=scope:org,type:lib,type:feature,domain:demographics \
  --unitTestRunner=jest

# Welfare feature (Angular)
nx g @nx/angular:library feature-welfare \
  --directory=libs/org/feature-welfare \
  --tags=scope:org,type:lib,type:feature,domain:welfare \
  --unitTestRunner=jest \
  --style=scss

# Welfare feature (NestJS)
nx g @nx/nest:library feature-welfare \
  --directory=libs/org/feature-welfare \
  --tags=scope:org,type:lib,type:feature,domain:welfare \
  --unitTestRunner=jest

# Migration feature (Angular)
nx g @nx/angular:library feature-migration \
  --directory=libs/org/feature-migration \
  --tags=scope:org,type:lib,type:feature,domain:migration \
  --unitTestRunner=jest \
  --style=scss

# Migration feature (NestJS)
nx g @nx/nest:library feature-migration \
  --directory=libs/org/feature-migration \
  --tags=scope:org,type:lib,type:feature,domain:migration \
  --unitTestRunner=jest
```

### 4. UI Library

```bash
# UI components library
nx g @nx/angular:library ui/components \
  --directory=libs/org/ui/components \
  --tags=scope:org,type:lib,type:ui \
  --unitTestRunner=jest \
  --style=scss

# UI layouts library
nx g @nx/angular:library ui/layouts \
  --directory=libs/org/ui/layouts \
  --tags=scope:org,type:lib,type:ui \
  --unitTestRunner=jest \
  --style=scss

# Design system library
nx g @nx/angular:library ui/design-system \
  --directory=libs/org/ui/design-system \
  --tags=scope:org,type:lib,type:ui \
  --unitTestRunner=jest \
  --style=scss
```

### 5. Utility Library

```bash
# Validators library
nx g @nx/js:lib util/validators \
  --directory=libs/org/util/validators \
  --tags=scope:org,type:lib,type:util \
  --unitTestRunner=jest \
  --bundler=esbuild

# Formatters library
nx g @nx/js:lib util/formatters \
  --directory=libs/org/util/formatters \
  --tags=scope:org,type:lib,type:util \
  --unitTestRunner=jest \
  --bundler=esbuild

# Guards library (Angular)
nx g @nx/angular:library util/guards \
  --directory=libs/org/util/guards \
  --tags=scope:org,type:lib,type:util \
  --unitTestRunner=jest \
  --style=scss
```

---

## Updated ESLint Module Boundaries

Update `eslint.base.config.mjs` with the following dependency constraints:

```javascript
depConstraints: [
  // Core libraries can be imported by anyone
  {
    sourceTag: '*',
    onlyDependOnLibsWithTags: ['type:core', 'scope:org'],
  },
  // Data access libraries can depend on core
  {
    sourceTag: 'type:data-access',
    onlyDependOnLibsWithTags: [
      'type:core',
      'type:data-access',
      'scope:org',
    ],
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
```

---

## Backend + Frontend Integration Pattern

For domains that need both backend (NestJS) and frontend (Angular) libraries:

### Option 1: Separate Libraries (Recommended)

```
libs/org/
├── feature-welfare/
│   ├── api/              # NestJS backend module
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── welfare.controller.ts
│   │   │   │   ├── welfare.service.ts
│   │   │   │   └── welfare.module.ts
│   │   │   └── index.ts
│   │   └── project.json  # Tags: scope:org,type:lib,type:feature,domain:welfare
│   │
│   └── feature/          # Angular frontend module
│       ├── src/
│       │   ├── lib/
│       │   │   ├── welfare.component.ts
│       │   │   ├── welfare.service.ts
│       │   │   └── welfare.module.ts
│       │   └── index.ts
│       └── project.json  # Tags: scope:org,type:lib,type:feature,domain:welfare
```

**Generation Commands**:

```bash
# Backend API
nx g @nx/nest:library feature-welfare/api \
  --directory=libs/org/feature-welfare/api \
  --tags=scope:org,type:lib,type:feature,domain:welfare \
  --unitTestRunner=jest

# Frontend Feature
nx g @nx/angular:library feature-welfare/feature \
  --directory=libs/org/feature-welfare/feature \
  --tags=scope:org,type:lib,type:feature,domain:welfare \
  --unitTestRunner=jest \
  --style=scss
```

### Option 2: Shared Types in Core

For shared types between backend and frontend:

```
libs/org/
├── core/
│   └── types/
│       └── welfare/      # Shared welfare types
│           ├── welfare.dto.ts
│           ├── welfare.entity.ts
│           └── index.ts
│
└── feature-welfare/
    ├── api/              # NestJS - imports from @org/core/types/welfare
    └── feature/          # Angular - imports from @org/core/types/welfare
```

---

## Bootstrap Sequence

### Phase 1: Foundation (Week 1)

```bash
# 1. Core libraries
nx g @nx/js:lib core/types --directory=libs/org/core/types --tags=scope:org,type:lib,type:core --unitTestRunner=jest --bundler=esbuild
nx g @nx/js:lib core/utils --directory=libs/org/core/utils --tags=scope:org,type:lib,type:core --unitTestRunner=jest --bundler=esbuild
nx g @nx/js:lib core/constants --directory=libs/org/core/constants --tags=scope:org,type:lib,type:core --unitTestRunner=jest --bundler=esbuild

# 2. Base data access
nx g @nx/js:lib data-access/api-client --directory=libs/org/data-access/api-client --tags=scope:org,type:lib,type:data-access --unitTestRunner=jest --bundler=esbuild

# 3. UI foundation
nx g @nx/angular:library ui/components --directory=libs/org/ui/components --tags=scope:org,type:lib,type:ui --unitTestRunner=jest --style=scss
nx g @nx/angular:library ui/design-system --directory=libs/org/ui/design-system --tags=scope:org,type:lib,type:ui --unitTestRunner=jest --style=scss

# 4. Utilities
nx g @nx/js:lib util/validators --directory=libs/org/util/validators --tags=scope:org,type:lib,type:util --unitTestRunner=jest --bundler=esbuild
nx g @nx/js:lib util/formatters --directory=libs/org/util/formatters --tags=scope:org,type:lib,type:util --unitTestRunner=jest --bundler=esbuild
```

### Phase 2: First Domain (Week 2)

```bash
# Example: Demographics domain

# 1. Data access
nx g @nx/nest:library data-access/demographics-api --directory=libs/org/data-access/demographics-api --tags=scope:org,type:lib,type:data-access,domain:demographics --unitTestRunner=jest
nx g @nx/angular:library data-access/demographics-api --directory=libs/org/data-access/demographics-api --tags=scope:org,type:lib,type:data-access,domain:demographics --unitTestRunner=jest --style=scss

# 2. Feature
nx g @nx/angular:library feature-demographics --directory=libs/org/feature-demographics --tags=scope:org,type:lib,type:feature,domain:demographics --unitTestRunner=jest --style=scss
nx g @nx/nest:library feature-demographics --directory=libs/org/feature-demographics --tags=scope:org,type:lib,type:feature,domain:demographics --unitTestRunner=jest
```

### Phase 3: Additional Domains (Week 3+)

Repeat Phase 2 for each new domain (welfare, migration, etc.)

---

## Tag Structure Summary

| Tag                | Purpose                      | Example Values                         |
| ------------------ | ---------------------------- | -------------------------------------- |
| `scope:org`        | Organization/workspace scope | `org`                                  |
| `type:app`         | Application projects         | `app`                                  |
| `type:lib`         | Library projects             | `lib`                                  |
| `type:core`        | Core/shared libraries        | `core`                                 |
| `type:data-access` | Data access layer            | `data-access`                          |
| `type:feature`     | Feature libraries            | `feature`                              |
| `type:ui`          | UI component libraries       | `ui`                                   |
| `type:util`        | Utility libraries            | `util`                                 |
| `domain:*`         | Domain identifier            | `demographics`, `welfare`, `migration` |

---

## Dependency Rules Matrix

| Source Type        | Can Depend On                                              |
| ------------------ | ---------------------------------------------------------- |
| `type:core`        | None (foundation)                                          |
| `type:data-access` | `type:core`                                                |
| `type:feature`     | `type:core`, `type:data-access`, `type:ui`, `type:feature` |
| `type:ui`          | `type:core`, `type:ui`                                     |
| `type:util`        | `type:core`, `type:util`                                   |
| `type:app`         | All types                                                  |

---

## Best Practices

1. **Domain Isolation**: Each feature domain should be self-contained with minimal cross-domain dependencies.

2. **Shared Types**: Place shared types in `core/types` to avoid duplication between backend and frontend.

3. **API Contracts**: Define API contracts in `data-access` libraries to ensure consistency.

4. **Component Reusability**: Place truly reusable components in `ui`, domain-specific components in `feature-*`.

5. **Testing**: Each library should have its own test suite. Use integration tests for cross-library interactions.

6. **Documentation**: Maintain README files in each library explaining its purpose and usage.

7. **Versioning**: Use Nx's built-in versioning for libraries that are published or shared across workspaces.

---

## Next Steps

1. Review and approve the domain structure
2. Update ESLint boundaries configuration
3. Execute Phase 1 bootstrap commands
4. Create initial shared types and utilities
5. Begin implementing first domain (demographics)
6. Establish coding standards and documentation templates

---

## References

- [Nx Library Generation](https://nx.dev/nx-api/angular/generators/library)
- [Nx Dependency Graph](https://nx.dev/core-features/explore-graph)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Nx Module Boundaries](https://nx.dev/concepts/more-concepts/enforcing-module-boundaries)
