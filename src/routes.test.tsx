import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/providers/ProtectedRoute';
import App from './App';
import * as StoreContext from './store/StoreContext';

// Mock StoreContext
vi.mock('./store/StoreContext', () => {
  return {
    useStore: vi.fn(),
    StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

// Mock Suspense-loaded components
vi.mock('./pages/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}));

vi.mock('./pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}));

vi.mock('./pages/Profile', () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>
}));

vi.mock('./components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>
}));

describe('Routing', () => {
  describe('ProtectedRoute Component', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    
    it('should redirect to login when user is not authenticated', async () => {
      // Mock unauthenticated state
      (StoreContext.useStore as any).mockReturnValue({
        userStore: {
          isAuthenticated: false,
          loading: false
        }
      });
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-route">Login Page</div>} />
            <Route path="/protected" element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      );
      
      // Should redirect to login
      expect(screen.getByTestId('login-route')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
    
    it('should show loading state while checking authentication', () => {
      // Mock loading state
      (StoreContext.useStore as any).mockReturnValue({
        userStore: {
          isAuthenticated: false,
          loading: true
        }
      });
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      );
      
      // Should show loading spinner
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
    
    it('should render protected content when user is authenticated', () => {
      // Mock authenticated state
      (StoreContext.useStore as any).mockReturnValue({
        userStore: {
          isAuthenticated: true,
          loading: false
        }
      });
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      );
      
      // Should render protected content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
  
  describe('App Routes', () => {
    // Setup for all app route tests
    const renderWithRoute = (route: string) => {
      return render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      );
    };
    
    beforeEach(() => {
      vi.clearAllMocks();
      
      // Default to authenticated for most tests
      (StoreContext.useStore as any).mockReturnValue({
        userStore: {
          isAuthenticated: true,
          loading: false
        }
      });
    });
    
    it('should render login page on /login route', async () => {
      renderWithRoute('/login');
      
      // Need to wait for lazy loading
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
    
    it('should render dashboard page on root route when authenticated', async () => {
      renderWithRoute('/');
      
      // Need to wait for lazy loading
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });
    });
    
    it('should redirect to login on protected route when not authenticated', async () => {
      // Set as not authenticated
      (StoreContext.useStore as any).mockReturnValue({
        userStore: {
          isAuthenticated: false,
          loading: false
        }
      });
      
      renderWithRoute('/profile');
      
      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
    
    it('should render profile page on /profile route when authenticated', async () => {
      renderWithRoute('/profile');
      
      // Need to wait for lazy loading
      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });
    });
  });
}); 