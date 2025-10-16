import type { Request } from 'express';
import type { AuthPayload } from '../middlewares/auth';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export {};
