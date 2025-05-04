# Project Structure

This document outlines the structure of the Portal Template System Kit project, explaining the purpose of each directory and the organization of code.

## Overview

The project follows a feature-based organization, where code is grouped by functionality rather than by technical role. This makes it easier to understand and modify specific features.

## Root Directory Structure

```
portal-template-system-kit/
├── .github/            # GitHub-specific files (workflows, templates)
├── .git/               # Git repository data
├── dist/               # Production build output (generated)
├── docs/               # Project documentation
├── node_modules/       # External dependencies (generated)
├── public/             # Static assets (favicons, images, etc.)
├── scripts/            # Build and utility scripts
├── src/                # Source code (main application code)
├── coverage/           # Test coverage reports (generated)
├── .gitignore          # Git ignore file
├── lighthouserc.js     # Lighthouse CI configuration
├── package.json        # Project dependencies and scripts
├── README.md           # Project overview
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build tool configuration
└── ... other config files
```

## Source Code Structure (`/src`)

The `src` directory contains the main application code, organized as follows:

```
src/
├── api/                # API client and service definitions
├── components/         # Shared UI components
├── config/             # Application configuration
├── features/           # Feature modules
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and helpers
├── pages/              # Page components
├── store/              # Global state management
├── test/               # Testing utilities
├── utils/              # Utility functions
├── App.tsx             # Main application component
├── App.css             # Main application styles
├── index.css           # Global CSS
├── main.tsx            # Application entry point
└── vite-env.d.ts       # Vite type definitions
```

## Feature Module Structure

Each feature in the `features` directory is organized in a consistent way:

```
features/
├── documents/                # Example feature: Documents
│   ├── api/                  # Feature-specific API services
│   ├── components/           # Feature-specific UI components
│   ├── pages/                # Feature-specific pages
│   ├── store/                # Feature-specific state management
│   └── utils/                # Feature-specific utilities
├── authentication/           # Authentication feature
├── dashboard/                # Dashboard feature
└── ... other features
```

## Component Structure

Components are structured to separate concerns and improve maintainability:

1. **UI Components**: Basic UI elements like buttons, inputs, and cards
2. **Layout Components**: Page layout elements like headers, footers, and navigation
3. **Feature Components**: Components specific to a feature
4. **Page Components**: Full page components that compose other components

## State Management

State management is organized by feature, with:

- Global application state in `src/store`
- Feature-specific state in `src/features/[feature-name]/store`

We use MobX for state management, with stores following a consistent pattern.

## Testing Structure

Tests are co-located with the code they test, using the `.test.ts` or `.test.tsx` extension:

```
components/
├── Button.tsx             # Component implementation
├── Button.test.tsx        # Component tests
└── ... other components
```

Utility test functions and mocks are in the `src/test` directory.

## Styling Approach

The project uses Tailwind CSS for styling, with:

- Global styles in `src/index.css`
- Component-specific styles using Tailwind class composition
- Theme configuration in `tailwind.config.ts`

## Configuration Files

Key configuration files include:

- `tsconfig.json`: TypeScript compiler options
- `vite.config.ts`: Build and development server configuration
- `package.json`: Project dependencies and NPM scripts
- `tailwind.config.ts`: Tailwind CSS theme configuration
- `eslint.config.js`: ESLint code quality rules

## Adding New Features

When adding a new feature:

1. Create a new directory in `src/features/`
2. Structure it with API, components, pages, and store subdirectories
3. Export the feature's public API from an index.ts file
4. Add route definitions in the main router configuration

## Best Practices

- Keep feature code isolated within its directory
- Use relative imports within a feature (`./component`) and absolute imports across features (`@/features/auth`)
- Share code through explicit exports in index.ts files
- Avoid cross-feature imports, except through public APIs

This structure helps maintain a clean separation of concerns while making the codebase easy to navigate and understand. 