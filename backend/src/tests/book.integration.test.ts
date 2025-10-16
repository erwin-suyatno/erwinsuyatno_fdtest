import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../utils/db';
import { TestDataFactory } from './testUtils';

let authToken: string;
let testUserId: string;
let testBookId: string;

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await TestDataFactory.cleanupTestData();
  
  // Create a test user and get auth token
  const testUser = await TestDataFactory.createTestUser();
  testUserId = testUser.id;
  authToken = await TestDataFactory.generateAuthToken(testUser);
});

afterEach(async () => {
  if (testUserId) {
    try {
      await prisma.booking.deleteMany({ where: { userId: testUserId } });
      await prisma.book.deleteMany({ where: { uploadedById: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } });
    } catch (error) {
      // Ignore cleanup errors
    }
    testUserId = undefined;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Book CRUD Integration Tests', () => {
  describe('Book Creation', () => {
    it('creates a book with valid data', async () => {
      const bookData = {
        title: 'Integration Test Book',
        author: 'Test Author',
        description: 'Test description for integration',
        rating: 5,
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body.book).toMatchObject({
        title: bookData.title,
        author: bookData.author,
        rating: bookData.rating,
      });
      
      testBookId = response.body.book.id;
    });

    it('creates a book with minimal data', async () => {
      const bookData = {
        title: 'Minimal Book',
        author: 'Minimal Author',
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body.book.title).toBe(bookData.title);
      expect(response.body.book.author).toBe(bookData.author);
      expect(response.body.book.description).toBeNull();
      expect(response.body.book.rating).toBeNull();
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' }) // Missing required fields
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('validates rating range', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Test Book', 
          author: 'Test Author', 
          rating: 6 // Invalid rating
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('returns 401 for unauthenticated requests', async () => {
      await request(app)
        .post('/api/books')
        .send({ title: 'Test', author: 'Test' })
        .expect(401);
    });
  });

  describe('Book Retrieval', () => {
    it('gets a book by id', async () => {
      // Create a book for this test
      const bookData = {
        title: 'Integration Test Book',
        author: 'Test Author',
        description: 'Test description for integration',
        rating: 5,
      };

      const createResponse = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);
      
      const bookId = createResponse.body.book.id;

      const response = await request(app)
        .get(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.book.id).toBe(bookId);
      expect(response.body.book.title).toBe('Integration Test Book');
    });

    it('lists books with pagination', async () => {
      // Create a book for this test
      const bookData = {
        title: 'Integration Test Book',
        author: 'Test Author',
        description: 'Test description for integration',
        rating: 5,
      };

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      const response = await request(app)
        .get('/api/books?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.books).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBeGreaterThan(0);
    });

    it('searches books by title', async () => {
      // Create a book for this test
      const bookData = {
        title: 'Integration Test Book',
        author: 'Test Author',
        description: 'Test description for integration',
        rating: 5,
      };

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      const response = await request(app)
        .get('/api/books?search=Integration')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.books.length).toBeGreaterThan(0);
      expect(response.body.books[0].title).toContain('Integration');
    });

    it('filters books by rating', async () => {
      // Create a book for this test
      const bookData = {
        title: 'Integration Test Book',
        author: 'Test Author',
        description: 'Test description for integration',
        rating: 5,
      };

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      const response = await request(app)
        .get('/api/books?rating=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.books.length).toBeGreaterThan(0);
      expect(response.body.books[0].rating).toBe(5);
    });
  });

  describe('Book Updates', () => {

    it('updates a book', async () => {
      // Create a book for this test
      const bookData = {
        title: 'Integration Test Book',
        author: 'Test Author',
        description: 'Test description for integration',
        rating: 5,
      };

      const createResponse = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);
      
      const bookId = createResponse.body.book.id;

      const updateData = {
        title: 'Updated Integration Test Book',
        rating: 4,
      };

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.book.title).toBe('Updated Integration Test Book');
      expect(response.body.book.rating).toBe(4);
    });

  });

  describe('Book Deletion', () => {
    it('deletes a book', async () => {
      // Create a book for this test
      const bookData = {
        title: 'Integration Test Book',
        author: 'Test Author',
        description: 'Test description for integration',
        rating: 5,
      };

      const createResponse = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);
      
      const bookId = createResponse.body.book.id;

      await request(app)
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify book is deleted
      await request(app)
        .get(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Error Handling and Validation', () => {
    it('returns 401 for unauthenticated requests', async () => {
      await request(app)
        .post('/api/books')
        .send({ title: 'Test', author: 'Test' })
        .expect(401);
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' }) // Missing required fields
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('validates rating range', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Test Book', 
          author: 'Test Author', 
          rating: 6 // Invalid rating
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('handles non-existent book operations', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      
      // Try to get non-existent book
      await request(app)
        .get(`/api/books/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Try to update non-existent book
      await request(app)
        .put(`/api/books/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      // Try to delete non-existent book
      await request(app)
        .delete(`/api/books/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

  });

  describe('Advanced Search and Pagination', () => {
    it('handles pagination correctly', async () => {
      // Create multiple books
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post('/api/books')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `Book ${i}`,
            author: `Author ${i}`,
            rating: 3,
          })
          .expect(201);
      }

      // Test first page
      const firstPage = await request(app)
        .get('/api/books?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(firstPage.body.books.length).toBe(10);
      expect(firstPage.body.page).toBe(1);
      expect(firstPage.body.totalPages).toBeGreaterThan(1);

      // Test second page
      const secondPage = await request(app)
        .get('/api/books?page=2&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(secondPage.body.books.length).toBe(5);
      expect(secondPage.body.page).toBe(2);
    });

    it('searches books by author', async () => {
      // Create books with different authors
      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'JavaScript Guide',
          author: 'John Doe',
          rating: 5,
        })
        .expect(201);

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Python Basics',
          author: 'Jane Smith',
          rating: 4,
        })
        .expect(201);

      // Search by author
      const response = await request(app)
        .get('/api/books?search=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.books.length).toBeGreaterThan(0);
      expect(response.body.books[0].author).toContain('John');
    });

    it('handles multiple filters simultaneously', async () => {
      // Create books with different ratings
      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'High Rated Book',
          author: 'Author A',
          rating: 5,
        })
        .expect(201);

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Low Rated Book',
          author: 'Author B',
          rating: 2,
        })
        .expect(201);

      // Test combined search and rating filter
      const response = await request(app)
        .get('/api/books?search=High&rating=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.books.length).toBeGreaterThan(0);
      expect(response.body.books[0].title).toContain('High');
      expect(response.body.books[0].rating).toBe(5);
    });

    it('handles empty search results', async () => {
      const response = await request(app)
        .get('/api/books?search=NonexistentBook')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.books.length).toBe(0);
      expect(response.body.total).toBe(0);
    });

    it('validates book update with invalid data', async () => {
      // Create a book first
      const createResponse = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Book',
          author: 'Original Author',
          rating: 3,
        })
        .expect(201);
      
      const bookId = createResponse.body.book.id;

      // Try to update with invalid data
      await request(app)
        .put(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Invalid: empty title
          rating: 6, // Invalid: rating > 5
        })
        .expect(400);
    });
});
