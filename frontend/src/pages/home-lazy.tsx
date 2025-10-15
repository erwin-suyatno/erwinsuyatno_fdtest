import { lazy, Suspense } from 'react';
import LazyLoadingSpinner from '../components/LazyLoadingSpinner';

// Lazy load the HomePage component
const HomePage = lazy(() => import('./home'));

export default function LazyHomePage() {
  return (
    <Suspense fallback={<LazyLoadingSpinner message="🌿 Loading your forest..." />}>
      <HomePage />
    </Suspense>
  );
}
