import {
  createBooking,
  findBookingById,
  listBookings,
  updateBookingStatus,
  returnBooking,
  deleteBooking,
  type CreateBookingInput,
  type UpdateBookingStatusInput,
  type ReturnBookingInput,
} from '../models/booking';
import { BookingStatus } from '@prisma/client';

export async function createBookingService(input: CreateBookingInput & { userId: string }) {
  return createBooking(input);
}

export async function getBookingByIdService(id: string) {
  return findBookingById(id);
}

export async function listBookingsService(params?: {
  userId?: string;
  bookId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const bookingParams = {
    ...params,
    status: params?.status ? params.status as BookingStatus : undefined,
  };
  return listBookings(bookingParams);
}

export async function updateBookingStatusService(id: string, input: UpdateBookingStatusInput) {
  return updateBookingStatus(id, input);
}

export async function returnBookingService(id: string, input: ReturnBookingInput) {
  return returnBooking(id, input);
}

export async function deleteBookingService(id: string) {
  return deleteBooking(id);
}
