import { lazy, Suspense } from 'react';
import LazyLoadingSpinner from '../components/LazyLoadingSpinner';

// Lazy load the UsersPage component
const UsersPage = lazy(() => import('./users'));

export default function LazyUsersPage() {
  return (
    <Suspense fallback={<LazyLoadingSpinner message="👥 Loading users management..." />}>
      <UsersPage />
    </Suspense>
  );
}
