import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  showProgress?: boolean;
}

export default function LoadingSpinner({ 
  message = "🌿 Growing...", 
  showProgress = false 
}: LoadingSpinnerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90% to wait for actual completion
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showProgress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center nature-bg">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative mb-4">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
        </div>
        
        {/* Message */}
        <p className="text-green-700 text-sm mb-2">{message}</p>
        
        {/* Progress bar (optional) */}
        {showProgress && (
          <div className="w-32 h-1 bg-green-200 rounded-full mx-auto">
            <div 
              className="h-1 bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
