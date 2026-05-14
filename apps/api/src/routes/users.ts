import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

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
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, status } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data: { name, email, status },
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
