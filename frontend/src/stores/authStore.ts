import { create } from 'zustand';
import { authService } from '../services/authService';
import { 
  AuthUser, 
  ForgotPasswordData, 
  ResetPasswordData, 
  ChangePasswordData, 
  PasswordStrength 
} from '../types';

interface AuthState {
  // User data
  user: AuthUser | null;
  isAuthenticated: boolean;
  
  // Loading states
  loading: boolean;
  profileLoading: boolean;
  passwordLoading: boolean;
  
  // Error states
  error: string | null;
  passwordError: string | null;
  
  // Success states
  forgotPasswordSuccess: boolean;
  resetPasswordSuccess: boolean;
  changePasswordSuccess: boolean;
  
  // Password strength
  passwordStrength: PasswordStrength | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setProfileLoading: (loading: boolean) => void;
  setPasswordLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPasswordError: (error: string | null) => void;
  setForgotPasswordSuccess: (success: boolean) => void;
  setResetPasswordSuccess: (success: boolean) => void;
  setChangePasswordSuccess: (success: boolean) => void;
  setPasswordStrength: (strength: PasswordStrength | null) => void;
  
  // API actions
  fetchCurrentUser: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  validatePassword: (password: string) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  clearErrors: () => void;
  clearSuccessStates: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  loading: false,
  profileLoading: false,
  passwordLoading: false,
  error: null,
  passwordError: null,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
  changePasswordSuccess: false,
  passwordStrength: null,

  // Basic setters
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  setLoading: (loading) => set({ loading }),
  
  setProfileLoading: (profileLoading) => set({ profileLoading }),
  
  setPasswordLoading: (passwordLoading) => set({ passwordLoading }),
  
  setError: (error) => set({ error }),
  
  setPasswordError: (passwordError) => set({ passwordError }),
  
  setForgotPasswordSuccess: (forgotPasswordSuccess) => set({ forgotPasswordSuccess }),
  
  setResetPasswordSuccess: (resetPasswordSuccess) => set({ resetPasswordSuccess }),
  
  setChangePasswordSuccess: (changePasswordSuccess) => set({ changePasswordSuccess }),
  
  setPasswordStrength: (passwordStrength) => set({ passwordStrength }),

  // API actions
  fetchCurrentUser: async () => {
    const { profileLoading } = get();
    if (profileLoading) return;

    set({ profileLoading: true, error: null });

    try {
      const response = await authService.getCurrentUser();
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        profileLoading: false 
      });
    } catch (err: any) {
      console.error('Error fetching current user:', err);
      set({ 
        profileLoading: false, 
        error: err.response?.data?.message || 'Failed to load user profile',
        isAuthenticated: false,
        user: null
      });
    }
  },

  forgotPassword: async (data) => {
    set({ passwordLoading: true, error: null, forgotPasswordSuccess: false });

    try {
      await authService.forgotPassword(data);
      set({ 
        passwordLoading: false, 
        forgotPasswordSuccess: true,
        error: null
      });
    } catch (err: any) {
      console.error('Error sending forgot password email:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        config: err.config
      });
      set({ 
        passwordLoading: false, 
        error: err.response?.data?.message || 'Failed to send reset email'
      });
    }
  },

  resetPassword: async (data) => {
    set({ passwordLoading: true, error: null, resetPasswordSuccess: false });

    try {
      await authService.resetPassword(data);
      set({ 
        passwordLoading: false, 
        resetPasswordSuccess: true,
        error: null
      });
    } catch (err: any) {
      console.error('Error resetting password:', err);
      set({ 
        passwordLoading: false, 
        error: err.response?.data?.message || 'Failed to reset password'
      });
    }
  },

  changePassword: async (data) => {
    set({ passwordLoading: true, passwordError: null, changePasswordSuccess: false });

    try {
      await authService.changePassword(data);
      set({ 
        passwordLoading: false, 
        changePasswordSuccess: true,
        passwordError: null
      });
    } catch (err: any) {
      console.error('Error changing password:', err);
      set({ 
        passwordLoading: false, 
        passwordError: err.response?.data?.message || 'Failed to change password'
      });
    }
  },

  validatePassword: async (password) => {
    if (!password) {
      set({ passwordStrength: null });
      return;
    }

    try {
      const strength = await authService.validatePassword(password);
      set({ passwordStrength: strength });
    } catch (err: any) {
      console.error('Error validating password:', err);
      set({ passwordStrength: null });
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });

    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        loading: false,
        error: null
      });
    } catch (err: any) {
      console.error('Error logging in:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Login failed'
      });
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });

    try {
      await authService.register(userData);
      set({ 
        loading: false, 
        error: null
      });
    } catch (err: any) {
      console.error('Error registering:', err);
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Registration failed'
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ 
      user: null, 
      isAuthenticated: false,
      error: null,
      passwordError: null,
      forgotPasswordSuccess: false,
      resetPasswordSuccess: false,
      changePasswordSuccess: false,
      passwordStrength: null
    });
  },

  clearErrors: () => set({ 
    error: null, 
    passwordError: null 
  }),

  clearSuccessStates: () => set({ 
    forgotPasswordSuccess: false,
    resetPasswordSuccess: false,
    changePasswordSuccess: false
  }),

  reset: () => set({
    user: null,
    isAuthenticated: false,
    loading: false,
    profileLoading: false,
    passwordLoading: false,
    error: null,
    passwordError: null,
    forgotPasswordSuccess: false,
    resetPasswordSuccess: false,
    changePasswordSuccess: false,
    passwordStrength: null,
  }),
}));
