import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/db';
import { z } from 'zod';
import { signJwt } from '../utils/jwt';
import crypto from 'crypto';
import { sendMail, verificationEmailTemplate, resetPasswordEmailTemplate } from '../utils/mailer';
import { 
  initiateForgotPassword, 
  resetPassword as resetPasswordService, 
  changePassword as changePasswordService,
  validatePasswordStrength 
} from '../services/passwordService';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    // create email verification token
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000*60*60*24);
    await prisma.emailVerification.create({ data: { userId: user.id, token, expiresAt } });

    const base = process.env.APP_BASE_URL || 'http://localhost:4000';
    const link = `${base}/api/auth/verify?token=${token}`;
    try {
      await sendMail(user.email, 'Verify your account', verificationEmailTemplate(link));
    } catch (_e) {
      // ignore email errors in dev; token is returned for testing
    }

    return res.status(201).json({ message: 'Registered. Please verify email.', verifyToken: token });
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ message: 'Invalid input', issues: e.issues });
    return res.status(500).json({ message: 'Server error' });
  }
}

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    return res.json({ token });
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ message: 'Invalid input', issues: e.issues });
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const token = req.query.token as string | undefined;
  if (!token) return res.status(400).json({ message: 'token is required' });
  const rec = await prisma.emailVerification.findFirst({ where: { token, used: false, expiresAt: { gt: new Date() } } });
  if (!rec) return res.status(400).json({ message: 'Invalid or expired token' });
  await prisma.$transaction([
    prisma.user.update({ where: { id: rec.userId }, data: { isVerified: true } }),
    prisma.emailVerification.update({ where: { id: rec.id }, data: { used: true } }),
  ]);
  return res.json({ message: 'Email verified' });
}

const forgotSchema = z.object({ email: z.string().email() });
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = forgotSchema.parse(req.body);
    const result = await initiateForgotPassword(email);
    
    if (result.success) {
      const response: any = { message: result.message };
      if (result.resetToken) {
        response.resetToken = result.resetToken;
      }
      return res.json(response);
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ message: 'Invalid input', issues: e.issues });
    return res.status(500).json({ message: 'Server error' });
  }
}

const resetSchema = z.object({ 
  token: z.string().min(10), 
  password: z.string().min(8) 
});
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = resetSchema.parse(req.body);
    const result = await resetPasswordService(token, password);
    
    if (result.success) {
      return res.json({ message: result.message });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ message: 'Invalid input', issues: e.issues });
    return res.status(500).json({ message: 'Server error' });
  }
}

const changeSchema = z.object({ 
  currentPassword: z.string().min(1), 
  newPassword: z.string().min(8) 
});
export async function changePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = changeSchema.parse(req.body);
    const userId = (req as any).user?.userId as string;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const result = await changePasswordService(userId, currentPassword, newPassword);
    
    if (result.success) {
      return res.json({ message: result.message });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ message: 'Invalid input', issues: e.issues });
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function me(_req: Request, res: Response) {
  const userId = (res.req as any).user?.userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, isVerified: true, role: true } });
  return res.json({ user });
}

const passwordStrengthSchema = z.object({ password: z.string() });
export async function validatePassword(req: Request, res: Response) {
  try {
    const { password } = passwordStrengthSchema.parse(req.body);
    const result = validatePasswordStrength(password);
    return res.json(result);
  } catch (e: any) {
    if (e?.issues) return res.status(400).json({ message: 'Invalid input', issues: e.issues });
    return res.status(500).json({ message: 'Server error' });
  }
}
