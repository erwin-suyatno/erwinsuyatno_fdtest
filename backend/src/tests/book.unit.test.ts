import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
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
import { TestDataFactory } from './testUtils';

let testUserId: string;
let testBookId: string;

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await TestDataFactory.cleanupTestData();

  // Create test user
  const testUser = await TestDataFactory.createTestUser();
  testUserId = testUser.id;
});

afterEach(async () => {
  await TestDataFactory.cleanupTestData();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Book Model Validation', () => {
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

  it('rejects rating below 1', () => {
    const invalidData = {
      title: 'Test Book',
      author: 'Test Author',
      rating: 0, // Invalid: should be 1-5
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

  it('rejects missing required fields', () => {
    const invalidData = {
      title: 'Test Book',
      // Missing author
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

  it('validates update book schema with all fields', () => {
    const validData = {
      title: 'Updated Book',
      author: 'Updated Author',
      description: 'Updated description',
      rating: 4,
    };
    
    const result = updateBookSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid update data', () => {
    const invalidData = {
      title: '', // Empty title
      rating: 6, // Invalid rating
    };
    
    const result = updateBookSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Book Model Operations', () => {
  it('creates a book', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      rating: 5,
      uploadedById: testUserId,
    };

    const book = await createBook(bookData);
    expect(book).toBeDefined();
    expect(book.title).toBe(bookData.title);
    expect(book.author).toBe(bookData.author);
    expect(book.uploadedById).toBe(testUserId);
    
    testBookId = book.id;
  });

  it('creates a book with minimal data', async () => {
    const bookData = {
      title: 'Minimal Book',
      author: 'Minimal Author',
      uploadedById: testUserId,
    };

    const book = await createBook(bookData);
    expect(book).toBeDefined();
    expect(book.title).toBe(bookData.title);
    expect(book.author).toBe(bookData.author);
    expect(book.uploadedById).toBe(testUserId);
    expect(book.description).toBeNull();
    expect(book.rating).toBeNull();
    
    testBookId = book.id;
  });

  it('finds a book by id', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      rating: 5,
      uploadedById: testUserId,
    };

    const book = await createBook(bookData);
    testBookId = book.id;
    
    const foundBook = await findBookById(book.id);
    expect(foundBook).not.toBeNull();
    expect(foundBook?.title).toBe('Test Book');
  });

  it('lists books with pagination', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      rating: 5,
      uploadedById: testUserId,
    };

    const book = await createBook(bookData);
    testBookId = book.id;
    
    const result = await listBooks({ page: 1, limit: 10 });
    expect(result.books).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
    expect(result.page).toBe(1);
  });

  it('searches books by title', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      rating: 5,
      uploadedById: testUserId,
    };

    const book = await createBook(bookData);
    testBookId = book.id;
    
    const result = await listBooks({ search: 'Test' });
    expect(result.books.length).toBeGreaterThan(0);
    expect(result.books[0].title).toContain('Test');
  });

  it('filters books by rating', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      rating: 5,
      uploadedById: testUserId,
    };

    const book = await createBook(bookData);
    testBookId = book.id;
    
    const result = await listBooks({ rating: 5 });
    expect(result.books.length).toBeGreaterThan(0);
    expect(result.books[0].rating).toBe(5);
  });

  it('updates a book', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      rating: 5,
      uploadedById: testUserId,
    };

    const book = await createBook(bookData);
    testBookId = book.id;
    
    const updateData = {
      title: 'Updated Test Book',
      rating: 4,
    };

    const updatedBook = await updateBook(book.id, updateData);
    expect(updatedBook.title).toBe('Updated Test Book');
    expect(updatedBook.rating).toBe(4);
  });

  it('deletes a book', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      rating: 5,
      uploadedById: testUserId,
    };

    const book = await createBook(bookData);
    testBookId = book.id;
    
    await deleteBook(book.id);
    
    const foundBook = await findBookById(book.id);
    expect(foundBook).toBeNull();
  });

  it('handles non-existent book deletion', async () => {
    const result = await deleteBook('non-existent-id');
    expect(result).toBe(false);
  });

  it('handles non-existent book update', async () => {
    const updateData = { title: 'Updated Title' };
    const result = await updateBook('non-existent-id', updateData);
    expect(result).toBeNull();
  });

  it('handles non-existent book find', async () => {
    const result = await findBookById('non-existent-id');
    expect(result).toBeNull();
  });

  it('lists books with different filters', async () => {
    // Create multiple books with different ratings
    await createBook({ title: 'Book 1', author: 'Author 1', rating: 3, uploadedById: testUserId });
    await createBook({ title: 'Book 2', author: 'Author 2', rating: 5, uploadedById: testUserId });
    await createBook({ title: 'Book 3', author: 'Author 3', rating: 4, uploadedById: testUserId });
    
    // Test rating filter
    const highRatedBooks = await listBooks({ rating: 5 });
    expect(highRatedBooks.books.length).toBeGreaterThan(0);
    expect(highRatedBooks.books.every(book => book.rating === 5)).toBe(true);
    
    // Test author search
    const authorBooks = await listBooks({ search: 'Author 1' });
    expect(authorBooks.books.length).toBeGreaterThan(0);
    expect(authorBooks.books[0].author).toContain('Author 1');
  });

  it('handles pagination correctly', async () => {
    // Create multiple books
    for (let i = 0; i < 15; i++) {
      await createBook({ 
        title: `Book ${i}`, 
        author: `Author ${i}`, 
        rating: 3,
        uploadedById: testUserId
      });
    }
    
    // Test first page
    const firstPage = await listBooks({ page: 1, limit: 10 });
    expect(firstPage.books.length).toBe(10);
    expect(firstPage.page).toBe(1);
    expect(firstPage.totalPages).toBeGreaterThan(1);
    
    // Test second page
    const secondPage = await listBooks({ page: 2, limit: 10 });
    expect(secondPage.books.length).toBe(5);
    expect(secondPage.page).toBe(2);
  });
});