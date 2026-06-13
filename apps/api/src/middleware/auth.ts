/**
 * Authentication & Authorization Middleware
 * 
 * SECURITY:
 * - authMiddleware: Validates JWT token, attaches userId to request
 * - requireRole: RBAC middleware that checks user's role in database
 * - optionalAuth: Silently attaches userId if token is valid (no error if missing)
 * 
 * No secrets, tokens, or passwords are ever logged.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../lib/config';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

/**
 * Require a valid JWT token. Attaches userId to the request.
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    // SECURITY: Never reveal why the token failed (expired vs invalid vs tampered)
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Role-Based Access Control middleware.
 * Must be used AFTER authMiddleware.
 * 
 * Usage: router.get('/admin', authMiddleware, requireRole('Administrator'), handler)
 * Usage: router.get('/editor', authMiddleware, requireRole('Administrator', 'Editor'), handler)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true, status: true },
      });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Block inactive/banned users
      if (user.status !== 'Active') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.userRole = user.role;
      next();
    } catch {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

/**
 * Shorthand: require Administrator role.
 * Usage: router.get('/admin', authMiddleware, requireAdmin, handler)
 */
export const requireAdmin = requireRole('Administrator');

/**
 * Optional auth — attach userId if a valid token is present, but don't error if missing.
 */
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
    req.userId = decoded.userId;
  } catch {
    // Silently continue without userId
  }
  next();
};
