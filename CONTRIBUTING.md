# Contributing to Athena Platform

Thank you for your interest in contributing to Athena Platform! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/athena.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Test your changes: `npm run test:all && npm run lint:all`
7. Commit your changes: `git commit -m 'Add some feature'`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality
fix(users): resolve user deletion issue
docs(readme): update installation instructions
```

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes
- Use enums for constants
- Prefer `const` over `let`, avoid `var`

### Angular

- Use standalone components
- Follow Angular style guide
- Use OnPush change detection where possible
- Use reactive forms for complex forms
- Use async pipe for observables

### NestJS

- Follow NestJS best practices
- Use DTOs for data validation
- Use dependency injection
- Implement proper error handling
- Use guards for authorization

### Testing

- Write unit tests for all new features
- Write integration tests for complex flows
- Maintain or improve test coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Code Style

- Run `npm run format` before committing
- Run `npm run lint:all` to check for issues
- Follow existing code patterns
- Keep functions small and focused
- Use meaningful variable names

## Project Structure

### Adding a New Feature

1. Create feature library: `npx nx g @nx/angular:lib feature-name`
2. Add appropriate tags: `scope:org`, `type:lib`, `type:feature`
3. Create components/services as needed
4. Add routes in `app.routes.ts`
5. Write tests
6. Update documentation

### Adding a New Domain

1. Create core domain library: `npx nx g @nx/js:lib core/domain-name`
2. Create data-access library: `npx nx g @nx/angular:lib data-access/domain-name-api`
3. Create feature library: `npx nx g @nx/angular:lib feature-domain-name`
4. Follow dependency rules (see [Architecture](./DOMAIN_ARCHITECTURE.md))

## Testing

### Running Tests

```bash
# All tests
npm run test:all

# Integration tests
npm run test:integration

# E2E tests
npm run e2e:api
npm run e2e:ui:chromium
```

### Writing Tests

- **Unit Tests**: Test individual functions/components in isolation
- **Integration Tests**: Test component + service interactions
- **E2E Tests**: Test complete user flows

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Ensure linting passes
5. Update CHANGELOG.md (if applicable)
6. Request review from maintainers

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Commit messages follow conventions

## Questions?

Feel free to open an issue for questions or discussions about contributions.

