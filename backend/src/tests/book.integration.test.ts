import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../utils/db';
import { issueJwtForUser } from '../services/authService';

let authToken: string;
let testUserId: string;
let testBookId: string;

beforeAll(async () => {
  await prisma.$connect();
  
  // Create a test user and get auth token
  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      passwordHash: 'hashedpassword',
      isVerified: true,
    },
  });
  testUserId = testUser.id;
  authToken = await issueJwtForUser(testUser.id, testUser.email, testUser.role);
});

afterAll(async () => {
  // Clean up test data
  if (testUserId) {
    await prisma.book.deleteMany({ where: { uploadedById: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
  }
  await prisma.$disconnect();
});

describe('Book CRUD Integration Tests', () => {
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

  it('gets a book by id', async () => {
    const response = await request(app)
      .get(`/api/books/${testBookId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.book.id).toBe(testBookId);
    expect(response.body.book.title).toBe('Integration Test Book');
  });

  it('lists books with pagination', async () => {
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
    const response = await request(app)
      .get('/api/books?search=Integration')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.books.length).toBeGreaterThan(0);
    expect(response.body.books[0].title).toContain('Integration');
  });

  it('filters books by rating', async () => {
    const response = await request(app)
      .get('/api/books?rating=5')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.books.length).toBeGreaterThan(0);
    expect(response.body.books[0].rating).toBe(5);
  });

  it('updates a book', async () => {
    const updateData = {
      title: 'Updated Integration Test Book',
      rating: 4,
    };

    const response = await request(app)
      .put(`/api/books/${testBookId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body.book.title).toBe('Updated Integration Test Book');
    expect(response.body.book.rating).toBe(4);
  });

  it('deletes a book', async () => {
    await request(app)
      .delete(`/api/books/${testBookId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // Verify book is deleted
    await request(app)
      .get(`/api/books/${testBookId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

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
});
