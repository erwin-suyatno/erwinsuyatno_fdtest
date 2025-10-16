import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../utils/db';
import { listUsersService } from '../services/userService';

beforeAll(async () => {
  await prisma.$connect();
});

describe('user service list filters', () => {
  it('builds query with search and isVerified', async () => {
    const result = await listUsersService({ isVerified: false, search: 'a' });
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('totalPages');
    expect(Array.isArray(result.users)).toBe(true);
  });
});
