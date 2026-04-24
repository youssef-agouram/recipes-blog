import { Router } from 'express';
import prisma from '../lib/prisma';
import { IngredientSchema } from '../lib/schemas';

const router = Router();

// Client: Get all ingredients
router.get('/', async (_req, res, next) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(ingredients);
  } catch (error) {
    next(error);
  }
});

// Admin: Create ingredient
router.post('/', async (req, res, next) => {
  try {
    const data = IngredientSchema.parse(req.body);
    const ingredient = await prisma.ingredient.create({ data });
    res.status(201).json(ingredient);
  } catch (error) {
    next(error);
  }
});

// Admin: Update ingredient
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = IngredientSchema.parse(req.body);
    const ingredient = await prisma.ingredient.update({
      where: { id: Number(id) },
      data,
    });
    res.json(ingredient);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete ingredient
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.ingredient.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
