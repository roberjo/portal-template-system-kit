# API Overview

This document provides an overview of the API architecture and usage in the Portal Template System Kit.

## API Architecture

The application uses a centralized API client for making HTTP requests to backend services. The API layer is structured as follows:

```
src/
└── api/
    ├── index.ts              # Main API exports
    ├── client.ts             # Core API client setup
    ├── authInterceptor.ts    # Authentication interceptor
    ├── errorHandler.ts       # Global error handling
    └── services/             # API service modules
        ├── authService.ts    # Authentication API
        ├── userService.ts    # User management API
        └── ...               # Other service modules
```

In addition, feature-specific API services are organized within their respective feature directories:

```
src/features/
└── documents/
    └── api/
        ├── DocumentService.ts  # Document-specific API
        └── ...
```

## Core API Client

The core API client is built using TanStack Query (formerly React Query) with axios as the HTTP client:

```typescript
// src/api/client.ts
import axios from 'axios';
import { config } from '@/config/env';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptors
apiClient.interceptors.request.use(
  authInterceptor,
  (error) => Promise.reject(error)
);

// Add response interceptors
apiClient.interceptors.response.use(
  (response) => response,
  errorHandler
);

// Helper function for API calls
export const api = {
  get: async <T>(url: string, config = {}) => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },
  post: async <T>(url: string, data = {}, config = {}) => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },
  put: async <T>(url: string, data = {}, config = {}) => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config = {}) => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};
```

## TanStack Query Integration

The application uses TanStack Query for data fetching, caching, and state management:

```typescript
// src/api/hooks/useQuery.ts
import { useQuery as useTanStackQuery, 
         useMutation as useTanStackMutation } from '@tanstack/react-query';

// Custom hook for data fetching
export function useQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options = {}
) {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useTanStackQuery({
    queryKey: key,
    queryFn,
    ...options,
  });
}

// Custom hook for data mutations
export function useMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options = {}
) {
  return useTanStackMutation({
    mutationFn,
    ...options,
  });
}
```

## API Services

API functionality is organized into service modules that provide specific API operations:

```typescript
// src/api/services/userService.ts
import { api } from '../client';
import { User, UserUpdateData } from '@/types';

export const userService = {
  getCurrentUser: () => api.get<User>('/users/me'),
  
  updateUser: (userId: string, data: UserUpdateData) => 
    api.put<User>(`/users/${userId}`, data),
  
  getUserById: (userId: string) => 
    api.get<User>(`/users/${userId}`),
  
  getUsers: (params = {}) => 
    api.get<User[]>('/users', { params }),
};
```

## Using API Services in Components

API services are used in components with TanStack Query hooks:

```tsx
// Example component using the userService
import { useQuery } from '@/api/hooks/useQuery';
import { userService } from '@/api/services/userService';

function UserProfile({ userId }) {
  const { 
    data: user,
    isLoading,
    error 
  } = useQuery(
    ['user', userId],
    () => userService.getUserById(userId),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {/* Other user profile information */}
    </div>
  );
}
```

## Data Mutation Example

For updating data, the application uses mutation hooks:

```tsx
// Example component updating user data
import { useMutation } from '@/api/hooks/useQuery';
import { userService } from '@/api/services/userService';
import { queryClient } from '@/api/queryClient';

function UserForm({ userId }) {
  const { 
    mutate: updateUser,
    isLoading,
    error 
  } = useMutation(
    (data) => userService.updateUser(userId, data),
    {
      onSuccess: () => {
        // Invalidate and refetch user data
        queryClient.invalidateQueries(['user', userId]);
        toast.success('User updated successfully');
      },
      onError: (error) => {
        toast.error(`Error updating user: ${error.message}`);
      },
    }
  );

  const handleSubmit = (data) => {
    updateUser(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
      {error && <ErrorMessage error={error} />}
    </form>
  );
}
```

## Error Handling

The application has a centralized error handling mechanism:

```typescript
// src/api/errorHandler.ts
import { AxiosError } from 'axios';
import { toast } from '@/components/ui/toast';
import { authStore } from '@/store/AuthStore';

export const errorHandler = (error: AxiosError) => {
  const { response } = error;

  // Handle authentication errors
  if (response?.status === 401) {
    // Try to refresh token, if that fails, log out
    return authStore.handleUnauthorized();
  }

  // Handle server errors
  if (response?.status >= 500) {
    toast.error('Server error. Please try again later.');
  }

  // Handle validation errors
  if (response?.status === 422) {
    const validationErrors = response.data?.errors;
    if (validationErrors) {
      Object.values(validationErrors).forEach((message) => {
        toast.error(message as string);
      });
    }
  }

  // Handle other client errors
  if (response?.status === 404) {
    toast.error('Resource not found.');
  }

  return Promise.reject(error);
};
```

## Mock API for Development

During development, the application can use mock API responses:

```typescript
// src/api/mockApi.ts
import { config } from '@/config/env';
import { mockHandlers } from './mockHandlers';

export const setupMockApi = () => {
  if (config.mockApi) {
    // Intercept API requests and return mock data
    apiClient.interceptors.request.use((config) => {
      const mockHandler = mockHandlers[config.url];
      if (mockHandler) {
        return Promise.resolve({
          data: mockHandler(config),
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      }
      return config;
    });
  }
};
```

## API Configuration

API configuration is managed through environment variables:

```typescript
// src/config/env.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  mockApi: import.meta.env.VITE_MOCK_API === 'true' || false,
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  // Other configuration values
};
```

## Best Practices

1. **Use Service Modules**: Organize API calls into service modules by domain
2. **Leverage TanStack Query**: Use TanStack Query for data fetching, caching, and synchronization
3. **Type Everything**: Use TypeScript types for all API requests and responses
4. **Centralize Error Handling**: Handle errors consistently across the application
5. **Keep API Logic Separate**: Separate API logic from components
6. **Use Mock API for Development**: Create mock APIs for development and testing

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [API Endpoints Reference](./endpoints.md)
- [Authentication Documentation](./authentication.md) 