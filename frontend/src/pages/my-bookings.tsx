import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useBookings } from '../hooks/useBookings';
import BookingList from '../components/ui/BookingList';
import FilterSection from '../components/ui/FilterSection';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function MyBookingsPage() {
  const router = useRouter();
  const {
    bookings,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    filters,
    handleStatusFilter,
    clearFilters,
    fetchMyBookings,
    returnBooking,
    cancelBooking,
    reset,
  } = useBookings();

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchMyBookings();
    
    return () => {
      reset();
    };
  }, [router, fetchMyBookings, reset]);

  const handleReturn = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Return Book',
      message: 'Are you sure you want to return this book?',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        performReturn(id);
      },
    });
  };

  const handleCancel = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking request?',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        performCancel(id);
      },
    });
  };

  const performReturn = async (id: string) => {
    setActionLoading(true);
    try {
      await returnBooking(id);
    } catch (err) {
      console.error('Error returning book:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const performCancel = async (id: string) => {
    setActionLoading(true);
    try {
      await cancelBooking(id);
    } catch (err) {
      console.error('Error canceling booking:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'approved', label: '✅ Approved' },
    { value: 'rejected', label: '❌ Rejected' },
    { value: 'returned', label: '📚 Returned' },
    { value: 'overdue', label: '⚠️ Overdue' },
  ];

  if (loading && bookings.length === 0) {
    return <LoadingSpinner message="Loading your bookings..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 My Bookings
          </h1>
          <p className="text-gray-600">
            View and manage your book booking requests
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <FilterSection
            title="Filter My Bookings"
            onClear={clearFilters}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="input"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FilterSection>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Your Bookings ({total})
              </h2>
              <p className="text-sm text-gray-500">
                Showing {bookings.length} of {total} bookings
              </p>
            </div>
          </div>

          {error ? (
            <ErrorState message={error} />
          ) : (
            <>
              <BookingList
                bookings={bookings}
                loading={loading}
                error={error}
                onReturn={handleReturn}
                onCancel={handleCancel}
                actionLoading={actionLoading}
              />

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={total}
                    itemsPerPage={10}
                    itemsOnCurrentPage={bookings.length}
                    loading={loading}
                    onPageChange={(page) => {
                      // You might want to implement page change logic here
                      console.log('Page change:', page);
                    }}
                    onPreviousPage={() => {
                      if (currentPage > 1) {
                        console.log('Previous page:', currentPage - 1);
                      }
                    }}
                    onNextPage={() => {
                      if (currentPage < totalPages) {
                        console.log('Next page:', currentPage + 1);
                      }
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
