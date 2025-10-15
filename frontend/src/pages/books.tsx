import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Book, BookFilters, CreateBookData, UpdateBookData } from '../types';
import { useAdminAuth } from '../middleware/adminAuth';
import { bookService } from '../services/bookService';
import { useLazyBooks } from '../hooks/useLazyData';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookFilters>({
    author: '',
    rating: '',
    search: '',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState<CreateBookData>({
    title: '',
    author: '',
    description: '',
    thumbnailUrl: '',
    rating: undefined
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchBooks();
    }
  }, [filters, isAdmin, authLoading]);

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

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen nature-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">You need admin privileges to access this page</p>
          <button
            onClick={() => router.push('/home')}
            className="btn btn-primary"
          >
            🏡 Back to Home
          </button>
        </div>
      </div>
    );
  }

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks({
        author: filters.author || undefined,
        rating: filters.rating ? Number(filters.rating) : undefined,
        search: filters.search || undefined,
        page: filters.page,
        limit: filters.limit
      });
      setBooks(response.books);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load books');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      description: '',
      thumbnailUrl: '',
      rating: undefined
    });
    setShowBookModal(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description || '',
      thumbnailUrl: book.thumbnailUrl || '',
      rating: book.rating
    });
    setShowBookModal(true);
  };

  const handleDeleteBook = (bookId: string) => {
    setDeleteConfirm(bookId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await bookService.deleteBook(deleteConfirm);
      setDeleteConfirm(null);
      fetchBooks(); // Refresh the list
    } catch (err: any) {
      setError('Failed to delete book');
    }
  };

  const handleBookSubmit = async () => {
    try {
      if (editingBook) {
        // Update existing book
        await bookService.updateBook(editingBook.id, bookForm);
      } else {
        // Create new book
        await bookService.createBook(bookForm);
      }
      
      setShowBookModal(false);
      setEditingBook(null);
      setBookForm({
        title: '',
        author: '',
        description: '',
        thumbnailUrl: '',
        rating: undefined
      });
      fetchBooks(); // Refresh the list
    } catch (err: any) {
      setError(editingBook ? 'Failed to update book' : 'Failed to create book');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen nature-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 text-sm">🌿 Loading books...</p>
        </div>
      </div>
    );
  }

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
          <div className="px-6 py-4 border-b border-green-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-green-800">📚 Admin - Book Management</h1>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddBook}
                  className="btn btn-primary"
                >
                  ➕ Add Book
                </button>
                <button
                  onClick={() => router.push('/home')}
                  className="btn btn-secondary"
                >
                  🏡 Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  🌿 Filter by Author
                </label>
                <input
                  type="text"
                  placeholder="Enter author name..."
                  value={filters.author || ''}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  ⭐ Filter by Rating
                </label>
                <select
                  value={filters.rating || ''}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
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
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ author: '', rating: '', search: '', page: 1, limit: 12 })}
                  className="btn btn-secondary w-full"
                >
                  🌱 Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          <div className="p-6">
            {error ? (
              <div className="text-center py-12">
                <div className="text-amber-600 text-xl mb-4">🌧️</div>
                <p className="text-amber-600 mb-4">{error}</p>
                <button 
                  onClick={fetchBooks} 
                  className="btn btn-primary"
                >
                  🌱 Try Again
                </button>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-green-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-green-800 mb-2">No books found in the forest</h3>
                <p className="text-green-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-800">
                    📚 {pagination.total} Book{pagination.total !== 1 ? 's' : ''} Found in Our Forest
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <div key={book.id} className="card hover:shadow-lg transition-shadow">
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

                      {/* Admin Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="btn btn-secondary text-sm flex-1"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="btn btn-danger text-sm flex-1"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="btn btn-secondary disabled:opacity-50"
                      >
                        🌲 Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                page === pagination.page
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-green-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="btn btn-secondary disabled:opacity-50"
                      >
                        Next 🌿
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-green-50 border-t border-green-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700">
                📚 Showing {books.length} book{books.length !== 1 ? 's' : ''} in the forest
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/users')}
                  className="btn btn-primary"
                >
                  👥 Manage Users
                </button>
                <button
                  onClick={() => router.push('/home')}
                  className="btn btn-secondary"
                >
                  🏡 Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Form Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingBook ? '✏️ Edit Book' : '➕ Add New Book'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📖 Title *
                </label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                  placeholder="Enter book title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ✍️ Author *
                </label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                  className="input"
                  placeholder="Enter author name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 Description
                </label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  placeholder="Enter book description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🖼️ Thumbnail URL
                </label>
                <input
                  type="url"
                  value={bookForm.thumbnailUrl}
                  onChange={(e) => setBookForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  className="input"
                  placeholder="Enter image URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ⭐ Rating
                </label>
                <select
                  value={bookForm.rating || ''}
                  onChange={(e) => setBookForm(prev => ({ ...prev, rating: e.target.value ? Number(e.target.value) : undefined }))}
                  className="input"
                >
                  <option value="">No Rating</option>
                  <option value="1">⭐ 1 Star</option>
                  <option value="2">⭐⭐ 2 Stars</option>
                  <option value="3">⭐⭐⭐ 3 Stars</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowBookModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSubmit}
                disabled={!bookForm.title || !bookForm.author}
                className="btn btn-primary flex-1"
              >
                {editingBook ? '✏️ Update Book' : '➕ Add Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              🗑️ Delete Book
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this book? This action cannot be undone.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-danger flex-1"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}