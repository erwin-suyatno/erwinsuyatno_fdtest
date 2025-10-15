import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { prisma } from '../utils/db';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const userId = (req as any).user?.userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, isVerified: true } });
  return res.json({ name: user?.name, isVerified: user?.isVerified ?? false });
});

export default router;
