import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma || new PrismaClient({ log: ['error', 'warn'] });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
