import { apiClient } from '../lib/api/client';
import { Booking, CreateBookingData, BookingListResponse } from '../types';

export const bookingService = {
  // Get all bookings for current user
  async getMyBookings(page: number = 1, limit: number = 10): Promise<BookingListResponse> {
    const response = await apiClient.get(`/bookings/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create a new booking
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<void> {
    await apiClient.delete(`/bookings/${bookingId}`);
  },

  // Get available books for booking
  async getAvailableBooks(page: number = 1, limit: number = 12): Promise<{ books: any[], total: number, page: number, totalPages: number }> {
    const response = await apiClient.get(`/books/available?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search available books
  async searchAvailableBooks(query: string, page: number = 1, limit: number = 12): Promise<{ books: any[], total: number, page: number, totalPages: number }> {
    const response = await apiClient.get(`/books/available/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  }
};
