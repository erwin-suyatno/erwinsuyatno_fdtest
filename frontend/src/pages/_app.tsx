import type { AppProps } from 'next/app';
import { Suspense } from 'react';
import LazyLoadingSpinner from '../components/LazyLoadingSpinner';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback={<LazyLoadingSpinner message="🌿 Loading page..." />}>
      <Component {...pageProps} />
    </Suspense>
  );
}
