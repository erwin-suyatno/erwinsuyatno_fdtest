import { Booking } from '../../types';

interface BookingCardProps {
  booking: Booking;
  onReturn?: (id: string) => void;
  onCancel?: (id: string) => void;
  loading?: boolean;
}

export default function BookingCard({ booking, onReturn, onCancel, loading = false }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'returned':
        return '📚';
      case 'overdue':
        return '⚠️';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canReturn = booking.status === 'approved';
  const canCancel = booking.status === 'pending';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📚 {booking.book?.title}
          </h3>
          <p className="text-gray-600 mb-1">
            <strong>Author:</strong> {booking.book?.author}
          </p>
          {booking.book?.rating && (
            <p className="text-gray-600 mb-1">
              <strong>Rating:</strong> {'⭐'.repeat(booking.book.rating)}
            </p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
          {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Borrow Date</p>
          <p className="font-medium">{formatDate(booking.borrowDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Return Date</p>
          <p className="font-medium">{formatDate(booking.returnDate)}</p>
        </div>
        {booking.actualReturnDate && (
          <div>
            <p className="text-sm text-gray-500">Actual Return Date</p>
            <p className="font-medium">{formatDate(booking.actualReturnDate)}</p>
          </div>
        )}
        {booking.overdueFee && booking.overdueFee > 0 && (
          <div>
            <p className="text-sm text-gray-500">Overdue Fee</p>
            <p className="font-medium text-red-600">${booking.overdueFee.toFixed(2)}</p>
          </div>
        )}
      </div>

      {booking.book?.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <p className="text-gray-700 text-sm line-clamp-2">{booking.book.description}</p>
        </div>
      )}

      <div className="flex space-x-3">
        {canReturn && (
          <button
            onClick={() => onReturn?.(booking.id)}
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? '⏳ Processing...' : '📚 Return Book'}
          </button>
        )}
        
        {canCancel && (
          <button
            onClick={() => onCancel?.(booking.id)}
            disabled={loading}
            className="btn btn-secondary flex-1"
          >
            {loading ? '⏳ Processing...' : '❌ Cancel Request'}
          </button>
        )}

        {booking.status === 'rejected' && (
          <div className="flex-1 text-center text-gray-500 text-sm py-2">
            This booking request was rejected
          </div>
        )}

        {booking.status === 'returned' && (
          <div className="flex-1 text-center text-green-600 text-sm py-2">
            ✅ Book has been returned
          </div>
        )}
      </div>
    </div>
  );
}
