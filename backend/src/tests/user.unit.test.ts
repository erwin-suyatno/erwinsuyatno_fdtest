import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../utils/db';
import { listUsersService } from '../services/userService';

beforeAll(async () => {
  await prisma.$connect();
});

describe('user service list filters', () => {
  it('builds query with search and isVerified', async () => {
    const users = await listUsersService({ isVerified: false, search: 'a' });
    expect(Array.isArray(users)).toBe(true);
  });
});
