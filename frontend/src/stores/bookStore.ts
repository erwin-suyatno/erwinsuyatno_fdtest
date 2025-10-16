import { create } from 'zustand';
import { Book, BookFilters } from '../types';
import { apiClient } from '../lib/api/client';

interface BookState {
  // Data
  books: Book[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  
  // Filters
  filters: BookFilters;
  
  // Actions
  setBooks: (books: Book[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { page: number; totalPages: number; total: number }) => void;
  setFilters: (filters: BookFilters) => void;
  goToPage: (page: number) => Promise<void>;
  fetchBooks: (reset?: boolean) => Promise<void>;
  fetchAvailableBooks: (reset?: boolean) => Promise<void>;
  reset: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  // Initial state
  books: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  total: 0,
  itemsPerPage: 5, // Show 5 books per page to trigger pagination more easily
  filters: {
    author: '',
    rating: '',
    search: '',
    page: 1,
    limit: 5, // Show 5 books per page
  },

  // Actions
  setBooks: (books) => set({ books }),
  
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
      
      if (filters.author) params.append('author', filters.author);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.search) params.append('search', filters.search);
      params.append('page', page.toString());
      params.append('limit', (filters.limit || 5).toString());
      
      const url = `/public/books?${params.toString()}`;
      const response = await apiClient.get(url);
      
      const books = response.data.books;
      const pagination = {
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total,
      };
      
      // Update filters with new page and set data for pagination
      set({
        books: books,
        loading: false,
        error: null,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
        filters: { ...filters, page: pagination.page },
      });
      
    } catch (err: any) {
      console.error('Error fetching books:', err);
      set({ 
        loading: false, 
        error: 'Failed to load books',
      });
    }
  },

  fetchBooks: async (reset = false) => {
    const { filters } = get();
    
    if (reset) {
      set({ 
        books: [], 
        currentPage: 1, 
        totalPages: 0, 
        total: 0
      });
    }
    
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      
      if (filters.author) params.append('author', filters.author);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.search) params.append('search', filters.search);
      params.append('page', (filters.page || 1).toString());
      params.append('limit', (filters.limit || 5).toString());
      
      const url = `/public/books?${params.toString()}`;
      const response = await apiClient.get(url);
      
      const books = response.data.books;
      const pagination = {
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total,
      };
      
      // Set initial data
      set({
        books: books,
        loading: false,
        error: null,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
      });
      
    } catch (err: any) {
      console.error('Error fetching books:', err);
      set({ 
        loading: false, 
        error: 'Failed to load books',
        books: [],
      });
    }
  },

  fetchAvailableBooks: async (reset = false) => {
    const { filters } = get();
    
    if (reset) {
      set({ 
        books: [], 
        currentPage: 1, 
        totalPages: 0, 
        total: 0
      });
    }
    
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      
      if (filters.author) params.append('author', filters.author);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.search) params.append('search', filters.search);
      params.append('isAvailable', 'true'); // Only fetch available books
      params.append('page', (filters.page || 1).toString());
      params.append('limit', (filters.limit || 5).toString());
      
      const url = `/public/books?${params.toString()}`;
      const response = await apiClient.get(url);
      
      const books = response.data.books;
      const pagination = {
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total,
      };
      
      set({
        books: books,
        loading: false,
        error: null,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
      });
      
    } catch (err: any) {
      console.error('Error fetching available books:', err);
      set({ 
        loading: false, 
        error: 'Failed to load available books',
        books: [],
      });
    }
  },

  reset: () => set({
    books: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
    total: 0,
    itemsPerPage: 5,
    filters: {
      author: '',
      rating: '',
      search: '',
      page: 1,
      limit: 5,
    },
  }),
}));
