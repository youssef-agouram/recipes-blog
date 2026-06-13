import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { CategorySchema } from '../lib/schemas';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { status: 'PUBLISHED' };
    
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { recipes: true }
        }
      },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Admin: Get single category
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Admin: Create category
router.post('/', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CategorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// Admin: Update category
router.put('/:id', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = CategorySchema.partial().parse(req.body);
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
router.delete('/:id', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
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
