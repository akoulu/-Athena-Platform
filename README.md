# Athena Platform

[![CI](https://github.com/yourusername/athena/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/athena/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A modern full-stack platform for managing social and administrative services, built with Angular 20, NestJS 11, and Nx monorepo architecture.

## 🚀 Features

- **🔐 Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (RBAC)
  - Password reset via email
  - Secure token storage in database

- **👥 User Management**
  - Complete CRUD operations for users
  - Admin panel for user administration
  - User profile management

- **📊 Dashboard**
  - Real-time statistics
  - User activity monitoring
  - System overview

- **🏗️ Architecture**
  - Domain-Driven Design (DDD) principles
  - Nx monorepo with strict dependency boundaries
  - Modular, scalable structure
  - Type-safe shared types between frontend and backend

- **🛡️ Security**
  - Helmet.js for security headers
  - Rate limiting with throttling
  - CORS configuration
  - Environment variable validation
  - Request ID tracking
  - Global exception handling

- **📝 API Documentation**
  - Swagger/OpenAPI integration
  - Interactive API explorer
  - Versioned API (`/api/v1`)

- **✅ Testing**
  - Unit tests with Jest
  - Integration tests
  - E2E tests with Playwright
  - Code coverage reporting

## 🛠️ Tech Stack

### Frontend
- **Angular 20.3** - Modern web framework
- **TypeScript 5.9** - Type-safe development
- **RxJS 7.8** - Reactive programming
- **Standalone Components** - Modern Angular architecture

### Backend
- **NestJS 11** - Progressive Node.js framework
- **Sequelize 6** - SQL ORM
- **PostgreSQL/SQLite** - Database support
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Winston** - Structured logging

### DevOps & Tools
- **Nx 22** - Monorepo tooling
- **Jest** - Testing framework
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **GitHub Actions** - CI/CD

## 📋 Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x
- **PostgreSQL** >= 14 (optional, SQLite supported for development)
- **Git**

## 🚦 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/athena.git
cd athena/org
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `org` directory:

```env
# Database
DB_DIALECT=sqlite
DB_STORAGE=./data/dev.sqlite

# Or for PostgreSQL:
# DB_DIALECT=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=athena
# DB_USER=postgres
# DB_PASS=password

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Email (optional, for password reset)
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 4. Run database migrations

```bash
npm run db:migrate:up
```

### 5. Start development servers

```bash
# Start both frontend and backend
npm run serve:all

# Or start separately:
# Frontend only
npx nx serve org

# Backend only
npx nx serve api
```

### 6. Access the application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 📚 Project Structure

```
org/
├── libs/org/
│   ├── core/              # Core domain logic, types, utilities
│   │   ├── auth/         # Authentication domain
│   │   ├── users/        # Users domain
│   │   ├── types/        # Shared TypeScript types
│   │   ├── utils/        # Utility functions
│   │   └── constants/    # Constants
│   │
│   ├── data-access/      # API clients and services
│   │   ├── api-client/   # Base HTTP client
│   │   ├── auth/         # Auth API service
│   │   └── users-api/    # Users API service
│   │
│   ├── feature-*/        # Feature modules
│   │   ├── auth/         # Authentication feature
│   │   ├── dashboard/    # Dashboard feature
│   │   └── users/        # Users management feature
│   │
│   ├── ui/               # UI components
│   │   ├── components/   # Reusable components
│   │   ├── layouts/      # Layout components
│   │   └── design-system/# Design tokens
│   │
│   └── util/             # Cross-cutting utilities
│       ├── guards/       # Route guards
│       ├── validators/   # Form validators
│       └── formatters/   # Data formatters
│
├── org/
│   └── api/              # NestJS backend application
│
├── src/                  # Angular frontend application
├── migrations/           # Database migrations
├── e2e/                  # E2E tests
└── scripts/              # Utility scripts
```

## 🧪 Testing

### Run all tests

```bash
# Unit tests
npm run test:all

# Integration tests
npm run test:integration

# Integration tests with coverage
npm run test:integration:coverage

# E2E tests
npm run e2e:api          # API E2E tests
npm run e2e:ui:chromium  # UI E2E tests (Chromium)
npm run e2e:ui:firefox   # UI E2E tests (Firefox)
```

### Run tests for a specific project

```bash
npx nx test <project-name>
npx nx test org --coverage
npx nx test api --coverage
```

## 🔍 Code Quality

### Linting

```bash
# Lint all projects
npm run lint:all

# Lint specific project
npx nx lint <project-name>
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## 🗄️ Database Migrations

```bash
# Run migrations
npm run db:migrate:up

# Rollback migrations
npm run db:migrate:down
```

## 📖 Documentation

- [Architecture Overview](./DOMAIN_ARCHITECTURE.md) - DDD architecture and domain structure
- [Configuration Guide](./CONFIGURATION.md) - Detailed configuration options
- [Quick Start Guide](./QUICK_START.md) - Quick reference for common tasks
- [Email Setup](./EMAIL_SETUP.md) - Email service configuration
- [Supabase RLS Setup](./SUPABASE_RLS_SETUP.md) - Row Level Security configuration

## 🏗️ Architecture Principles

### Domain-Driven Design (DDD)

The project follows DDD principles with clear domain boundaries:

- **Core** - Foundation layer (types, utilities, constants)
- **Data Access** - API communication layer
- **Features** - Business domain features
- **UI** - Reusable UI components
- **Util** - Cross-cutting utilities

### Dependency Rules

- **Core** → Can be imported by anyone
- **Data Access** → Can import: Core
- **Feature** → Can import: Core, Data Access, UI, Feature
- **UI** → Can import: Core, UI
- **App** → Can import: Everything

These rules are enforced via ESLint rules in the monorepo.

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Token storage in database (not memory)
- ✅ Automatic token refresh on frontend
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Security headers (Helmet.js)
- ✅ Environment variable validation
- ✅ Request ID tracking
- ✅ Global exception handling
- ✅ Row Level Security (RLS) support

## 🚢 Deployment

### Environment Variables

Ensure all required environment variables are set in your production environment. See the `.env` example above.

### Database

Run migrations in production:

```bash
npm run db:migrate:up
```

### Build

```bash
# Build frontend
npx nx build org

# Build backend
npx nx build api
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Nx](https://nx.dev) - Monorepo tooling
- [Angular](https://angular.io) - Frontend framework
- [NestJS](https://nestjs.com) - Backend framework
- [Playwright](https://playwright.dev) - E2E testing

---

**Note**: This is a development project. For production use, ensure all security best practices are followed, including:
- Strong JWT secrets
- Secure database credentials
- HTTPS configuration
- Proper CORS settings
- Rate limiting configuration
- Monitoring and logging setup
