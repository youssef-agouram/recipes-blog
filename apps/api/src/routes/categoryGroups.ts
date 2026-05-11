import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { CategoryGroupSchema } from '../lib/schemas';

const router = Router();

// Get all groups
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

// Create group
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CategoryGroupSchema.parse(req.body);
    const group = await prisma.categoryGroup.create({ data });
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
});

// Update group
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
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

// Delete group
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
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
