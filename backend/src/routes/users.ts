import { Router } from 'express';
import { list, update } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, list);
router.put('/:id', authenticate, update);

export default router;
