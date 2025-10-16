import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useBooks } from '../hooks/useBooks';
import { 
  Header, 
  PageContainer, 
  BookCard, 
  Pagination, 
  FilterSection, 
  LoadingState, 
  ErrorState, 
  EmptyState 
} from '../components';

export default function LandingPage() {
  const router = useRouter();
  const {
    books,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    filters,
    handleSearch,
    handleAuthorFilter,
    handleRatingFilter,
    clearFilters,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    fetchBooks,
  } = useBooks();

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen nature-bg relative overflow-hidden">
      <Header 
        title="🌿 Nature Library" 
        showAuthButtons={true}
      />

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
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none bg-white/90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <FilterSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              🌿 Filter by Author
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
            <label className="block text-sm font-medium text-green-700 mb-2">
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
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn btn-secondary w-full"
            >
              🌱 Clear Filters
            </button>
          </div>
        </div>
      </FilterSection>

      {/* Books Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingState message="🌿 Growing our collection..." />
        ) : error ? (
          <ErrorState 
            message={error}
            onRetry={() => fetchBooks(true)}
          />
        ) : books.length === 0 ? (
          <EmptyState 
            icon="🌿"
            title="No books found in this forest"
            description="Try adjusting your search criteria to explore different areas"
          />
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800">
                🌿 {total} Book{total !== 1 ? 's' : ''} Found in Our Forest
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </>
        )}
      </main>
      <div className="flex justify-center space-x-4">
        
      </div>

      {/* Footer */}
      <footer className="earth-bg text-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            itemsPerPage={itemsPerPage}
            itemsOnCurrentPage={books.length}
            loading={loading}
            onPageChange={handlePageChange}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        </div>
      </footer>
    </div>
  );
}
