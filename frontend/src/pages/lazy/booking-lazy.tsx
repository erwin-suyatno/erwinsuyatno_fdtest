import { lazy, Suspense } from 'react';
import LazyLoadingSpinner from '../components/LazyLoadingSpinner';

// Lazy load the BookingPage component
const BookingPage = lazy(() => import('./booking'));

export default function LazyBookingPage() {
  return (
    <Suspense fallback={<LazyLoadingSpinner message="📖 Loading book library..." />}>
      <BookingPage />
    </Suspense>
  );
}
