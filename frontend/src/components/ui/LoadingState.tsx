interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ 
  message = "🌿 Loading...", 
  className = "" 
}: LoadingStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-green-700 text-sm">{message}</p>
    </div>
  );
}
