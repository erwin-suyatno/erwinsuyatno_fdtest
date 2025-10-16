import { Booking } from '../../types';
import BookingCard from './BookingCard';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  onReturn?: (id: string) => void;
  onCancel?: (id: string) => void;
  actionLoading?: boolean;
}

export default function BookingList({ 
  bookings, 
  loading, 
  error, 
  onReturn, 
  onCancel, 
  actionLoading = false 
}: BookingListProps) {
  if (loading) {
    return <LoadingSpinner message="Loading your bookings..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="No Bookings Found"
        description="You haven't made any booking requests yet. Browse our books and make your first booking!"
        actionText="Browse Books"
        onAction={() => window.location.href = '/books'}
      />
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onReturn={onReturn}
          onCancel={onCancel}
          loading={actionLoading}
        />
      ))}
    </div>
  );
}
