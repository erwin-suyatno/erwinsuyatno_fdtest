import { prisma } from '../utils/db';
import { z } from 'zod';

// Define types manually since Prisma client types are not being exported properly
type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE';

type Booking = {
  id: string;
  userId: string;
  bookId: string;
  status: BookingStatus;
  borrowDate: Date;
  returnDate: Date;
  actualReturnDate: Date | null;
  overdueFee: number;
  createdAt: Date;
  updatedAt: Date;
};

export const createBookingSchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
  borrowDate: z.string().min(1, 'Borrow date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
}).refine((data) => {
  const borrowDate = new Date(data.borrowDate);
  const returnDate = new Date(data.returnDate);
  return returnDate > borrowDate;
}, {
  message: 'Return date must be after borrow date',
  path: ['returnDate'],
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'OVERDUE']),
});

export const returnBookingSchema = z.object({
  actualReturnDate: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type ReturnBookingInput = z.infer<typeof returnBookingSchema>;

export type PublicBooking = Pick<Booking, 'id' | 'userId' | 'bookId' | 'status' | 'borrowDate' | 'returnDate' | 'actualReturnDate' | 'overdueFee' | 'createdAt' | 'updatedAt'> & {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  book?: {
    id: string;
    title: string;
    author: string;
    thumbnailUrl?: string;
  };
};

export async function createBooking(input: CreateBookingInput & { userId: string }): Promise<PublicBooking> {
  const data = createBookingSchema.parse(input);
  
  // Check if book exists and is available
  const book = await prisma.book.findUnique({
    where: { id: data.bookId },
    select: { id: true, isAvailable: true, title: true, author: true }
  } as any);
  
  if (!book) {
    throw new Error('Book not found');
  }
  
  if (!(book as any).isAvailable) {
    throw new Error('Book is not available for booking');
  }
  
  // Check if user already has a pending or approved booking for this book
  const existingBooking = await (prisma as any).booking.findFirst({
    where: {
      userId: input.userId,
      bookId: data.bookId,
      status: { in: ['PENDING', 'APPROVED'] }
    }
  });
  
  if (existingBooking) {
    throw new Error('You already have a pending or approved booking for this book');
  }
  
  const booking = await (prisma as any).booking.create({
    data: {
      userId: input.userId,
      bookId: data.bookId,
      borrowDate: new Date(data.borrowDate),
      returnDate: new Date(data.returnDate),
    },
    select: {
      id: true,
      userId: true,
      bookId: true,
      status: true,
      borrowDate: true,
      returnDate: true,
      actualReturnDate: true,
      overdueFee: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return booking;
}

export async function findBookingById(id: string): Promise<PublicBooking | null> {
  return (prisma as any).booking.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      bookId: true,
      status: true,
      borrowDate: true,
      returnDate: true,
      actualReturnDate: true,
      overdueFee: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          thumbnailUrl: true,
        },
      },
    },
  });
}

export async function listBookings(params?: {
  userId?: string;
  bookId?: string;
  status?: BookingStatus;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ bookings: PublicBooking[]; total: number; page: number; totalPages: number }> {
  const page = params?.page || 1;
  const limit = params?.limit || 5;
  const skip = (page - 1) * limit;

  const where = {
    ...(params?.userId ? { userId: params.userId } : {}),
    ...(params?.bookId ? { bookId: params.bookId } : {}),
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.search
      ? {
          OR: [
            { user: { name: { contains: params.search, mode: 'insensitive' as const } } },
            { user: { email: { contains: params.search, mode: 'insensitive' as const } } },
            { book: { title: { contains: params.search, mode: 'insensitive' as const } } },
            { book: { author: { contains: params.search, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  };

  const [bookings, total] = await Promise.all([
    (prisma as any).booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        userId: true,
        bookId: true,
        status: true,
        borrowDate: true,
        returnDate: true,
        actualReturnDate: true,
        overdueFee: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            thumbnailUrl: true,
          },
        },
      },
    }),
    (prisma as any).booking.count({ where }),
  ]);

  return {
    bookings,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateBookingStatus(id: string, input: UpdateBookingStatusInput): Promise<PublicBooking | null> {
  const data = updateBookingStatusSchema.parse(input);
  
  const booking = await (prisma as any).booking.findUnique({
    where: { id },
    select: { id: true, bookId: true, status: true }
  });
  
  if (!booking) {
    return null;
  }
  
  // If approving, make book unavailable
  if (data.status === 'APPROVED') {
    await prisma.book.update({
      where: { id: booking.bookId },
      data: { isAvailable: false } as any
    });
  }
  
  // If rejecting or returning, make book available again
  if (data.status === 'REJECTED' || data.status === 'RETURNED') {
    await prisma.book.update({
      where: { id: booking.bookId },
      data: { isAvailable: true } as any
    });
  }
  
  const updatedBooking = await (prisma as any).booking.update({
    where: { id },
    data: { status: data.status as BookingStatus },
    select: {
      id: true,
      userId: true,
      bookId: true,
      status: true,
      borrowDate: true,
      returnDate: true,
      actualReturnDate: true,
      overdueFee: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          thumbnailUrl: true,
        },
      },
    },
  });
  
  return updatedBooking;
}

export async function returnBooking(id: string, input: ReturnBookingInput): Promise<PublicBooking | null> {
  const data = returnBookingSchema.parse(input);
  
  const booking = await (prisma as any).booking.findUnique({
    where: { id },
    select: { id: true, bookId: true, status: true, returnDate: true }
  });
  
  if (!booking) {
    return null;
  }
  
  if (booking.status !== 'APPROVED') {
    throw new Error('Only approved bookings can be returned');
  }
  
  const actualReturnDate = data.actualReturnDate ? new Date(data.actualReturnDate) : new Date();
  const returnDate = new Date(booking.returnDate);
  
  // Calculate overdue fee if returned late
  let overdueFee = 0;
  if (actualReturnDate > returnDate) {
    const daysOverdue = Math.ceil((actualReturnDate.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24));
    overdueFee = daysOverdue * 1; // $1 per day overdue
  }
  
  const updatedBooking = await (prisma as any).booking.update({
    where: { id },
    data: {
      status: 'RETURNED',
      actualReturnDate,
      overdueFee,
    },
    select: {
      id: true,
      userId: true,
      bookId: true,
      status: true,
      borrowDate: true,
      returnDate: true,
      actualReturnDate: true,
      overdueFee: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          thumbnailUrl: true,
        },
      },
    },
  });
  
  // Make book available again
  await prisma.book.update({
    where: { id: booking.bookId },
    data: { isAvailable: true } as any
  });
  
  return updatedBooking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  try {
    const booking = await (prisma as any).booking.findUnique({
      where: { id },
      select: { id: true, bookId: true, status: true }
    });
    
    if (!booking) {
      return false;
    }
    
    // Only allow deletion of pending bookings
    if (booking.status !== 'PENDING') {
      throw new Error('Only pending bookings can be cancelled');
    }
    
    await (prisma as any).booking.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
