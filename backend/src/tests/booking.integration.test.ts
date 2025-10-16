import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../utils/db';
import jwt from 'jsonwebtoken';

describe('Booking Integration Tests', () => {
  let testUser: any;
  let testAdmin: any;
  let testBook: any;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        isVerified: true,
        role: 'USER',
      },
    });

    // Create test admin
    testAdmin = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'admin@example.com',
        passwordHash: 'hashedpassword',
        isVerified: true,
        role: 'ADMIN',
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

    // Generate JWT tokens
    userToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { id: testAdmin.id, email: testAdmin.email, role: testAdmin.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.booking.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.userId).toBe(testUser.id);
      expect(response.body.booking.bookId).toBe(testBook.id);
      expect(response.body.booking.status).toBe('PENDING');
    });

    it('should reject booking if book is not available', async () => {
      // Make book unavailable
      await prisma.book.update({
        where: { id: testBook.id },
        data: { isAvailable: false },
      });

      const bookingData = {
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('Book is not available for booking');
    });

    it('should reject booking without authentication', async () => {
      const bookingData = {
        bookId: testBook.id,
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      };

      await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(401);
    });

    it('should reject invalid booking data', async () => {
      const invalidData = {
        bookId: 'invalid-uuid',
        borrowDate: '2024-01-01T00:00:00Z',
        returnDate: '2024-01-15T00:00:00Z',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Invalid book ID');
    });
  });

  describe('GET /api/bookings/my', () => {
    beforeEach(async () => {
      // Create test bookings
      await prisma.booking.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          status: 'PENDING',
          borrowDate: new Date('2024-01-01'),
          returnDate: new Date('2024-01-15'),
        },
      });
    });

    it('should get user bookings with pagination', async () => {
      const response = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(1);
    });

    it('should filter user bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings/my?status=PENDING')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.bookings[0].status).toBe('PENDING');
    });

    it('should reject request without authentication', async () => {
      await request(app)
        .get('/api/bookings/my')
        .expect(401);
    });
  });

  describe('GET /api/bookings', () => {
    beforeEach(async () => {
      // Create test bookings
      await prisma.booking.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          status: 'PENDING',
          borrowDate: new Date('2024-01-01'),
          returnDate: new Date('2024-01-15'),
        },
      });
    });

    it('should get all bookings (admin only)', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.total).toBe(1);
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.bookings[0].status).toBe('PENDING');
    });

    it('should filter bookings by user', async () => {
      const response = await request(app)
        .get(`/api/bookings?userId=${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.bookings[0].userId).toBe(testUser.id);
    });

    it('should reject request without authentication', async () => {
      await request(app)
        .get('/api/bookings')
        .expect(401);
    });
  });

  describe('GET /api/bookings/:id', () => {
    let testBooking: any;

    beforeEach(async () => {
      testBooking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          status: 'PENDING',
          borrowDate: new Date('2024-01-01'),
          returnDate: new Date('2024-01-15'),
        },
      });
    });

    it('should get booking by ID', async () => {
      const response = await request(app)
        .get(`/api/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.id).toBe(testBooking.id);
    });

    it('should return 404 for non-existent booking', async () => {
      await request(app)
        .get('/api/bookings/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/bookings/:id/approve', () => {
    let testBooking: any;

    beforeEach(async () => {
      testBooking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          status: 'PENDING',
          borrowDate: new Date('2024-01-01'),
          returnDate: new Date('2024-01-15'),
        },
      });
    });

    it('should approve booking', async () => {
      const response = await request(app)
        .put(`/api/bookings/${testBooking.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.booking.status).toBe('APPROVED');
    });

    it('should make book unavailable when approved', async () => {
      await request(app)
        .put(`/api/bookings/${testBooking.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const book = await prisma.book.findUnique({ where: { id: testBook.id } });
      expect(book?.isAvailable).toBe(false);
    });

    it('should reject request without admin token', async () => {
      await request(app)
        .put(`/api/bookings/${testBooking.id}/approve`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/bookings/:id/reject', () => {
    let testBooking: any;

    beforeEach(async () => {
      testBooking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          status: 'PENDING',
          borrowDate: new Date('2024-01-01'),
          returnDate: new Date('2024-01-15'),
        },
      });
    });

    it('should reject booking', async () => {
      const response = await request(app)
        .put(`/api/bookings/${testBooking.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.booking.status).toBe('REJECTED');
    });

    it('should make book available when rejected', async () => {
      await request(app)
        .put(`/api/bookings/${testBooking.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const book = await prisma.book.findUnique({ where: { id: testBook.id } });
      expect(book?.isAvailable).toBe(true);
    });
  });

  describe('PUT /api/bookings/:id/return', () => {
    let testBooking: any;

    beforeEach(async () => {
      testBooking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          status: 'APPROVED',
          borrowDate: new Date('2024-01-01'),
          returnDate: new Date('2024-01-15'),
        },
      });
    });

    it('should mark booking as returned', async () => {
      const response = await request(app)
        .put(`/api/bookings/${testBooking.id}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ actualReturnDate: '2024-01-20T00:00:00Z' })
        .expect(200);

      expect(response.body.booking.status).toBe('RETURNED');
      expect(response.body.booking.actualReturnDate).toBeDefined();
    });

    it('should calculate overdue fee for late return', async () => {
      const response = await request(app)
        .put(`/api/bookings/${testBooking.id}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ actualReturnDate: '2024-01-20T00:00:00Z' })
        .expect(200);

      expect(response.body.booking.overdueFee).toBe(5); // 5 days overdue
    });

    it('should reject return of non-approved booking', async () => {
      // Create pending booking
      const pendingBooking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          status: 'PENDING',
          borrowDate: new Date('2024-01-01'),
          returnDate: new Date('2024-01-15'),
        },
      });

      const response = await request(app)
        .put(`/api/bookings/${pendingBooking.id}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error).toBe('Only approved bookings can be returned');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    let testBooking: any;

    beforeEach(async () => {
      testBooking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          status: 'PENDING',
          borrowDate: new Date('2024-01-01'),
          returnDate: new Date('2024-01-15'),
        },
      });
    });

    it('should cancel pending booking', async () => {
      await request(app)
        .delete(`/api/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      const booking = await prisma.booking.findUnique({ where: { id: testBooking.id } });
      expect(booking).toBeNull();
    });

    it('should not cancel approved booking', async () => {
      // Approve the booking first
      await prisma.booking.update({
        where: { id: testBooking.id },
        data: { status: 'APPROVED' },
      });

      const response = await request(app)
        .delete(`/api/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error).toContain('cannot be cancelled');
    });
  });
});
