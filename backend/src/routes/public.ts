import { Router } from 'express';
import { getPublicBooks } from '../controllers/publicController';

const router = Router();

// Public routes (no authentication required)
router.get('/books', getPublicBooks);

export default router;
