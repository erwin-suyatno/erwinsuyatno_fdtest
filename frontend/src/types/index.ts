export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  thumbnailUrl?: string;
  rating?: number;
  uploadedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  description?: string;
  thumbnailUrl?: string;
  rating?: number;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  description?: string;
  thumbnailUrl?: string;
  rating?: number;
}

export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BookFilters {
  author?: string;
  rating?: number | string;
  search?: string;
  uploadedById?: string;
  page?: number;
  limit?: number;
}

export interface Booking {
  id: string;
  bookId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  borrowDate: string;
  returnDate: string;
  createdAt: string;
  updatedAt: string;
  book?: Book;
  user?: User;
}

export interface CreateBookingData {
  bookId: string;
  borrowDate: string;
  returnDate: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
}
