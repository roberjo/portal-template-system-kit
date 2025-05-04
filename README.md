# Portal Template System Kit

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-purple?logo=vite)](https://vitejs.dev/)
[![MobX](https://img.shields.io/badge/MobX-6.10.2-orange?logo=mobx)](https://mobx.js.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)
![Code Coverage](https://img.shields.io/badge/Coverage-0%25-red)
![Last Updated](https://img.shields.io/badge/Last%20Updated-2025-05-04-blue)](LICENSE)

A modern, responsive admin portal template system with authentication, session management, data visualization, and user management features.

![Portal Screenshot](https://via.placeholder.com/800x400.png?text=Portal+Template+System+Kit)

## 🚀 Features

- **Authentication System**
  - User login with session persistence
  - Automatic session timeout after 5 minutes of inactivity
  - Session extension warnings
  - Mock authentication for development
  
- **Responsive Dashboard**
  - Data visualization with charts
  - Activity monitoring
  - Key performance metrics
  
- **User Management**
  - User profiles with preferences
  - Role-based access control
  - User impersonation for admins
  
- **Modern UI Components**
  - Modular component system
  - Dark/light theme support
  - Form validation
  - Data tables with sorting and filtering
  
- **Notification System**
  - Real-time notifications
  - Toast messages
  - Notification center

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **State Management**: MobX with MobX-React-Lite
- **Routing**: React Router 6
- **Styling**: TailwindCSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Data Visualization**: Recharts
- **Date Handling**: date-fns
- **HTTP Client**: TanStack Query

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## 🚦 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portal-template-system-kit.git

# Navigate to the project directory
cd portal-template-system-kit

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Login Credentials

For development purposes, you can use the following credentials:

- **Email**: admin@example.com
- **Password**: password

## 📖 Usage Guide

### Authentication

The system includes a mock authentication system for development. Users will be redirected to the login page when trying to access protected routes. After successful login, they will be redirected to the dashboard.

### Session Management

- The session automatically expires after 5 minutes of inactivity
- A warning dialog appears 1 minute before session timeout
- Any user activity (mouse movement, clicks, keyboard input) resets the inactivity timer

### User Profile

Navigate to the Profile page to:
- Update user information
- Manage notification preferences
- Change theme settings

### Admin Panel

Administrators have access to additional features:
- User management
- Role assignment
- User impersonation

## 🧩 Project Structure

```
portal-template-system-kit/
├── public/             # Static assets
│   ├── components/     # Reusable UI components
│   │   ├── layout/     # Layout components
│   │   ├── providers/  # Context providers
│   │   └── ui/         # UI components
│   ├── config/         # Configuration files
│   ├── pages/          # Page components
│   ├── store/          # MobX stores
│   └── App.tsx         # Main application component
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Configuration

The application can be configured by modifying the files in the `src/config` directory:

- `env.ts`: Environment-specific configuration
- `auth.ts`: Authentication settings
- `theme.ts`: Theme configuration

## 🔄 API Integration

By default, the application uses mock data. To connect to a real API:

1. Update the API endpoints in `src/config/env.ts`
2. Set `mockAuth` to `false` to use real authentication
3. Implement actual API calls in the store methods

## 📚 Documentation

This project includes comprehensive documentation in the `/docs` directory:

- [Installation Guide](docs/getting-started/installation.md)
- [Architecture Overview](docs/architecture/overview.md)
- [API Documentation](docs/api/overview.md)
- [Component Documentation](docs/components/overview.md)
- [Testing Guide](docs/guides/testing.md)

For more detailed documentation:

- [Main Documentation Index](docs/README.md)
- [Quality Documentation](QUALITY.md)
- [GitHub Actions](GITHUB_ACTIONS.md)

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```







## 📊 Code Coverage

| Category   | Coverage |
|------------|----------|
| Lines      | 0% |
| Statements | 0% |
| Functions  | 0% |
| Branches   | 0% |

Last updated: 2025-05-04
## 📦 Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) for the component system
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) for beautiful icons

---

Built with ❤️ by Your Name/Team
