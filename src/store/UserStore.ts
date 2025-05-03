
import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager';
  permissions: string[];
  preferences: {
    theme?: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export class UserStore {
  rootStore: RootStore;
  
  // Current user
  currentUser: User | null = null;
  
  // Impersonation
  impersonating: boolean = false;
  originalUser: User | null = null;
  
  // Loading state
  loading: boolean = false;
  
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    
    // Mock user for demo purposes
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
    
    makeAutoObservable(this, { rootStore: false });
  }
  
  // Check if user has specific permission
  hasPermission = (permission: string) => {
    if (!this.currentUser) return false;
    
    return this.currentUser.permissions.includes(permission) || 
           this.currentUser.permissions.includes('admin:all');
  }
  
  // Start impersonation
  startImpersonation = (user: User) => {
    if (!this.currentUser) return;
    
    this.originalUser = this.currentUser;
    this.currentUser = user;
    this.impersonating = true;
    
    // Notify user
    this.rootStore.notificationStore.addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Impersonation Active',
      message: `You are now impersonating ${user.name}`,
      persistent: true
    });
  }
  
  // End impersonation
  endImpersonation = () => {
    if (!this.impersonating || !this.originalUser) return;
    
    this.currentUser = this.originalUser;
    this.originalUser = null;
    this.impersonating = false;
    
    // Notify user
    this.rootStore.notificationStore.addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Impersonation Ended',
      message: 'You are now back to your account',
      duration: 5000
    });
  }
  
  // Update user preferences
  updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (!this.currentUser) return;
    
    this.currentUser.preferences = {
      ...this.currentUser.preferences,
      ...preferences
    };
    
    // Apply theme if changed
    if (preferences.theme && preferences.theme !== this.rootStore.uiStore.theme) {
      this.rootStore.uiStore.theme = preferences.theme;
      this.rootStore.uiStore.applyTheme(preferences.theme);
    }
    
    // In a real app, you would persist to backend here
  }
}
