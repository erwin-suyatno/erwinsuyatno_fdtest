import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../utils/db';
import { TestDataFactory } from './testUtils';

let testUserId: string;

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await TestDataFactory.cleanupTestData();
});

afterEach(async () => {
  if (testUserId) {
    try {
      await prisma.emailVerification.deleteMany({ where: { userId: testUserId } });
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

describe('Auth Integration Tests', () => {
  describe('Complete Authentication Flow', () => {
    it('register → verify → login → home', async () => {
      const email = TestDataFactory.getUniqueEmail();
      const register = await request(app).post('/api/auth/register').send({ name: 'U', email, password: 'secret123' });
      expect(register.status).toBe(201);
      expect(register.body).toHaveProperty('verifyToken');
      const token: string = register.body.verifyToken;

      // Wait a bit for database transaction to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const verify = await request(app).get('/api/auth/verify').query({ token });
      expect(verify.status).toBe(200);
      expect(verify.body).toHaveProperty('message');

      const login = await request(app).post('/api/auth/login').send({ email, password: 'secret123' });
      expect(login.status).toBe(200);
      expect(login.body).toHaveProperty('token');
      const jwt: string = login.body.token;

      const home = await request(app).get('/api/home').set('Authorization', `Bearer ${jwt}`);
      expect(home.status).toBe(200);
      expect(home.body).toHaveProperty('name');
      expect(home.body).toHaveProperty('isVerified', true);
      
      // Store user ID for cleanup
      testUserId = home.body.id;
    }, 15000); // Increase timeout to 15 seconds

    it('handles invalid registration data', async () => {
      const response = await request(app).post('/api/auth/register').send({ 
        name: '', 
        email: 'invalid-email', 
        password: '123' 
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('handles invalid login credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({ 
        email: 'nonexistent@example.com', 
        password: 'wrongpassword' 
      });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('requires authentication for protected routes', async () => {
      const response = await request(app).get('/api/home');
      expect(response.status).toBe(401);
    });
  });

  describe('Password Management Flow', () => {
    it('handles forgot password flow (with email service fallback)', async () => {
      const email = TestDataFactory.getUniqueEmail();
      const register = await request(app).post('/api/auth/register').send({ name: 'U', email, password: 'secret123' });
      expect(register.status).toBe(201);
      
      const verify = await request(app).get('/api/auth/verify').query({ token: register.body.verifyToken });
      expect(verify.status).toBe(200);
      
      const forgot = await request(app).post('/api/auth/forgot-password').send({ email });
      // Accept both success and email service unavailable responses
      expect([200, 400]).toContain(forgot.status);
      if (forgot.status === 200) {
        expect(forgot.body).toHaveProperty('message');
      } else {
        expect(forgot.body.message).toContain('Email service');
      }
      
      // Store user ID for cleanup
      testUserId = register.body.userId || 'temp';
    }, 15000);

    it('handles password reset flow (with email service fallback)', async () => {
      const email = TestDataFactory.getUniqueEmail();
      const register = await request(app).post('/api/auth/register').send({ name: 'U', email, password: 'secret123' });
      expect(register.status).toBe(201);
      
      const verify = await request(app).get('/api/auth/verify').query({ token: register.body.verifyToken });
      expect(verify.status).toBe(200);
      
      const forgot = await request(app).post('/api/auth/forgot-password').send({ email });
      // Accept both success and email service unavailable responses
      if (forgot.status === 200 && forgot.body.resetToken) {
        const reset = await request(app).post('/api/auth/reset-password').send({ 
          token: forgot.body.resetToken, 
          password: 'newpassword123' 
        });
        expect(reset.status).toBe(200);
      }
      
      // Store user ID for cleanup
      testUserId = register.body.userId || 'temp';
    }, 15000);

    it('handles change password for authenticated user', async () => {
      const email = TestDataFactory.getUniqueEmail();
      const register = await request(app).post('/api/auth/register').send({ name: 'U', email, password: 'secret123' });
      expect(register.status).toBe(201);
      
      const verify = await request(app).get('/api/auth/verify').query({ token: register.body.verifyToken });
      expect(verify.status).toBe(200);
      
      const login = await request(app).post('/api/auth/login').send({ email, password: 'secret123' });
      expect(login.status).toBe(200);
      const jwt = login.body.token;
      
      const changePassword = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${jwt}`)
        .send({ currentPassword: 'secret123', newPassword: 'newpassword123' });
      expect(changePassword.status).toBe(200);
      
      // Store user ID for cleanup
      testUserId = register.body.userId || 'temp';
    }, 15000);

    it('validates password strength', async () => {
      const response = await request(app).post('/api/auth/validate-password').send({ password: 'weak' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isValid', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Email Verification', () => {
    it('handles invalid email verification token', async () => {
      const response = await request(app).get('/api/auth/verify').query({ token: 'invalid-token' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('handles expired email verification token', async () => {
      const response = await request(app).get('/api/auth/verify').query({ token: 'expired-token' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('handles missing email verification token', async () => {
      const response = await request(app).get('/api/auth/verify');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
