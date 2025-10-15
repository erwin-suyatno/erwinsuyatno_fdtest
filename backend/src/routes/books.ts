import { Router } from 'express';
import { create, list, getById, update, remove } from '../controllers/bookController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All book routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', create);
router.get('/', list);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
