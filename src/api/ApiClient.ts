import { ENV } from '@/config/env';

// Types for API requests and responses
export interface ApiRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: RequestCache;
  withCredentials?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: ApiRequestConfig;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  config?: ApiRequestConfig;
}

// Type for request interceptors
export type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;

// Type for response interceptors
export type ResponseInterceptor = (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;

// Type for error interceptors
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string = '';
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private defaultTimeout: number = 30000; // 30 seconds
  
  // Cache for requests
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private cacheTTL: number = 60000; // 1 minute cache TTL by default
  private requestsInProgress: Map<string, Promise<ApiResponse>> = new Map();
  private retryCount: number = 3;
  private retryDelay: number = 1000; // 1 second delay between retries
  
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || ENV.API_URL || '';
  }
  
  public static getInstance(baseUrl?: string): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(baseUrl);
    }
    return ApiClient.instance;
  }
  
  // Set the base URL for all requests
  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }
  
  // Set default headers for all requests
  public setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
  
  // Set a specific default header
  public setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }
  
  // Add a request interceptor
  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }
  
  // Add a response interceptor
  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }
  
  // Add an error interceptor
  public addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }
  
  // Set cache TTL
  public setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }
  
  // Clear cache
  public clearCache(): void {
    this.cache.clear();
  }
  
  // Set retry configuration
  public setRetryConfig(count: number, delay: number): void {
    this.retryCount = count;
    this.retryDelay = delay;
  }
  
  // Main request method
  public async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let requestConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }
    
    // Build full URL
    const url = new URL(requestConfig.url.startsWith('http') ? requestConfig.url : `${this.baseUrl}${requestConfig.url}`);
    
    // Add query parameters
    if (requestConfig.params) {
      Object.entries(requestConfig.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    // Generate cache key
    const cacheKey = `${requestConfig.method || 'GET'}-${url.toString()}-${JSON.stringify(requestConfig.data || {})}`;
    
    // Check if the request is already in progress
    if (this.requestsInProgress.has(cacheKey)) {
      return this.requestsInProgress.get(cacheKey) as Promise<ApiResponse<T>>;
    }
    
    // Check cache for GET requests
    if ((requestConfig.method === 'GET' || !requestConfig.method) && this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < this.cacheTTL) {
        return {
          data: cachedData.data,
          status: 200,
          statusText: 'OK (cached)',
          headers: new Headers(),
          config: requestConfig
        };
      }
    }
    
    // Prepare headers
    const headers = new Headers({
      ...this.defaultHeaders,
      ...requestConfig.headers
    });
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method: requestConfig.method || 'GET',
      headers,
      cache: requestConfig.cache || 'no-cache',
      credentials: requestConfig.withCredentials ? 'include' : 'same-origin'
    };
    
    // Add body for non-GET requests
    if (requestConfig.method !== 'GET' && requestConfig.method !== undefined && requestConfig.data) {
      if (requestConfig.data instanceof FormData) {
        requestOptions.body = requestConfig.data;
        // Remove Content-Type header to let the browser set it with the boundary
        headers.delete('Content-Type');
      } else {
        requestOptions.body = JSON.stringify(requestConfig.data);
      }
    }
    
    // Execute request with retries
    const requestPromise = this.executeWithRetry<T>(url.toString(), requestOptions, requestConfig);
    this.requestsInProgress.set(cacheKey, requestPromise);
    
    try {
      const response = await requestPromise;
      
      // Remove from in-progress map
      this.requestsInProgress.delete(cacheKey);
      
      // Cache successful GET responses
      if ((requestConfig.method === 'GET' || !requestConfig.method) && response.status >= 200 && response.status < 300) {
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response;
    } catch (error) {
      // Remove from in-progress map on error
      this.requestsInProgress.delete(cacheKey);
      throw error;
    }
  }
  
  // Helper methods for common HTTP methods
  public async get<T = any>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }
  
  public async post<T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }
  
  public async put<T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }
  
  public async delete<T = any>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }
  
  public async patch<T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }
  
  // Private method to execute request with retries
  private async executeWithRetry<T>(url: string, options: RequestInit, config: ApiRequestConfig, attempt = 0): Promise<ApiResponse<T>> {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, config.timeout || this.defaultTimeout);
      
      // Add signal to options
      const optionsWithSignal = {
        ...options,
        signal: controller.signal
      };
      
      // Execute fetch
      const response = await fetch(url, optionsWithSignal);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Parse response data
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }
      
      // Create response object
      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config
      };
      
      // Apply response interceptors
      let transformedResponse = apiResponse;
      for (const interceptor of this.responseInterceptors) {
        transformedResponse = await interceptor(transformedResponse);
      }
      
      // Handle error responses
      if (!response.ok) {
        const apiError: ApiError = {
          message: `Request failed with status ${response.status}`,
          status: response.status,
          data: transformedResponse.data,
          config
        };
        
        // Apply error interceptors
        let transformedError = apiError;
        for (const interceptor of this.errorInterceptors) {
          transformedError = await interceptor(transformedError);
        }
        
        // Check if we should retry
        if (attempt < this.retryCount && this.shouldRetry(response.status)) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
          return this.executeWithRetry<T>(url, options, config, attempt + 1);
        }
        
        throw transformedError;
      }
      
      return transformedResponse;
    } catch (error) {
      // Handle network errors or aborted requests
      if (error instanceof DOMException && error.name === 'AbortError') {
        const apiError: ApiError = {
          message: 'Request timed out',
          config
        };
        
        // Apply error interceptors
        let transformedError = apiError;
        for (const interceptor of this.errorInterceptors) {
          transformedError = await interceptor(transformedError);
        }
        
        throw transformedError;
      }
      
      // If it's already an ApiError, just rethrow it
      if (typeof error === 'object' && error !== null && 'message' in error && 'status' in error) {
        throw error;
      }
      
      // For other errors, create an ApiError
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        config
      };
      
      // Apply error interceptors
      let transformedError = apiError;
      for (const interceptor of this.errorInterceptors) {
        transformedError = await interceptor(transformedError);
      }
      
      // Check if we should retry
      if (attempt < this.retryCount) {
        await this.delay(this.retryDelay * Math.pow(2, attempt));
        return this.executeWithRetry<T>(url, options, config, attempt + 1);
      }
      
      throw transformedError;
    }
  }
  
  // Helper to check if we should retry based on status code
  private shouldRetry(status: number): boolean {
    // Retry for network errors, timeouts and specific HTTP status codes
    return (
      status === 408 || // Request Timeout
      status === 429 || // Too Many Requests
      status === 500 || // Internal Server Error
      status === 502 || // Bad Gateway
      status === 503 || // Service Unavailable
      status === 504    // Gateway Timeout
    );
  }
  
  // Helper method to delay execution
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create a default instance
export const apiClient = ApiClient.getInstance();

// Add some basic error handling
apiClient.addErrorInterceptor((error: ApiError) => {
  console.error('API Error:', error);
  return error;
}); 