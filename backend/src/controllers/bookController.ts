import type { Request, Response } from 'express';
import { 
  createBookService, 
  getBookByIdService, 
  listBooksService, 
  updateBookService, 
  deleteBookService 
} from '../services/bookService';

export async function create(req: Request, res: Response) {
  try {
    const book = await createBookService({
      ...req.body,
      uploadedById: req.user?.id,
    });
    res.status(201).json({ book });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function list(req: Request, res: Response) {
  try {
    const author = typeof req.query.author === 'string' ? req.query.author : undefined;
    const rating = typeof req.query.rating === 'string' ? parseInt(req.query.rating) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const uploadedById = typeof req.query.uploadedById === 'string' ? req.query.uploadedById : undefined;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : undefined;

    const result = await listBooksService({
      author,
      rating,
      search,
      uploadedById,
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

export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const book = await getBookByIdService(id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ book });
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
    const book = await updateBookService(id, req.body);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ book });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const success = await deleteBookService(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
