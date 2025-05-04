import { RequestInterceptor, ErrorInterceptor, ApiError } from './ApiClient';
import rootStore from '@/store/RootStore';

export const authRequestInterceptor: RequestInterceptor = (config) => {
  // Get the current token from user store
  const token = localStorage.getItem('authToken');
  
  // Add authorization header if token exists
  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      }
    };
  }
  
  return config;
};

export const authErrorInterceptor: ErrorInterceptor = async (error: ApiError) => {
  // Handle 401 Unauthorized errors
  if (error.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        // Attempt to refresh the token
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Save new tokens
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          // Retry the original request with the new token
          if (error.config) {
            // Use the authRequestInterceptor to add the new token
            const newConfig = authRequestInterceptor(error.config);
            
            // Return a promise that will resolve with the retry
            return {
              ...error,
              retry: true,
              config: newConfig
            };
          }
        } else {
          // If refresh failed, logout the user
          rootStore.userStore.logout();
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Logout on refresh error
        rootStore.userStore.logout();
      }
    } else {
      // No refresh token, just logout
      rootStore.userStore.logout();
    }
  }
  
  return error;
}; 