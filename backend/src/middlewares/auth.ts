import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload { id: string; userId: string; email: string; role: string; }

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = auth.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
