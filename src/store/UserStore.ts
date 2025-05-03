import { makeAutoObservable } from 'mobx';
import { IUserStore, User } from './types';
import rootStore from './RootStore';

export class UserStore implements IUserStore {
  currentUser: User | null = null;
  isAuthenticated: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  impersonating: boolean = false;
  originalUser: User | null = null;

  constructor() {
    makeAutoObservable(this);
    this.checkAuth();
  }

  // Replace or modify the method that's accessing the private property
  applyUserPreferences = (user: User) => {
    if (user && user.preferences && user.preferences.theme) {
      // Use a public method instead of directly accessing the private property
      rootStore.uiStore.setTheme(user.preferences.theme);
    }
  }

  checkAuth = async () => {
    // Check if user is already authenticated (e.g., via token in localStorage)
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        this.loading = true;
        // In a real app, validate token with API
        // For demo, we'll simulate a successful auth
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
          this.setUser(user);
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.error = 'Authentication failed';
        this.logout();
      }
    }
  };

  login = async (email: string, password: string) => {
    try {
      this.loading = true;
      this.error = null;

      // In a real app, call API for authentication
      // For demo, we'll simulate a successful login
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        role: 'admin',
        permissions: ['read:all', 'write:all'],
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store auth token and user data
      localStorage.setItem('auth_token', 'mock_token_12345');
      localStorage.setItem('user', JSON.stringify(mockUser));

      this.setUser(mockUser);
      this.loading = false;
      return true;
    } catch (error) {
      this.loading = false;
      this.error = 'Invalid email or password';
      return false;
    }
  };

  logout = () => {
    // If impersonating, return to original user
    if (this.impersonating && this.originalUser) {
      this.endImpersonation();
      return;
    }

    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    this.currentUser = null;
    this.isAuthenticated = false;
    this.error = null;
    
    // Redirect to login page or home
    window.location.href = '/login';
  };

  setUser = (user: User) => {
    this.currentUser = user;
    this.isAuthenticated = true;
    this.applyUserPreferences(user);
  };

  updateUserProfile = async (userData: Partial<User>) => {
    try {
      this.loading = true;
      
      // In a real app, call API to update user data
      // For demo, we'll just update the local state
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this.currentUser) {
        const updatedUser = {
          ...this.currentUser,
          ...userData
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        this.setUser(updatedUser);
      }
      
      this.loading = false;
      return true;
    } catch (error) {
      this.loading = false;
      this.error = 'Failed to update profile';
      return false;
    }
  };

  startImpersonation = (user: User) => {
    // Store the original user
    this.originalUser = this.currentUser;
    
    // Set the impersonated user
    this.currentUser = user;
    this.impersonating = true;
    
    // Apply the impersonated user's preferences
    this.applyUserPreferences(user);
    
    // Notify the user
    rootStore.notificationStore.addNotification({
      id: Date.now().toString(),
      type: 'warning',
      title: 'Impersonation Active',
      message: `You are now impersonating ${user.name}`,
      duration: 5000
    });
  };

  endImpersonation = () => {
    if (this.originalUser) {
      // Restore the original user
      this.currentUser = this.originalUser;
      this.originalUser = null;
      this.impersonating = false;
      
      // Apply the original user's preferences
      this.applyUserPreferences(this.currentUser);
      
      // Notify the user
      rootStore.notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'Impersonation Ended',
        message: 'You have returned to your account',
        duration: 5000
      });
    }
  };
}
