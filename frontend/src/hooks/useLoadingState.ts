import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface UseLoadingStateOptions {
  debounceMs?: number;
  maxLoadingMs?: number;
  minLoadingMs?: number;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    debounceMs = 100,
    maxLoadingMs = 2000,
    minLoadingMs = 500
  } = options;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        startTimeRef.current = Date.now();
        
        // Clear any existing timeouts
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Debounce loading state
        debounceTimeoutRef.current = setTimeout(() => {
          setLoading(true);
          
          // Auto-hide loading after max time
          loadingTimeoutRef.current = setTimeout(() => {
            setLoading(false);
          }, maxLoadingMs);
        }, debounceMs);
      }
    };

    const handleComplete = (url: string) => {
      if (url === router.asPath) {
        const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        const remainingTime = Math.max(0, minLoadingMs - elapsed);
        
        // Clear timeouts
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
          debounceTimeoutRef.current = null;
        }
        
        // Hide loading after minimum time or immediately if already past minimum
        if (remainingTime > 0) {
          setTimeout(() => setLoading(false), remainingTime);
        } else {
          setLoading(false);
        }
      }
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      // Cleanup timeouts on unmount
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router, debounceMs, maxLoadingMs, minLoadingMs]);

  return loading;
}
