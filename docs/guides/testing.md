# Testing Guide

This guide provides comprehensive information on testing practices and tools used in the Portal Template System Kit.

## Table of Contents

- [Testing Framework](#testing-framework)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Testing Utilities](#testing-utilities)
- [Writing Tests](#writing-tests)
  - [Component Tests](#component-tests)
  - [Hook Tests](#hook-tests)
  - [Store Tests](#store-tests)
  - [Utility Tests](#utility-tests)
- [Mocking](#mocking)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Framework

This project uses the following testing tools:

- **Vitest**: Test runner and framework
- **React Testing Library**: For testing React components
- **Happy-DOM**: DOM implementation for testing
- **@testing-library/user-event**: For simulating user interactions
- **vitest-coverage-report**: For generating coverage reports

## Running Tests

The project includes several npm scripts for running tests:

```powershell
# Run all tests once
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Generate coverage report and open in browser
npm run coverage:open

# Run all quality checks (ESLint, TypeScript, tests with coverage)
npm run quality
```

## Test Structure

Tests are placed alongside the code they test with a `.test.tsx` or `.test.ts` extension:

```
src/
  components/
    Button.tsx
    Button.test.tsx
  utils/
    formatter.ts
    formatter.test.ts
```

For complex features, tests can be organized in a dedicated `__tests__` directory:

```
features/
  authentication/
    __tests__/
      AuthForm.test.tsx
      useAuth.test.ts
      authStore.test.ts
```

## Testing Utilities

### Custom Render Function

The project provides a custom render function in `src/test/test-utils.tsx` that wraps components with all necessary providers:

```tsx
import { render, screen } from '@/test/test-utils'
import MyComponent from './MyComponent'

test('renders component', () => {
  render(<MyComponent />)
  // Your assertions here
})
```

### Test Setup and Teardown

Global test setup and teardown logic is in `src/test/setup.ts`:

```tsx
// src/test/setup.ts is automatically loaded by Vitest
import '@testing-library/jest-dom'

// Add any global setup here
beforeAll(() => {
  // Global setup before all tests
})

afterAll(() => {
  // Global cleanup after all tests
})
```

## Writing Tests

### Component Tests

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders disabled state correctly', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Hook Tests

```tsx
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(1)
  })
})
```

### Store Tests

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthStore } from './AuthStore'

describe('AuthStore', () => {
  let store: AuthStore

  beforeEach(() => {
    store = new AuthStore()
  })

  it('starts with unauthenticated state', () => {
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })

  it('sets authenticated state after login', () => {
    store.login({ id: '1', username: 'testuser' })
    expect(store.isAuthenticated).toBe(true)
    expect(store.user).toEqual({ id: '1', username: 'testuser' })
  })
})
```

### Utility Tests

```tsx
import { describe, it, expect } from 'vitest'
import { formatDate } from './formatters'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2023-05-15T12:00:00Z')
    expect(formatDate(date)).toBe('May 15, 2023')
  })

  it('handles null date', () => {
    expect(formatDate(null)).toBe('N/A')
  })
})
```

## Mocking

### Mocking Functions

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { Form } from './Form'

describe('Form', () => {
  it('calls onSubmit when form is submitted', () => {
    const handleSubmit = vi.fn()
    render(<Form onSubmit={handleSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/username/i), { 
      target: { value: 'testuser' } 
    })
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    
    expect(handleSubmit).toHaveBeenCalledTimes(1)
    expect(handleSubmit).toHaveBeenCalledWith({ username: 'testuser' })
  })
})
```

### Mocking API Requests

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { UserProfile } from './UserProfile'
import { fetchUserProfile } from '@/api/user'

// Mock the API module
vi.mock('@/api/user', () => ({
  fetchUserProfile: vi.fn(),
}))

describe('UserProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays user profile when loaded', async () => {
    // Setup the mock return value
    fetchUserProfile.mockResolvedValueOnce({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    })

    render(<UserProfile userId="123" />)
    
    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    // After loading completes
    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    })
    
    expect(fetchUserProfile).toHaveBeenCalledWith('123')
  })

  it('shows error message when API fails', async () => {
    // Setup mock to reject
    fetchUserProfile.mockRejectedValueOnce(new Error('Failed to fetch'))

    render(<UserProfile userId="123" />)
    
    await waitFor(() => {
      expect(screen.getByText(/error loading profile/i)).toBeInTheDocument()
    })
  })
})
```

### Mocking MobX Stores

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { UserSettings } from './UserSettings'
import { UserStore } from '@/store/UserStore'

// Create a mock store
const createMockStore = () => ({
  user: { id: '123', name: 'Test User' },
  isLoading: false,
  updateUserSettings: vi.fn(),
})

// Override the useStore hook in the test-utils
vi.mock('@/hooks/useStore', () => ({
  useStore: () => ({
    userStore: createMockStore(),
  }),
}))

describe('UserSettings', () => {
  it('displays user settings form', () => {
    render(<UserSettings />)
    expect(screen.getByLabelText(/name/i)).toHaveValue('Test User')
  })
})
```

## Test Coverage

The project aims for high test coverage, especially for critical components and business logic:

- Critical components and business logic: 90%+ coverage
- Utility functions: 90%+ coverage
- UI components: 80%+ coverage
- Overall project: 70%+ coverage

View coverage reports with:

```powershell
npm run coverage:open
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it's built
2. **Prefer User-Centric Queries**: Use queries like `getByRole`, `getByLabelText` instead of `getByTestId`
3. **Test Edge Cases**: Test loading states, error states, and boundary conditions
4. **Keep Tests Isolated**: Each test should be independent and not rely on the state of other tests
5. **Test One Thing per Test**: Each test should verify a single aspect of behavior
6. **Use Descriptive Test Names**: Test names should clearly describe what's being tested
7. **Avoid Testing Implementation Details**: Avoid testing internal state or private methods
8. **Write Tests Before Fixing Bugs**: To prevent regression and verify the fix

## Troubleshooting

### Common Issues

- **Tests Failing in CI but Not Locally**: Check environment variables or timing issues
- **Slow Tests**: Look for excessive re-renders or inefficient mocks
- **Flaky Tests**: Identify and fix race conditions or timing issues

### Debugging Tips

- Use `screen.debug()` to log the current state of the DOM
- Check mock call history with `mockFn.mock.calls`
- Use `console.log` for debugging test execution
- For timing issues, try increasing timeouts with `vi.advanceTimersByTime()` 