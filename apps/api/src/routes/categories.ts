import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { CategorySchema } from '../lib/schemas';

const router = Router();

// Client: Get all categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Admin: Create category
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CategorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// Admin: Update category
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = CategorySchema.parse(req.body);
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data,
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete category
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
