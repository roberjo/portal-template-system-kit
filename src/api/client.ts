import { ENV } from '@config/env';
import { HttpMethod, ApiError as ApiErrorType, RequestOptions } from './types';

class ApiError extends Error implements ApiErrorType {
  status: number;
  data: unknown;
  request?: {
    url: string;
    method: HttpMethod;
    data?: unknown;
    options: {
      headers: Record<string, string>;
      [key: string]: unknown;
    };
  };

  constructor(message: string, status: number, data?: unknown, request?: ApiErrorType['request']) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.request = request;
  }
}

const requestInterceptors: ((url: string, options: RequestInit) => [string, RequestInit])[] = [];
const responseInterceptors: ((response: Response) => Promise<Response>)[] = [];
const errorInterceptors: ((error: ApiError) => Promise<unknown>)[] = [];

// Cache for GET requests
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const apiClient = {
  // Base request method
  async request<T>(url: string, method: HttpMethod, data?: unknown, options: RequestOptions = {}): Promise<T> {
    try {
      let apiUrl = url.startsWith('http') ? url : `${ENV.API_URL || ''}${url}`;
      let requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        cache: options.cache || 'default',
        signal: options.signal
      };

      // Add body for non-GET requests
      if (method !== 'GET' && data) {
        requestOptions.body = JSON.stringify(data);
      }

      // Add query parameters for GET requests
      if (method === 'GET' && options.params) {
        const queryParams = new URLSearchParams();
        
        // Handle different param types
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
        
        apiUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${queryParams}`;
      }

      // Apply request interceptors
      for (const interceptor of requestInterceptors) {
        [apiUrl, requestOptions] = interceptor(apiUrl, requestOptions);
      }

      // Check cache for GET requests
      const cacheKey = `${method}:${apiUrl}`;
      if (method === 'GET' && apiCache.has(cacheKey)) {
        const cached = apiCache.get(cacheKey)!;
        const now = Date.now();
        if (now - cached.timestamp < DEFAULT_CACHE_TTL) {
          return cached.data as T;
        }
        // Expired cache entry
        apiCache.delete(cacheKey);
      }

      // Make the request
      let response = await fetch(apiUrl, requestOptions);

      // Apply response interceptors
      for (const interceptor of responseInterceptors) {
        response = await interceptor(response);
      }

      // Handle response
      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText };
        }

        const request = {
          url,
          method,
          data,
          options: { 
            headers: requestOptions.headers as Record<string, string>,
            ...options 
          }
        };

        throw new ApiError(
          typeof errorData === 'object' && errorData !== null && 'message' in errorData 
            ? String(errorData.message) 
            : `API error: ${response.status}`,
          response.status,
          errorData,
          request
        );
      }

      // Parse response
      const responseData = await response.json();

      // Cache successful GET responses
      if (method === 'GET') {
        apiCache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now()
        });
      }

      return responseData as T;
    } catch (error) {
      // Apply error interceptors
      let transformedError = error instanceof ApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
      
      for (const interceptor of errorInterceptors) {
        try {
          const result = await interceptor(transformedError);
          // Only update if the result is an ApiError
          if (result instanceof ApiError) {
            transformedError = result;
          }
        } catch (e) {
          console.error('Error in error interceptor:', e);
        }
      }
      throw transformedError;
    }
  },

  // Convenience methods
  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'GET', undefined, options);
  },

  post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'POST', data, options);
  },

  put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'PUT', data, options);
  },

  patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'PATCH', data, options);
  },

  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'DELETE', undefined, options);
  },

  // Interceptor management
  addRequestInterceptor(interceptor: (url: string, options: RequestInit) => [string, RequestInit]) {
    requestInterceptors.push(interceptor);
    return () => {
      const index = requestInterceptors.indexOf(interceptor);
      if (index !== -1) {
        requestInterceptors.splice(index, 1);
      }
    };
  },

  addResponseInterceptor(interceptor: (response: Response) => Promise<Response>) {
    responseInterceptors.push(interceptor);
    return () => {
      const index = responseInterceptors.indexOf(interceptor);
      if (index !== -1) {
        responseInterceptors.splice(index, 1);
      }
    };
  },

  addErrorInterceptor(interceptor: (error: ApiError) => Promise<unknown>) {
    errorInterceptors.push(interceptor);
    return () => {
      const index = errorInterceptors.indexOf(interceptor);
      if (index !== -1) {
        errorInterceptors.splice(index, 1);
      }
    };
  },

  // Cache management
  clearCache() {
    apiCache.clear();
  },

  invalidateCache(url: string, method: HttpMethod = 'GET') {
    const cacheKey = `${method}:${url}`;
    apiCache.delete(cacheKey);
  }
}; 