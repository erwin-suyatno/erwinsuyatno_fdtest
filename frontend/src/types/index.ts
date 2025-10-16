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
  isAvailable?: boolean;
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
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue';
  borrowDate: string;
  returnDate: string;
  actualReturnDate?: string;
  overdueFee?: number;
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

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PublicFilters {
  author?: string;
  rating?: number | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingFilters {
  status?: string;
  userId?: string;
  bookId?: string;
  page?: number;
  limit?: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
}
