# Code Quality Tools

This document describes the various code quality tools set up in this project and how to use them.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Code Coverage](#code-coverage)
- [TypeScript Type Checking](#typescript-type-checking)
- [ESLint](#eslint)
- [Comprehensive Quality Check](#comprehensive-quality-check)
- [SonarQube Analysis](#sonarqube-analysis)
- [Lighthouse CI](#lighthouse-ci)
- [CI/CD Integration](#cicd-integration)

## Overview

This project uses several tools to ensure code quality:

- **Vitest**: For running tests and generating coverage reports
- **ESLint**: For static code analysis and style checking
- **TypeScript**: For type checking
- **SonarQube**: For more comprehensive code quality analysis
- **Lighthouse CI**: For web performance, accessibility, and best practices analysis

## Running Tests

To run the tests:

```bash
npm test
```

To run tests in watch mode (for development):

```bash
npm run test:watch
```

## Code Coverage

To generate a code coverage report:

```bash
npm run test:coverage
```

To generate a coverage report and open it in your browser:

```bash
npm run coverage:open
```

This will generate a coverage report in the `coverage` directory and show a summary in the terminal.

## TypeScript Type Checking

To run TypeScript type checking without compiling:

```bash
npm run typecheck
```

## ESLint

To run ESLint for static code analysis:

```bash
npm run lint
```

## Comprehensive Quality Check

To run all basic quality checks (ESLint, TypeScript, and tests with coverage):

```bash
npm run quality
```

To run the complete quality suite including SonarQube and Lighthouse CI:

```bash
npm run quality:full
```

## SonarQube Analysis

To run SonarQube analysis (requires SonarQube server):

```bash
npm run sonar
```

Configure SonarQube settings in `sonar-project.js`. You need to set the environment variables:

- `SONAR_SERVER_URL`: URL of your SonarQube server (default: http://localhost:9000)
- `SONAR_TOKEN`: Your SonarQube authentication token

## Lighthouse CI

To run Lighthouse CI for web performance, accessibility, and best practices:

```bash
npm run lighthouse
```

This requires a built version of your app. Configuration is in `lighthouserc.js`.

## CI/CD Integration

This project includes GitHub Actions workflows for running quality checks on pull requests and pushes to the main branch. See the `.github/workflows/quality.yml` file for details.

To set up the CI/CD pipeline, you need to add the following secrets to your GitHub repository:

- `SONAR_TOKEN`: Your SonarQube authentication token
- `LHCI_GITHUB_APP_TOKEN`: Your Lighthouse CI GitHub app token (if using Lighthouse CI with GitHub integration) 