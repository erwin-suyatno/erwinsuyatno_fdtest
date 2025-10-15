import { useState, useEffect, useCallback } from 'react';

interface UseLazyDataOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  enabled?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface UseLazyDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isRetrying: boolean;
}

export function useLazyData<T>({
  fetchFn,
  dependencies = [],
  enabled = true,
  retryCount = 3,
  retryDelay = 1000
}: UseLazyDataOptions<T>): UseLazyDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      setRetryAttempts(0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      
      // Retry logic
      if (retryAttempts < retryCount) {
        setIsRetrying(true);
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1);
          setIsRetrying(false);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled, retryAttempts, retryCount, retryDelay]);

  const refetch = useCallback(() => {
    setRetryAttempts(0);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    isRetrying
  };
}

// Specialized hooks for common data types
export function useLazyBooks() {
  return useLazyData({
    fetchFn: async () => {
      const { bookService } = await import('../services/bookService');
      return bookService.getBooks();
    },
    enabled: true
  });
}

export function useLazyUsers() {
  return useLazyData({
    fetchFn: async () => {
      const { userService } = await import('../services/userService');
      return userService.getUsers();
    },
    enabled: true
  });
}

export function useLazyBookings() {
  return useLazyData({
    fetchFn: async () => {
      const { bookingService } = await import('../services/bookingService');
      return bookingService.getMyBookings();
    },
    enabled: true
  });
}
