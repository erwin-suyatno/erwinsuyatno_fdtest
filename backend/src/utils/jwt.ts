import jwt from 'jsonwebtoken';

export function signJwt(payload: object, expiresIn: string | number = process.env.JWT_EXPIRES_IN || '1d') {
  return jwt.sign(payload as any, process.env.JWT_SECRET as string, { expiresIn });
}
