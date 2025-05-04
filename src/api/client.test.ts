import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './client';

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());

describe('API Client', () => {
  const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
  const mockJsonResponse = { data: 'test' };
  
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.clearCache();
    
    // Default mock implementation
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockJsonResponse,
      status: 200,
      statusText: 'OK',
    } as Response);
  });
  
  describe('GET requests', () => {
    it('should make a GET request with correct URL and headers', async () => {
      await apiClient.get('/test');
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      
      expect(url).toContain('/test');
      expect(options.method).toBe('GET');
      expect(options.headers).toHaveProperty('Content-Type', 'application/json');
    });
    
    it('should append query parameters to the URL', async () => {
      await apiClient.get('/test', { params: { foo: 'bar', baz: 'qux' } });
      
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/test?foo=bar&baz=qux');
    });
    
    it('should use cache for repeated GET requests', async () => {
      // First request
      await apiClient.get('/cache-test');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Second request - should use cache
      await apiClient.get('/cache-test');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still just one call
    });
    
    it('should invalidate cache when requested', async () => {
      // First request
      await apiClient.get('/invalidate-test');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Invalidate cache
      apiClient.invalidateCache('/invalidate-test');
      
      // Second request - should not use cache
      await apiClient.get('/invalidate-test');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('POST requests', () => {
    it('should make a POST request with correct URL, headers and body', async () => {
      const testData = { name: 'test', value: 123 };
      await apiClient.post('/test', testData);
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      
      expect(url).toContain('/test');
      expect(options.method).toBe('POST');
      expect(options.headers).toHaveProperty('Content-Type', 'application/json');
      expect(options.body).toBe(JSON.stringify(testData));
    });
  });
  
  describe('Error handling', () => {
    it('should throw an ApiError for non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
      } as Response);
      
      await expect(apiClient.get('/not-found')).rejects.toThrow('Resource not found');
    });
    
    it('should apply error interceptors', async () => {
      // Mock an error interceptor
      const errorInterceptor = vi.fn(async (error) => {
        error.intercepted = true;
        return error;
      });
      
      const removeInterceptor = apiClient.addErrorInterceptor(errorInterceptor);
      
      // Simulate an error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      try {
        await apiClient.get('/error');
      } catch (error: any) {
        expect(errorInterceptor).toHaveBeenCalled();
        expect(error.intercepted).toBe(true);
      }
      
      // Clean up
      removeInterceptor();
    });
  });
  
  describe('Interceptors', () => {
    it('should apply request interceptors', async () => {
      const requestInterceptor = vi.fn((url, options) => {
        return [`${url}/intercepted`, {
          ...options,
          headers: {
            ...options.headers,
            'X-Test': 'test-value'
          }
        }];
      });
      
      const removeInterceptor = apiClient.addRequestInterceptor(requestInterceptor);
      
      await apiClient.get('/intercept-request');
      
      expect(requestInterceptor).toHaveBeenCalled();
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/intercept-request/intercepted');
      expect(options.headers).toHaveProperty('X-Test', 'test-value');
      
      // Clean up
      removeInterceptor();
    });
    
    it('should apply response interceptors', async () => {
      const responseInterceptor = vi.fn(async (response) => {
        // Create a new response with modified headers
        const newResponse = new Response(JSON.stringify({ intercepted: true }), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        return newResponse;
      });
      
      const removeInterceptor = apiClient.addResponseInterceptor(responseInterceptor);
      
      const result = await apiClient.get('/intercept-response');
      
      expect(responseInterceptor).toHaveBeenCalled();
      expect(result).toHaveProperty('intercepted', true);
      
      // Clean up
      removeInterceptor();
    });
  });
}); 