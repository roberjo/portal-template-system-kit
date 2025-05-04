import { ENV } from '@/config/env';

// Types for API requests and responses
export interface ApiRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: RequestCache;
  withCredentials?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: ApiRequestConfig;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
  config?: ApiRequestConfig;
}

// Type for request interceptors
export type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;

// Type for response interceptors
export type ResponseInterceptor = (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;

// Type for error interceptors
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

// Type alias for retry status codes
export type RetryStatusCode = 408 | 429 | 500 | 502 | 503 | 504;

// Interface for cached data
interface CachedData<T = unknown> {
  data: T;
  timestamp: number;
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string = '';
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly errorInterceptors: ErrorInterceptor[] = [];
  private readonly defaultTimeout: number = 30000; // 30 seconds
  
  // Cache for requests
  private readonly cache: Map<string, CachedData> = new Map();
  private cacheTTL: number = 60000; // 1 minute cache TTL by default
  private readonly requestsInProgress: Map<string, Promise<ApiResponse>> = new Map();
  private retryCount: number = 3;
  private retryDelay: number = 1000; // 1 second delay between retries
  
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? ENV.API_URL ?? '';
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
  public async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let requestConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }
    
    // Build full URL
    const url = this.buildUrl(requestConfig);
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(requestConfig, url);
    
    // Check if the request is already in progress
    if (this.requestsInProgress.has(cacheKey)) {
      return this.requestsInProgress.get(cacheKey) as Promise<ApiResponse<T>>;
    }
    
    // Check cache for GET requests
    const cachedResponse = this.checkCache<T>(requestConfig, cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Prepare headers and request options
    const { headers, requestOptions } = this.prepareRequestOptions(requestConfig);
    
    // Execute request with retries
    const requestPromise = this.executeWithRetry<T>(url.toString(), requestOptions, requestConfig);
    this.requestsInProgress.set(cacheKey, requestPromise);
    
    try {
      const response = await requestPromise;
      
      // Remove from in-progress map
      this.requestsInProgress.delete(cacheKey);
      
      // Cache successful GET responses
      this.cacheSuccessfulResponse(requestConfig, cacheKey, response);
      
      return response;
    } catch (error) {
      // Remove from in-progress map on error
      this.requestsInProgress.delete(cacheKey);
      throw error;
    }
  }
  
  // Helper to build URL with parameters
  private buildUrl(config: ApiRequestConfig): URL {
    const url = new URL(config.url.startsWith('http') ? config.url : `${this.baseUrl}${config.url}`);
    
    // Add query parameters
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    return url;
  }
  
  // Helper to generate cache key
  private generateCacheKey(config: ApiRequestConfig, url: URL): string {
    return `${config.method || 'GET'}-${url.toString()}-${JSON.stringify(config.data || {})}`;
  }
  
  // Helper to check cache for GET requests
  private checkCache<T>(config: ApiRequestConfig, cacheKey: string): ApiResponse<T> | null {
    if ((config.method === 'GET' || !config.method) && this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < this.cacheTTL) {
        return {
          data: cachedData.data as T,
          status: 200,
          statusText: 'OK (cached)',
          headers: new Headers(),
          config
        };
      }
    }
    return null;
  }
  
  // Helper to prepare request options
  private prepareRequestOptions(config: ApiRequestConfig): { headers: Headers, requestOptions: RequestInit } {
    // Prepare headers
    const headers = new Headers({
      ...this.defaultHeaders,
      ...config.headers
    });
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method: config.method || 'GET',
      headers,
      cache: config.cache || 'no-cache',
      credentials: config.withCredentials ? 'include' : 'same-origin'
    };
    
    // Add body for non-GET requests
    if (config.method !== 'GET' && config.method !== undefined && config.data) {
      if (config.data instanceof FormData) {
        requestOptions.body = config.data;
        // Remove Content-Type header to let the browser set it with the boundary
        headers.delete('Content-Type');
      } else {
        requestOptions.body = JSON.stringify(config.data);
      }
    }
    
    return { headers, requestOptions };
  }
  
  // Helper to cache successful responses
  private cacheSuccessfulResponse<T>(config: ApiRequestConfig, cacheKey: string, response: ApiResponse<T>): void {
    if ((config.method === 'GET' || !config.method) && response.status >= 200 && response.status < 300) {
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
  }
  
  // Helper methods for common HTTP methods
  public async get<T>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }
  
  public async post<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }
  
  public async put<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }
  
  public async delete<T>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }
  
  public async patch<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }
  
  // Private method to execute request with retries
  private async executeWithRetry<T>(url: string, options: RequestInit, config: ApiRequestConfig, attempt = 0): Promise<ApiResponse<T>> {
    try {
      const response = await this.executeFetch<T>(url, options, config);
      return response;
    } catch (error) {
      return this.handleFetchError<T>(error, url, options, config, attempt);
    }
  }
  
  // Helper to execute fetch with timeout
  private async executeFetch<T>(url: string, options: RequestInit, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, config.timeout ?? this.defaultTimeout);
    
    // Add signal to options
    const optionsWithSignal = {
      ...options,
      signal: controller.signal
    };
    
    try {
      // Execute fetch
      const response = await fetch(url, optionsWithSignal);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Parse response
      const apiResponse = await this.parseResponse<T>(response, config);
      
      // Handle error responses
      if (!response.ok) {
        throw await this.createErrorFromResponse(apiResponse, response);
      }
      
      return apiResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  // Helper to parse response
  private async parseResponse<T>(response: Response, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    // Parse response data
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
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
    
    return transformedResponse;
  }
  
  // Helper to create error from response
  private async createErrorFromResponse<T>(apiResponse: ApiResponse<T>, response: Response): Promise<ApiError> {
    const apiError: ApiError = {
      message: `Request failed with status ${response.status}`,
      status: response.status,
      data: apiResponse.data,
      config: apiResponse.config
    };
    
    // Apply error interceptors
    let transformedError = apiError;
    for (const interceptor of this.errorInterceptors) {
      transformedError = await interceptor(transformedError);
    }
    
    return transformedError;
  }
  
  // Helper to handle fetch errors
  private async handleFetchError<T>(
    error: unknown, 
    url: string, 
    options: RequestInit,
    config: ApiRequestConfig, 
    attempt: number
  ): Promise<ApiResponse<T>> {
    // Handle timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      const apiError: ApiError = {
        message: 'Request timed out',
        config
      };
      
      throw await this.applyErrorInterceptors(apiError);
    }
    
    // If it's already an ApiError, check for retry
    if (this.isApiError(error)) {
      // Check if we should retry based on status
      if (attempt < this.retryCount && error.status && this.shouldRetry(error.status)) {
        await this.delay(this.retryDelay * Math.pow(2, attempt));
        return this.executeWithRetry<T>(url, options, config, attempt + 1);
      }
      throw error;
    }
    
    // For other errors, create an ApiError
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      config
    };
    
    const transformedError = await this.applyErrorInterceptors(apiError);
    
    // Check if we should retry
    if (attempt < this.retryCount) {
      await this.delay(this.retryDelay * Math.pow(2, attempt));
      return this.executeWithRetry<T>(url, options, config, attempt + 1);
    }
    
    throw transformedError;
  }
  
  // Helper to apply error interceptors
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let transformedError = error;
    for (const interceptor of this.errorInterceptors) {
      transformedError = await interceptor(transformedError);
    }
    return transformedError;
  }
  
  // Type guard for ApiError
  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' && 
      error !== null && 
      'message' in error
    );
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