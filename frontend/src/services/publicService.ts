import { apiClient } from '../lib/api/client';
import { Book, BookListResponse } from '../types';

export const publicService = {
  // Get all public books with filters
  async getPublicBooks(params?: {
    author?: string;
    rating?: number | string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BookListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.author) queryParams.append('author', params.author);
    if (params?.rating) queryParams.append('rating', params.rating.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/public/books?${queryParams.toString()}`);
    return response.data;
  },

  // Get a single public book by ID
  async getPublicBookById(id: string): Promise<Book> {
    const response = await apiClient.get(`/public/books/${id}`);
    return response.data.book;
  }
};
