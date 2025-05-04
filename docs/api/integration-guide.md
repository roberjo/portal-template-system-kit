# API Integration Guide

This guide outlines our approach to API integration and the patterns we follow when working with our API client.

## API Integration Philosophy

Our API integration is built on these principles:

1. **Type safety** - All API interactions should be properly typed
2. **Consistency** - Use the same patterns across the application
3. **Error handling** - Handle errors gracefully and consistently
4. **Testability** - API calls should be easy to mock and test

## API Client Usage

Our application uses a custom `ApiClient` that provides type-safe methods for making HTTP requests:

```typescript
import { apiClient } from '@/api/ApiClient';

// Define response types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Make type-safe requests
async function fetchUser(id: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
}
```

### Making Requests

Use the appropriate methods for different request types:

```typescript
// GET request
const response = await apiClient.get<User>('/users/me');

// POST request with data
const response = await apiClient.post<User>('/users', { name: 'New User', email: 'user@example.com' });

// PUT request to update
const response = await apiClient.put<User>(`/users/${id}`, { name: 'Updated Name' });

// DELETE request
const response = await apiClient.delete(`/users/${id}`);

// PATCH request for partial updates
const response = await apiClient.patch<User>(`/users/${id}`, { name: 'Patched Name' });
```

### Request Configuration

You can customize requests with additional options:

```typescript
const response = await apiClient.get<User>('/users/me', {
  headers: {
    'Custom-Header': 'value'
  },
  params: {
    include: 'profile',
    fields: 'id,name,email'
  },
  timeout: 5000,
  withCredentials: true
});
```

## Response Types

Define clear interfaces for API responses:

```typescript
// Base interfaces
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

// Domain-specific interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Usage with API client
const response = await apiClient.get<PaginatedResponse<User>>('/users', {
  params: { page: 1, limit: 10 }
});

const users = response.data.data; // Array of users
const total = response.data.meta.total; // Total count
```

## Error Handling

Handle API errors consistently:

```typescript
import { ApiError } from '@/api/ApiClient';

async function fetchData() {
  try {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API errors
      if (error.status === 401) {
        // Handle unauthorized
        redirectToLogin();
      } else if (error.status === 404) {
        // Handle not found
        showNotFound();
      } else {
        // Handle other API errors
        showErrorMessage(error.message);
      }
    } else {
      // Handle network or other errors
      console.error('Unexpected error:', error);
      showErrorMessage('An unexpected error occurred');
    }
    
    // Rethrow or return a default value
    throw error; // or return null;
  }
}
```

### Error Handling in Stores

When handling errors in stores, follow this pattern:

```typescript
async fetchUser(id: string): Promise<void> {
  this.isLoading = true;
  this.error = null;
  
  try {
    const response = await apiClient.get<User>(`/users/${id}`);
    
    runInAction(() => {
      this.user = response.data;
      this.isLoading = false;
    });
  } catch (error) {
    runInAction(() => {
      if (error instanceof ApiError) {
        this.error = error.message;
      } else {
        this.error = 'An unexpected error occurred';
        console.error(error);
      }
      this.isLoading = false;
    });
  }
}
```

## Caching

Our API client supports caching for GET requests:

```typescript
// Enable caching for frequently accessed data
apiClient.setCacheTTL(60000); // 1 minute cache

// Clear cache when needed
apiClient.clearCache();
```

## Interceptors

Use interceptors for cross-cutting concerns:

```typescript
// Add authentication token to all requests
apiClient.addRequestInterceptor((config) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  
  return config;
});

// Handle global response processing
apiClient.addResponseInterceptor((response) => {
  // Log successful responses
  console.debug('API Response:', response.config.url, response.status);
  
  return response;
});

// Handle global error processing
apiClient.addErrorInterceptor((error) => {
  // Log errors
  console.error('API Error:', error.config?.url, error.status, error.message);
  
  // Handle authentication errors
  if (error.status === 401) {
    redirectToLogin();
  }
  
  return error;
});
```

## API Integration in Components

When integrating API calls in components, follow these patterns:

```tsx
import { useState, useEffect } from 'react';
import { useStore } from '@/store/StoreContext';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';

function UserProfile({ userId }: { userId: string }) {
  // Prefer using store for data fetching
  const { userStore } = useStore();
  const { user, isLoading, error, fetchUser } = userStore;
  
  useEffect(() => {
    fetchUser(userId);
  }, [fetchUser, userId]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Direct API Calls in Components

For simple or one-off API calls, you can make direct calls in components:

```tsx
import { useState, useEffect } from 'react';
import { apiClient, ApiError } from '@/api/ApiClient';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';

interface User {
  id: string;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    async function loadUser() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get<User>(`/users/${userId}`);
        
        if (isMounted) {
          setUser(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
          
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred');
            console.error(err);
          }
        }
      }
    }
    
    loadUser();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);
  
  // Render the UI based on state...
}
```

## Testing API Integration

### Mocking the API Client

Mock the API client in tests:

```typescript
import { apiClient } from '@/api/ApiClient';

jest.mock('@/api/ApiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn()
  }
}));

describe('UserStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should fetch user data', async () => {
    // Mock the API response
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { id: '1', name: 'Test User', email: 'test@example.com' },
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      config: { url: '/users/1' }
    });
    
    // Test the store or component
    // ...
    
    // Assert the API was called correctly
    expect(apiClient.get).toHaveBeenCalledWith('/users/1');
  });
  
  it('should handle API errors', async () => {
    // Mock an API error
    const apiError = {
      message: 'User not found',
      status: 404,
      data: null,
      config: { url: '/users/999' }
    };
    
    (apiClient.get as jest.Mock).mockRejectedValueOnce(apiError);
    
    // Test error handling
    // ...
  });
});
```

## Best Practices

1. **Define response types** - Create interfaces for all API responses
2. **Handle loading states** - Always show loading indicators during requests
3. **Handle errors gracefully** - Display meaningful error messages
4. **Use consistent patterns** - Follow the same approach across the application
5. **Include cancelation** - Cancel requests when components unmount
6. **Batch related requests** - Use Promise.all for related requests
7. **Avoid direct API calls** - Prefer using stores for data fetching
8. **Test API integration** - Write tests for API-related logic 