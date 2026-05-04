import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { HeroSettingsSchema, SubscriberSchema } from '../lib/schemas';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get hero settings
router.get('/hero', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.heroSettings.findFirst();
    res.json(settings || {
      title: "Good Food, Good Mood",
      subtitle: "Explore thousands of handpicked recipes from around the world.",
      ctaText: "Explore Recipes"
    });
  } catch (error) {
    next(error);
  }
});

// Update hero settings (Admin)
router.put('/hero', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = HeroSettingsSchema.parse(req.body);
    const settings = await prisma.heroSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { ...data, id: 1 },
    });
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Subscribe to newsletter
router.post('/subscribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = SubscriberSchema.parse(req.body);
    const subscriber = await prisma.subscriber.create({
      data: { email },
    });
    res.status(201).json(subscriber);
  } catch (error) {
    if ((error as any).code === 'P2002') {
      return res.status(400).json({ error: 'Email already subscribed' });
    }
    next(error);
  }
});

export default router;
