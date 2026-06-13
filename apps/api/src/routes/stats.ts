import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = Router();

// Record a visit from frontend client
router.post('/visit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { path, sessionId } = req.body;
    if (!path) {
      return res.status(400).json({ error: 'path is required' });
    }

    // Secondary backend safeguard to ensure no admin path visits are recorded in the database
    if (path.startsWith('/admin')) {
      return res.json({ success: true, message: 'Admin visits are not tracked to match Vercel Analytics' });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Extract referrer
    let referrer = 'Direct';
    const rawReferrer = (req.headers.referer || req.headers.referrer || '') as string;
    if (rawReferrer) {
      try {
        const refUrl = new URL(rawReferrer);
        const host = refUrl.hostname.toLowerCase();
        
        // Exclude own hosts (local or production domain)
        const isOwnHost = host.includes('localhost') || 
                           host.includes('127.0.0.1') || 
                           host.includes('recipes-blog-web') || 
                           host.includes('tasteful');
        
        if (!isOwnHost) {
          if (host.includes('google.')) referrer = 'Google Search';
          else if (host.includes('pinterest.')) referrer = 'Pinterest';
          else if (host.includes('facebook.')) referrer = 'Facebook';
          else if (host.includes('youtube.')) referrer = 'YouTube';
          else if (host.includes('instagram.')) referrer = 'Instagram';
          else {
            referrer = refUrl.hostname.replace('www.', '');
          }
        }
      } catch (e) {
        if (rawReferrer.includes('google')) referrer = 'Google Search';
        else if (rawReferrer.includes('pinterest')) referrer = 'Pinterest';
        else if (rawReferrer.includes('facebook')) referrer = 'Facebook';
        else if (rawReferrer.includes('youtube')) referrer = 'YouTube';
        else if (rawReferrer.includes('instagram')) referrer = 'Instagram';
      }
    }

    // Extract country code from Vercel header
    const countryCode = (req.headers['x-vercel-ip-country'] as string || '').toUpperCase();
    const countryMap: { [key: string]: string } = {
      'MA': 'Morocco',
      'US': 'United States',
      'FR': 'France',
      'DZ': 'Algeria',
      'CA': 'Canada',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'ES': 'Spain',
      'IT': 'Italy',
      'IN': 'India',
      'AU': 'Australia',
      'BR': 'Brazil',
      'JP': 'Japan',
    };
    const country = countryCode ? (countryMap[countryCode] || countryCode) : 'Unknown';

    // Update duration of the previous visit in the same session (if any)
    if (sessionId) {
      const lastVisit = await prisma.visit.findFirst({
        where: { sessionId },
        orderBy: { createdAt: 'desc' }
      });

      if (lastVisit) {
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - lastVisit.createdAt.getTime()) / 1000);
        if (diffSeconds > 0 && diffSeconds < 1800) {
          await prisma.visit.update({
            where: { id: lastVisit.id },
            data: { duration: diffSeconds }
          });
        }
      }
    }

    // Create the new visit
    const visit = await prisma.visit.create({
      data: {
        path,
        sessionId: sessionId || 'guest_session',
        ip,
        userAgent,
        referrer,
        country
      }
    });

    res.json({ success: true, visitId: visit.id });
  } catch (error) {
    next(error);
  }
});

