import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Book, Booking, CreateBookingData } from '../types';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../middleware/auth';
import { 
  PageContainer, 
  BookCard, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  Modal,
  BookingForm
} from '../components';

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-bookings'>('browse');
  const [books, setBooks] = useState<Book[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    borrowDate: '',
    returnDate: ''
  });
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      if (activeTab === 'browse') {
        fetchAvailableBooks();
      } else {
        fetchMyBookings();
      }
    }
  }, [activeTab, user, authLoading]);

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

  const fetchAvailableBooks = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAvailableBooks();
      setBooks(response.books);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load available books');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setBookings(response.bookings);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load your bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAvailableBooks();
      return;
    }

    try {
      setLoading(true);
      const response = await bookingService.searchAvailableBooks(searchQuery);
      setBooks(response.books);
    } catch (err: any) {
      setError('Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowBookingModal(true);
    // Set default dates (today and 7 days from now)
    const today = new Date().toISOString().split('T')[0];
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 7);
    setBookingForm({
      borrowDate: today,
      returnDate: returnDate.toISOString().split('T')[0]
    });
  };

  const handleBookingSubmit = async () => {
    if (!selectedBook) return;

    try {
      setLoading(true);
      await bookingService.createBooking({
        bookId: selectedBook.id,
        borrowDate: bookingForm.borrowDate,
        returnDate: bookingForm.returnDate
      });
      
      setShowBookingModal(false);
      setSelectedBook(null);
      setBookingForm({ borrowDate: '', returnDate: '' });
      
      // Refresh the current tab
      if (activeTab === 'browse') {
        fetchAvailableBooks();
      } else {
        fetchMyBookings();
      }
    } catch (err: any) {
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingService.cancelBooking(bookingId);
      fetchMyBookings();
    } catch (err: any) {
      setError('Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'returned': return '📚';
      default: return '❓';
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

          {/* Search (only for browse tab) */}
          {activeTab === 'browse' && (
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="🔍 Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 input"
                />
                <button
                  onClick={handleSearch}
                  className="btn btn-primary"
                >
                  🔍 Search
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState 
                message={error}
                onRetry={() => activeTab === 'browse' ? fetchAvailableBooks() : fetchMyBookings()}
              />
            ) : activeTab === 'browse' ? (
              <>
                {books.length === 0 ? (
                  <EmptyState 
                    icon="📚"
                    title="No books available"
                    description="Try searching for different books"
                  />
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-green-800">
                        📚 {books.length} Book{books.length !== 1 ? 's' : ''} Available for Borrowing
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {books.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onBorrow={handleBookClick}
                          actionText="📖 Borrow This Book"
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {bookings.length === 0 ? (
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
                    
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="card">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {booking.book?.title || 'Unknown Book'}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                by {booking.book?.author || 'Unknown Author'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>📅 Borrow: {new Date(booking.borrowDate).toLocaleDateString()}</span>
                                <span>📅 Return: {new Date(booking.returnDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {getStatusEmoji(booking.status)} {booking.status.toUpperCase()}
                              </span>
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="btn btn-danger text-sm"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
          title={`📖 Borrow "${selectedBook?.title || ''}"`}
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
