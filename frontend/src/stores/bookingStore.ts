import { create } from 'zustand';
import { Booking, BookingFilters } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingState {
  // Data
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  
  // Filters
  filters: BookingFilters;
  
  // Actions
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { page: number; totalPages: number; total: number }) => void;
  setFilters: (filters: BookingFilters) => void;
  goToPage: (page: number) => Promise<void>;
  fetchMyBookings: (reset?: boolean) => Promise<void>;
  fetchAllBookings: (reset?: boolean) => Promise<void>;
  createBooking: (bookingData: { bookId: string; borrowDate: string; returnDate: string }) => Promise<void>;
  approveBooking: (id: string) => Promise<void>;
  rejectBooking: (id: string) => Promise<void>;
  returnBooking: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state
  bookings: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  total: 0,
  itemsPerPage: 10,
  filters: {
    status: '',
    page: 1,
    limit: 10,
  },

  // Actions
  setBookings: (bookings) => set({ bookings }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setPagination: (pagination) => set({
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    total: pagination.total,
  }),
  
  setFilters: (filters) => set({ filters }),

  goToPage: async (page: number) => {
    const { filters, totalPages, loading } = get();
    
    if (page < 1 || page > totalPages || loading) return;
    
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.bookId) params.append('bookId', filters.bookId);
      params.append('page', page.toString());
      params.append('limit', (filters.limit || 10).toString());
      
      const response = await bookingService.getAllBookings({
        status: filters.status,
        userId: filters.userId,
        bookId: filters.bookId,
        page,
        limit: filters.limit || 10,
      });
      
      const bookings = response.bookings;
      const pagination = {
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      };
      
      set({
        bookings: bookings,
        loading: false,
        error: null,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
        filters: { ...filters, page: pagination.page },
      });
      
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      set({ 
        loading: false, 
        error: 'Failed to load bookings',
      });
    }
  },

  fetchMyBookings: async (reset = false) => {
    const { filters } = get();
    
    if (reset) {
      set({ 
        bookings: [], 
        currentPage: 1, 
        totalPages: 0, 
        total: 0
      });
    }
    
    set({ loading: true, error: null });
    
    try {
      const response = await bookingService.getMyBookings({
        status: filters.status,
        page: filters.page || 1,
        limit: filters.limit || 10,
      });
      
      const bookings = response.bookings;
      const pagination = {
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      };
      
      set({
        bookings: bookings,
        loading: false,
        error: null,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
      });
      
    } catch (err: any) {
      console.error('Error fetching my bookings:', err);
      set({ 
        loading: false, 
        error: 'Failed to load bookings',
        bookings: [],
      });
    }
  },

  fetchAllBookings: async (reset = false) => {
    const { filters } = get();
    
    if (reset) {
      set({ 
        bookings: [], 
        currentPage: 1, 
        totalPages: 0, 
        total: 0
      });
    }
    
    set({ loading: true, error: null });
    
    try {
      const response = await bookingService.getAllBookings({
        status: filters.status,
        userId: filters.userId,
        bookId: filters.bookId,
        page: filters.page || 1,
        limit: filters.limit || 10,
      });
      
      const bookings = response.bookings;
      const pagination = {
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      };
      
      set({
        bookings: bookings,
        loading: false,
        error: null,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
      });
      
    } catch (err: any) {
      console.error('Error fetching all bookings:', err);
      set({ 
        loading: false, 
        error: 'Failed to load bookings',
        bookings: [],
      });
    }
  },

  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    
    try {
      await bookingService.createBooking(bookingData);
      // Refresh the bookings list
      await get().fetchMyBookings(true);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Failed to create booking',
      });
    }
  },

  approveBooking: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await bookingService.approveBooking(id);
      // Refresh the bookings list
      await get().fetchAllBookings();
    } catch (err: any) {
      console.error('Error approving booking:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Failed to approve booking',
      });
    }
  },

  rejectBooking: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await bookingService.rejectBooking(id);
      // Refresh the bookings list
      await get().fetchAllBookings();
    } catch (err: any) {
      console.error('Error rejecting booking:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Failed to reject booking',
      });
    }
  },

  returnBooking: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await bookingService.returnBook(id);
      // Refresh the bookings list
      await get().fetchMyBookings();
    } catch (err: any) {
      console.error('Error returning booking:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Failed to return book',
      });
    }
  },

  cancelBooking: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await bookingService.cancelBooking(id);
      // Refresh the bookings list
      await get().fetchMyBookings();
    } catch (err: any) {
      console.error('Error canceling booking:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Failed to cancel booking',
      });
    }
  },

  reset: () => set({
    bookings: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
    total: 0,
    itemsPerPage: 10,
    filters: {
      status: '',
      page: 1,
      limit: 10,
    },
  }),
}));
