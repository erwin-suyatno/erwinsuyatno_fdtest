import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Book, Booking, CreateBookingData } from '../types';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../middleware/auth';
import { useBooks } from '../hooks/useBooks';
import { useBookings } from '../hooks/useBookings';
import { 
  PageContainer, 
  BookCard, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  Modal,
  BookingForm,
  BookingList,
  FilterSection,
  Pagination
} from '../components';

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-bookings'>('browse');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  
  // Use bookStore for available books
  const {
    books,
    loading: booksLoading,
    error: booksError,
    currentPage,
    totalPages,
    total,
    filters,
    handleSearch,
    handleAuthorFilter,
    handleRatingFilter,
    clearFilters,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    fetchAvailableBooks,
    reset: resetBooks,
  } = useBooks();

  // Use bookingStore for user bookings
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchMyBookings,
    returnBooking,
    cancelBooking,
    reset: resetBookings,
  } = useBookings();

  useEffect(() => {
    if (user && !authLoading) {
      if (activeTab === 'browse') {
        fetchAvailableBooks();
      } else {
        fetchMyBookings();
      }
    }
    
    return () => {
      resetBooks();
      resetBookings();
    };
  }, [activeTab, user, authLoading, fetchAvailableBooks, fetchMyBookings, resetBooks, resetBookings]);

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

  // Redirect if no user (not authenticated)
  if (!user) {
    router.push('/login');
    return null;
  }

  // Allow all authenticated users (ADMIN, USER, MEMBER) to access booking page
  // No redirect needed - admins can also borrow books

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (bookingData: CreateBookingData) => {
    try {
      await bookingService.createBooking(bookingData);
      setShowBookingModal(false);
      setSelectedBook(null);
      
      // Refresh the current tab
      if (activeTab === 'browse') {
        fetchAvailableBooks();
      } else {
        fetchMyBookings();
      }
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      // Show error message to user
      alert(`Failed to create booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
      alert(`Failed to cancel booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };

  const handleReturnBooking = async (bookingId: string) => {
    try {
      await returnBooking(bookingId);
    } catch (err: any) {
      console.error('Failed to return booking:', err);
      alert(`Failed to return booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    }
  };


  return (
    <PageContainer>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100">
          {/* Header */}
          <div className="px-6 py-4 border-b border-green-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-green-800">📚 Book Library - Borrow Books</h1>
              <button
                onClick={() => router.push('/home')}
                className="btn btn-secondary"
              >
                🏡 Back to Home
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600 hover:bg-green-100'
                }`}
              >
                🌿 Browse Books
              </button>
              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'my-bookings'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600 hover:bg-green-100'
                }`}
              >
                📋 My Bookings
              </button>
            </div>
          </div>

          {/* Filters (only for browse tab) */}
          {activeTab === 'browse' && (
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <FilterSection
                title="Filter Available Books"
                onClear={clearFilters}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      🔍 Search Books
                    </label>
                    <input
                      type="text"
                      placeholder="Search by title or author..."
                      value={filters.search || ''}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      ✍️ Filter by Author
                    </label>
                    <input
                      type="text"
                      placeholder="Enter author name..."
                      value={filters.author || ''}
                      onChange={(e) => handleAuthorFilter(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      ⭐ Filter by Rating
                    </label>
                    <select
                      value={filters.rating || ''}
                      onChange={(e) => handleRatingFilter(e.target.value)}
                      className="input"
                    >
                      <option value="">All Ratings</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                      <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                      <option value="3">⭐⭐⭐ 3 Stars</option>
                      <option value="2">⭐⭐ 2 Stars</option>
                      <option value="1">⭐ 1 Star</option>
                    </select>
                  </div>
                </div>
              </FilterSection>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {activeTab === 'browse' ? (
              <>
                {booksLoading ? (
                  <LoadingState message="🌿 Loading available books..." />
                ) : booksError ? (
                  <ErrorState 
                    message={booksError}
                    onRetry={() => fetchAvailableBooks()}
                  />
                ) : books.length === 0 ? (
                  <EmptyState 
                    icon="📚"
                    title="No books available"
                    description="Try adjusting your search criteria or check back later"
                  />
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-green-800">
                        📚 {total} Book{total !== 1 ? 's' : ''} Available for Borrowing
                      </h3>
                      <p className="text-sm text-gray-500">
                        Showing {books.length} of {total} books
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {books.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onBook={handleBookClick}
                          showBookingButton={true}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          total={total}
                          itemsPerPage={5}
                          itemsOnCurrentPage={books.length}
                          loading={booksLoading}
                          onPageChange={handlePageChange}
                          onPreviousPage={handlePreviousPage}
                          onNextPage={handleNextPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {bookingsLoading ? (
                  <LoadingState message="📋 Loading your bookings..." />
                ) : bookingsError ? (
                  <ErrorState 
                    message={bookingsError}
                    onRetry={() => fetchMyBookings()}
                  />
                ) : bookings.length === 0 ? (
                  <EmptyState 
                    icon="📋"
                    title="No bookings yet"
                    description="Start by browsing and borrowing some books!"
                    actionText="🌿 Browse Books"
                    onAction={() => setActiveTab('browse')}
                  />
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-green-800">
                        📋 Your Bookings ({bookings.length})
                      </h3>
                    </div>
                    
                    <BookingList
                      bookings={bookings}
                      loading={bookingsLoading}
                      error={bookingsError}
                      onReturn={handleReturnBooking}
                      onCancel={handleCancelBooking}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Booking Modal */}
        <Modal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          title="📚 Book This Book"
        >
          {selectedBook && (
            <BookingForm
              book={selectedBook}
              onSubmit={handleBookingSubmit}
              onCancel={() => setShowBookingModal(false)}
            />
          )}
        </Modal>
      </PageContainer>
  );
}