// Get dashboard stats
router.get('/dashboard', authMiddleware, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = (req.query.range || '7d') as string;
    let startDate = new Date();
    if (range === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (range === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setDate(startDate.getDate() - 7);
    }

    const results = await Promise.all([
      prisma.recipe.count({ where: { status: { not: 'TRASH' } } }),
      prisma.category.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.recipe.count({ where: { status: 'PUBLISHED' } }),
      prisma.recipe.count({ where: { status: 'DRAFT' } }),
      prisma.visit.count({ where: { createdAt: { gte: startDate } } }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } } }
      }),
      prisma.recipe.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, slug: true, imageUrl: true, views: true }
      }),
      prisma.visit.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: startDate } }
      }).then(res => res.length),
      prisma.visit.aggregate({
        _sum: { duration: true },
        where: { createdAt: { gte: startDate } }
      }).then(res => res._sum.duration || 0),
      // Count sessions with only 1 visit
      prisma.$queryRaw<{count: string}[]>`
        SELECT COUNT(*) as count 
        FROM (
          SELECT "sessionId" 
          FROM "Visit" 
          WHERE "createdAt" >= ${startDate}
          GROUP BY "sessionId" 
          HAVING COUNT(*) = 1
        ) as single_visit_sessions
      `.then(res => Number(res[0].count || 0)),
      // Active users count (unique session ids in last 5 minutes)
      prisma.visit.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000)
          }
        }
      }).then(res => res.length),
      // Top active pages (grouped by path in last 5 minutes)
      prisma.visit.groupBy({
        by: ['path'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000)
          }
        },
        _count: {
          path: true
        },
        orderBy: {
          _count: {
            path: 'desc'
          }
        },
        take: 5
      }),
      // Unique IP address count
      prisma.visit.groupBy({
        by: ['ip'],
        where: { createdAt: { gte: startDate } }
      }).then(res => res.length),
      // GA4 Analytics Settings
      prisma.analyticsSettings.findFirst({
        where: { id: 1 }
      })
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
      singleVisitSessions,
      activeUsersCount,
      activePagesGroup,
      uniqueIpsCount,
      analyticsConfig
    ] = results;

    const avgDuration = uniqueSessionsCount ? Math.floor(totalDuration / uniqueSessionsCount) : 0;
    const pagesPerSession = uniqueSessionsCount ? (visitsCount / uniqueSessionsCount).toFixed(2) : '0';
    const bounceRate = uniqueSessionsCount ? ((singleVisitSessions / uniqueSessionsCount) * 100).toFixed(1) : '0';

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate overviewData (hourly for 24h, daily for others)
    let overviewData = [];
    if (range === '24h') {
      const last24Hours = Array.from({ length: 24 }, (_, i) => {
        const d = new Date();
        d.setHours(d.getHours() - i);
        d.setMinutes(0, 0, 0);
        return d;
      }).reverse();

      overviewData = await Promise.all(last24Hours.map(async (hourDate) => {
        const startOfHour = new Date(hourDate);
        const endOfHour = new Date(hourDate);
        endOfHour.setHours(endOfHour.getHours() + 1);

        const pageViews = await prisma.visit.count({
          where: {
            createdAt: { gte: startOfHour, lt: endOfHour }
          }
        });

        const visitors = await prisma.visit.groupBy({
          by: ['sessionId'],
          where: {
            createdAt: { gte: startOfHour, lt: endOfHour }
          }
        }).then(res => res.length);

        return {
          name: hourDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          visitors,
          pageViews,
          sessions: visitors,
          pageviews: pageViews,
        };
      }));
    } else {
      const daysCount = range === '30d' ? 30 : 7;
      const lastDays = Array.from({ length: daysCount }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      overviewData = await Promise.all(lastDays.map(async (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const pageViews = await prisma.visit.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        });

        const visitors = await prisma.visit.groupBy({
          by: ['sessionId'],
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }).then(res => res.length);

        return {
          name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          visitors,
          pageViews,
          sessions: visitors,
          pageviews: pageViews,
        };
      }));
    }

    // Fetch and aggregate dynamic Top Recipes views from visits
    const topVisitPaths = await prisma.visit.groupBy({
      by: ['path'],
      where: {
        path: { startsWith: '/recipes/' },
        createdAt: { gte: startDate }
      },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10
    });

    const slugs = topVisitPaths.map(p => {
      const parts = p.path.split('?')[0].split('/');
      return parts[2];
    }).filter(Boolean);

    const dbRecipes = await prisma.recipe.findMany({
      where: { slug: { in: slugs } },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        categories: {
          take: 1,
          select: { name: true }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    const formattedTopRecipes = topVisitPaths.map(vp => {
      const slug = vp.path.split('?')[0].split('/')[2];
      const recipe = dbRecipes.find(r => r.slug === slug);
      if (!recipe) return null;
      return {
        id: recipe.id,
        title: recipe.title,
        path: `/recipes/${recipe.slug}`,
        category: recipe.categories[0]?.name || 'Uncategorized',
        views: vp._count.path.toLocaleString(),
        comments: recipe._count.comments,
        imageUrl: recipe.imageUrl,
        avgTime: '4m 32s',
        favorites: Math.floor(vp._count.path * 0.1).toLocaleString(),
      };
    }).filter(Boolean);

    let finalTopRecipes = formattedTopRecipes;
    if (finalTopRecipes.length === 0) {
      finalTopRecipes = topRecipes.map(r => ({
        id: r.id,
        title: r.title,
        path: `/recipes/${r.slug || ''}`,
        category: 'Uncategorized',
        views: r.views.toLocaleString(),
        comments: 0,
        imageUrl: r.imageUrl,
        avgTime: '3m 45s',
        favorites: Math.floor(r.views * 0.12).toLocaleString(),
      }));
    }

    // Parse Device UA analytics
    const allVisitsWithUA = await prisma.visit.findMany({
      select: { userAgent: true },
      where: { createdAt: { gte: startDate } },
      take: 1000
    });

    let mobileCount = 0;
    let tabletCount = 0;
    let desktopCount = 0;

    allVisitsWithUA.forEach(v => {
      const ua = v.userAgent || '';
      if (/mobile|iphone|android/i.test(ua)) {
        mobileCount++;
      } else if (/tablet|ipad/i.test(ua)) {
        tabletCount++;
      } else {
        desktopCount++;
      }
    });

    const totalUA = allVisitsWithUA.length || 1;
    let deviceData = [
      { name: 'Mobile', value: mobileCount },
      { name: 'Desktop', value: desktopCount },
      { name: 'Tablet', value: tabletCount },
    ];

    // Query and calculate referrer data dynamically
    const dbReferrers = await prisma.visit.groupBy({
      by: ['referrer'],
      where: { createdAt: { gte: startDate } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: 'desc' } },
      take: 6
    });

    const totalReferrersCount = await prisma.visit.count({ where: { createdAt: { gte: startDate } } });
    const chartColors = ['#5850ec', '#ec4899', '#22d3ee', '#3b82f6', '#ef4444', '#f59e0b', '#10b981'];

    let referrerData = dbReferrers.map((r, i) => {
      const val = r._count.referrer;
      const pct = totalReferrersCount ? ((val / totalReferrersCount) * 100).toFixed(1) + '%' : '0%';
      return {
        name: r.referrer || 'Direct',
        value: val,
        percentage: pct,
        color: chartColors[i % chartColors.length]
      };
    });

    // Query and calculate country data dynamically
    const dbCountries = await prisma.visit.groupBy({
      by: ['country'],
      where: { createdAt: { gte: startDate } },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 5
    });

    const totalCountriesCount = await prisma.visit.count({ where: { createdAt: { gte: startDate } } });

    let countryData = dbCountries.map((c, i) => {
      const val = c._count.country;
      const pct = totalCountriesCount ? ((val / totalCountriesCount) * 100).toFixed(1) + '%' : '0%';
      return {
        name: c.country || 'Unknown',
        value: val,
        percentage: pct,
        color: chartColors[i % chartColors.length]
      };
    });

    let finalActiveUsers = {
      total: activeUsersCount || 0,
      pages: activePagesGroup.length > 0 ? activePagesGroup.map(ap => ({ path: ap.path, users: ap._count.path })) : [],
      chartData: [] as { time: string; users: number }[]
    };

    let finalSummary = {
      recipes: { total: recipesCount, trend: { value: '0%', isUp: true } },
      categories: { total: categoriesCount, trend: { value: '0%', isUp: true } },
      users: { total: usersCount, trend: { value: '0%', isUp: true } },
      comments: { total: commentsCount, trend: { value: '0%', isUp: false } },
      sessions: { total: uniqueSessionsCount, trend: { value: '0%', isUp: true } },
      pageviews: { total: visitsCount, trend: { value: '0%', isUp: true } },
      uniqueVisitors: { total: uniqueIpsCount, trend: { value: '0%', isUp: true } },
      avgDuration: { value: formatDuration(avgDuration), trend: { value: '0%', isUp: true } },
      pagesPerSession: { value: pagesPerSession, trend: { value: '0%', isUp: true } },
      bounceRate: { value: bounceRate + '%', trend: { value: '0%', isUp: false } }
    };

    res.json({
      summary: finalSummary,
      status: {
        published: publishedCount,
        draft: draftCount,
        pending: 0
      },
      recentComments: recentComments.length > 0 ? recentComments : [],
      topRecipes: finalTopRecipes,
      overviewData,
      deviceData,
      referrerData,
      countryData,
      activeUsers: finalActiveUsers
    });
  } catch (error) {
    next(error);
  }
});

export default router;
