import type { Request, Response } from 'express';
import { listUsersService } from '../services/userService';
import { updateUser } from '../models/user';

export async function list(req: Request, res: Response) {
  try {
    const isVerified = typeof req.query.is_verified === 'string' ? req.query.is_verified === 'true' : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : undefined;

    const result = await listUsersService({ isVerified, search, page, limit });
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await updateUser(id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
