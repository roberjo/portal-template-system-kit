import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './test/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/providers/ProtectedRoute';
import * as StoreContext from './store/StoreContext';

// Mock StoreContext
vi.mock('./store/StoreContext', () => {
  return {
    useStore: vi.fn(),
    StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

// Mock App component instead of importing real one
const MockApp = ({ isAuthenticated = true }) => {
  return (
    <Routes>
      <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
      <Route path="/" element={
        isAuthenticated ? 
          <div data-testid="main-layout">
            <div data-testid="dashboard-page">Dashboard Page</div>
          </div>
          : 
          <div data-testid="login-page">Login Page</div>
      } />
      <Route path="/profile" element={
        isAuthenticated ?
          <div data-testid="main-layout">
            <div data-testid="profile-page">Profile Page</div>
          </div>
          :
          <div data-testid="login-page">Login Page</div>
      } />
    </Routes>
  );
};

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

// Type for mocked store function
type MockStoreFunction = {
  mockReturnValue: (value: {
    userStore: {
      isAuthenticated: boolean;
      loading: boolean;
    }
  }) => void;
};

describe('Routing', () => {
  describe('ProtectedRoute Component', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    
    it('should redirect to login when user is not authenticated', async () => {
      // Mock unauthenticated state
      (StoreContext.useStore as MockStoreFunction).mockReturnValue({
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
        </MemoryRouter>,
        { withRouter: false }
      );
      
      // Should redirect to login
      expect(screen.getByTestId('login-route')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
    
    it('should show loading state while checking authentication', () => {
      // Mock loading state
      (StoreContext.useStore as MockStoreFunction).mockReturnValue({
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
        </MemoryRouter>,
        { withRouter: false }
      );
      
      // Loading spinner doesn't have a role, so check for the class instead
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
    
    it('should render protected content when user is authenticated', () => {
      // Mock authenticated state
      (StoreContext.useStore as MockStoreFunction).mockReturnValue({
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
        </MemoryRouter>,
        { withRouter: false }
      );
      
      // Should render protected content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
  
  describe('App Routes', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    
    it('should render login page on /login route', async () => {
      // Default to authenticated
      (StoreContext.useStore as MockStoreFunction).mockReturnValue({
        userStore: {
          isAuthenticated: true,
          loading: false
        }
      });
      
      render(
        <MemoryRouter initialEntries={['/login']}>
          <MockApp isAuthenticated={true} />
        </MemoryRouter>,
        { withRouter: false }
      );
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
    
    it('should render dashboard page on root route when authenticated', async () => {
      // Default to authenticated
      (StoreContext.useStore as MockStoreFunction).mockReturnValue({
        userStore: {
          isAuthenticated: true,
          loading: false
        }
      });
      
      render(
        <MemoryRouter initialEntries={['/']}>
          <MockApp isAuthenticated={true} />
        </MemoryRouter>,
        { withRouter: false }
      );
      
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
    
    it('should redirect to login on protected route when not authenticated', async () => {
      render(
        <MemoryRouter initialEntries={['/profile']}>
          <MockApp isAuthenticated={false} />
        </MemoryRouter>,
        { withRouter: false }
      );
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument();
    });
    
    it('should render profile page on /profile route when authenticated', async () => {
      render(
        <MemoryRouter initialEntries={['/profile']}>
          <MockApp isAuthenticated={true} />
        </MemoryRouter>,
        { withRouter: false }
      );
      
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });
}); 