# Testing Guide

This project uses Vitest with React Testing Library for testing React components and application logic.

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are placed alongside the components they test with a `.test.tsx` or `.test.ts` extension.

Example file structure:
```
src/
  components/
    Button.tsx
    Button.test.tsx
  utils/
    formatter.ts
    formatter.test.ts
```

## Testing Utilities

We provide some utilities to make testing easier:

### Custom Render Function

The custom render function in `test-utils.tsx` wraps your components with all the necessary providers (React Router, React Query, etc.). Use it instead of the default render from React Testing Library:

```tsx
import { render, screen } from '@/test/test-utils'
import MyComponent from './MyComponent'

test('renders component', () => {
  render(<MyComponent />)
  // Your assertions here
})
```

## Writing Tests

### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { Counter } from './Counter'

describe('Counter', () => {
  it('increments count when button is clicked', () => {
    render(<Counter />)
    
    const button = screen.getByRole('button', { name: /increment/i })
    fireEvent.click(button)
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
```

### Testing Async Code

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { UserProfile } from './UserProfile'

describe('UserProfile', () => {
  it('loads and displays user data', async () => {
    render(<UserProfile userId="123" />)
    
    // Initially shows loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    })
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
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})
```

### Mocking API Calls

For API mocking, use MSW or manual mocks.

## Best Practices

1. Test behavior, not implementation details
2. Use role-based queries when possible (getByRole)
3. Write tests that resemble how users interact with your app
4. Test edge cases and error states
5. Keep tests simple and focused 