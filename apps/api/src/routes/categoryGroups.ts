/**
 * Category Groups Routes
 * 
 * SECURITY: Write operations (create, update, delete) require
 * authentication + Administrator role.
 */

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { CategoryGroupSchema } from '../lib/schemas';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = Router();

// Get all groups — public read
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await prisma.categoryGroup.findMany({
      include: { _count: { select: { categories: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(groups);
  } catch (error) {
    next(error);
  }
});

// Create group — Admin only
router.post('/', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CategoryGroupSchema.parse(req.body);
    const group = await prisma.categoryGroup.create({ data });
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
});

// Update group — Admin only
router.put('/:id', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = CategoryGroupSchema.parse(req.body);
    const group = await prisma.categoryGroup.update({
      where: { id: Number(id) },
      data,
    });
    res.json(group);
  } catch (error) {
    next(error);
  }
});

// Delete group — Admin only
router.delete('/:id', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.categoryGroup.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
