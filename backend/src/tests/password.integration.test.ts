import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../utils/db';
import { signJwt } from '../utils/jwt';

describe('Password Management Integration Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: await require('bcrypt').hash('TestPassword123!', 10),
        isVerified: true
      }
    });

    authToken = signJwt({ 
      userId: testUser.id, 
      email: testUser.email, 
      role: testUser.role 
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.passwordReset.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should handle forgot password for existing verified user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('reset instructions');

      // Check that reset token was created
      const resetRecord = await prisma.passwordReset.findFirst({
        where: { userId: testUser.id }
      });
      expect(resetRecord).toBeDefined();
      expect(resetRecord?.token).toBeDefined();
    });

    it('should handle forgot password for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('If the account exists');
    });

    it('should reject unverified users', async () => {
      // Create unverified user
      const unverifiedUser = await prisma.user.create({
        data: {
          name: 'Unverified User',
          email: 'unverified@example.com',
          passwordHash: 'hashedpassword',
          isVerified: false
        }
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'unverified@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('verify your email');

      // Clean up
      await prisma.user.delete({ where: { id: unverifiedUser.id } });
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid input');
    });

    it('should handle rate limiting', async () => {
      // Create 3 recent password reset requests
      for (let i = 0; i < 3; i++) {
        await prisma.passwordReset.create({
          data: {
            userId: testUser.id,
            token: `ratetoken${i}`,
            expiresAt: new Date(Date.now() + 3600000)
          }
        });
      }

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Too many');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      resetToken = require('crypto').randomBytes(32).toString('hex');
      await prisma.passwordReset.create({
        data: {
          userId: testUser.id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
        }
      });
    });

    it('should reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewSecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('reset successfully');

      // Check that token was marked as used
      const resetRecord = await prisma.passwordReset.findFirst({
        where: { token: resetToken }
      });
      expect(resetRecord?.used).toBe(true);

      // Verify new password works
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      const isNewPasswordValid = await require('bcrypt').compare(
        'NewSecurePassword123!',
        updatedUser?.passwordHash || ''
      );
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalidtoken',
          password: 'NewSecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject expired token', async () => {
      // Create expired token
      const expiredToken = require('crypto').randomBytes(32).toString('hex');
      await prisma.passwordReset.create({
        data: {
          userId: testUser.id,
          token: expiredToken,
          expiresAt: new Date(Date.now() - 3600000) // 1 hour ago
        }
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          password: 'NewSecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('does not meet requirements');
    });

    it('should validate input format', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'short',
          password: 'NewSecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid input');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewTestPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('changed successfully');

      // Verify new password works
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      const isNewPasswordValid = await require('bcrypt').compare(
        'NewTestPassword123!',
        updatedUser?.passwordHash || ''
      );
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject invalid current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewTestPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('incorrect');
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('does not meet requirements');
    });

    it('should reject same password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'TestPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('different from current');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewTestPassword123!'
        });

      expect(response.status).toBe(401);
    });

    it('should validate input format', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: '',
          newPassword: 'short'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid input');
    });
  });

  describe('POST /api/auth/validate-password', () => {
    it('should validate strong passwords', async () => {
      const response = await request(app)
        .post('/api/auth/validate-password')
        .send({ password: 'StrongPassword123!' });

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(true);
      expect(response.body.score).toBe(5);
      expect(response.body.feedback).toHaveLength(0);
    });

    it('should identify weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/validate-password')
        .send({ password: 'weak' });

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(false);
      expect(response.body.score).toBeLessThan(4);
      expect(response.body.feedback.length).toBeGreaterThan(0);
    });

    it('should provide specific feedback for missing requirements', async () => {
      const response = await request(app)
        .post('/api/auth/validate-password')
        .send({ password: 'nouppercase123!' });

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(false);
      expect(response.body.feedback).toContain('uppercase letter');
    });

    it('should validate input format', async () => {
      const response = await request(app)
        .post('/api/auth/validate-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid input');
    });
  });

  describe('Password Reset Flow Integration', () => {
    it('should complete full password reset flow', async () => {
      // Step 1: Request password reset
      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(forgotResponse.status).toBe(200);

      // Get reset token from database
      const resetRecord = await prisma.passwordReset.findFirst({
        where: { userId: testUser.id, used: false }
      });
      expect(resetRecord).toBeDefined();

      // Step 2: Reset password
      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetRecord?.token,
          password: 'NewResetPassword123!'
        });

      expect(resetResponse.status).toBe(200);

      // Step 3: Verify new password works with login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'NewResetPassword123!'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();

      // Step 4: Verify old password no longer works
      const oldLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        });

      expect(oldLoginResponse.status).toBe(401);
    });

    it('should prevent token reuse', async () => {
      // Request password reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      const resetRecord = await prisma.passwordReset.findFirst({
        where: { userId: testUser.id, used: false }
      });

      // First reset attempt
      const firstReset = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetRecord?.token,
          password: 'FirstResetPassword123!'
        });

      expect(firstReset.status).toBe(200);

      // Second reset attempt with same token
      const secondReset = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetRecord?.token,
          password: 'SecondResetPassword123!'
        });

      expect(secondReset.status).toBe(400);
      expect(secondReset.body.message).toContain('Invalid or expired');
    });
  });
});
