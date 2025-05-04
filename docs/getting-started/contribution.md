# Contribution Guide

This guide outlines how to contribute to the project effectively, covering coding standards, pull requests, and code review processes.

## Development Workflow

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/portal-template-system-kit.git
   cd portal-template-system-kit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Branch Naming Convention

Use the following format for branch names:

- `feature/<feature-name>` - For new features
- `fix/<issue-name>` - For bug fixes
- `refactor/<refactor-name>` - For code refactoring
- `docs/<doc-name>` - For documentation changes

Examples:
- `feature/user-authentication`
- `fix/login-validation-error`
- `refactor/api-client`
- `docs/api-integration-guide`

### Commit Guidelines

Follow these guidelines for commit messages:

1. Use the present tense ("Add feature" not "Added feature")
2. Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
3. Limit the first line to 72 characters or less
4. Reference issues and pull requests after the first line

Use the following prefixes for commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor:` - A code change that neither fixes a bug nor adds a feature
- `perf:` - A code change that improves performance
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Changes to the build process or auxiliary tools

Examples:
```
feat: add user authentication
fix: correct validation error in login form
docs: update API integration guide
refactor: simplify data fetching logic
```

## Pull Request Process

### Creating a Pull Request

1. Make sure your code follows the project's coding standards
2. Run tests and ensure they pass
3. Update documentation if necessary
4. Create a pull request with a clear description of the changes

### PR Description Template

Use this template for your PRs:

```markdown
## Description
[Provide a brief description of the changes in this PR]

## Related Issue
[Link to the related issue, if applicable]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update

## How to Test
[Provide instructions for testing these changes]

## Screenshots (if appropriate)
[Include screenshots of UI changes]

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings or errors
```

### Code Review Guidelines

#### For Contributors

1. **Keep PRs focused** - Each PR should address a single concern
2. **Make it reviewable** - Keep PRs reasonably sized (under 500 lines when possible)
3. **Describe your changes** - Provide context and motivation for changes
4. **Respond promptly** - Address review comments in a timely manner
5. **Be open to feedback** - Be receptive to suggestions and improvements

#### For Reviewers

1. **Be constructive** - Focus on improvement, not criticism
2. **Be specific** - Provide clear suggestions with examples
3. **Look for:**
   - Code correctness
   - Test coverage
   - Security concerns
   - Performance implications
   - Adherence to project style guidelines
   - Documentation updates
4. **Ask questions** rather than making demands
5. **Acknowledge good work** - Highlight well-implemented code

## Coding Standards

Follow these standards in your code:

### General

1. Write self-documenting code with clear variable and function names
2. Keep functions small and focused on a single task
3. Follow the DRY (Don't Repeat Yourself) principle
4. Write comments for complex logic or non-obvious decisions

### TypeScript

1. Use explicit typing (avoid `any`)
2. Use interfaces for object shapes
3. Use enums for fixed sets of values
4. Use type guards for type narrowing

### React

1. Use functional components with hooks
2. Keep components small and focused
3. Use prop types or TypeScript interfaces for component props
4. Follow the project's component structure

### Testing

1. Write tests for all new features
2. Maintain high test coverage
3. Test edge cases and error scenarios
4. Use proper test descriptions

## Review Process

### Steps

1. **Initial Review** - A team member will review your PR
2. **Address Feedback** - Make necessary changes based on review comments
3. **Final Review** - PR will be reviewed again after changes
4. **Approval** - PR will be approved when it meets all requirements
5. **Merge** - The PR will be merged into the main branch

### Review Criteria

PRs will be evaluated based on:

1. Code quality and adherence to style guidelines
2. Test coverage and quality
3. Documentation completeness
4. Performance and security considerations
5. Compatibility with existing code

## Getting Help

If you need help or have questions:

1. Check existing documentation
2. Open an issue for discussions
3. Reach out to the team via [preferred communication channel]
4. Mention specific team members in your PR for targeted questions 