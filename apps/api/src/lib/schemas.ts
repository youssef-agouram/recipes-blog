import { z } from 'zod';

export const RecipeSchema = z.object({
  title: z.string().min(3).max(255),
  summary: z.string().optional(),
  imageUrl: z.string().optional(),
  content: z.any(), // Will be Tiptap JSON
  categoryIds: z.array(z.number()).optional(),
  ingredientIds: z.array(z.number()).optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

export const CategorySchema = z.object({
  name: z.string().min(2).max(50),
});

export const IngredientSchema = z.object({
  name: z.string().min(2).max(50),
});
