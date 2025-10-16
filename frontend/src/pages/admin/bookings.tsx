import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Booking, BookingFilters } from '../../types';
import { bookingService } from '../../services/bookingService';
import { useAdminAuth } from '../../middleware/adminAuth';
import { useBookings } from '../../hooks/useBookings';
import { 
  PageContainer, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  BookingList,
  FilterSection,
  Pagination
} from '../../components';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<BookingFilters>({
    status: '',
    userId: '',
    bookId: '',
    page: 1,
    limit: 10
  });

  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (user && !authLoading) {
      if (!isAdmin) {
        router.push('/home');
        return;
      }
      fetchBookings();
    }
  }, [user, authLoading, isAdmin, filters]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getAllBookings(filters);
      setBookings(response.bookings);
      setTotal(response.total);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await bookingService.approveBooking(bookingId);
      await fetchBookings(); // Refresh the list
    } catch (err: any) {
      alert(`Failed to approve booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await bookingService.rejectBooking(bookingId);
      await fetchBookings(); // Refresh the list
    } catch (err: any) {
      alert(`Failed to reject booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  const handleReturn = async (bookingId: string) => {
    try {
      await bookingService.returnBook(bookingId);
      await fetchBookings(); // Refresh the list
    } catch (err: any) {
      alert(`Failed to return book: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleUserIdFilter = (userId: string) => {
    setFilters(prev => ({ ...prev, userId, page: 1 }));
  };

  const handleBookIdFilter = (bookId: string) => {
    setFilters(prev => ({ ...prev, bookId, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      userId: '',
      bookId: '',
      page: 1,
      limit: 10
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen nature-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 text-sm">🌿 Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect if no user or not admin
  if (!user || !isAdmin) {
    router.push('/home');
    return null;
  }

  return (
    <PageContainer>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-green-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-800">📋 Admin - Booking Management</h1>
            <button
              onClick={() => router.push('/home')}
              className="btn btn-secondary"
            >
              🏡 Back to Home
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-green-50 border-b border-green-200">
          <FilterSection
            title="Filter Bookings"
            onClear={clearFilters}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  📊 Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                  <option value="returned">📚 Returned</option>
                  <option value="overdue">⚠️ Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  👤 User ID
                </label>
                <input
                  type="text"
                  placeholder="Enter user ID..."
                  value={filters.userId || ''}
                  onChange={(e) => handleUserIdFilter(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  📚 Book ID
                </label>
                <input
                  type="text"
                  placeholder="Enter book ID..."
                  value={filters.bookId || ''}
                  onChange={(e) => handleBookIdFilter(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchBookings}
                  className="btn btn-primary w-full"
                >
                  🔍 Search
                </button>
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <LoadingState message="📋 Loading bookings..." />
          ) : error ? (
            <ErrorState 
              message={error}
              onRetry={() => fetchBookings()}
            />
          ) : bookings.length === 0 ? (
            <EmptyState 
              icon="📋"
              title="No bookings found"
              description="Try adjusting your search criteria or check back later"
            />
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-800">
                  📋 {total} Booking{total !== 1 ? 's' : ''} Found
                </h3>
                <p className="text-sm text-gray-500">
                  Showing {bookings.length} of {total} bookings
                </p>
              </div>
              
              <AdminBookingList
                bookings={bookings}
                loading={loading}
                error={error}
                onApprove={handleApprove}
                onReject={handleReject}
                onReturn={handleReturn}
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
                    onPageChange={handlePageChange}
                    onPreviousPage={() => handlePageChange(currentPage - 1)}
                    onNextPage={() => handlePageChange(currentPage + 1)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

// Admin-specific booking list component with approve/reject/return actions
function AdminBookingList({ 
  bookings, 
  loading, 
  error, 
  onApprove, 
  onReject,
  onReturn
}: {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReturn: (id: string) => void;
}) {
  if (loading) return <LoadingState message="Loading bookings..." />;
  if (error) return <ErrorState message={error} />;
  if (bookings.length === 0) return <EmptyState icon="📋" title="No bookings found" description="Try adjusting your search criteria" />;

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    📚 {booking.book?.title || 'Unknown Book'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    by {booking.book?.author || 'Unknown Author'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    booking.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {booking.status === 'PENDING' ? '⏳ Pending' :
                     booking.status === 'APPROVED' ? '✅ Approved' :
                     booking.status === 'REJECTED' ? '❌ Rejected' :
                     booking.status === 'RETURNED' ? '📚 Returned' :
                     '⚠️ Overdue'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>👤 User:</strong> {booking.user?.name || 'Unknown User'}</p>
                  <p><strong>📧 Email:</strong> {booking.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p><strong>📅 Borrow Date:</strong> {new Date(booking.borrowDate).toLocaleDateString()}</p>
                  <p><strong>📅 Return Date:</strong> {new Date(booking.returnDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              {booking.actualReturnDate && (
                <div className="mt-2 text-sm">
                  <p><strong>📅 Actual Return:</strong> {new Date(booking.actualReturnDate).toLocaleDateString()}</p>
                </div>
              )}
              
              {booking.overdueFee && booking.overdueFee > 0 && (
                <div className="mt-2 text-sm">
                  <p><strong>💰 Overdue Fee:</strong> ${booking.overdueFee}</p>
                </div>
              )}
            </div>
            
            {/* Admin Actions */}
            {booking.status === 'PENDING' && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onApprove(booking.id)}
                  className="btn btn-success text-sm px-3 py-1"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => onReject(booking.id)}
                  className="btn btn-danger text-sm px-3 py-1"
                >
                  ❌ Reject
                </button>
              </div>
            )}
            
            {booking.status === 'APPROVED' && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onReturn(booking.id)}
                  className="btn btn-primary text-sm px-3 py-1"
                >
                  📚 Return Book
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
