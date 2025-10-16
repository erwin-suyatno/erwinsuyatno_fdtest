import { prisma } from '../utils/db';
import { signJwt } from '../utils/jwt';
import { randomUUID } from 'crypto';

export class TestDataFactory {
  private static counter = 0;

  static getUniqueEmail(prefix: string = 'test'): string {
    this.counter++;
    const uuid = randomUUID().substring(0, 8);
    return `${prefix}-${Date.now()}-${uuid}-${this.counter}@example.com`;
  }

  static async createTestUser(overrides: any = {}) {
    const email = this.getUniqueEmail();
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email,
        passwordHash: 'hashedpassword',
        isVerified: true,
        role: 'USER',
        ...overrides,
      },
    });
    return user;
  }

  static async createTestAdmin(overrides: any = {}) {
    const email = this.getUniqueEmail('admin');
    const admin = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email,
        passwordHash: 'hashedpassword',
        isVerified: true,
        role: 'ADMIN',
        ...overrides,
      },
    });
    return admin;
  }

  static async createTestBook(uploadedById: string, overrides: any = {}) {
    const book = await prisma.book.create({
      data: {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        rating: 5,
        isAvailable: true,
        uploadedById,
        ...overrides,
      } as any,
    });
    return book;
  }

  static async createTestBooking(userId: string, bookId: string, overrides: any = {}) {
    const booking = await prisma.booking.create({
      data: {
        userId,
        bookId,
        status: 'PENDING',
        borrowDate: new Date('2024-01-01'),
        returnDate: new Date('2024-01-15'),
        ...overrides,
      } as any,
    });
    return booking;
  }

  static async generateAuthToken(user: any) {
    return await signJwt({
      userId: user.id,
      email: user.email,
      role: user.role
    });
  }

  static async cleanupTestData() {
    // Clean up in proper order to avoid foreign key constraints
    await prisma.booking.deleteMany();
    await prisma.book.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.emailVerification.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@example.com'
        }
      }
    });
  }
}
