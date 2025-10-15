import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, issueJwtForUser } from '../services/authService';
import jwt from 'jsonwebtoken';

describe('auth service', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('secret123');
    expect(hash).toMatch(/^\$2[aby]\$/);
    const ok = await verifyPassword('secret123', hash);
    expect(ok).toBe(true);
  });

  it('issues JWT with correct payload', async () => {
    process.env.JWT_SECRET = 'testsecret';
    const token = await issueJwtForUser('uid','u@example.com','USER');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    expect((decoded as any).userId).toBe('uid');
  });
});
