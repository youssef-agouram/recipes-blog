import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { SiteSettingsSchema, HeroSettingsSchema, SubscriberSchema } from '../lib/schemas';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get site settings
router.get('/site', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    let adSettings = undefined;
    if (settings && settings.commentSettings && typeof settings.commentSettings === 'object' && 'ads' in (settings.commentSettings as any)) {
      adSettings = (settings.commentSettings as any).ads;
    }
    
    // Fallback: Also try to read from actual adSettings column if it exists and has keys
    if (!adSettings && settings && 'adSettings' in settings && settings.adSettings && Object.keys(settings.adSettings as any).length > 0) {
      adSettings = settings.adSettings;
    }

    res.json(settings ? { ...settings, adSettings } : {
      brandName: "Tasteful",
      tagline: "Delicious Recipes",
      stickyNavbar: true,
      showSearchBar: true,
      showAuthButtons: true,
      showTopBar: true,
      menuItems: [],
      profileMenu: [],
      socialLinks: [],
      copyrightText: "© {year} Tasteful. All rights reserved.",
      adSettings: undefined
    });
  } catch (error) {
    next(error);
  }
});

// Update site settings (Admin)
router.put('/site', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = SiteSettingsSchema.parse(req.body);
    const { adSettings, ...restData } = data;
    
    const updatePayload = {
      ...restData,
      commentSettings: {
        ...(typeof restData.commentSettings === 'object' ? restData.commentSettings : {}),
        ads: adSettings
      }
    };

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: updatePayload,
      create: { ...updatePayload, id: 1 },
    });
    res.json({ ...settings, adSettings });
  } catch (error) {
    next(error);
  }
});

// Get hero settings
router.get('/hero', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.heroSettings.findFirst();
    res.json(settings || {
      title: "Good Food, Good Mood",
      subtitle: "Explore thousands of handpicked recipes from around the world.",
      images: [],
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
