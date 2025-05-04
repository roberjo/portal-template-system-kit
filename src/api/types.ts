/**
 * API types for use across the application
 */

/**
 * Supported HTTP methods for API requests
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Basic API response structure
 */
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Error response from the API
 */
export interface ApiError {
  name: string;
  message: string;
  status?: number;
  request?: {
    url: string;
    method: HttpMethod;
    data?: unknown;
    options: {
      headers: Record<string, string>;
      [key: string]: unknown;
    };
  };
}

/**
 * Pagination metadata structure
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  cache?: RequestCache;
  signal?: AbortSignal;
  withCredentials?: boolean;
} 