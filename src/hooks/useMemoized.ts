import { useRef, useMemo, useCallback } from 'react';

/**
 * Creates a memoized version of a function that remembers the results of previous calls.
 * This is useful for expensive calculations that may be called repeatedly with the same inputs.
 * 
 * @param fn - The function to memoize
 * @param maxCacheSize - Maximum number of results to cache (default: 50)
 * @returns A memoized version of the function
 */
export function useMemoized<T extends (...args: any[]) => any>(
  fn: T,
  maxCacheSize: number = 50
): T {
  // Create a cache to store previous results
  const cacheRef = useRef<Map<string, ReturnType<T>>>(new Map());
  
  // Create a function to convert arguments to a cache key
  const getCacheKey = useCallback((args: Parameters<T>): string => {
    return JSON.stringify(args);
  }, []);
  
  // Create the memoized function
  const memoizedFn = useCallback((...args: Parameters<T>): ReturnType<T> => {
    const cache = cacheRef.current;
    const key = getCacheKey(args);
    
    // Check if we have a cached result
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    // Calculate the result
    const result = fn(...args);
    
    // Manage cache size
    if (cache.size >= maxCacheSize) {
      // Remove the oldest entry
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    // Store the result in the cache
    cache.set(key, result);
    
    return result;
  }, [fn, getCacheKey, maxCacheSize]);
  
  return memoizedFn as T;
}

/**
 * A hook that combines React's useMemo with our caching strategy.
 * It's similar to useMemo but provides more control over the cache.
 * 
 * @param factory - The factory function to create the memoized value
 * @param dependencies - The dependencies array
 * @param options - Optional configuration
 * @returns The memoized value
 */
export function useEnhancedMemo<T>(
  factory: () => T,
  dependencies: React.DependencyList,
  options?: { cacheKey?: string }
): T {
  // Use the standard useMemo for the basic implementation
  return useMemo(() => {
    return factory();
  }, dependencies);
} 