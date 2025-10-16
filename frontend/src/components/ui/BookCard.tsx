import { Book } from '../../types';

interface BookCardProps {
  book: Book;
  showActions?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
  onBorrow?: (book: Book) => void;
  actionText?: string;
}

export default function BookCard({ 
  book, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onBorrow,
  actionText = "📖 Borrow This Book"
}: BookCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      {book.thumbnailUrl ? (
        <div className="mb-4">
          <img
            src={book.thumbnailUrl}
            alt={book.title}
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="mb-4 h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-md flex items-center justify-center">
          <span className="text-green-400 text-4xl">🌿</span>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {book.title}
        </h4>
        {book.rating && (
          <div className="flex items-center ml-2 flex-shrink-0">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-medium text-gray-600 ml-1">
              {book.rating}
            </span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
      
      {book.description && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {book.description}
        </p>
      )}
      
      <div className="text-xs text-gray-500 mb-4">
        Added {new Date(book.createdAt).toLocaleDateString()}
      </div>

      {showActions && onEdit && onDelete && (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(book)}
            className="btn btn-secondary text-sm flex-1"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="btn btn-danger text-sm flex-1"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {onBorrow && (
        <button 
          onClick={() => onBorrow(book)}
          className="btn btn-primary w-full"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
