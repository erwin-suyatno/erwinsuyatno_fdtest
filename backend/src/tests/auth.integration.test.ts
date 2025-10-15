import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../utils/db';

beforeAll(async () => {
  await prisma.$connect();
});

describe('auth integration', () => {
  it('register → verify → login → home', async () => {
    const email = `u_${Date.now()}@ex.com`;
    const register = await request(app).post('/api/auth/register').send({ name: 'U', email, password: 'secret123' });
    expect(register.status).toBe(201);
    const token: string = register.body.verifyToken;

    const verify = await request(app).get('/api/auth/verify').query({ token });
    expect(verify.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email, password: 'secret123' });
    expect(login.status).toBe(200);
    const jwt: string = login.body.token;

    const home = await request(app).get('/api/home').set('Authorization', `Bearer ${jwt}`);
    expect(home.status).toBe(200);
    expect(home.body).toHaveProperty('name');
    expect(home.body).toHaveProperty('isVerified', true);
  });
});
