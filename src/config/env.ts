// This file contains environment-specific configuration

// Environment detection
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
const isTest = import.meta.env.MODE === 'test';

// API configuration
const API_URL = {
  development: 'http://localhost:3000/api',
  production: 'https://api.portal-templates.com',
  test: 'http://localhost:3000/api',
}[import.meta.env.MODE || (isDevelopment ? 'development' : 'production')];

// Feature flags
const FEATURES = {
  enableNotifications: true,
  enableAnalytics: isProduction,
  debugMode: isDevelopment,
  mockAuth: !isProduction, // Only mock auth in development and test
};

// Auth configuration
const AUTH_CONFIG = {
  tokenStorageKey: 'portal_auth_token',
  refreshTokenStorageKey: 'portal_refresh_token',
  tokenExpiryKey: 'portal_token_expiry',
  loginEndpoint: `${API_URL}/auth/login`,
  logoutEndpoint: `${API_URL}/auth/logout`,
  refreshEndpoint: `${API_URL}/auth/refresh`,
};

// Constants
const APP_CONFIG = {
  appName: 'Portal Template System',
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  defaultPageSize: 10,
};

export const ENV = {
  isDevelopment,
  isProduction,
  isTest,
  API_URL,
  FEATURES,
  AUTH_CONFIG,
  APP_CONFIG,
}; 