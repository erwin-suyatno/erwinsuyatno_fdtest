import { prisma } from '../utils/db';

export async function listUsersService(params?: { isVerified?: boolean; search?: string }) {
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
