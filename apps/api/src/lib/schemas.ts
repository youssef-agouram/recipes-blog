import { z } from 'zod';

export const RecipeSchema = z.object({
  title: z.string().min(3).max(255),
  summary: z.string().max(160).optional(),
  imageUrl: z.string().optional(),
  content: z.any(), // Will be Tiptap JSON
  categoryIds: z.array(z.number()).optional(),
  ingredientIds: z.array(z.number()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.number().int().min(1).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  allowComments: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  ingredientsJson: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
  })).optional(),
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

export const ArticleSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(10),
  summary: z.string().optional(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
});

export const HeroSettingsSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageUrl: z.string().optional(),
  ctaText: z.string(),
});

export const SubscriberSchema = z.object({
  email: z.string().email(),
});
