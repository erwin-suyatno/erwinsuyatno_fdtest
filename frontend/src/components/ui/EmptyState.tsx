interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-green-400 text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-green-800 mb-2">{title}</h3>
      <p className="text-green-600 mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
