import { useBookingStore } from '../stores/bookingStore';
import { BookingFilters } from '../types';

export const useBookings = () => {
  const {
    bookings,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    itemsPerPage,
    filters,
    setFilters,
    goToPage,
    fetchMyBookings,
    fetchAllBookings,
    createBooking,
    approveBooking,
    rejectBooking,
    returnBooking,
    cancelBooking,
    reset,
  } = useBookingStore();

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    fetchMyBookings(true); // Reset and fetch with new filters
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

  const handleStatusFilter = (status: string) => {
    handleFilterChange('status', status);
  };

  const clearFilters = () => {
    const clearedFilters: BookingFilters = {
      status: '',
      page: 1,
      limit: 10,
    };
    setFilters(clearedFilters);
    fetchMyBookings(true);
  };

  return {
    // Data
    bookings,
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
    handleStatusFilter,
    clearFilters,
    fetchMyBookings,
    fetchAllBookings,
    createBooking,
    approveBooking,
    rejectBooking,
    returnBooking,
    cancelBooking,
    reset,
  };
};
