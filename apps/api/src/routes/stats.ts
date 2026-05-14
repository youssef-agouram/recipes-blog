import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get dashboard stats
router.get('/dashboard', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await Promise.all([
      prisma.recipe.count({ where: { status: { not: 'TRASH' } } }),
      prisma.category.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.recipe.count({ where: { status: 'PUBLISHED' } }),
      prisma.recipe.count({ where: { status: 'DRAFT' } }),
      prisma.visit.count(),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } } }
      }),
      prisma.recipe.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, imageUrl: true, views: true }
      }),
      prisma.visit.groupBy({
        by: ['sessionId'],
      }).then(res => res.length),
      prisma.visit.aggregate({
        _sum: { duration: true }
      }).then(res => res._sum.duration || 0),
      // Count sessions with only 1 visit
      prisma.$queryRaw<{count: string}[]>`
        SELECT COUNT(*) as count 
        FROM (
          SELECT "sessionId" 
          FROM "Visit" 
          GROUP BY "sessionId" 
          HAVING COUNT(*) = 1
        ) as single_visit_sessions
      `.then(res => Number(res[0].count || 0))
    ]);

    const [
      recipesCount, 
      categoriesCount, 
      usersCount, 
      commentsCount,
      publishedCount,
      draftCount,
      visitsCount,
      recentComments,
      topRecipes,
      uniqueSessionsCount,
      totalDuration,
      singleVisitSessions
    ] = results;

    const avgDuration = uniqueSessionsCount ? Math.floor(totalDuration / uniqueSessionsCount) : 0;
    const pagesPerSession = uniqueSessionsCount ? (visitsCount / uniqueSessionsCount).toFixed(2) : '0';
    const bounceRate = uniqueSessionsCount ? ((singleVisitSessions / uniqueSessionsCount) * 100).toFixed(1) : '0';

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Group visits by day for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const overviewData = await Promise.all(last7Days.map(async (date) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await prisma.visit.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      return {
        name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: count,
        impressions: count * 15,
      };
    }));

    res.json({
      summary: {
        recipes: { total: recipesCount, trend: { value: '12.5%', isUp: true } },
        categories: { total: categoriesCount, trend: { value: '8.3%', isUp: true } },
        users: { total: usersCount, trend: { value: '15.7%', isUp: true } },
        comments: { total: commentsCount, trend: { value: '4.2%', isUp: false } },
        sessions: { total: visitsCount, trend: { value: '23.6%', isUp: true } },
        avgDuration: { value: formatDuration(avgDuration), trend: { value: '16.3%', isUp: true } },
        pagesPerSession: { value: pagesPerSession, trend: { value: '4.1%', isUp: true } },
        bounceRate: { value: bounceRate + '%', trend: { value: '5.3%', isUp: false } }
      },
      status: {
        published: publishedCount,
        draft: draftCount,
        pending: 0
      },
      recentComments: recentComments.length > 0 ? recentComments : [],
      topRecipes: topRecipes.length > 0 ? topRecipes : [],
      overviewData
    });
  } catch (error) {
    next(error);
  }
});

export default router;
