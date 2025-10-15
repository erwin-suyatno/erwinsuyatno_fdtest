import bcrypt from 'bcrypt';
import { prisma } from '../utils/db';
import { signJwt } from '../utils/jwt';
import crypto from 'crypto';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createUserWithVerification(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('EMAIL_EXISTS');
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 1000*60*60*24);
  await prisma.emailVerification.create({ data: { userId: user.id, token, expiresAt } });
  return { user, token };
}

export async function issueJwtForUser(userId: string, email: string, role: string) {
  return signJwt({ userId, email, role });
}
