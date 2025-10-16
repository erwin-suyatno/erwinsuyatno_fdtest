import { Router } from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword, changePassword, me, validatePassword } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);
router.post('/validate-password', validatePassword);
router.get('/me', authenticate, me);

export default router;
