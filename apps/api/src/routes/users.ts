/**
 * Users Routes
 * 
 * SECURITY:
 * - ALL routes require authentication
 * - List/stats/role-change/delete require Administrator role
 * - Password field is NEVER returned in any response
 * - Users can only update their own profile (unless Admin)
 */

import { Router, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, requireAdmin, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// SECURITY: Prisma select that explicitly excludes password
const USER_SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  avatar: true,
  createdAt: true,
} as const;

// GET /users — Admin only, never returns passwords
router.get('/', authMiddleware, requireAdmin, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: USER_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /users/stats — Admin only
router.get('/stats', authMiddleware, requireAdmin, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, activeUsers, subscribers, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'Active' } }),
      prisma.user.count({ where: { role: 'Subscriber' } }),
      prisma.user.count({ where: { role: 'Administrator' } }),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      subscribers,
      admins,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:id/role — Admin only
router.patch('/:id/role', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['Subscriber', 'Administrator', 'Author', 'Editor'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id as string) },
      select: USER_SAFE_SELECT,
      data: { role },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// PUT /users/:id — Authenticated users can update own profile, Admins can update anyone
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id as string);

    // Get current requesting user to check permissions
    const requestingUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!requestingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // A user can only update their own profile, UNLESS they are an Administrator
    if (req.userId !== targetUserId && requestingUser.role !== 'Administrator') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, email, status, avatar } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Only administrators can change the status
    if (requestingUser.role === 'Administrator') {
      if (status !== undefined) updateData.status = status;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      select: USER_SAFE_SELECT,
      data: updateData,
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id — Admin only
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id as string);

    // Prevent admin from deleting themselves
    if (req.userId === targetUserId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
