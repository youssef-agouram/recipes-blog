import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { RecipeSchema } from '../lib/schemas';
import { generateSlug } from '../lib/utils';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Helper: parse ingredientsJson from string to array for API responses
function parseRecipe(recipe: any) {
  if (!recipe) return recipe;
  if (Array.isArray(recipe)) {
    return recipe.map(r => ({
      ...r,
      ingredientsJson: typeof r.ingredientsJson === 'string' ? JSON.parse(r.ingredientsJson) : r.ingredientsJson ?? [],
    }));
  }
  return {
    ...recipe,
    ingredientsJson: typeof recipe.ingredientsJson === 'string' ? JSON.parse(recipe.ingredientsJson) : recipe.ingredientsJson ?? [],
  };
}

// Client: Get recipes with pagination and filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, categoryId, search, featured, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (categoryId) {
      where.categories = { some: { id: Number(categoryId) } };
    }
    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }
    if (status) {
      where.status = status as string;
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

    res.json({
      data: parseRecipe(recipes),
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

    res.json(parseRecipe(recipe));
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
        status: data.status || 'PUBLISHED',
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        allowComments: data.allowComments ?? true,
        isFeatured: data.isFeatured ?? false,
        ingredientsJson: data.ingredientsJson || undefined,
        categories: data.categoryIds
          ? { connect: data.categoryIds.map((id) => ({ id })) }
          : undefined,
        ingredients: data.ingredientIds
          ? { connect: data.ingredientIds.map((id) => ({ id })) }
          : undefined,
        seo: data.seo && (data.seo.title || data.seo.description) 
          ? { create: data.seo } 
          : undefined,
      },
      include: { categories: true, ingredients: true, seo: true },
    });

    res.status(201).json(parseRecipe(recipe));
  } catch (error) {
    console.error('Error creating recipe:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
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
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL), '[]') AS categories,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', i.id, 'name', i.name)) FILTER (WHERE i.id IS NOT NULL), '[]') AS ingredients
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
        status: data.status,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        allowComments: data.allowComments,
        isFeatured: data.isFeatured,
        ingredientsJson: data.ingredientsJson || undefined,
        categories: data.categoryIds
          ? { set: data.categoryIds.map((id) => ({ id })) }
          : undefined,
        ingredients: data.ingredientIds
          ? { set: data.ingredientIds.map((id) => ({ id })) }
          : undefined,
        seo: data.seo && (data.seo.title || data.seo.description)
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

    res.json(parseRecipe(recipe));
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
