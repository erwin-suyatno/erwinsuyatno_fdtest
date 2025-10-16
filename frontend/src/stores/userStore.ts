import { create } from 'zustand';
import { User } from '../types';
import { userService } from '../services/userService';

interface UserFilters {
  is_verified?: boolean | string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UserState {
  // Data
  users: User[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  
  // Filters
  filters: UserFilters;
  
  // Actions
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { page: number; totalPages: number; total: number }) => void;
  setFilters: (filters: UserFilters) => void;
  goToPage: (page: number) => Promise<void>;
  fetchUsers: (reset?: boolean) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  users: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  total: 0,
  itemsPerPage: 5, // Show 5 users per page to trigger pagination more easily
  filters: {
    is_verified: '',
    search: '',
    page: 1,
    limit: 5, // Show 5 users per page
  },

  // Actions
  setUsers: (users) => set({ users }),
  
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
      const response = await userService.getUsers({
        is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
        search: filters.search || undefined,
        page: page,
        limit: filters.limit || 10, // Show 10 users per page
      });
      
      const users = response.users;
      const pagination = {
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      };
      
      // Update filters with new page and set data for pagination
      set({
        users: users,
        loading: false,
        error: null,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
        filters: { ...filters, page: pagination.page },
      });
      
    } catch (err: any) {
      console.error('Error fetching users:', err);
      set({ 
        loading: false, 
        error: 'Failed to load users',
      });
    }
  },

  fetchUsers: async (reset = false) => {
    const { filters } = get();
    
    if (reset) {
      set({ 
        users: [], 
        currentPage: 1, 
        totalPages: 0, 
        total: 0
      });
    }
    
    set({ loading: true, error: null });
    
    try {
      const response = await userService.getUsers({
        is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
        search: filters.search || undefined,
        page: filters.page || 1,
        limit: filters.limit || 10, // Show 10 users per page
      });
      
      const users = response.users;
      const pagination = {
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      };
      
      // Set initial data
      set({
        users: users,
        loading: false,
        error: null,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
      });
      
    } catch (err: any) {
      console.error('Error fetching users:', err);
      set({ 
        loading: false, 
        error: 'Failed to load users',
        users: [],
      });
    }
  },

  reset: () => set({
    users: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
    total: 0,
    itemsPerPage: 5,
    filters: {
      is_verified: '',
      search: '',
      page: 1,
      limit: 5,
    },
  }),
}));
