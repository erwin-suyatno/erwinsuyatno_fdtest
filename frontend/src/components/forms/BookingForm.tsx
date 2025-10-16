import { useState } from 'react';
import { Book, CreateBookingData } from '../../types';

interface BookingFormProps {
  book: Book;
  onSubmit: (data: CreateBookingData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function BookingForm({ book, onSubmit, onCancel, loading = false }: BookingFormProps) {
  const [formData, setFormData] = useState<CreateBookingData>({
    bookId: book.id,
    borrowDate: '',
    returnDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 30 days from now for default return date
  const defaultReturnDate = new Date();
  defaultReturnDate.setDate(defaultReturnDate.getDate() + 30);
  const maxReturnDate = defaultReturnDate.toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📚 Book Details</h3>
        <div className="text-sm text-blue-800">
          <p><strong>Title:</strong> {book.title}</p>
          <p><strong>Author:</strong> {book.author}</p>
          {book.rating && (
            <p><strong>Rating:</strong> {'⭐'.repeat(book.rating)}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📅 Borrow Date *
          </label>
          <input
            type="date"
            value={formData.borrowDate}
            onChange={(e) => setFormData(prev => ({ ...prev, borrowDate: e.target.value }))}
            min={today}
            className="input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Select when you want to borrow the book
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📅 Return Date *
          </label>
          <input
            type="date"
            value={formData.returnDate}
            onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
            min={formData.borrowDate || today}
            max={maxReturnDate}
            className="input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Select when you plan to return the book (max 30 days)
          </p>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Your booking request will be reviewed by an admin</li>
            <li>• You'll be notified once your request is approved or rejected</li>
            <li>• Late returns may incur a fee of $1 per day</li>
            <li>• You can cancel your request if it's still pending</li>
          </ul>
        </div>
        
        <div className="flex space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.borrowDate || !formData.returnDate || loading}
            className="btn btn-primary flex-1"
          >
            {loading ? '⏳ Processing...' : '📚 Request Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}