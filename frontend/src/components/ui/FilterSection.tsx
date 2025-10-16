import { ReactNode } from 'react';

interface FilterSectionProps {
  children: ReactNode;
  className?: string;
}

export default function FilterSection({ children, className = "" }: FilterSectionProps) {
  return (
    <div className={`px-6 py-4 bg-green-50 border-b border-green-200 ${className}`}>
      {children}
    </div>
  );
}
