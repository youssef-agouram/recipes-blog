/**
 * Comments Routes
 * 
 * SECURITY:
 * - Like requires authentication (prevents vote manipulation)
 * - Status change requires Admin role
 * - Delete requires Admin role
 * - Comment posting requires authentication
 */

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get comments for a recipe (with nested replies) — public
router.get('/recipe/:recipeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipeId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { 
        recipeId: Number(recipeId),
        status: 'APPROVED',
        parentId: null
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
router.get('/', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
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

// Post a comment (or reply) — requires auth
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text, rating, recipeId, parentId } = req.body;
    const userId = req.userId;
    
    if (!text || !recipeId) {
      return res.status(400).json({ error: 'Text and recipeId are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        text: String(text).substring(0, 2000), // Limit comment length
        rating: rating ? Math.min(Math.max(Number(rating), 1), 5) : null, // Clamp 1-5
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

// Like a comment — requires auth to prevent vote manipulation
router.patch('/:id/like', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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
router.patch('/:id/status', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'SPAM'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

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
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
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
