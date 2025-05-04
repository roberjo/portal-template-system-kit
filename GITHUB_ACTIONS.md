# GitHub Actions Workflows

This document describes the GitHub Actions workflows set up for this project to ensure code quality and maintain documentation.

## 1. Code Quality Workflow

**File**: [.github/workflows/quality.yml](.github/workflows/quality.yml)

This workflow runs on push to `main` branch and on pull requests targeting `main`. It performs:

- ESLint for code style checking
- TypeScript type checking
- Vitest unit tests with coverage reports
- SonarCloud analysis for deeper code quality metrics
- Lighthouse CI for performance analysis
- Automatic README badge updates on push to main

### Coverage Badges

The workflow automatically updates the README.md file with:
- Overall code coverage percentage badge
- Detailed coverage statistics in the Code Coverage section
- Last updated timestamp

### Required Secrets

- `GITHUB_TOKEN`: Automatically provided by GitHub
- `SONAR_TOKEN`: Required for SonarCloud integration
- `LHCI_GITHUB_APP_TOKEN`: Required for Lighthouse CI

## 2. PR Validation Workflow

**File**: [.github/workflows/pr-validation.yml](.github/workflows/pr-validation.yml)

This workflow runs on pull requests targeting the `main` branch and:

- Performs code quality checks (lint, typecheck, tests)
- Generates coverage reports
- Posts a coverage summary as a comment on the PR

This helps reviewers quickly see the impact of changes on code quality and test coverage.

## 3. Test Badge Update Workflow

**File**: [.github/workflows/test-badges.yml](.github/workflows/test-badges.yml)

This is a manually triggered workflow (`workflow_dispatch`) that:
- Creates a test coverage report
- Updates the README with badges
- Commits and pushes the changes

It's useful for testing the badge update functionality without having to run the full quality workflow.

## Making Changes to Workflows

When making changes to these workflows:

1. For significant changes, create a PR with the workflow file changes
2. Test changes using the `test-badges.yml` workflow when possible
3. Make sure any badge or documentation updates are working correctly

## Repository Settings

For these workflows to function properly, the repository requires:

1. GitHub Actions enabled
2. Write permissions for GitHub Actions (for updating README)
3. Proper secrets configured for SonarCloud and Lighthouse CI
4. Branch protection on main with required status checks 