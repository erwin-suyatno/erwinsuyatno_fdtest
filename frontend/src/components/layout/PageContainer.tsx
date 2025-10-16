import { ReactNode } from 'react';
import BackgroundElements from './BackgroundElements';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`min-h-screen nature-bg relative overflow-hidden ${className}`}>
      <BackgroundElements />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </div>
    </div>
  );
}
