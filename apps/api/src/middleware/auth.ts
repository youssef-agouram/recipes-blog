import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { getJwtSecret } from '../lib/config';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.error('[AUTH] No token provided in request');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    console.error('[AUTH] JWT Verification Failed:', {
      errorName: error.name,
      errorMessage: error.message,
      jwtSecretLoaded: !!process.env.JWT_SECRET,
      secretPreview: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'FALLBACK USED',
      tokenPreview: token.substring(0, 20) + '...',
    });
    
    let reason = error.message;
    if (error.name === 'TokenExpiredError') {
      reason = 'Token expired - please login again';
    } else if (error.name === 'JsonWebTokenError') {
      reason = 'Invalid token signature - JWT_SECRET mismatch';
    }
    
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid token',
      reason,
      debug: process.env.NODE_ENV === 'development' ? { errorName: error.name } : undefined
    });
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
    req.userId = decoded.userId;
  } catch (error) {
    // Just continue without userId if token is invalid
  }
  next();
};
