import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserStore } from './UserStore';
import { ENV } from '../config/env';
import rootStore from './RootStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock fetch
vi.stubGlobal('fetch', vi.fn());

// Mock setTimeout
vi.stubGlobal('setTimeout', vi.fn((cb) => {
  // Execute callback immediately for testing
  cb();
  return 123; // Mock timer ID
}));

// Mock clearTimeout
vi.stubGlobal('clearTimeout', vi.fn());

describe('UserStore', () => {
  let userStore: UserStore;
  const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset test environment
    ENV.FEATURES = { mockAuth: true };
    ENV.AUTH_CONFIG = {
      tokenStorageKey: 'test-token',
      tokenExpiryKey: 'test-expiry',
      refreshTokenStorageKey: 'test-refresh-token',
    };
    
    // Default mock implementations
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === ENV.AUTH_CONFIG.tokenStorageKey) return null;
      if (key === ENV.AUTH_CONFIG.tokenExpiryKey) return null;
      return null;
    });
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Test User' }),
    } as Response);
    
    // Create fresh store for each test
    userStore = new UserStore();
  });
  
  afterEach(() => {
    // Clean up any event listeners or timers
    userStore.stopInactivityTimer();
  });
  
  describe('initialization', () => {
    it('should start with no authenticated user', () => {
      expect(userStore.isAuthenticated).toBe(false);
      expect(userStore.currentUser).toBeNull();
      expect(userStore.loading).toBe(false);
    });
    
    it('should try to restore session from localStorage on init', () => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith(ENV.AUTH_CONFIG.tokenStorageKey);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(ENV.AUTH_CONFIG.tokenExpiryKey);
    });
    
    it('should restore session if valid token exists', () => {
      // Reset mocks
      vi.clearAllMocks();
      
      // Setup localStorage to return valid token and expiry
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === ENV.AUTH_CONFIG.tokenStorageKey) return 'valid-token';
        if (key === ENV.AUTH_CONFIG.tokenExpiryKey) return futureDate.toISOString();
        return null;
      });
      
      // Create new store instance
      const store = new UserStore();
      
      // Check that it's loading (waiting for profile fetch)
      expect(store.loading).toBe(true);
    });
  });
  
  describe('login', () => {
    it('should set authenticated state on successful login', async () => {
      const result = await userStore.login({
        email: 'admin@example.com',
        password: 'password',
      });
      
      expect(result).toBe(true);
      expect(userStore.isAuthenticated).toBe(true);
      expect(userStore.currentUser).not.toBeNull();
      expect(userStore.loading).toBe(false);
    });
    
    it('should store token in localStorage on successful login', async () => {
      await userStore.login({
        email: 'admin@example.com',
        password: 'password',
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        ENV.AUTH_CONFIG.tokenStorageKey,
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        ENV.AUTH_CONFIG.tokenExpiryKey,
        expect.any(String)
      );
    });
    
    it('should store refresh token if remember is true', async () => {
      await userStore.login({
        email: 'admin@example.com',
        password: 'password',
        remember: true,
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        ENV.AUTH_CONFIG.refreshTokenStorageKey,
        expect.any(String)
      );
    });
    
    it('should fail login with invalid credentials', async () => {
      const result = await userStore.login({
        email: 'wrong@example.com',
        password: 'wrong',
      });
      
      expect(result).toBe(false);
      expect(userStore.isAuthenticated).toBe(false);
      expect(userStore.currentUser).toBeNull();
      expect(userStore.error).not.toBeNull();
    });
    
    it('should start inactivity timer on successful login', async () => {
      await userStore.login({
        email: 'admin@example.com',
        password: 'password',
      });
      
      expect(global.setTimeout).toHaveBeenCalled();
    });
  });
  
  describe('logout', () => {
    beforeEach(async () => {
      // Login first
      await userStore.login({
        email: 'admin@example.com',
        password: 'password',
      });
    });
    
    it('should clear authenticated state', async () => {
      await userStore.logout();
      
      expect(userStore.isAuthenticated).toBe(false);
      expect(userStore.currentUser).toBeNull();
    });
    
    it('should remove tokens from localStorage', async () => {
      await userStore.logout();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(ENV.AUTH_CONFIG.tokenStorageKey);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(ENV.AUTH_CONFIG.tokenExpiryKey);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(ENV.AUTH_CONFIG.refreshTokenStorageKey);
    });
    
    it('should stop inactivity timer', async () => {
      await userStore.logout();
      
      expect(global.clearTimeout).toHaveBeenCalled();
    });
  });
  
  describe('user preferences', () => {
    it('should apply theme preference when user is set', async () => {
      // Spy on UI store
      const setThemeSpy = vi.spyOn(rootStore.uiStore, 'setTheme');
      
      // Login with a user that has theme preference
      await userStore.login({
        email: 'admin@example.com',
        password: 'password',
      });
      
      // User should have a preference (based on the mock user setup in store)
      expect(userStore.currentUser?.preferences?.theme).toBeDefined();
      expect(setThemeSpy).toHaveBeenCalledWith(userStore.currentUser?.preferences?.theme);
    });
    
    it('should update user preferences', async () => {
      // Login first
      await userStore.login({
        email: 'admin@example.com',
        password: 'password',
      });
      
      // Update preferences
      userStore.updatePreferences({
        theme: 'dark',
        notifications: {
          email: false,
          push: true,
          sms: true,
        },
      });
      
      // Check that preferences were updated
      expect(userStore.currentUser?.preferences?.theme).toBe('dark');
      expect(userStore.currentUser?.preferences?.notifications?.email).toBe(false);
      expect(userStore.currentUser?.preferences?.notifications?.sms).toBe(true);
    });
  });
}); 