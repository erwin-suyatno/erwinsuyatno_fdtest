import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../lib/api/client';
import { Book, BookFilters } from '../types';

export default function LandingPage() {
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
  const router = useRouter();

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.author) params.append('author', filters.author);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(`/public/books?${params.toString()}`);
      setBooks(response.data.books);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
      });
    } catch (err: any) {
      setError('Failed to load books');
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

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">🌿 Nature Library</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="btn btn-secondary"
              >
                🌲 Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="btn btn-primary"
              >
                🌱 Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="forest-bg text-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">🌿 Discover Nature's Wisdom</h2>
            <p className="text-xl text-green-100 mb-8">
              Explore our collection of books that celebrate the beauty and knowledge of nature
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search for books in our forest..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none bg-white/90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white/90 backdrop-blur-sm border-b border-green-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
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
              <label className="block text-sm font-medium text-green-700 mb-2">
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
      </section>

      {/* Books Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-green-600">🌿 Growing our collection...</p>
          </div>
        ) : error ? (
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
            <div className="text-green-400 text-6xl mb-4">🌿</div>
            <h3 className="text-lg font-medium text-green-800 mb-2">No books found in this forest</h3>
            <p className="text-green-600">Try adjusting your search criteria to explore different areas</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800">
                🌿 {pagination.total} Book{pagination.total !== 1 ? 's' : ''} Found in Our Forest
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
                  
                  <div className="text-xs text-gray-500">
                    Added {new Date(book.createdAt).toLocaleDateString()}
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
      </main>

      {/* Footer */}
      <footer className="earth-bg text-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">🌿 Nature Library</h3>
            <p className="text-amber-100 mb-4">
              Discover and explore the wisdom of nature through our collection of books
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="text-green-300 hover:text-green-200 transition-colors"
              >
                🌲 Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="text-green-300 hover:text-green-200 transition-colors"
              >
                🌱 Register
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
