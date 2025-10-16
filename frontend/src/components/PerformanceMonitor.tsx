import { useEffect } from 'react';

interface PerformanceMonitorProps {
  componentName: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

export default function PerformanceMonitor({ 
  componentName, 
  onLoadStart, 
  onLoadEnd 
}: PerformanceMonitorProps) {
  useEffect(() => {
    const startTime = performance.now();
    onLoadStart?.();

    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log performance metrics
      console.log(`🌿 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send to analytics if needed
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'component_load', {
          component_name: componentName,
          load_time: Math.round(loadTime),
        });
      }
      
      onLoadEnd?.();
    };
  }, [componentName, onLoadStart, onLoadEnd]);

  return null;
}

// Hook for monitoring component performance
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      console.log(`🌿 ${componentName} rendered in ${loadTime.toFixed(2)}ms`);
    };
  }, [componentName]);
}
