import { lazy } from 'react';

// Simple lazy imports without complex error handling

// Pre-configured lazy components
export const LazyBooksPage = lazy(() => import('../pages/books'));
export const LazyUsersPage = lazy(() => import('../pages/users'));
export const LazyBookingPage = lazy(() => import('../pages/booking'));
export const LazyHomePage = lazy(() => import('../pages/home'));
export const LazyLoginPage = lazy(() => import('../pages/login'));
export const LazyRegisterPage = lazy(() => import('../pages/register'));
