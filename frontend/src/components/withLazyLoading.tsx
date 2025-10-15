import { ComponentType, Suspense } from 'react';
import LazyLoadingSpinner from './LazyLoadingSpinner';

interface WithLazyLoadingOptions {
  fallbackMessage?: string;
  delay?: number;
}

export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: WithLazyLoadingOptions = {}
) {
  const { fallbackMessage = "🌿 Loading...", delay = 0 } = options;

  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense 
        fallback={
          <LazyLoadingSpinner 
            message={fallbackMessage}
          />
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

// Pre-configured HOCs for common pages
export const withBooksLazyLoading = (Component: ComponentType<any>) =>
  withLazyLoading(Component, { fallbackMessage: "📚 Loading books management..." });

export const withUsersLazyLoading = (Component: ComponentType<any>) =>
  withLazyLoading(Component, { fallbackMessage: "👥 Loading users management..." });

export const withBookingLazyLoading = (Component: ComponentType<any>) =>
  withLazyLoading(Component, { fallbackMessage: "📖 Loading book library..." });

export const withHomeLazyLoading = (Component: ComponentType<any>) =>
  withLazyLoading(Component, { fallbackMessage: "🌿 Loading your forest..." });
