import { makeAutoObservable } from 'mobx';
import { 
  IUserStore, 
  User, 
  UserPreferencesUpdate,
  LoginCredentials
} from './types';
import { ENV } from '../config/env';

export class UserStore implements IUserStore {
  // Current user
  currentUser: User | null = null;
  
  // Authentication state
  isAuthenticated: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  
  // Impersonation
  impersonating: boolean = false;
  originalUser: User | null = null;
  
  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
  }

  private initializeAuth = () => {
    // Check for existing token
    const token = localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey);
    const tokenExpiry = localStorage.getItem(ENV.AUTH_CONFIG.tokenExpiryKey);
    
    if (token && tokenExpiry && new Date(tokenExpiry) > new Date()) {
      this.loading = true;
      
      // In a real app, validate the token with the server
      // For now, just simulate a valid session with mock data if in dev/test
      if (ENV.FEATURES.mockAuth) {
        setTimeout(() => {
          this.setMockUser();
          this.isAuthenticated = true;
          this.loading = false;
        }, 500);
      } else {
        // Fetch user profile using the token
        this.fetchUserProfile(token)
          .catch(() => {
            this.logout();
          });
      }
    }
  }
  
  private setMockUser = () => {
    this.currentUser = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: '',
      role: 'admin',
      permissions: ['read:all', 'write:all', 'admin:all'],
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    };
  }
  
  private async fetchUserProfile(token: string): Promise<void> {
    try {
      const response = await fetch(`${ENV.API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await response.json();
      this.currentUser = userData;
      this.isAuthenticated = true;
      this.loading = false;
    } catch (error) {
      this.error = 'Failed to fetch user profile';
      this.loading = false;
      throw error;
    }
  }
  
  login = async (credentials: LoginCredentials): Promise<boolean> => {
    this.loading = true;
    this.error = null;
    
    try {
      if (ENV.FEATURES.mockAuth) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate mock credentials
        if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          this.setMockUser();
          this.isAuthenticated = true;
          
          // Store token in localStorage
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour expiry
          
          localStorage.setItem(ENV.AUTH_CONFIG.tokenStorageKey, 'mock-token');
          localStorage.setItem(ENV.AUTH_CONFIG.tokenExpiryKey, expiryDate.toISOString());
          
          if (credentials.remember) {
            localStorage.setItem(ENV.AUTH_CONFIG.refreshTokenStorageKey, 'mock-refresh-token');
          }
          
          this.loading = false;
          return true;
        } else {
          throw new Error('Invalid email or password');
        }
      } else {
        // Real API login
        const response = await fetch(ENV.AUTH_CONFIG.loginEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        
        // Store tokens
        localStorage.setItem(ENV.AUTH_CONFIG.tokenStorageKey, data.token);
        localStorage.setItem(ENV.AUTH_CONFIG.tokenExpiryKey, data.expiry);
        
        if (credentials.remember && data.refreshToken) {
          localStorage.setItem(ENV.AUTH_CONFIG.refreshTokenStorageKey, data.refreshToken);
        }
        
        // Fetch user profile
        await this.fetchUserProfile(data.token);
        
        return true;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      this.loading = false;
      return false;
    }
  }
  
  logout = async (): Promise<void> => {
    this.loading = true;
    
    try {
      if (!ENV.FEATURES.mockAuth) {
        const token = localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey);
        
        if (token) {
          await fetch(ENV.AUTH_CONFIG.logoutEndpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(ENV.AUTH_CONFIG.tokenStorageKey);
      localStorage.removeItem(ENV.AUTH_CONFIG.refreshTokenStorageKey);
      localStorage.removeItem(ENV.AUTH_CONFIG.tokenExpiryKey);
      
      // Reset state
      this.currentUser = null;
      this.isAuthenticated = false;
      this.loading = false;
      this.error = null;
      
      // If impersonating, also reset impersonation
      if (this.impersonating) {
        this.impersonating = false;
        this.originalUser = null;
      }
    }
  }
  
  updatePreferences = (preferences: UserPreferencesUpdate): void => {
    if (!this.currentUser) return;
    
    // Update current user's preferences
    this.currentUser = {
      ...this.currentUser,
      preferences: {
        ...this.currentUser.preferences,
        ...preferences,
        notifications: {
          ...this.currentUser.preferences.notifications,
          ...preferences.notifications
        }
      }
    };
    
    // In a real app, save to API
    // This would be an async operation with error handling
  }
  
  startImpersonation = async (userId: string): Promise<void> => {
    if (!this.currentUser || this.impersonating) return;
    
    this.loading = true;
    
    try {
      // In a real app, call API to get user data for impersonation
      // For now, mock it
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store original user
      this.originalUser = this.currentUser;
      
      // Set impersonated user
      this.currentUser = {
        id: userId,
        name: 'Impersonated User',
        email: 'user@example.com',
        role: 'user',
        permissions: ['read:own'],
        preferences: {
          notifications: {
            email: false,
            push: true,
            sms: false
          }
        }
      };
      
      this.impersonating = true;
    } catch (error) {
      this.error = 'Failed to start impersonation';
    } finally {
      this.loading = false;
    }
  }
  
  stopImpersonation = (): void => {
    if (!this.impersonating || !this.originalUser) return;
    
    // Restore original user
    this.currentUser = this.originalUser;
    this.originalUser = null;
    this.impersonating = false;
  }
}
