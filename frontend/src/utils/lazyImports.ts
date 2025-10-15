import { ComponentType } from 'react';
import { lazy } from 'react';

// Lazy import utility with better error handling
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackMessage: string
) {
  return lazy(() => 
    importFunc().catch((error) => {
      console.error('Failed to load component:', error);
      // Return a fallback component
      return {
        default: () => (
          <div className="min-h-screen nature-bg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌧️</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Loading Error</h2>
              <p className="text-red-600 mb-4">Failed to load {fallbackMessage}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                🌱 Try Again
              </button>
            </div>
          </div>
        )
      };
    })
  );
}

// Pre-configured lazy components
export const LazyBooksPage = createLazyComponent(
  () => import('../pages/books'),
  'Books Management'
);

export const LazyUsersPage = createLazyComponent(
  () => import('../pages/users'),
  'Users Management'
);

export const LazyBookingPage = createLazyComponent(
  () => import('../pages/booking'),
  'Book Library'
);

export const LazyHomePage = createLazyComponent(
  () => import('../pages/home'),
  'Home Page'
);

export const LazyLoginPage = createLazyComponent(
  () => import('../pages/login'),
  'Login Page'
);

export const LazyRegisterPage = createLazyComponent(
  () => import('../pages/register'),
  'Register Page'
);
