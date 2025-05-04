export * from './ApiClient';
export * from './authInterceptor';

import { apiClient } from './ApiClient';
import { authRequestInterceptor, authErrorInterceptor } from './authInterceptor';

// Register auth interceptors
apiClient.addRequestInterceptor(authRequestInterceptor);
apiClient.addErrorInterceptor(authErrorInterceptor);

export default apiClient;

// Re-export common types for the API
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  cache?: RequestCache;
  signal?: AbortSignal;
}; 