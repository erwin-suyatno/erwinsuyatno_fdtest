import { Router } from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword, changePassword, me } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyEmail);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, me);

export default router;
