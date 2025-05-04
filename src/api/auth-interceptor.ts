import { apiClient } from './client';

export const setupAuthInterceptors = (
  getToken: () => string | null,
  refreshToken: () => Promise<string | null>,
  logout: () => void
) => {
  // Add token to requests
  apiClient.addRequestInterceptor((url, options) => {
    const token = getToken();
    if (token) {
      const headers = options.headers as Record<string, string>;
      headers['Authorization'] = `Bearer ${token}`;
    }
    return [url, options];
  });

  // Handle 401 errors and try to refresh the token
  apiClient.addErrorInterceptor(async (error) => {
    if (error.name === 'ApiError' && error.status === 401) {
      try {
        // Try to refresh the token
        const newToken = await refreshToken();
        
        if (newToken) {
          // Recreate the original request with the new token
          const originalRequest = error.request;
          if (originalRequest) {
            // Retry the request with the new token
            return apiClient.request(
              originalRequest.url,
              originalRequest.method as any,
              originalRequest.data,
              {
                ...originalRequest.options,
                headers: {
                  ...originalRequest.options.headers,
                  Authorization: `Bearer ${newToken}`
                }
              }
            );
          }
        } else {
          // If refresh token fails, log the user out
          logout();
        }
      } catch (refreshError) {
        // If refreshing fails, log the user out
        logout();
      }
    }
    
    // If we can't handle the error, propagate it
    throw error;
  });

  // Return a function to remove the interceptors if needed
  return () => {
    // Cleanup function would remove the interceptors
  };
}; 