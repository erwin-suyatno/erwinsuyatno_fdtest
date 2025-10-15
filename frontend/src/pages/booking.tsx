import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Book, Booking, CreateBookingData } from '../types';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../middleware/auth';

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
    <div className="min-h-screen nature-bg relative overflow-hidden">
      {/* Background Nature Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-6xl animate-pulse">🌲</div>
        <div className="absolute top-20 right-20 text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌿</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
        <div className="absolute bottom-10 right-10 text-3xl animate-pulse" style={{ animationDelay: '1.5s' }}>🌱</div>
        <div className="absolute top-1/2 left-5 text-4xl animate-pulse" style={{ animationDelay: '2s' }}>🌳</div>
        <div className="absolute top-1/3 right-5 text-3xl animate-pulse" style={{ animationDelay: '2.5s' }}>🌾</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
              <div className="text-center py-12">
                <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-green-700 text-sm">🌿 Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-amber-600 text-xl mb-4">🌧️</div>
                <p className="text-amber-600 mb-4">{error}</p>
                <button 
                  onClick={() => activeTab === 'browse' ? fetchAvailableBooks() : fetchMyBookings()} 
                  className="btn btn-primary"
                >
                  🌱 Try Again
                </button>
              </div>
            ) : activeTab === 'browse' ? (
              <>
                {books.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-green-400 text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">No books available</h3>
                    <p className="text-green-600">Try searching for different books</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-green-800">
                        📚 {books.length} Book{books.length !== 1 ? 's' : ''} Available for Borrowing
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {books.map((book) => (
                        <div key={book.id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleBookClick(book)}>
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
                          
                          <div className="text-xs text-gray-500 mb-2">
                            Added {new Date(book.createdAt).toLocaleDateString()}
                          </div>
                          
                          <button className="btn btn-primary w-full">
                            📖 Borrow This Book
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-green-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">No bookings yet</h3>
                    <p className="text-green-600">Start by browsing and borrowing some books!</p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="btn btn-primary mt-4"
                    >
                      🌿 Browse Books
                    </button>
                  </div>
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
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📖 Borrow "{selectedBook.title}"
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 Borrow Date
                </label>
                <input
                  type="date"
                  value={bookingForm.borrowDate}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, borrowDate: e.target.value }))}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 Return Date
                </label>
                <input
                  type="date"
                  value={bookingForm.returnDate}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, returnDate: e.target.value }))}
                  className="input"
                  min={bookingForm.borrowDate}
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={!bookingForm.borrowDate || !bookingForm.returnDate}
                className="btn btn-primary flex-1"
              >
                📖 Borrow Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
