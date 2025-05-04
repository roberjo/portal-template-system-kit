import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
    },
  },
})

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { withRouter = true, ...renderOptions } = options || {};
  const queryClient = createTestQueryClient()
  
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {withRouter ? (
            <BrowserRouter>
              {children}
            </BrowserRouter>
          ) : (
            children
          )}
        </TooltipProvider>
      </QueryClientProvider>
    ),
    ...renderOptions,
  })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render method
export { customRender as render } 