import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../utils/db';
import { sendMail, resetPasswordEmailTemplate } from '../utils/mailer';

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number;
  feedback: string[];
}

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message: string;
}

/**
 * Validates password strength according to security requirements
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: score === 5 && password.length >= 8,
    score,
    feedback
  };
}

/**
 * Generates a secure reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Checks if user has exceeded rate limit for password reset requests
 */
export async function checkRateLimit(email: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Get user first, then check password resets
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (!user) {
    return true; // No user found, no rate limit
  }

  // Use raw query to avoid Prisma client type issues
  const result = await prisma.$queryRaw`
    SELECT COUNT(*) as count 
    FROM "PasswordReset" 
    WHERE "userId" = ${user.id} 
    AND "createdAt" >= ${oneHourAgo}
  `;
  
  const recentRequests = Number((result as any)[0]?.count || 0);

  return recentRequests < 3; // Max 3 requests per hour
}

/**
 * Initiates forgot password process
 */
export async function initiateForgotPassword(email: string): Promise<ForgotPasswordResult> {
  try {
    // Check if user exists and is verified
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, email: true, isVerified: true }
    });

    if (!user) {
      // Return success message even if user doesn't exist for security
      return {
        success: true,
        message: 'If the account exists and is verified, reset instructions have been sent'
      };
    }

    if (!user.isVerified) {
      return {
        success: false,
        message: 'Please verify your email address before resetting password'
      };
    }

    // Check rate limit
    const withinRateLimit = await checkRateLimit(email);
    if (!withinRateLimit) {
      return {
        success: false,
        message: 'Too many password reset requests. Please try again later'
      };
    }

    // Generate secure reset token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Store reset token in database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Send reset email
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:4000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    
    try {
      await sendMail(
        user.email,
        'Reset Your Password',
        resetPasswordEmailTemplate(resetLink)
      );
    } catch (emailError: any) {
      console.error('Failed to send reset email:', emailError);
      
      // Handle different types of email errors
      if (emailError.code === 'EAUTH' && emailError.message.includes('email limit')) {
        console.log('Email service limit reached. Using development fallback.');
        
        // In development, return the token for testing
        if (process.env.NODE_ENV === 'development') {
          return {
            success: true,
            message: 'Reset instructions sent (check console for email content in development)',
            resetToken: token
          };
        }
        
        // In production, suggest alternative contact methods
        return {
          success: false,
          message: 'Email service temporarily unavailable. Please contact support for password reset assistance.'
        };
      }
      
      // For other email errors, use development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: 'Reset instructions sent (check console for email content in development)',
          resetToken: token
        };
      }
      
      // In production, return generic error
      return {
        success: false,
        message: 'Unable to send reset email. Please try again later or contact support.'
      };
    }

    return {
      success: true,
      message: 'Password reset instructions have been sent to your email'
    };

  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      message: 'An error occurred while processing your request'
    };
  }
}

/**
 * Resets password using token
 */
export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  try {
    // Validate password strength
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return {
        success: false,
        message: `Password does not meet requirements: ${strengthCheck.feedback.join(', ')}`
      };
    }

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!resetRecord) {
      return {
        success: false,
        message: 'Invalid or expired reset token'
      };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash }
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true }
      })
    ]);

    return {
      success: true,
      message: 'Password has been reset successfully'
    };

  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: 'An error occurred while resetting your password'
    };
  }
}

/**
 * Changes password for authenticated user
 */
export async function changePassword(
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<ChangePasswordResult> {
  try {
    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }

    // Validate new password strength
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return {
        success: false,
        message: `New password does not meet requirements: ${strengthCheck.feedback.join(', ')}`
      };
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return {
        success: false,
        message: 'New password must be different from current password'
      };
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return {
      success: true,
      message: 'Password has been changed successfully'
    };

  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: 'An error occurred while changing your password'
    };
  }
}

/**
 * Cleans up expired password reset tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await prisma.passwordReset.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true }
        ]
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}
