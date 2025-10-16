import { apiClient } from '../lib/api/client';
import { 
  ForgotPasswordData, 
  ResetPasswordData, 
  ChangePasswordData, 
  PasswordStrength,
  AuthUser 
} from '../types';

export const authService = {
  // Get current user profile
  async getCurrentUser(): Promise<{ user: AuthUser }> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Forgot password - send reset email
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password with token
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  // Change password (authenticated user)
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },

  // Validate password strength
  async validatePassword(password: string): Promise<PasswordStrength> {
    const response = await apiClient.post('/auth/validate-password', { password });
    return response.data;
  },

  // Login
  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: AuthUser }> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  async register(userData: { name: string; email: string; password: string }): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }
};
