import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
    },
  },
})

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const queryClient = createTestQueryClient()
  
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    ),
    ...options,
  })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render method
export { customRender as render } 