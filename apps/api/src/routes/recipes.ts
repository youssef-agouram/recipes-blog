import { Router } from 'express';
import prisma from '../lib/prisma';
import { RecipeSchema } from '../lib/schemas';
import { generateSlug } from '../lib/utils';

const router = Router();

// Client: Get recipes with pagination and filters
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, categoryId, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (categoryId) {
      where.categories = { some: { id: Number(categoryId) } };
    }
    if (search) {
      where.title = { contains: String(search), mode: 'insensitive' };
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
      data: recipes,
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
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
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
router.post('/', async (req, res, next) => {
  try {
    const data = RecipeSchema.parse(req.body);
    const slug = generateSlug(data.title);

    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        content: data.content,
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

// Admin: Update recipe
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = RecipeSchema.parse(req.body);

    const recipe = await prisma.recipe.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        summary: data.summary,
        content: data.content,
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
router.delete('/:id', async (req, res, next) => {
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
