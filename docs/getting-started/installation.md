# Installation Guide

This guide will walk you through the process of installing and setting up the Portal Template System Kit on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.x or higher)
- **npm** (version 9.x or higher)
- **Git** (for cloning the repository)

You can check your current versions by running:

```powershell
node --version
npm --version
git --version
```

## Installation Steps

### 1. Clone the Repository

```powershell
# Clone the repository
git clone https://github.com/yourusername/portal-template-system-kit.git

# Navigate to the project directory
Set-Location portal-template-system-kit
```

### 2. Install Dependencies

```powershell
# Install project dependencies
npm install
```

This will install all the required dependencies specified in the `package.json` file.

### 3. Configure Environment Variables

Create a `.env` file in the root directory of the project based on the `.env.example` template:

```powershell
# Copy the example environment file
Copy-Item .env.example .env
```

Then edit the `.env` file to configure your environment-specific settings:

```
API_URL=http://localhost:3000/api
MOCK_AUTH=true
```

### 4. Start the Development Server

```powershell
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## Development Login Credentials

For development purposes, you can use the following credentials:

- **Email**: admin@example.com
- **Password**: password

## Troubleshooting Installation Issues

### Node Version Issues

If you encounter issues related to Node.js version, consider using Node Version Manager (nvm) to manage multiple Node.js versions.

### Package Installation Errors

If you encounter errors during package installation:

```powershell
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

### Port Conflicts

If port 5173 is already in use, you can modify the `vite.config.ts` file to use a different port:

```typescript
// vite.config.ts
export default defineConfig({
  // ...
  server: {
    port: 3000, // Change to an available port
  },
});
```

## Next Steps

After installing the application, you can:

- Explore the [Quick Start Guide](./quick-start.md) to learn about the basic features
- Set up your [Development Environment](./dev-environment.md) for optimal productivity
- Learn about the [Project Structure](../architecture/project-structure.md) to understand the codebase

If you encounter any issues not covered in this guide, please check the [Troubleshooting Guide](../guides/troubleshooting.md) or open an issue on the project's GitHub repository. 