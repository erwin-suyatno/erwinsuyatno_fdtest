import { useUserStore } from '../stores/userStore';

export const useUsers = () => {
  const {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    filters,
    setFilters,
    goToPage,
    fetchUsers,
    reset,
  } = useUserStore();

  const handleFilterChange = (key: keyof typeof filters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchUsers(true); // Reset and fetch with new filters
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

  const handleVerificationFilter = (isVerified: string) => {
    handleFilterChange('is_verified', isVerified);
  };

  const clearFilters = () => {
    const clearedFilters = {
      is_verified: '',
      search: '',
      page: 1,
      limit: 20,
    };
    setFilters(clearedFilters);
    fetchUsers(true);
  };

  return {
    // Data
    users,
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
    handleVerificationFilter,
    clearFilters,
    fetchUsers,
    reset,
  };
};
