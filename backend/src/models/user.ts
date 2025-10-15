import { prisma } from '../utils/db';
import { z } from 'zod';
import type { Role, User } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  passwordHash: z.string().min(10),
  role: z.enum(['ADMIN', 'USER', 'MEMBER']).default('USER'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'isVerified' | 'role' | 'createdAt' | 'updatedAt'>;

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const data = createUserSchema.parse(input);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role as Role,
    },
    select: { id: true, name: true, email: true, isVerified: true, role: true, createdAt: true, updatedAt: true },
  });
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, isVerified: true, role: true, createdAt: true, updatedAt: true } });
}

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  isVerified: z.boolean().optional(),
  role: z.enum(['ADMIN', 'USER', 'MEMBER']).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export async function updateUser(id: string, input: UpdateUserInput): Promise<PublicUser | null> {
  const data = updateUserSchema.parse(input);
  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, isVerified: true, role: true, createdAt: true, updatedAt: true },
  });
  return user;
}

export async function listUsers(params?: { isVerified?: boolean; search?: string }): Promise<PublicUser[]> {
  const where = {
    ...(typeof params?.isVerified === 'boolean' ? { isVerified: params.isVerified } : {}),
    ...(params?.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  return prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, isVerified: true, role: true, createdAt: true, updatedAt: true },
  });
}
