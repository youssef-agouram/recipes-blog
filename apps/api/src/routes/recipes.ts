import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { RecipeSchema } from '../lib/schemas';
import { generateSlug } from '../lib/utils';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Client: Get recipes with pagination and filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, categoryId, search, featured } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Use raw SQL so isFeatured is always included regardless of Prisma client version
    if (featured === 'true') {
      const recipes = await prisma.$queryRaw<any[]>`
        SELECT r.*,
          COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL), '[]') AS categories,
          COALESCE(json_agg(DISTINCT jsonb_build_object('id', i.id, 'name', i.name)) FILTER (WHERE i.id IS NOT NULL), '[]') AS ingredients
        FROM "Recipe" r
        LEFT JOIN "_RecipeCategories" rc ON rc."B" = r.id
        LEFT JOIN "Category" c ON c.id = rc."A"
        LEFT JOIN "_RecipeIngredients" ri ON ri."B" = r.id
        LEFT JOIN "Ingredient" i ON i.id = ri."A"
        WHERE r."isFeatured" = true
        GROUP BY r.id
        ORDER BY r."createdAt" DESC
        LIMIT ${take} OFFSET ${skip}
      `;
      const [countResult] = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "Recipe" WHERE "isFeatured" = true
      `;
      return res.json({
        data: recipes,
        meta: {
          total: Number(countResult.count),
          page: Number(page),
          limit: take,
          totalPages: Math.ceil(Number(countResult.count) / take),
        },
      });
    }

    // General list — use Prisma ORM for filtering, then enrich with isFeatured from raw SQL
    const where: any = {};
    if (categoryId) {
      where.categories = { some: { id: Number(categoryId) } };
    }
    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take,
        include: { categories: true, ingredients: true, seo: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.recipe.count({ where }),
    ]);

    // Enrich with isFeatured from raw SQL (in case Prisma binary is stale)
    const ids = recipes.map((r: any) => r.id);
    let featuredSet = new Set<number>();
    if (ids.length > 0) {
      const placeholders = ids.map((_: any, i: number) => `$${i + 1}`).join(',');
      const featuredRows = await prisma.$queryRawUnsafe<{ id: number }[]>(
        `SELECT id FROM "Recipe" WHERE id IN (${placeholders}) AND "isFeatured" = true`,
        ...ids
      );
      featuredSet = new Set(featuredRows.map((r) => r.id));
    }
    const enriched = recipes.map((r: any) => ({
      ...r,
      isFeatured: featuredSet.has(r.id),
    }));

    res.json({
      data: enriched,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Client: Get single recipe by slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const recipe = await prisma.recipe.findUnique({
      where: { slug: slug as string },
      include: { categories: true, ingredients: true, seo: true },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Admin: Create recipe
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RecipeSchema.parse(req.body);
    const slug = generateSlug(data.title);

    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl,
        categories: data.categoryIds
          ? { connect: data.categoryIds.map((id) => ({ id })) }
          : undefined,
        ingredients: data.ingredientIds
          ? { connect: data.ingredientIds.map((id) => ({ id })) }
          : undefined,
        seo: data.seo ? { create: data.seo } : undefined,
      },
      include: { categories: true, ingredients: true, seo: true },
    });

    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

// Admin: Toggle featured status (must be BEFORE /:id routes)
router.patch('/:id/feature', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid recipe ID' });

    // Use raw SQL to toggle isFeatured — bypasses stale Prisma client binary
    await prisma.$executeRaw`
      UPDATE "Recipe" SET "isFeatured" = NOT "isFeatured", "updatedAt" = NOW() WHERE id = ${id}
    `;

    const [updated] = await prisma.$queryRaw<any[]>`
      SELECT r.*, 
        json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL) AS categories,
        json_agg(DISTINCT jsonb_build_object('id', i.id, 'name', i.name)) FILTER (WHERE i.id IS NOT NULL) AS ingredients
      FROM "Recipe" r
      LEFT JOIN "_RecipeCategories" rc ON rc."B" = r.id
      LEFT JOIN "Category" c ON c.id = rc."A"
      LEFT JOIN "_RecipeIngredients" ri ON ri."B" = r.id
      LEFT JOIN "Ingredient" i ON i.id = ri."A"
      WHERE r.id = ${id}
      GROUP BY r.id
    `;

    if (!updated) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ ...updated, categories: updated.categories ?? [], ingredients: updated.ingredients ?? [] });
  } catch (error) {
    next(error);
  }
});

// Admin: Update recipe
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = RecipeSchema.parse(req.body);

    const recipe = await prisma.recipe.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl,
        categories: data.categoryIds
          ? { set: data.categoryIds.map((id) => ({ id })) }
          : undefined,
        ingredients: data.ingredientIds
          ? { set: data.ingredientIds.map((id) => ({ id })) }
          : undefined,
        seo: data.seo
          ? {
              upsert: {
                create: data.seo,
                update: data.seo,
              },
            }
          : undefined,
      },
      include: { categories: true, ingredients: true, seo: true },
    });

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete recipe
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.recipe.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
