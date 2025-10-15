import { prisma } from '../utils/db';
import { z } from 'zod';
import type { Book } from '@prisma/client';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5).optional(),
  uploadedById: z.string().uuid().optional(),
});

export const updateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  author: z.string().min(1, 'Author is required').optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5).optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;

export type PublicBook = Pick<Book, 'id' | 'title' | 'author' | 'description' | 'thumbnailUrl' | 'rating' | 'uploadedById' | 'createdAt' | 'updatedAt'>;

export async function createBook(input: CreateBookInput): Promise<PublicBook> {
  const data = createBookSchema.parse(input);
  const book = await prisma.book.create({
    data: {
      title: data.title,
      author: data.author,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      rating: data.rating,
      uploadedById: data.uploadedById,
    },
    select: { 
      id: true, 
      title: true, 
      author: true, 
      description: true, 
      thumbnailUrl: true, 
      rating: true, 
      uploadedById: true, 
      createdAt: true, 
      updatedAt: true 
    },
  });
  return book;
}

export async function findBookById(id: string): Promise<PublicBook | null> {
  return prisma.book.findUnique({ 
    where: { id }, 
    select: { 
      id: true, 
      title: true, 
      author: true, 
      description: true, 
      thumbnailUrl: true, 
      rating: true, 
      uploadedById: true, 
      createdAt: true, 
      updatedAt: true 
    } 
  });
}

export async function listBooks(params?: { 
  author?: string; 
  rating?: number; 
  search?: string; 
  uploadedById?: string;
  page?: number;
  limit?: number;
}): Promise<{ books: PublicBook[]; total: number; page: number; totalPages: number }> {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    ...(params?.author ? { author: { contains: params.author, mode: 'insensitive' } } : {}),
    ...(params?.rating ? { rating: params.rating } : {}),
    ...(params?.uploadedById ? { uploadedById: params.uploadedById } : {}),
    ...(params?.search
      ? {
          OR: [
            { title: { contains: params.search, mode: 'insensitive' } },
            { author: { contains: params.search, mode: 'insensitive' } },
            { description: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: { 
        id: true, 
        title: true, 
        author: true, 
        description: true, 
        thumbnailUrl: true, 
        rating: true, 
        uploadedById: true, 
        createdAt: true, 
        updatedAt: true 
      },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateBook(id: string, input: UpdateBookInput): Promise<PublicBook | null> {
  const data = updateBookSchema.parse(input);
  
  const book = await prisma.book.update({
    where: { id },
    data,
    select: { 
      id: true, 
      title: true, 
      author: true, 
      description: true, 
      thumbnailUrl: true, 
      rating: true, 
      uploadedById: true, 
      createdAt: true, 
      updatedAt: true 
    },
  });
  
  return book;
}

export async function deleteBook(id: string): Promise<boolean> {
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
