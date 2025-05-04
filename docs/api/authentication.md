# Authentication System

This document explains the authentication system implemented in the Portal Template System Kit.

## Overview

The application uses a token-based authentication system with session timeout functionality. In development mode, it can use mock authentication for easier testing.

## Authentication Flow

1. **Login**: User submits credentials (email/password)
2. **Token Acquisition**: Server validates credentials and returns access and refresh tokens
3. **Token Storage**: Tokens are stored securely in the application 
4. **Authenticated Requests**: Access token is included in subsequent API requests
5. **Token Refresh**: Refresh token is used to obtain a new access token when needed
6. **Logout**: Tokens are removed and user session is ended

## Session Management

The application manages user sessions with the following features:

- **Session Timeout**: Automatic session expiration after 5 minutes of inactivity
- **Session Extension**: Activity monitoring to extend active sessions
- **Timeout Warning**: Notification 1 minute before session expiration
- **Session Renewal**: Option to continue the session when warned about expiration

## Implementation Details

### Authentication Store

The `AuthStore` (found in `src/store/AuthStore.ts`) is the central store for authentication state:

```typescript
// Simplified version of AuthStore
class AuthStore {
  // Observable state
  user: User | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;
  
  // Token management
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  
  // Session management
  sessionTimeoutId: NodeJS.Timeout | null = null;
  warningTimeoutId: NodeJS.Timeout | null = null;
  
  // Methods
  login = async (credentials: Credentials) => { /* ... */ }
  logout = () => { /* ... */ }
  refreshSession = async () => { /* ... */ }
  resetSessionTimeout = () => { /* ... */ }
  
  // Token utilities
  getAccessToken = () => { /* ... */ }
  handleTokenRefresh = async () => { /* ... */ }
}
```

### API Authentication

API requests are authenticated using an interceptor that adds the access token to requests:

```typescript
// src/api/authInterceptor.ts
export const authInterceptor = (config: AxiosRequestConfig) => {
  const token = authStore.getAccessToken();
  
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  
  return config;
};

// Add the interceptor to the API client
apiClient.interceptors.request.use(authInterceptor);
```

### Session Timeout Management

Session timeout is managed by the `SessionManager` component:

```tsx
// src/components/SessionManager.tsx (simplified)
function SessionManager() {
  const { 
    resetSessionTimeout, 
    isAuthenticated, 
    logout,
    sessionExpiryTime 
  } = useAuthStore();
  
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Reset timeout on any user activity
    const handleActivity = () => {
      resetSessionTimeout();
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [isAuthenticated, resetSessionTimeout]);
  
  // Additional code for timer and warning dialog
  
  return (
    <>
      {showWarning && (
        <SessionTimeoutWarning 
          onContinue={resetSessionTimeout}
          onLogout={logout}
          expiryTime={sessionExpiryTime}
        />
      )}
    </>
  );
}
```

## Protected Routes

The application uses protected routes to restrict access to authenticated users:

```tsx
// src/App.tsx (partial)
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

## Mock Authentication

In development mode, the application can use mock authentication for easier testing:

```typescript
// src/config/env.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  mockAuth: import.meta.env.VITE_MOCK_AUTH === 'true' || true,
  // ...other config
};

// src/api/auth.ts
export const login = async (credentials: Credentials): Promise<AuthResponse> => {
  if (config.mockAuth) {
    // Mock authentication for development
    return mockAuthService.login(credentials);
  }
  
  // Real authentication for production
  return apiClient.post('/auth/login', credentials);
};
```

## Security Considerations

- Access tokens have a short lifespan (typically 15 minutes)
- Refresh tokens have a longer lifespan (typically 7 days)
- Tokens are stored in memory, not in localStorage or cookies, to mitigate XSS attacks
- The application enforces HTTPS in production
- CSRF protection is implemented on the server
- Failed login attempts are rate-limited

## Extending the Authentication System

To extend or modify the authentication system:

1. Update the `AuthStore` with new functionality
2. Modify the `authInterceptor` if API authentication needs to change
3. Add or update authentication-related components
4. Update the protected routes if necessary

## Troubleshooting

### Common Issues

- **"Unauthorized" errors**: Check if the access token has expired
- **Session expires too quickly**: Check the session timeout settings
- **Can't log in during development**: Ensure mock authentication is enabled

### Debugging

For debugging authentication issues:

```typescript
// Enable authentication debugging
import { setAuthDebug } from '@/store/AuthStore';
setAuthDebug(true);
```

This will output detailed authentication flow information to the console. 