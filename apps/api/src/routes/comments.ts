import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get comments for a recipe (with nested replies)
router.get('/recipe/:recipeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipeId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { 
        recipeId: Number(recipeId),
        status: 'APPROVED',
        parentId: null // Only get top-level comments
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        },
        replies: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Admin: Get all comments
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        recipe: { select: { title: true, imageUrl: true } },
        user: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Post a comment (or reply)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text, rating, recipeId, parentId } = req.body;
    const userId = req.userId;
    
    if (!text || !recipeId) {
      return res.status(400).json({ error: 'Text and recipeId are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        rating: rating ? Number(rating) : null,
        recipeId: Number(recipeId),
        userId: userId,
        parentId: parentId ? Number(parentId) : null,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// Like a comment
router.patch('/:id/like', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { likeCount: { increment: 1 } }
    });
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Admin: Update comment status
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const comment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete comment
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id: Number(id) }
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
