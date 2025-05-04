# Deployment Overview

This document outlines the deployment options and best practices for the Portal Template System Kit.

## Deployment Options

The application can be deployed in several ways:

1. **Static Hosting**: Deploy the built assets to a static hosting service
2. **Container-Based**: Deploy using Docker containers
3. **Server-Based**: Deploy to a Node.js server
4. **Serverless**: Deploy to a serverless platform

## Prerequisites

Before deploying, ensure you have:

1. Node.js 18.x or higher and npm 9.x or higher
2. Access to the deployment target (hosting service, server, etc.)
3. Environment variables configured for the target environment

## Building for Production

To build the application for production:

```powershell
# Install dependencies
npm install

# Build for production
npm run build
```

This will create a `dist` directory with the production-ready assets.

## Environment Configuration

The application uses environment variables for configuration. Before deploying, create a `.env.production` file with the appropriate settings:

```
VITE_API_URL=https://api.example.com
VITE_MOCK_AUTH=false
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

Environment variables are processed during the build, so they need to be set before running `npm run build`.

## Deployment to Static Hosting

### Option 1: Netlify

1. Create a `netlify.toml` file in the project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy to Netlify:

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy
```

### Option 2: Vercel

1. Create a `vercel.json` file in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

2. Deploy to Vercel:

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

### Option 3: GitHub Pages

1. Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: dist
```

2. Push to the main branch to trigger the GitHub Action.

## Container-Based Deployment

### Docker Deployment

1. Create a `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create an `nginx.conf` file:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Build and run the Docker container:

```powershell
# Build the Docker image
docker build -t portal-template-system-kit .

# Run the Docker container
docker run -p 8080:80 portal-template-system-kit
```

## Server-Based Deployment

### Node.js Server Deployment

1. Create a simple server file `server.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

2. Add the server dependencies:

```powershell
npm install express
```

3. Update `package.json` with a start script:

```json
"scripts": {
  "start": "node server.js"
}
```

4. Deploy to a Node.js hosting service (Heroku, DigitalOcean, etc.)

## CI/CD Integration

The project includes GitHub Actions workflows for CI/CD. See [GitHub Actions Documentation](../GITHUB_ACTIONS.md) for details.

## Post-Deployment Verification

After deploying, verify that:

1. The application loads correctly
2. Authentication works
3. API requests are successful
4. Features function as expected

## Rollback Procedure

If issues are detected after deployment:

1. Identify the last stable version
2. Redeploy the stable version
3. Investigate and fix issues in a development environment

## Performance Monitoring

Set up performance monitoring using:

1. Lighthouse CI for performance metrics
2. Analytics for user behavior
3. Error tracking (Sentry, etc.)

## Security Considerations

1. Ensure HTTPS is enabled
2. Set proper Content Security Policy headers
3. Configure proper CORS settings on the API
4. Keep dependencies updated
5. Follow OWASP security best practices

## Further Resources

- [Environment Configuration](./environment-config.md)
- [CI/CD Pipeline](./ci-cd.md)
- [Monitoring and Logging](./monitoring.md) 