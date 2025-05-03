import { makeAutoObservable } from 'mobx';
import { 
  IUserStore, 
  User, 
  UserPreferencesUpdate,
  LoginCredentials
} from './types';
import { ENV } from '../config/env';
import rootStore from './RootStore';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export class UserStore implements IUserStore {
  currentUser: User | null = null;
  isAuthenticated: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  impersonating: boolean = false;
  originalUser: User | null = null;
  inactivityTimer: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this, {
      inactivityTimer: false // Don't observe the timer
    });
    this.initializeAuth();
  }

  applyUserPreferences = (user: User) => {
    if (user && user.preferences && user.preferences.theme) {
      rootStore.uiStore.setTheme(user.preferences.theme);
    }
  }

  initializeAuth = () => {
    const token = localStorage.getItem(ENV.AUTH_CONFIG.tokenStorageKey);
    const tokenExpiry = localStorage.getItem(ENV.AUTH_CONFIG.tokenExpiryKey);
    
    if (token && tokenExpiry && new Date(tokenExpiry) > new Date()) {
      this.loading = true;
      
      if (ENV.FEATURES.mockAuth) {
        setTimeout(() => {
          this.setMockUser();
          this.isAuthenticated = true;
          this.loading = false;
          this.startInactivityTimer();
        }, 500);
      } else {
        this.fetchUserProfile(token)
          .then(() => this.startInactivityTimer())
          .catch(() => {
            this.logout();
          });
      }
    }
  }
  
  resetInactivityTimer = () => {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    this.inactivityTimer = setTimeout(() => {
      console.log('Session expired due to inactivity');
      this.logout();
    }, INACTIVITY_TIMEOUT);
  };
  
  startInactivityTimer = () => {
    this.resetInactivityTimer();
    
    window.addEventListener('mousedown', this.resetInactivityTimer);
    window.addEventListener('keydown', this.resetInactivityTimer);
    window.addEventListener('mousemove', this.throttleResetTimer);
    window.addEventListener('touchstart', this.resetInactivityTimer);
  };
  
  stopInactivityTimer = () => {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    window.removeEventListener('mousedown', this.resetInactivityTimer);
    window.removeEventListener('keydown', this.resetInactivityTimer);
    window.removeEventListener('mousemove', this.throttleResetTimer);
    window.removeEventListener('touchstart', this.resetInactivityTimer);
  };
  
  private lastMoveTime = 0;
  throttleResetTimer = () => {
    const now = Date.now();
    if (now - this.lastMoveTime > 5000) {
      this.lastMoveTime = now;
      this.resetInactivityTimer();
    }
  };
  
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          this.setMockUser();
          this.isAuthenticated = true;
          
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 24);
          
          localStorage.setItem(ENV.AUTH_CONFIG.tokenStorageKey, 'mock-token');
          localStorage.setItem(ENV.AUTH_CONFIG.tokenExpiryKey, expiryDate.toISOString());
          
          if (credentials.remember) {
            localStorage.setItem(ENV.AUTH_CONFIG.refreshTokenStorageKey, 'mock-refresh-token');
          }
          
          this.loading = false;
          this.startInactivityTimer();
          return true;
        } else {
          throw new Error('Invalid email or password');
        }
      } else {
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
        
        localStorage.setItem(ENV.AUTH_CONFIG.tokenStorageKey, data.token);
        localStorage.setItem(ENV.AUTH_CONFIG.tokenExpiryKey, data.expiry);
        
        if (credentials.remember && data.refreshToken) {
          localStorage.setItem(ENV.AUTH_CONFIG.refreshTokenStorageKey, data.refreshToken);
        }
        
        await this.fetchUserProfile(data.token);
        this.startInactivityTimer();
        
        return true;
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      this.loading = false;
      return false;
    }
  }
  
  logout = async (): Promise<void> => {
    this.stopInactivityTimer();
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
      localStorage.removeItem(ENV.AUTH_CONFIG.tokenStorageKey);
      localStorage.removeItem(ENV.AUTH_CONFIG.refreshTokenStorageKey);
      localStorage.removeItem(ENV.AUTH_CONFIG.tokenExpiryKey);
      
      this.currentUser = null;
      this.isAuthenticated = false;
      this.loading = false;
      this.error = null;
      
      if (this.impersonating) {
        this.impersonating = false;
        this.originalUser = null;
      }
    }
  }
  
  updatePreferences = (preferences: UserPreferencesUpdate): void => {
    if (!this.currentUser) return;
    
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
  }
  
  startImpersonation = async (userId: string): Promise<void> => {
    if (!this.currentUser || this.impersonating) return;
    
    this.loading = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.originalUser = this.currentUser;
      
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
    
    this.currentUser = this.originalUser;
    this.originalUser = null;
    this.impersonating = false;
  }
}
