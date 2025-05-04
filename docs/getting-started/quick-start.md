# Quick Start Guide

This guide will help you quickly get started with the Portal Template System Kit. If you need more detailed instructions, see the [Installation Guide](./installation.md).

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

## Step 1: Clone and Install

```powershell
# Clone the repository
git clone https://github.com/yourusername/portal-template-system-kit.git

# Navigate to the project directory
Set-Location portal-template-system-kit

# Install dependencies
npm install
```

## Step 2: Start Development Server

```powershell
# Start the development server
npm run dev
```

The application will be available at http://localhost:5173.

## Step 3: Login to the Application

Use the following test credentials:

- **Email**: admin@example.com
- **Password**: password

## Step 4: Explore Key Features

1. **Dashboard**: Explore the data visualization components
2. **User Management**: View and manage user accounts
3. **Document Management**: Upload and manage documents
4. **Settings**: Configure application settings and preferences

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |

## Project Structure Overview

```
portal-template-system-kit/
├── src/                # Source code
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── features/       # Feature modules
│   ├── store/          # Global state management
│   └── api/            # API client and services
├── public/             # Static assets
└── docs/               # Documentation
```

## Next Steps

- Explore the [Architecture Overview](../architecture/overview.md)
- Learn about the [Component Library](../components/overview.md)
- Understand the [API Integration](../api/overview.md)
- Review the [Testing Guide](../guides/testing.md)

## Troubleshooting

- **Port conflict**: If port 5173 is already in use, Vite will automatically use the next available port.
- **Module not found errors**: Ensure you've run `npm install` and that all dependencies are properly installed.
- **Authentication issues**: In development mode, the app uses mock authentication. Check the login credentials above.

## Getting Help

If you encounter any issues or have questions:

1. Check the [documentation](../README.md)
2. Search for existing issues in the GitHub repository
3. Ask for help in the project's discussion forum
4. Open a new issue with detailed information about your problem 