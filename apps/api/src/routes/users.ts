import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /users
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /users/stats
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
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
      admins
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:id/role
router.patch('/:id/role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['Subscriber', 'Administrator', 'Author', 'Editor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data: { role },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// PUT /users/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id as string);

    // 1. Get current requesting user to check permissions
    const requestingUser = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!requestingUser) {
      return res.status(404).json({ error: 'Requesting user not found' });
    }

    // 2. A user can only update their own profile, UNLESS they are an Administrator
    if (req.userId !== targetUserId && requestingUser.role !== 'Administrator') {
      return res.status(403).json({ error: 'Forbidden: You cannot modify other users' });
    }

    const { name, email, status, avatar, unlockCookingGuide } = req.body;

    // 3. Build update body
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Only administrators can change the status and unlockCookingGuide permission
    if (requestingUser.role === 'Administrator') {
      if (status !== undefined) updateData.status = status;
      if (unlockCookingGuide !== undefined) {
        updateData.unlockCookingGuide = unlockCookingGuide === true || unlockCookingGuide === 'true';
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
