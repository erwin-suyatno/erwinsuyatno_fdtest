import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../utils/db';
import { 
  createBook, 
  findBookById, 
  listBooks, 
  updateBook, 
  deleteBook,
  createBookSchema,
  updateBookSchema 
} from '../models/book';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('book model validation', () => {
  it('validates create book schema with required fields', () => {
    const validData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test description',
      rating: 5,
    };
    
    const result = createBookSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates create book schema with optional fields', () => {
    const validData = {
      title: 'Test Book',
      author: 'Test Author',
    };
    
    const result = createBookSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid rating values', () => {
    const invalidData = {
      title: 'Test Book',
      author: 'Test Author',
      rating: 6, // Invalid: should be 1-5
    };
    
    const result = createBookSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const invalidData = {
      title: '',
      author: 'Test Author',
    };
    
    const result = createBookSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates update book schema with partial fields', () => {
    const validData = {
      title: 'Updated Book',
      rating: 4,
    };
    
    const result = updateBookSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('book model operations', () => {
  let testBookId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user first with unique email
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
      },
    });
    testUserId = testUser.id;
  });

  it('creates a book', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test description',
      rating: 5,
      uploadedById: testUserId,
    };
    
    const book = await createBook(bookData);
    expect(book.title).toBe('Test Book');
    expect(book.author).toBe('Test Author');
    expect(book.rating).toBe(5);
    testBookId = book.id;
  });

  it('finds a book by id', async () => {
    const book = await findBookById(testBookId);
    expect(book).not.toBeNull();
    expect(book?.title).toBe('Test Book');
  });

  it('lists books with pagination', async () => {
    const result = await listBooks({ page: 1, limit: 10 });
    expect(result.books).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBeGreaterThan(0);
  });

  it('searches books by title', async () => {
    const result = await listBooks({ search: 'Test Book' });
    expect(result.books.length).toBeGreaterThan(0);
    expect(result.books[0].title).toContain('Test Book');
  });

  it('filters books by rating', async () => {
    const result = await listBooks({ rating: 5 });
    expect(result.books.length).toBeGreaterThan(0);
    expect(result.books[0].rating).toBe(5);
  });

  it('updates a book', async () => {
    const updateData = {
      title: 'Updated Book Title',
      rating: 4,
    };
    
    const updatedBook = await updateBook(testBookId, updateData);
    expect(updatedBook?.title).toBe('Updated Book Title');
    expect(updatedBook?.rating).toBe(4);
  });

  it('deletes a book', async () => {
    const success = await deleteBook(testBookId);
    expect(success).toBe(true);
    
    const deletedBook = await findBookById(testBookId);
    expect(deletedBook).toBeNull();
  });

  afterAll(async () => {
    // Clean up test user
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });
});
