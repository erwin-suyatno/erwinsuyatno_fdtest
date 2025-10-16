import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { prisma } from '../utils/db';
import { listUsersService } from '../services/userService';
import { createUser, findUserById, updateUser, listUsers } from '../models/user';
import { TestDataFactory } from './testUtils';

let testUserId: string;

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await TestDataFactory.cleanupTestData();
});

afterEach(async () => {
  await TestDataFactory.cleanupTestData();
});

describe('user model operations', () => {
  it('creates a user', async () => {
    const timestamp = Date.now();
    const userData = {
      name: 'Test User',
      email: `test-${timestamp}@example.com`,
      passwordHash: 'hashedpassword',
      role: 'USER' as const,
    };
    
    const user = await createUser(userData);
    expect(user.name).toBe('Test User');
    expect(user.email).toBe(`test-${timestamp}@example.com`);
    expect(user.role).toBe('USER');
    testUserId = user.id;
  });

  it('finds user by id', async () => {
    // Create a user for this test
    const timestamp = Date.now();
    const userData = {
      name: 'Test User',
      email: `test-${timestamp}@example.com`,
      passwordHash: 'hashedpassword',
      role: 'USER' as const,
    };
    
    const user = await createUser(userData);
    testUserId = user.id;
    
    // Wait a bit for database transaction to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = await findUserById(user.id);
    expect(foundUser).not.toBeNull();
    expect(foundUser?.name).toBe('Test User');
  });

  it('updates user', async () => {
    // Create a user for this test
    const timestamp = Date.now() + Math.random() * 1000; // Add more randomness
    const userData = {
      name: 'Test User',
      email: `test-${timestamp}@example.com`,
      passwordHash: 'hashedpassword',
      role: 'USER' as const,
    };
    
    const user = await createUser(userData);
    testUserId = user.id;
    
    const updateData = {
      name: 'Updated User',
      isVerified: true,
    };
    
    const updatedUser = await updateUser(user.id, updateData);
    expect(updatedUser?.name).toBe('Updated User');
    expect(updatedUser?.isVerified).toBe(true);
  });

  it('lists users with pagination', async () => {
    // Create a user for this test
    const timestamp = Date.now();
    const userData = {
      name: 'Test User',
      email: `test-${timestamp}@example.com`,
      passwordHash: 'hashedpassword',
      role: 'USER' as const,
    };
    
    const user = await createUser(userData);
    testUserId = user.id;
    
    // Wait a bit for database transaction to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const result = await listUsers({ page: 1, limit: 10 });
    expect(result.users).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBeGreaterThan(0);
  });

  it('filters users by verification status', async () => {
    // Create a user for this test
    const timestamp = Date.now();
    const userData = {
      name: 'Test User',
      email: `test-${timestamp}@example.com`,
      passwordHash: 'hashedpassword',
      role: 'USER' as const,
    };
    
    const user = await createUser(userData);
    testUserId = user.id;
    
    const result = await listUsers({ isVerified: true });
    expect(result.users).toBeInstanceOf(Array);
    expect(result.users.every(user => user.isVerified === true)).toBe(true);
  });

  it('searches users by name and email', async () => {
    // Create a user for this test
    const timestamp = Date.now();
    const userData = {
      name: 'Test User',
      email: `test-${timestamp}@example.com`,
      passwordHash: 'hashedpassword',
      role: 'USER' as const,
    };
    
    const user = await createUser(userData);
    testUserId = user.id;
    
    const result = await listUsers({ search: 'Test' });
    expect(result.users).toBeInstanceOf(Array);
    expect(result.users.length).toBeGreaterThan(0);
  });

  it('handles non-existent user find', async () => {
    const result = await findUserById('non-existent-id');
    expect(result).toBeNull();
  });

  it('handles non-existent user update', async () => {
    const updateData = { name: 'Updated Name' };
    const result = await updateUser('non-existent-id', updateData);
    expect(result).toBeNull();
  });

  it('lists users with different filters', async () => {
    // Create multiple users with different verification status
    const user1 = await createUser({
      name: 'Verified User',
      email: TestDataFactory.getUniqueEmail(),
      passwordHash: 'hashedpassword1',
      role: 'USER',
      isVerified: true,
    });
    
    const user2 = await createUser({
      name: 'Unverified User',
      email: TestDataFactory.getUniqueEmail(),
      passwordHash: 'hashedpassword2',
      role: 'USER',
      isVerified: false,
    });
    
    // Test verification filter
    const verifiedUsers = await listUsers({ isVerified: true });
    expect(verifiedUsers.users.length).toBeGreaterThan(0);
    expect(verifiedUsers.users.every(user => user.isVerified === true)).toBe(true);
    
    // Test name search
    const nameSearch = await listUsers({ search: 'Verified' });
    expect(nameSearch.users.length).toBeGreaterThan(0);
    expect(nameSearch.users[0].name).toContain('Verified');
  });

  it('handles pagination correctly', async () => {
    // Create multiple users
    for (let i = 0; i < 15; i++) {
      await createUser({
        name: `User ${i}`,
        email: TestDataFactory.getUniqueEmail(),
        passwordHash: 'hashedpassword',
        role: 'USER',
      });
    }
    
    // Test first page
    const firstPage = await listUsers({ page: 1, limit: 10 });
    expect(firstPage.users.length).toBe(10);
    expect(firstPage.page).toBe(1);
    expect(firstPage.totalPages).toBeGreaterThan(1);
    
    // Test second page
    const secondPage = await listUsers({ page: 2, limit: 10 });
    expect(secondPage.users.length).toBe(5);
    expect(secondPage.page).toBe(2);
  });
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
