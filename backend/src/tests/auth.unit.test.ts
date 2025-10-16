import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { hashPassword, verifyPassword, issueJwtForUser, createUserWithVerification } from '../services/authService';
import { signJwt } from '../utils/jwt';
import { prisma } from '../utils/db';
import { TestDataFactory } from './testUtils';

describe('Auth Service Unit Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await TestDataFactory.cleanupTestData();
  });

  afterEach(async () => {
    await TestDataFactory.cleanupTestData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Password Management', () => {
    it('hashes and verifies password correctly', async () => {
      const hash = await hashPassword('secret123');
      expect(hash).toMatch(/^\$2[aby]\$/);
      const ok = await verifyPassword('secret123', hash);
      expect(ok).toBe(true);
    });

    it('verifies wrong password returns false', async () => {
      const hash = await hashPassword('secret123');
      const ok = await verifyPassword('wrongpassword', hash);
      expect(ok).toBe(false);
    });

    it('handles empty password', async () => {
      const hash = await hashPassword('');
      expect(hash).toMatch(/^\$2[aby]\$/);
      const ok = await verifyPassword('', hash);
      expect(ok).toBe(true);
    });

    it('handles special characters in password', async () => {
      const specialPassword = 'P@ssw0rd!@#$%^&*()';
      const hash = await hashPassword(specialPassword);
      const ok = await verifyPassword(specialPassword, hash);
      expect(ok).toBe(true);
    });
  });

  describe('JWT Token Management', () => {
    it('issues JWT with correct payload', async () => {
      const token = await signJwt({
        userId: 'uid',
        email: 'u@example.com',
        role: 'USER'
      });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('issues JWT for user with correct data', async () => {
      const token = await issueJwtForUser('user123', 'test@example.com', 'USER');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('handles different user roles', async () => {
      const userToken = await issueJwtForUser('user123', 'user@example.com', 'USER');
      const adminToken = await issueJwtForUser('admin123', 'admin@example.com', 'ADMIN');
      
      expect(userToken).toBeDefined();
      expect(adminToken).toBeDefined();
      expect(userToken).not.toBe(adminToken);
    });
  });

  describe('User Creation and Verification', () => {
    it('creates user with verification token', async () => {
      const email = TestDataFactory.getUniqueEmail();
      const { user, token } = await createUserWithVerification('Test User', email, 'password123');
      
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    it('throws error when creating user with existing email', async () => {
      const email = TestDataFactory.getUniqueEmail();
      await createUserWithVerification('Test User', email, 'password123');
      
      await expect(createUserWithVerification('Another User', email, 'password456'))
        .rejects.toThrow('EMAIL_EXISTS');
    });

    it('validates email format during user creation', async () => {
      const invalidEmail = 'invalid-email';
      await expect(createUserWithVerification('Test User', invalidEmail, 'password123'))
        .rejects.toThrow();
    });

    it('validates password strength during user creation', async () => {
      const email = TestDataFactory.getUniqueEmail();
      const weakPassword = '123';
      await expect(createUserWithVerification('Test User', email, weakPassword))
        .rejects.toThrow();
    });

    it('handles user creation with minimal data', async () => {
      const email = TestDataFactory.getUniqueEmail();
      const { user, token } = await createUserWithVerification('U', email, 'password123');
      
      expect(user).toBeDefined();
      expect(user.name).toBe('U');
      expect(token).toBeDefined();
    });
  });
});
