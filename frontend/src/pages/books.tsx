import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Book, CreateBookData, UpdateBookData } from '../types';
import { useAdminAuth } from '../middleware/adminAuth';
import { bookService } from '../services/bookService';
import { useBooks } from '../hooks/useBooks';
import { 
  PageContainer, 
  BookCard, 
  Pagination, 
  FilterSection, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  Modal,
  BookForm,
  ConfirmDialog
} from '../components';

export default function BooksPage() {
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
  
  const {
    books,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    filters,
    handleAuthorFilter,
    handleRatingFilter,
    clearFilters,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    fetchBooks,
  } = useBooks();

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchBooks();
    }
  }, [isAdmin, authLoading]);

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
      console.error('Failed to delete book:', err);
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
      console.error(editingBook ? 'Failed to update book' : 'Failed to create book:', err);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="🌿 Loading books..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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
          <FilterSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
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
          <div className="p-6">
            {error ? (
              <ErrorState 
                message={error}
                onRetry={() => fetchBooks(true)}
              />
            ) : books.length === 0 ? (
              <EmptyState 
                icon="📚"
                title="No books found in the forest"
                description="Try adjusting your search criteria"
              />
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-800">
                    📚 {total} Book{total !== 1 ? 's' : ''} Found in Our Forest
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      showActions={true}
                      onEdit={handleEditBook}
                      onDelete={handleDeleteBook}
                    />
                  ))}
                </div>

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
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-green-50 border-t border-green-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700">
                📚 Showing {books.length} of {total} book{total !== 1 ? 's' : ''} in the forest
              </p>
            </div>
          </div>
        </div>

        {/* Book Form Modal */}
        <Modal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          title={editingBook ? '✏️ Edit Book' : '➕ Add New Book'}
        >
          {editingBook && (
            <BookForm
              book={editingBook}
              onSubmit={handleBookSubmit}
              onCancel={() => setShowBookModal(false)}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="🗑️ Delete Book"
          message="Are you sure you want to delete this book? This action cannot be undone."
          confirmText="🗑️ Delete"
          cancelText="Cancel"
          confirmButtonClass="btn btn-danger"
        />
      </PageContainer>
  );
}