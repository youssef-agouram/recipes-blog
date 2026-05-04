import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { ArticleSchema } from '../lib/schemas';
import { generateSlug } from '../lib/utils';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all articles
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10 } = req.query;
    const articles = await prisma.article.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// Create article (Admin)
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ArticleSchema.parse(req.body);
    const slug = generateSlug(data.title);
    const article = await prisma.article.create({
      data: {
        ...data,
        slug,
      },
    });
    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
});

// Get article by slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
    });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    next(error);
  }
});

// Update article (Admin)
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ArticleSchema.partial().parse(req.body);
    const article = await prisma.article.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(article);
  } catch (error) {
    next(error);
  }
});

// Delete article (Admin)
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.article.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
