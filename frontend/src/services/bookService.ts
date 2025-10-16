import { apiClient } from '../lib/api/client';
import { Book, CreateBookData, UpdateBookData, BookListResponse } from '../types';

export const bookService = {
  // Get all books with filters
  async getBooks(params?: {
    author?: string;
    rating?: number | string;
    search?: string;
    uploadedById?: string;
    isAvailable?: boolean;
    page?: number;
    limit?: number;
  }): Promise<BookListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.author) queryParams.append('author', params.author);
    if (params?.rating) queryParams.append('rating', params.rating.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.uploadedById) queryParams.append('uploadedById', params.uploadedById);
    if (params?.isAvailable !== undefined) queryParams.append('isAvailable', params.isAvailable.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/books?${queryParams.toString()}`);
    return response.data;
  },

  // Get a single book by ID
  async getBookById(id: string): Promise<Book> {
    const response = await apiClient.get(`/books/${id}`);
    return response.data.book;
  },

  // Create a new book
  async createBook(bookData: CreateBookData): Promise<Book> {
    const response = await apiClient.post('/books', bookData);
    return response.data.book;
  },

  // Update a book
  async updateBook(id: string, bookData: UpdateBookData): Promise<Book> {
    const response = await apiClient.put(`/books/${id}`, bookData);
    return response.data.book;
  },

  // Delete a book
  async deleteBook(id: string): Promise<void> {
    await apiClient.delete(`/books/${id}`);
  },

  // Get available books (for booking)
  async getAvailableBooks(params?: {
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
    queryParams.append('isAvailable', 'true'); // Only available books
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/public/books?${queryParams.toString()}`);
    return response.data;
  }
};
