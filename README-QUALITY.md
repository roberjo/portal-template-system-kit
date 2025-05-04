# Code Quality and Testing Guide

## Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate code coverage report |
| `npm run coverage:open` | Generate coverage report and open in browser |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint for code quality |
| `npm run quality` | Run ESLint, TypeScript check, and tests with coverage |
| `npm run sonar` | Run SonarQube analysis |
| `npm run lighthouse` | Run Lighthouse CI for web performance analysis |
| `npm run quality:full` | Run all quality checks (ESLint, TypeScript, tests, SonarQube, Lighthouse) |

## Current Test Coverage Summary

The current test coverage for the project shows that we have good coverage for key components but there are many areas that need more tests:

- Well-tested components:
  - `src/api/client.ts`: 93.01%
  - `src/components/ui/DataGrid.tsx`: 93.89%
  - `src/components/ui/button.tsx`: 100%
  - `src/pages/Login.tsx`: 96.58%
  - `src/utils/formatters.ts`: 100%

- Overall project coverage is low (~6%), indicating many components need tests.

## Setting Up Quality Tools

For detailed instructions on setting up and using these tools, see the [QUALITY.md](./QUALITY.md) file.

## CI/CD Integration

The project includes GitHub Actions workflows in `.github/workflows/quality.yml` that run quality checks automatically on PRs and pushes to main branch.

## Best Practices

1. **Write tests before fixing bugs** - This helps prevent regression
2. **Aim for at least 80% coverage** for critical code paths
3. **Use snapshot testing** for UI components to detect unexpected changes
4. **Run the quality check before submitting PRs**
5. **Address SonarQube issues** to improve code quality 