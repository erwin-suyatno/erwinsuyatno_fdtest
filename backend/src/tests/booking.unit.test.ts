import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../utils/db';
import {
  createBooking,
  findBookingById,
  listBookings,
  updateBookingStatus,
  returnBooking,
  deleteBooking,
  createBookingSchema,
  updateBookingStatusSchema,
  returnBookingSchema,
} from '../models/booking';

describe('Booking Model Unit Tests', () => {
  let testUser: any;
  let testBook: any;

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        isVerified: true,
      },
    });

    // Create test book
    testBook = await prisma.book.create({
      data: {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        rating: 5,
        isAvailable: true,
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.booking.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('createBookingSchema validation', () => {
    it('should validate correct booking data', () => {
      const validData = {
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      };

      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid book ID', () => {
      const invalidData = {
        bookId: 'invalid-uuid',
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject return date before borrow date', () => {
      const invalidData = {
        bookId: testBook.id,
        borrowDate: '2024-01-15T00:00:00Z',
        returnDate: '2024-01-01T00:00:00Z',
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      };

      const booking = await createBooking(bookingData);

      expect(booking).toBeDefined();
      expect(booking.userId).toBe(testUser.id);
      expect(booking.bookId).toBe(testBook.id);
      expect(booking.status).toBe('PENDING');
    });

    it('should throw error if book is not available', async () => {
      // Make book unavailable
      await prisma.book.update({
        where: { id: testBook.id },
        data: { isAvailable: false },
      });

      const bookingData = {
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      };

      await expect(createBooking(bookingData)).rejects.toThrow('Book is not available for booking');
    });

    it('should throw error if user already has pending booking for same book', async () => {
      // Create first booking
      await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      // Try to create second booking for same book
      const bookingData = {
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-02-01T00:00:00Z',
        returnDate: '2024-02-15T00:00:00Z',
      };

      await expect(createBooking(bookingData)).rejects.toThrow('You already have a pending or approved booking for this book');
    });
  });

  describe('findBookingById', () => {
    it('should find booking by ID', async () => {
      const booking = await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      const foundBooking = await findBookingById(booking.id);
      expect(foundBooking).toBeDefined();
      expect(foundBooking?.id).toBe(booking.id);
    });

    it('should return null for non-existent booking', async () => {
      const foundBooking = await findBookingById('non-existent-id');
      expect(foundBooking).toBeNull();
    });
  });

  describe('listBookings', () => {
    beforeEach(async () => {
      // Create multiple bookings
      await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      const anotherUser = await prisma.user.create({
        data: {
          name: 'Another User',
          email: 'another@example.com',
          passwordHash: 'hashedpassword',
          isVerified: true,
        },
      });

      const anotherBook = await prisma.book.create({
        data: {
          title: 'Another Book',
          author: 'Another Author',
          description: 'Another Description',
          rating: 4,
          isAvailable: true,
        },
      });

      await createBooking({
        userId: anotherUser.id,
        bookId: anotherBook.id,
        borrowDate: '2024-02-01T00:00:00Z',
        returnDate: '2024-02-15T00:00:00Z',
      });
    });

    it('should list all bookings with pagination', async () => {
      const result = await listBookings({ page: 1, limit: 5 });
      
      expect(result.bookings).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter bookings by user', async () => {
      const result = await listBookings({ userId: testUser.id });
      
      expect(result.bookings).toHaveLength(1);
      expect(result.bookings[0].userId).toBe(testUser.id);
    });

    it('should filter bookings by status', async () => {
      const result = await listBookings({ status: 'PENDING' });
      
      expect(result.bookings).toHaveLength(2);
      expect(result.bookings.every(booking => booking.status === 'PENDING')).toBe(true);
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status to approved', async () => {
      const booking = await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      const updatedBooking = await updateBookingStatus(booking.id, { status: 'APPROVED' });
      
      expect(updatedBooking).toBeDefined();
      expect(updatedBooking?.status).toBe('APPROVED');
    });

    it('should make book unavailable when approved', async () => {
      const booking = await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      await updateBookingStatus(booking.id, { status: 'APPROVED' });
      
      const book = await prisma.book.findUnique({ where: { id: testBook.id } });
      expect(book?.isAvailable).toBe(false);
    });
  });

  describe('returnBooking', () => {
    it('should mark booking as returned', async () => {
      const booking = await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      // First approve the booking
      await updateBookingStatus(booking.id, { status: 'APPROVED' });

      const returnedBooking = await returnBooking(booking.id, {});
      
      expect(returnedBooking).toBeDefined();
      expect(returnedBooking?.status).toBe('RETURNED');
      expect(returnedBooking?.actualReturnDate).toBeDefined();
    });

    it('should calculate overdue fee for late return', async () => {
      const booking = await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      // First approve the booking
      await updateBookingStatus(booking.id, { status: 'APPROVED' });

      // Return 5 days late
      const lateReturnDate = new Date('2024-01-20T00:00:00Z');
      const returnedBooking = await returnBooking(booking.id, {
        actualReturnDate: lateReturnDate.toISOString(),
      });
      
      expect(returnedBooking?.overdueFee).toBe(5); // 5 days * $1 per day
    });

    it('should throw error if trying to return non-approved booking', async () => {
      const booking = await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      await expect(returnBooking(booking.id, {})).rejects.toThrow('Only approved bookings can be returned');
    });
  });

  describe('deleteBooking', () => {
    it('should delete pending booking', async () => {
      const booking = await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      const success = await deleteBooking(booking.id);
      expect(success).toBe(true);

      const foundBooking = await findBookingById(booking.id);
      expect(foundBooking).toBeNull();
    });

    it('should not delete approved booking', async () => {
      const booking = await createBooking({
        userId: testUser.id,
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      });

      // Approve the booking
      await updateBookingStatus(booking.id, { status: 'APPROVED' });

      const success = await deleteBooking(booking.id);
      expect(success).toBe(false);
    });
  });

  describe('Schema validation', () => {
    it('should validate updateBookingStatusSchema', () => {
      const validData = { status: 'APPROVED' };
      const result = updateBookingStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate returnBookingSchema', () => {
      const validData = { actualReturnDate: '2024-01-20T00:00:00Z' };
      const result = returnBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
