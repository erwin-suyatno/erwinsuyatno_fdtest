import { ReactNode } from 'react';

interface FilterSectionProps {
  children: ReactNode;
  title?: string;
  onClear?: () => void;
  className?: string;
}

export default function FilterSection({ children, title, onClear, className = "" }: FilterSectionProps) {
  return (
    <div className={`px-6 py-4 bg-green-50 border-b border-green-200 ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-green-800">{title}</h3>
          {onClear && (
            <button
              onClick={onClear}
              className="btn btn-secondary text-sm"
            >
              🌱 Clear Filters
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
