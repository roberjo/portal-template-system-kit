# State Management Guide

This guide outlines our approach to state management using MobX and the patterns we follow.

## State Management Philosophy

Our state management approach is built on these principles:

1. **Domain-driven** - State is organized around business domains
2. **Separation of concerns** - UI components should be separated from business logic
3. **Observability** - State changes should be transparent and predictable
4. **Minimal state** - Only store what you need

## Store Structure

Our application uses a root store that composes domain-specific stores:

```
RootStore
├── UserStore (authentication, user preferences)
├── DataStore (application data)
├── NotificationStore (UI notifications)
└── DocumentStore (document management)
```

### Store Implementation

Stores should follow this pattern:

```typescript
// Import dependencies
import { makeAutoObservable, runInAction } from 'mobx';
import { apiClient } from '../api/client';

// Define store-specific types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

// Implement the store
export class UserStore {
  currentUser: User | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isAuthenticated: boolean = false;
  
  constructor(private rootStore: RootStore) {
    // Make properties observable
    makeAutoObservable(this, {
      rootStore: false // Don't make the rootStore observable
    });
  }
  
  // Actions - methods that modify state
  async login(credentials: AuthCredentials): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await apiClient.post<User>('/auth/login', credentials);
      
      // Use runInAction for async state updates
      runInAction(() => {
        this.currentUser = response.data;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
      
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Login failed';
        this.isLoading = false;
      });
      
      return false;
    }
  }
  
  // More actions...
  
  // Computed values
  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
  
  // Reset state
  reset(): void {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.error = null;
    this.isLoading = false;
  }
}
```

## Store Organization Guidelines

1. **One domain per store** - Each store should focus on a specific domain
2. **Minimize store dependencies** - Prefer composition over direct dependencies
3. **Use the root store for coordination** - Communication between stores should go through the root store

## Best Practices

### State Structure

1. **Normalize data** - Avoid deeply nested state
2. **Prefer plain objects** - Use simple objects for state
3. **Define loading and error states** - Track loading and error states for async operations

### Actions

1. **Use async/await** - Define asynchronous actions using async/await
2. **Use runInAction** - Wrap async state updates in runInAction
3. **Keep actions focused** - Each action should do one thing well

```typescript
// Good
async fetchUser(id: string): Promise<void> {
  this.isLoading = true;
  
  try {
    const response = await apiClient.get<User>(`/users/${id}`);
    
    runInAction(() => {
      this.currentUser = response.data;
      this.isLoading = false;
    });
  } catch (error) {
    runInAction(() => {
      this.error = error instanceof Error ? error.message : 'Failed to fetch user';
      this.isLoading = false;
    });
  }
}

// Bad - mixing concerns
async fetchUserAndPosts(id: string): Promise<void> {
  // This should be split into separate actions
}
```

### Computed Values

Use computed values for derived state:

```typescript
// Good
get fullName(): string {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
}

get isAdmin(): boolean {
  return this.user?.role === 'admin';
}

// Bad - should be computed
getFullName(): string {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
}
```

### Error Handling

Handle errors consistently:

```typescript
try {
  // API call
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
```

## Using Stores in Components

Use the `observer` HOC to make components reactive:

```tsx
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/StoreContext';

const UserProfile = observer(() => {
  const { userStore } = useStore();
  const { currentUser, isLoading, error } = userStore;
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!currentUser) {
    return <NotFound message="User not found" />;
  }
  
  return (
    <div>
      <h1>{currentUser.name}</h1>
      <p>{currentUser.email}</p>
    </div>
  );
});
```

### Component Integration Guidelines

1. **Keep components pure** - Components should primarily render based on props and store state
2. **Use the observer HOC** - Wrap components that use observable state with observer
3. **Use destructuring** - Destructure values from the store to make dependencies clear
4. **Handle loading and error states** - Always account for loading and error states

## Testing Stores

Test stores in isolation:

```typescript
describe('UserStore', () => {
  let userStore: UserStore;
  let rootStore: RootStore;
  
  beforeEach(() => {
    rootStore = new RootStore();
    userStore = rootStore.userStore;
  });
  
  it('should set authentication status after login', async () => {
    // Mock API client
    jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      config: { url: '/auth/login' }
    });
    
    // Call the action
    await userStore.login({ email: 'test@example.com', password: 'password' });
    
    // Assert state changes
    expect(userStore.isAuthenticated).toBe(true);
    expect(userStore.currentUser).toEqual({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    });
    expect(userStore.isLoading).toBe(false);
    expect(userStore.error).toBeNull();
  });
  
  it('should handle login errors', async () => {
    // Mock API client to throw
    jest.spyOn(apiClient, 'post').mockRejectedValueOnce(new Error('Invalid credentials'));
    
    // Call the action
    await userStore.login({ email: 'test@example.com', password: 'wrong' });
    
    // Assert state changes
    expect(userStore.isAuthenticated).toBe(false);
    expect(userStore.currentUser).toBeNull();
    expect(userStore.isLoading).toBe(false);
    expect(userStore.error).toBe('Invalid credentials');
  });
});
``` 