import { useBookStore } from '../stores/bookStore';
import { BookFilters } from '../types';

export const useBooks = () => {
  const {
    books,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    filters,
    setFilters,
    goToPage,
    fetchBooks,
    reset,
  } = useBookStore();

  const handleFilterChange = (key: keyof BookFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchBooks(true); // Reset and fetch with new filters
  };

  const handlePageChange = async (page: number) => {
    if (page !== currentPage && !loading) {
      await goToPage(page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleSearch = (searchTerm: string) => {
    handleFilterChange('search', searchTerm);
  };

  const handleAuthorFilter = (author: string) => {
    handleFilterChange('author', author);
  };

  const handleRatingFilter = (rating: string) => {
    handleFilterChange('rating', rating);
  };

  const clearFilters = () => {
    const clearedFilters: BookFilters = {
      author: '',
      rating: '',
      search: '',
      page: 1,
      limit: 5,
    };
    setFilters(clearedFilters);
    fetchBooks(true);
  };

  return {
    // Data
    books,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    
    // Filters
    filters,
    
    // Actions
    handleFilterChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleSearch,
    handleAuthorFilter,
    handleRatingFilter,
    clearFilters,
    fetchBooks,
    reset,
  };
};
