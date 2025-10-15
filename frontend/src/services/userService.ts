import { apiClient } from '../lib/api/client';
import { User } from '../types';

export interface UpdateUserData {
  name?: string;
  email?: string;
  isVerified?: boolean;
  role?: 'ADMIN' | 'USER' | 'MEMBER';
}

export const userService = {
  // Get all users with filters
  async getUsers(params?: {
    is_verified?: boolean | string;
    search?: string;
  }): Promise<{ users: User[] }> {
    const queryParams = new URLSearchParams();
    if (params?.is_verified !== undefined) {
      queryParams.append('is_verified', params.is_verified.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const response = await apiClient.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  // Update a user
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data.user;
  }
};
