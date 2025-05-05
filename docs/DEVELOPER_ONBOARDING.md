# Developer Onboarding Guide

Welcome to the Portal Template System Kit! This onboarding guide will help you get started with development, understand our workflows, and quickly become a productive contributor.

## Table of Contents

- [First-Time Setup](#first-time-setup)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Branch Strategy](#branch-strategy)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Review Process](#code-review-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

## First-Time Setup

1. **Clone the Repository**

   ```powershell
   git clone https://github.com/yourusername/portal-template-system-kit.git
   Set-Location portal-template-system-kit
   ```

2. **Install Dependencies**

   ```powershell
   npm install
   ```

3. **Set up Environment Variables**

   Create a `.env` file based on the `.env.example` template (if available)

4. **Run Development Server**

   ```powershell
   npm run dev
   ```

5. **Verify Setup**

   Open your browser to http://localhost:5173 and verify that the application loads correctly.

6. **Run Tests**

   ```powershell
   npm run test
   ```

## Development Environment

### Recommended Tools

- **Editor**: VS Code with the following extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Hero

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher

### Editor Configuration

We recommend the following settings for VS Code (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Project Structure

```
portal-template-system-kit/
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # Reusable UI components
│   │   ├── layout/     # Layout components
│   │   ├── providers/  # Context providers
│   │   └── ui/         # UI components
│   ├── config/         # Configuration files
│   ├── pages/          # Page components
│   ├── store/          # MobX stores
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom hooks
│   ├── types/          # TypeScript types/interfaces
│   └── App.tsx         # Main application component
├── docs/               # Documentation
├── scripts/            # Build and utility scripts
├── tests/              # Test files
└── [configuration files]
```

### Key Directories Explained

- **components/**: Reusable UI components organized by function
- **pages/**: Route-specific page components
- **store/**: MobX state management stores
- **config/**: Environment-specific configuration

## Development Workflow

### Daily Development Cycle

1. **Pull latest changes** from the main branch
   ```powershell
   git checkout main
   git pull
   ```

2. **Create a feature branch** for your work
   ```powershell
   git checkout -b feature/your-feature-name
   ```

3. **Make changes** and commit regularly with meaningful commit messages

4. **Write tests** for new functionality

5. **Run quality checks** before submitting a PR
   ```powershell
   npm run quality
   ```

6. **Push your branch** and create a Pull Request
   ```powershell
   git push -u origin feature/your-feature-name
   ```

7. **Address review feedback** if necessary

### Working with Tasks

1. **Check the issue tracker** for assigned tasks
2. **Move the issue** to "In Progress" when you start working on it
3. **Reference the issue number** in commit messages and PR descriptions

## Coding Standards

We follow strict coding standards to maintain code quality and consistency. See [SPA_SETUP_RECOMMENDATIONS.md](./SPA_SETUP_RECOMMENDATIONS.md) for detailed recommendations.

### Key Standards

- Use TypeScript for all new code
- Follow the existing code structure and naming conventions
- Use functional components with hooks for React components
- Avoid using `any` type in TypeScript
- Write comprehensive tests for all new features
- Document complex logic with comments

## Branch Strategy

### Branch Naming Convention

Use the following format for branch names:

- `feature/<feature-name>` - For new features
- `fix/<issue-name>` - For bug fixes
- `refactor/<refactor-name>` - For code refactoring
- `docs/<doc-name>` - For documentation changes
- `test/<test-name>` - For adding or updating tests

Examples:
- `feature/user-authentication`
- `fix/login-validation-error`
- `refactor/api-client`

### Branch Lifecycle

1. Create branch from `main`
2. Develop and test your changes
3. Submit PR for review
4. Address feedback and update PR
5. PR is merged back to `main` (typically via squash merge)
6. Branch is deleted after merge

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```
feat(auth): implement user authentication

Add login form and authentication service to handle user login.

Closes #123
```

```
fix(forms): correct validation error in login form

The email validation was not properly handling special characters.
```

## Pull Request Process

### Creating a PR

1. Ensure your code passes all tests and quality checks
2. Create a pull request against the `main` branch
3. Fill out the PR template with details about your changes
4. Assign reviewers from the team
5. Link any related issues in the PR description

### PR Template Usage

Use the provided PR template which includes:
- Description of changes
- Related issues
- Type of change
- How to test the changes
- Screenshots (if appropriate)
- Checklist of completed requirements

### PR Size Guidelines

- Keep PRs focused on a single concern
- Aim for PRs under 500 lines of code when possible
- Break large features into smaller, incremental PRs
- Include only relevant changes (no unrelated refactoring)

## Code Review Process

### For Contributors

1. Be responsive to feedback and questions
2. Explain your implementation decisions when asked
3. Be open to alternative approaches
4. Resolve conversations once addressed
5. Request re-review after making changes

### For Reviewers

1. Review PRs within 48 hours when possible
2. Be constructive and respectful in feedback
3. Use "Comment" for minor suggestions, "Request changes" for critical issues
4. Approve once all issues are addressed
5. Focus on:
   - Code correctness
   - Test coverage
   - Security concerns
   - Performance implications
   - Adherence to coding standards

## Testing Guidelines

### Types of Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete user flows

### Running Tests

```powershell
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Coverage Requirements

- Aim for at least 80% coverage for new code
- Write tests for all edge cases and error scenarios
- Focus on testing business logic and user interactions

## Documentation

### Code Documentation

- Document public functions and interfaces with JSDoc comments
- Explain complex algorithms or business logic
- Keep comments up-to-date with code changes

### Project Documentation

- Update README.md with new features or changes
- Update API documentation for new endpoints
- Create or update user guides when adding features

## Troubleshooting

### Common Issues

#### Build Failures

- Check for TypeScript errors with `npm run typecheck`
- Ensure all dependencies are installed with `npm install`
- Clear node_modules and reinstall with `Remove-Item -Recurse -Force node_modules && npm install`

#### Test Failures

- Run tests in watch mode to debug issues: `npm run test:watch`
- Check for mock data inconsistencies
- Review recent changes that might affect the failing tests

### Getting Help

If you're stuck or have questions:

1. Check the existing documentation
2. Look for similar issues in the issue tracker
3. Ask the team in the designated communication channel
4. Reach out to the project maintainers

## Additional Resources

- [SPA Setup Recommendations](./SPA_SETUP_RECOMMENDATIONS.md)
- [Quality Documentation](../QUALITY.md)
- [GitHub Actions](../GITHUB_ACTIONS.md)
- [Contribution Guide](./getting-started/contribution.md)

---

Welcome to the team! We're excited to have you contribute to the Portal Template System Kit. 