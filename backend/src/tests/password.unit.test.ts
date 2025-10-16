import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  validatePasswordStrength, 
  generateResetToken, 
  checkRateLimit,
  initiateForgotPassword,
  resetPassword,
  changePassword,
  cleanupExpiredTokens
} from '../services/passwordService';
import { prisma } from '../utils/db';

describe('Password Management Unit Tests', () => {
  describe('validatePasswordStrength', () => {
    it('should validate strong passwords correctly', () => {
      const strongPassword = 'MySecure123!';
      const result = validatePasswordStrength(strongPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(5);
      expect(result.feedback).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const weakPassword = '123';
      const result = validatePasswordStrength(weakPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(4);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should require minimum length', () => {
      const shortPassword = 'Ab1!';
      const result = validatePasswordStrength(shortPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Password must be at least 8 characters long');
    });

    it('should require uppercase letter', () => {
      const noUpperPassword = 'mypassword123!';
      const result = validatePasswordStrength(noUpperPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one uppercase letter');
    });

    it('should require lowercase letter', () => {
      const noLowerPassword = 'MYPASSWORD123!';
      const result = validatePasswordStrength(noLowerPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one lowercase letter');
    });

    it('should require number', () => {
      const noNumberPassword = 'MyPassword!';
      const result = validatePasswordStrength(noNumberPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one number');
    });

    it('should require special character', () => {
      const noSpecialPassword = 'MyPassword123';
      const result = validatePasswordStrength(noSpecialPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one special character');
    });
  });

  describe('generateResetToken', () => {
    it('should generate a secure token', () => {
      const token = generateResetToken();
      
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
      expect(/^[a-f0-9]+$/i.test(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('checkRateLimit', () => {
    const testEmail = 'test@example.com';
    let testUser: any;

    beforeEach(async () => {
      // Create test user
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: testEmail,
          passwordHash: 'hashedpassword',
          isVerified: true
        }
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

    it('should allow requests within rate limit', async () => {
      const withinLimit = await checkRateLimit(testEmail);
      expect(withinLimit).toBe(true);
    });

    it('should block requests exceeding rate limit', async () => {
      // Create 3 recent password reset requests
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        await prisma.passwordReset.create({
          data: {
            userId: testUser.id,
            token: `token${i}`,
            expiresAt: new Date(now.getTime() + 3600000) // 1 hour from now
          }
        });
      }

      const withinLimit = await checkRateLimit(testEmail);
      expect(withinLimit).toBe(false);
    });

    it('should allow requests after rate limit window', async () => {
      // Create old password reset requests (outside 1 hour window)
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      for (let i = 0; i < 5; i++) {
        await prisma.passwordReset.create({
          data: {
            userId: testUser.id,
            token: `oldtoken${i}`,
            expiresAt: new Date(oldDate.getTime() + 3600000),
            createdAt: oldDate
          }
        });
      }

      const withinLimit = await checkRateLimit(testEmail);
      expect(withinLimit).toBe(true);
    });
  });

  describe('initiateForgotPassword', () => {
    const testEmail = 'forgot@example.com';
    let testUser: any;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          name: 'Forgot User',
          email: testEmail,
          passwordHash: 'hashedpassword',
          isVerified: true
        }
      });
    });

    afterEach(async () => {
      await prisma.passwordReset.deleteMany({
        where: { userId: testUser.id }
      });
      await prisma.user.delete({
        where: { id: testUser.id }
      });
    });

    it('should handle non-existent user gracefully', async () => {
      const result = await initiateForgotPassword('nonexistent@example.com');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('If the account exists');
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

      const result = await initiateForgotPassword('unverified@example.com');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('verify your email');

      // Clean up
      await prisma.user.delete({ where: { id: unverifiedUser.id } });
    });

    it('should create reset token for verified user', async () => {
      const result = await initiateForgotPassword(testEmail);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('reset instructions');

      // Check that reset token was created
      const resetRecord = await prisma.passwordReset.findFirst({
        where: { userId: testUser.id }
      });
      expect(resetRecord).toBeDefined();
      expect(resetRecord?.token).toBeDefined();
      expect(resetRecord?.used).toBe(false);
    });

    it('should respect rate limiting', async () => {
      // Create 3 recent requests
      for (let i = 0; i < 3; i++) {
        await prisma.passwordReset.create({
          data: {
            userId: testUser.id,
            token: `ratetoken${i}`,
            expiresAt: new Date(Date.now() + 3600000)
          }
        });
      }

      const result = await initiateForgotPassword(testEmail);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many');
    });
  });

  describe('resetPassword', () => {
    const testEmail = 'reset@example.com';
    let testUser: any;
    let resetToken: string;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          name: 'Reset User',
          email: testEmail,
          passwordHash: 'oldhashedpassword',
          isVerified: true
        }
      });

      resetToken = generateResetToken();
      await prisma.passwordReset.create({
        data: {
          userId: testUser.id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
        }
      });
    });

    afterEach(async () => {
      await prisma.passwordReset.deleteMany({
        where: { userId: testUser.id }
      });
      await prisma.user.delete({
        where: { id: testUser.id }
      });
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewSecure123!';
      const result = await resetPassword(resetToken, newPassword);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('reset successfully');

      // Check that token was marked as used
      const resetRecord = await prisma.passwordReset.findFirst({
        where: { token: resetToken }
      });
      expect(resetRecord?.used).toBe(true);

      // Check that password was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      expect(updatedUser?.passwordHash).not.toBe('oldhashedpassword');
    });

    it('should reject invalid token', async () => {
      const result = await resetPassword('invalidtoken', 'NewSecure123!');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });

    it('should reject expired token', async () => {
      // Create expired token
      const expiredToken = generateResetToken();
      await prisma.passwordReset.create({
        data: {
          userId: testUser.id,
          token: expiredToken,
          expiresAt: new Date(Date.now() - 3600000) // 1 hour ago
        }
      });

      const result = await resetPassword(expiredToken, 'NewSecure123!');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });

    it('should reject weak passwords', async () => {
      const result = await resetPassword(resetToken, 'weak');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('does not meet requirements');
    });

    it('should reject already used token', async () => {
      // Get the reset record first
      const resetRecord = await prisma.passwordReset.findFirst({
        where: { token: resetToken }
      });
      
      // Mark token as used
      await prisma.passwordReset.update({
        where: { id: resetRecord?.id },
        data: { used: true }
      });

      const result = await resetPassword(resetToken, 'NewSecure123!');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });
  });

  describe('changePassword', () => {
    const testEmail = 'change@example.com';
    let testUser: any;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          name: 'Change User',
          email: testEmail,
          passwordHash: await require('bcrypt').hash('OldPassword123!', 10),
          isVerified: true
        }
      });
    });

    afterEach(async () => {
      await prisma.user.delete({
        where: { id: testUser.id }
      });
    });

    it('should change password with valid current password', async () => {
      const result = await changePassword(
        testUser.id,
        'OldPassword123!',
        'NewPassword123!'
      );
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('changed successfully');

      // Verify password was changed
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      const isNewPasswordValid = await require('bcrypt').compare(
        'NewPassword123!',
        updatedUser?.passwordHash || ''
      );
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject invalid current password', async () => {
      const result = await changePassword(
        testUser.id,
        'WrongPassword',
        'NewPassword123!'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('incorrect');
    });

    it('should reject weak new password', async () => {
      const result = await changePassword(
        testUser.id,
        'OldPassword123!',
        'weak'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('does not meet requirements');
    });

    it('should reject same password', async () => {
      const result = await changePassword(
        testUser.id,
        'OldPassword123!',
        'OldPassword123!'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('different from current');
    });

    it('should handle non-existent user', async () => {
      const result = await changePassword(
        'nonexistent-id',
        'OldPassword123!',
        'NewPassword123!'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('cleanupExpiredTokens', () => {
    const testEmail = 'cleanup@example.com';
    let testUser: any;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          name: 'Cleanup User',
          email: testEmail,
          passwordHash: 'hashedpassword',
          isVerified: true
        }
      });
    });

    afterEach(async () => {
      await prisma.passwordReset.deleteMany({
        where: { userId: testUser.id }
      });
      await prisma.user.delete({
        where: { id: testUser.id }
      });
    });

    it('should clean up expired tokens', async () => {
      // Create expired token
      await prisma.passwordReset.create({
        data: {
          userId: testUser.id,
          token: 'expiredtoken',
          expiresAt: new Date(Date.now() - 3600000) // 1 hour ago
        }
      });

      // Create used token
      await prisma.passwordReset.create({
        data: {
          userId: testUser.id,
          token: 'usedtoken',
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
          used: true
        }
      });

      // Create valid token
      await prisma.passwordReset.create({
        data: {
          userId: testUser.id,
          token: 'validtoken',
          expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
        }
      });

      await cleanupExpiredTokens();

      // Check that only valid token remains
      const remainingTokens = await prisma.passwordReset.findMany({
        where: { userId: testUser.id }
      });
      expect(remainingTokens).toHaveLength(1);
      expect(remainingTokens[0].token).toBe('validtoken');
    });
  });
});
