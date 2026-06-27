import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function parentAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    res.status(401).json({ error: 'トークンが無効です' });
  }
}
