import { lazy, Suspense } from 'react';
import LazyLoadingSpinner from '../components/LazyLoadingSpinner';

// Lazy load the BooksPage component
const BooksPage = lazy(() => import('./books'));

export default function LazyBooksPage() {
  return (
    <Suspense fallback={<LazyLoadingSpinner message="📚 Loading books management..." />}>
      <BooksPage />
    </Suspense>
  );
}
