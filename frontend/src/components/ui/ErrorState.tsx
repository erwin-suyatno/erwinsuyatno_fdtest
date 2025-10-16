interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export default function ErrorState({ 
  message, 
  onRetry, 
  retryText = "🌱 Try Again",
  className = ""
}: ErrorStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-amber-600 text-xl mb-4">🌧️</div>
      <p className="text-amber-600 mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="btn btn-primary"
        >
          {retryText}
        </button>
      )}
    </div>
  );
}
