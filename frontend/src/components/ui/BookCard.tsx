import { Book } from '../../types';

interface BookCardProps {
  book: Book;
  showActions?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
  onBorrow?: (book: Book) => void;
  onBook?: (book: Book) => void;
  showBookingButton?: boolean;
  actionText?: string;
}

export default function BookCard({ 
  book, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onBorrow,
  onBook,
  showBookingButton = false,
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
      
      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
        <span>Added {new Date(book.createdAt).toLocaleDateString()}</span>
        {showBookingButton && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            book.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {book.isAvailable ? '✅ Available' : '❌ Unavailable'}
          </span>
        )}
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

      {showBookingButton && onBook && (
        <button 
          onClick={() => onBook(book)}
          disabled={!book.isAvailable}
          className={`btn w-full ${
            book.isAvailable 
              ? 'btn-primary' 
              : 'btn-secondary cursor-not-allowed opacity-50'
          }`}
        >
          {book.isAvailable ? '📚 Book This Book' : '❌ Not Available'}
        </button>
      )}
    </div>
  );
}
