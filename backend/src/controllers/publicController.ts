import type { Request, Response } from 'express';
import { listBooksService } from '../services/bookService';

export async function getPublicBooks(req: Request, res: Response) {
  try {
    const author = typeof req.query.author === 'string' ? req.query.author : undefined;
    const rating = typeof req.query.rating === 'string' ? parseInt(req.query.rating) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : undefined;

    const result = await listBooksService({
      author,
      rating,
      search,
      page,
      limit,
    });
    
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
