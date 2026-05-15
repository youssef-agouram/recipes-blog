import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { ArticleSchema } from '../lib/schemas';
import { generateSlug } from '../lib/utils';
import { authMiddleware, AuthRequest, optionalAuth } from '../middleware/auth';

const router = Router();

// Get all articles
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { limit = 10, isTopArticle } = req.query;
    const where: any = {};
    
    if (isTopArticle === 'true') {
      where.isTopArticle = true;
    }

    const articles = await prisma.article.findMany({
      where,
      take: Number(limit),
      include: {
        ...(userId ? { 
          savedArticles: { where: { userId } },
          favoriteArticles: { where: { userId } }
        } : {})
      },
      orderBy: { createdAt: 'desc' },
    });

    const processed = articles.map(a => {
      const isSaved = userId ? a.savedArticles.length > 0 : false;
      const isFavorited = userId ? a.favoriteArticles.length > 0 : false;
      const { savedArticles, favoriteArticles, ...rest } = a;
      return { ...rest, isSaved, isFavorited };
    });

    res.json(processed);
  } catch (error) {
    next(error);
  }
});

// Client: Get saved articles
router.get('/saved', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const saved = await prisma.savedArticle.findMany({
      where: { userId },
      include: { article: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(saved.map(s => ({ ...s.article, isSaved: true })));
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
// Client: Get favorited articles
router.get('/favorited', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const favorited = await prisma.favoriteArticle.findMany({
      where: { userId },
      include: { article: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(favorited.map(f => ({ ...f.article, isFavorited: true, isSaved: false }))); // isSaved would need another check if we want it perfect
  } catch (error) {
    next(error);
  }
});


// Get article by slug
router.get('/:slug', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const article = await prisma.article.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        ...(userId ? { 
          savedArticles: { where: { userId } },
          favoriteArticles: { where: { userId } }
        } : {})
      }
    });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    const isSaved = userId ? article.savedArticles.length > 0 : false;
    const isFavorited = userId ? article.favoriteArticles.length > 0 : false;
    const { savedArticles, favoriteArticles, ...rest } = article;
    
    res.json({ ...rest, isSaved, isFavorited });
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

// Admin: Toggle top article status
router.patch('/:id/toggle-top-article', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid article ID' });

    await prisma.$executeRaw`
      UPDATE "Article" SET "isTopArticle" = NOT "isTopArticle", "updatedAt" = NOW() WHERE id = ${id}
    `;

    const updated = await prisma.article.findUnique({
      where: { id },
    });

    if (!updated) return res.status(404).json({ error: 'Article not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Client: Save article
router.post('/:id/save', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const articleId = Number(req.params.id);
    const userId = req.userId!;
    const saved = await prisma.savedArticle.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: {},
      create: { userId, articleId }
    });
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

// Client: Unsave article
router.delete('/:id/save', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const articleId = Number(req.params.id);
    const userId = req.userId!;
    await prisma.savedArticle.delete({
      where: { userId_articleId: { userId, articleId } }
    });
    res.status(204).end();
  } catch (error) {
    res.status(204).end();
  }
});


// Client: Favorite article
router.post('/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const articleId = Number(req.params.id);
    const userId = req.userId!;
    const favorited = await prisma.favoriteArticle.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: {},
      create: { userId, articleId }
    });
    res.status(201).json(favorited);
  } catch (error) {
    next(error);
  }
});

// Client: Unfavorite article
router.delete('/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const articleId = Number(req.params.id);
    const userId = req.userId!;
    await prisma.favoriteArticle.delete({
      where: { userId_articleId: { userId, articleId } }
    });
    res.status(204).end();
  } catch (error) {
    res.status(204).end();
  }
});

export default router;
