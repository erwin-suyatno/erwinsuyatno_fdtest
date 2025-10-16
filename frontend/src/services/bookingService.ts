import { apiClient } from '../lib/api/client';
import { Booking, CreateBookingData, BookingListResponse } from '../types';

export const bookingService = {
  // Get user's bookings
  async getMyBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/bookings/my?${queryParams.toString()}`);
    return response.data;
  },

  // Get all bookings (admin)
  async getAllBookings(params?: {
    status?: string;
    userId?: string;
    bookId?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.bookId) queryParams.append('bookId', params.bookId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/bookings?${queryParams.toString()}`);
    return response.data;
  },

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data.booking;
  },

  // Create a new booking
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data.booking;
  },

  // Approve booking (admin)
  async approveBooking(id: string): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/approve`);
    return response.data.booking;
  },

  // Reject booking (admin)
  async rejectBooking(id: string): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/reject`);
    return response.data.booking;
  },

  // Return book
  async returnBook(id: string): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/return`, {});
    return response.data.booking;
  },

  // Cancel booking
  async cancelBooking(id: string): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  }
};