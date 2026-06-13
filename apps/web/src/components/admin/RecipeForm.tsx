'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InstructionsEditor } from '../editor/InstructionsEditor';
import { useGetAdminCategoriesQuery } from '@/store/api/categoryApi';
import { useUploadImageMutation, useGetAdminRecipesQuery } from '@/store/api/recipeApi';
import { useGenerateAiMetadataMutation } from '@/store/api/seoApi';
import { Recipe, RecipeIngredient } from '@/lib/types';
import {
  analyzeRecipeSEO,
  analyzeReadability,
  getInternalLinkingSuggestions,
  generateAdvancedRecipeJsonLd,
  generateFAQJsonLd,
  generateBreadcrumbListJsonLd,
} from '@/lib/seoAnalyzer';
import {
  Loader2, Upload, Clock, Users, Trash2, ChevronDown,
  CheckCircle, AlertCircle, X, Plus, ImagePlus,
  ArrowLeft, Eye, Save, Star, Calendar, Edit2, Lightbulb, Check, List, Play, Video, ExternalLink, Link, Apple,
  Globe, Monitor, Smartphone, Sparkles, Key, HelpCircle
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const ingredientRowSchema = z.object({
  name: z.string().optional().or(z.literal('')),
  quantity: z.string().optional().or(z.literal('')),
  unit: z.string().optional().or(z.literal('')),
});

const instructionStepSchema = z.object({
  text: z.string().optional().or(z.literal('')),
});

const nutritionItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  unit: z.string(),
});

const recipeFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  summary: z.string().max(1000).optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  videoUrl: z.string().optional().or(z.literal('')),
  content: z.any(),
  categoryIds: z.array(z.number()).default([]),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
  servings: z.union([z.number(), z.nan()]).optional().transform(v => (v === undefined || isNaN(v as any) ? undefined : v)),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  allowComments: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'TRASH']).default('PUBLISHED'),
  ingredientsJson: z.array(ingredientRowSchema).default([]),
  ingredientsText: z.string().optional(),
  instructions: z.array(instructionStepSchema).default([]),
  instructionsText: z.string().optional(),
  nutritionText: z.string().optional(),
  timeText: z.string().optional(),
  seo: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    seoTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    focusKeyword: z.string().optional().nullable(),
    canonicalUrl: z.string().optional().nullable(),
    ogImage: z.string().optional().nullable(),
    robotsMeta: z.string().optional().nullable(),
    faqJson: z.string().optional().nullable(),
  }).optional(),
  nutritionList: z.array(nutritionItemSchema).default([
    { label: 'Calories', value: '', unit: 'kcal' },
    { label: 'Protein', value: '', unit: 'g' },
    { label: 'Carbs', value: '', unit: 'g' },
    { label: 'Fat', value: '', unit: 'g' },
    { label: 'Fiber', value: '', unit: 'g' },
  ]),
  images: z.array(z.string()).optional(),
  slug: z.string().optional(),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

const extractHeadingsFromTiptap = (node: any): { level: number; text: string }[] => {
  if (!node) return [];
  const list: { level: number; text: string }[] = [];
  const traverse = (n: any) => {
    if (n.type === 'heading' && n.attrs?.level) {
      const text = n.content?.map((c: any) => c.text || '').join('') || '';
      list.push({ level: n.attrs.level, text });
    }
    if (n.content && Array.isArray(n.content)) {
      n.content.forEach(traverse);
    }
  };
  traverse(node);
  return list;
};

const extractHeadingsFromHtml = (html: string): { level: number; text: string }[] => {
  const matches = html.matchAll(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi);
  const list: { level: number; text: string }[] = [];
  for (const match of matches) {
    list.push({ level: parseInt(match[1]), text: match[2].replace(/<[^>]*>/g, '').trim() });
  }
  return list;
};

const getHeadings = (content: any): { level: number; text: string }[] => {
  if (!content) return [];
  if (typeof content === 'string') {
    return extractHeadingsFromHtml(content);
  }
  return extractHeadingsFromTiptap(content);
};

const getSuggestedHeadings = (titleStr: string) => {
  const cleanTitle = titleStr ? titleStr.trim() : 'Recipe';
  return [
    { level: 2, text: `Ingredients for ${cleanTitle}` },
    { level: 2, text: `How to Make ${cleanTitle} (Step-by-Step)` },
    { level: 2, text: `Pro-Tips for Perfect ${cleanTitle}` },
    { level: 2, text: `Recipe Variations & Substitutions` },
    { level: 2, text: `Storage & Reheating Guidelines` },
    { level: 3, text: `Can you freeze ${cleanTitle}?` }
  ];
};

const getFocusKeyword = (titleStr: string, contentStr?: string) => {
  const textSeed = `${titleStr || ''} ${contentStr || ''}`.toLowerCase();
  if (textSeed.includes('tagine') || textSeed.includes('moroccan')) return 'chicken tagine';
  if (textSeed.includes('pizza') || textSeed.includes('margherita')) return 'margherita pizza';
  if (textSeed.includes('burger') || textSeed.includes('cheeseburger')) return 'beef burger';
  if (textSeed.includes('pasta') || textSeed.includes('spaghetti') || textSeed.includes('lasagna')) return 'creamy pasta';
  if (textSeed.includes('salad') || textSeed.includes('caesar')) return 'caesar salad';
  if (textSeed.includes('cookie') || textSeed.includes('cookies') || textSeed.includes('chocolate')) return 'chocolate chip cookies';
  if (textSeed.includes('salmon') || textSeed.includes('fish') || textSeed.includes('seafood')) return 'glazed salmon';
  if (textSeed.includes('soup') || textSeed.includes('stew') || textSeed.includes('bean')) return 'hearty soup';
  if (textSeed.includes('taco') || textSeed.includes('tacos') || textSeed.includes('mexican')) return 'spicy beef tacos';

  // Fallback to title-based extraction
  if (!titleStr) return 'recipe';
  const stopwords = new Set(['a', 'an', 'the', 'easy', 'quick', 'best', 'perfect', 'ultimate', 'how', 'to', 'make', 'classic', 'homemade', 'recipe']);
  const words = titleStr.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const filtered = words.filter(w => w && !stopwords.has(w));
  return filtered.length > 0 ? filtered.join(' ') : titleStr.toLowerCase().trim();
};

const RECIPE_PRESETS = [
  {
    keywords: ['tagine', 'moroccan'],
    title: 'Easy Chicken Tagine with Olives and Preserved Lemon',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
    prepTime: '15 mins',
    cookTime: '45 mins',
    servings: 4,
    ingredients: `8 pieces chicken thighs
2 tablespoons olive oil
1 large onion, chopped
3 cloves garlic, minced
1 cup green olives, pitted
1 preserved lemon, sliced
1 teaspoon ground ginger
1 teaspoon ground cumin
1 teaspoon ground turmeric
1/2 teaspoon ground black pepper
1/2 teaspoon salt
1 cup chicken broth
2 tablespoons fresh cilantro, chopped
2 tablespoons fresh parsley, chopped
Lemon wedges for serving`,
    instructions: `Prepare the ingredients.
Pat chicken dry and season with ginger, cumin, turmeric, salt, and pepper.
Heat olive oil in a tagine or deep skillet over medium heat.
Brown the chicken on both sides, then transfer to a plate.
Sauté chopped onion and minced garlic in the same pan until soft.
Add chicken back, pour in chicken broth and spices, cover, and simmer for 30 minutes.
Stir in green olives and preserved lemons, and simmer for another 10 minutes.
Garnish with fresh cilantro and parsley.
Serve hot with couscous or crusty bread.`,
    nutrition: `Calories: 350 kcal
Protein: 28g
Carbs: 8g
Fat: 24g
Sodium: 650mg
Fiber: 2g
Sugar: 3g
Cholesterol: 110mg
Calcium: 6%
Iron: 12%
Potassium: 420mg
Vitamin A: 10%
Vitamin C: 15%
Saturated Fat: 5g
Trans Fat: 0g`
  },
  {
    keywords: ['pizza', 'margherita'],
    title: 'Classic Margherita Pizza with Fresh Basil',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    prepTime: '20 mins',
    cookTime: '12 mins',
    servings: 2,
    ingredients: `1 ball prepared pizza dough
1/2 cup tomato sauce
1 1/2 cups fresh mozzarella, sliced
2 tbsp extra virgin olive oil
1/2 cup fresh basil leaves
1/2 tsp kosher salt
1/4 tsp black pepper`,
    instructions: `Preheat oven to 500°F (260°C) with a pizza stone inside.
Stretch or roll out pizza dough on a floured surface to 12 inches.
Spread tomato sauce evenly over the dough, leaving a small border.
Arrange sliced fresh mozzarella cheese over the sauce.
Drizzle with olive oil and sprinkle with salt and pepper.
Carefully transfer to the hot pizza stone and bake for 10-12 minutes until bubbly.
Remove from oven, top with fresh basil leaves immediately, and slice.`,
    nutrition: `Calories: 280 kcal
Protein: 12g
Carbs: 34g
Fat: 11g
Sodium: 580mg
Fiber: 2g
Sugar: 2g
Cholesterol: 25mg
Calcium: 20%
Iron: 8%
Potassium: 190mg
Vitamin A: 8%
Vitamin C: 4%
Saturated Fat: 4g
Trans Fat: 0g`
  },
  {
    keywords: ['burger', 'cheeseburger', 'hamburger'],
    title: 'Gourmet Classic Beef Burger with Special Sauce',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    prepTime: '15 mins',
    cookTime: '10 mins',
    servings: 4,
    ingredients: `1 lb ground beef (80% lean)
4 brioche burger buns, toasted
4 slices cheddar cheese
1 large beefsteak tomato, sliced
4 butter lettuce leaves
1 small red onion, sliced
2 tbsp butter
2 tbsp mayonnaise
1 tbsp ketchup
1 tsp yellow mustard
1/2 tsp garlic powder
Salt and black pepper to taste`,
    instructions: `Divide ground beef into 4 equal portions and shape into patties.
Make a slight indentation in the center of each patty.
Season both sides generously with salt, pepper, and garlic powder.
Heat butter in a skillet or grill to medium-high heat.
Cook patties for 3-4 minutes per side for medium doneness.
Add a slice of cheddar cheese to each patty during the last minute of cooking.
Mix mayonnaise, ketchup, mustard, and garlic powder to make the special sauce.
Assemble: Spread sauce on toasted buns, top with patty, lettuce, tomato, and onion.`,
    nutrition: `Calories: 590 kcal
Protein: 34g
Carbs: 28g
Fat: 38g
Sodium: 890mg
Fiber: 2g
Sugar: 6g
Cholesterol: 105mg
Calcium: 15%
Iron: 22%
Potassium: 410mg
Vitamin A: 12%
Vitamin C: 8%
Saturated Fat: 14g
Trans Fat: 1g`
  },
  {
    keywords: ['pasta', 'spaghetti', 'lasagna', 'noodle', 'macaroni', 'carbonara', 'fettuccine'],
    title: 'Creamy Garlic Butter Tuscan Pasta',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 4,
    ingredients: `12 oz fettuccine pasta
2 tbsp unsalted butter
3 cloves garlic, minced
1 cup heavy cream
1/2 cup chicken broth
1 cup grated parmesan cheese
1 cup cherry tomatoes, halved
2 cups baby spinach
Salt and black pepper to taste
1/4 tsp red pepper flakes`,
    instructions: `Cook fettuccine in a large pot of salted boiling water according to package directions.
Melt butter in a large skillet over medium heat.
Add minced garlic and sauté for 1 minute until fragrant.
Pour in heavy cream and chicken broth, bring to a simmer, and cook for 3 minutes.
Stir in parmesan cheese until melted and smooth.
Add halved cherry tomatoes and baby spinach, cooking until spinach wilts.
Drain pasta and toss with the creamy Tuscan sauce.
Season with salt, pepper, and red pepper flakes before serving.`,
    nutrition: `Calories: 450 kcal
Protein: 14g
Carbs: 48g
Fat: 23g
Sodium: 490mg
Fiber: 3g
Sugar: 4g
Cholesterol: 65mg
Calcium: 18%
Iron: 10%
Potassium: 310mg
Vitamin A: 25%
Vitamin C: 12%
Saturated Fat: 12g
Trans Fat: 0.5g`
  },
  {
    keywords: ['salad', 'caesar', 'greens'],
    title: 'Classic Caesar Salad with Garlic Croutons',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    prepTime: '15 mins',
    cookTime: '10 mins',
    servings: 4,
    ingredients: `2 heads romaine lettuce, chopped
1 cup gourmet garlic croutons
1/2 cup shaved parmesan cheese
1/2 cup Caesar dressing
1 tbsp fresh lemon juice
1/4 tsp cracked black pepper
1 skinless chicken breast (optional, grilled)`,
    instructions: `Wash, dry, and chop the romaine lettuce into bite-size pieces.
Place chopped lettuce in a large wooden salad bowl.
Drizzle Caesar dressing and fresh lemon juice over the lettuce.
Toss gently to ensure all leaves are evenly coated.
Add croutons and shaved parmesan cheese to the bowl.
Toss once more to distribute croutons and cheese.
Top with grilled sliced chicken breast if desired, and finish with cracked black pepper.`,
    nutrition: `Calories: 210 kcal
Protein: 8g
Carbs: 12g
Fat: 15g
Sodium: 460mg
Fiber: 2g
Sugar: 2g
Cholesterol: 20mg
Calcium: 12%
Iron: 6%
Potassium: 240mg
Vitamin A: 45%
Vitamin C: 20%
Saturated Fat: 3.5g
Trans Fat: 0g`
  },
  {
    keywords: ['cookie', 'cake', 'brownie', 'pie', 'cupcake', 'muffin', 'donut', 'dessert', 'apple', 'chocolate', 'sweet'],
    title: 'Soft and Chewy Chocolate Chip Cookies',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    prepTime: '15 mins',
    cookTime: '15 mins',
    servings: 24,
    ingredients: `2 1/4 cups all-purpose flour
1/2 tsp baking soda
1 cup unsalted butter, melted
1/2 cup granulated sugar
1 cup packed brown sugar
1 tbsp vanilla extract
2 large eggs
2 cups semi-sweet chocolate chips
1/2 tsp sea salt`,
    instructions: `Preheat oven to 325°F (165°C) and line baking sheets with parchment paper.
Whisk flour and baking soda together in a medium bowl; set aside.
In a large bowl, cream together melted butter, brown sugar, and white sugar.
Beat in vanilla extract and eggs one at a time until light and creamy.
Gradually stir in the dry ingredients until just combined.
Fold in the semi-sweet chocolate chips by hand.
Drop cookie dough by rounded tablespoons onto the prepared baking sheets.
Bake for 12-15 minutes until edges are golden brown. Let cool on sheets for 5 minutes.`,
    nutrition: `Calories: 180 kcal
Protein: 2g
Carbs: 25g
Fat: 9g
Sodium: 110mg
Fiber: 1g
Sugar: 16g
Cholesterol: 20mg
Calcium: 2%
Iron: 4%
Potassium: 60mg
Vitamin A: 4%
Vitamin C: 0%
Saturated Fat: 5g
Trans Fat: 0g`
  },
  {
    keywords: ['salmon', 'fish', 'shrimp', 'seafood', 'tuna', 'cod', 'trout'],
    title: 'Garlic Butter Glazed Salmon',
    image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=800&q=80',
    prepTime: '10 mins',
    cookTime: '10 mins',
    servings: 4,
    ingredients: `4 salmon fillets (6 oz each)
2 tbsp unsalted butter
3 cloves garlic, minced
1 tbsp honey
1 tbsp fresh lemon juice
1 tbsp olive oil
Salt and black pepper to taste
1 lemon, sliced for garnish
1 tbsp chopped fresh parsley`,
    instructions: `Pat salmon fillets dry with paper towels and season with salt and pepper.
Heat olive oil and 1 tablespoon of butter in a large skillet over medium-high heat.
Sear salmon skin-side up for 4-5 minutes until golden brown.
Flip fillets and cook for an additional 3-4 minutes.
Reduce heat to medium, add remaining butter, minced garlic, honey, and lemon juice.
Spoon the melted garlic butter sauce over the salmon for 1-2 minutes.
Garnish with sliced lemons and chopped fresh parsley.
Serve hot with roasted asparagus or rice.`,
    nutrition: `Calories: 380 kcal
Protein: 34g
Carbs: 4g
Fat: 25g
Sodium: 290mg
Fiber: 0g
Sugar: 3g
Cholesterol: 95mg
Calcium: 4%
Iron: 6%
Potassium: 620mg
Vitamin A: 6%
Vitamin C: 8%
Saturated Fat: 7g
Trans Fat: 0g`
  },
  {
    keywords: ['soup', 'stew', 'broth', 'chowder', 'ramen'],
    title: 'Hearty Tuscan White Bean Soup',
    image: 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&w=800&q=80',
    prepTime: '15 mins',
    cookTime: '25 mins',
    servings: 6,
    ingredients: `2 cans (15 oz) cannellini beans, drained
2 tbsp olive oil
1 large onion, chopped
2 carrots, diced
2 stalks celery, diced
3 cloves garlic, minced
4 cups vegetable broth
1 can (14 oz) diced tomatoes
2 cups chopped kale
1 tsp dried rosemary
Salt and black pepper to taste`,
    instructions: `Heat olive oil in a large pot over medium heat.
Add chopped onion, diced carrots, and diced celery, cooking until soft (6-8 minutes).
Stir in minced garlic and dried rosemary, cooking for 1 minute.
Add diced tomatoes (with juice), vegetable broth, and drained white beans.
Bring soup to a boil, then reduce heat and simmer for 15 minutes.
Stir in the chopped kale and cook for another 5 minutes until tender.
Season with salt and black pepper to taste.
Ladle into bowls and serve with a drizzle of olive oil.`,
    nutrition: `Calories: 220 kcal
Protein: 9g
Carbs: 34g
Fat: 6g
Sodium: 720mg
Fiber: 8g
Sugar: 4g
Cholesterol: 0mg
Calcium: 10%
Iron: 15%
Potassium: 540mg
Vitamin A: 35%
Vitamin C: 25%
Saturated Fat: 1g
Trans Fat: 0g`
  },
  {
    keywords: ['taco', 'quesadilla', 'burrito', 'mexican', 'fajita'],
    title: 'Spicy Beef Tacos with Cilantro Lime Crema',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    prepTime: '15 mins',
    cookTime: '15 mins',
    servings: 4,
    ingredients: `1 lb lean ground beef
1 packet taco seasoning
8 small corn tortillas
1 cup shredded lettuce
1 cup cheddar cheese, shredded
1 cup roma tomatoes, diced
1/2 cup sour cream
1/2 lime juice
2 tbsp fresh cilantro, chopped
1/2 tsp chili powder`,
    instructions: `Brown ground beef in a skillet over medium-high heat; drain fat.
Stir in taco seasoning and 1/3 cup of water; simmer for 5 minutes.
Warm corn tortillas in a dry skillet over medium heat for 30 seconds per side.
Whisk sour cream, lime juice, chopped cilantro, and chili powder in a small bowl to make the crema.
Fill each tortilla with seasoned ground beef.
Top with shredded lettuce, cheddar cheese, and diced tomatoes.
Drizzle with the cilantro lime crema and serve immediately.`,
    nutrition: `Calories: 310 kcal
Protein: 18g
Carbs: 22g
Fat: 16g
Sodium: 640mg
Fiber: 3g
Sugar: 2g
Cholesterol: 55mg
Calcium: 15%
Iron: 12%
Potassium: 290mg
Vitamin A: 8%
Vitamin C: 6%
Saturated Fat: 7g
Trans Fat: 0.5g`
  }
];

const DEFAULT_PRESET = {
  title: 'Creamy Tuscan Garlic Chicken',
  image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  prepTime: '10 mins',
  cookTime: '20 mins',
  servings: 4,
  ingredients: `2 large chicken breasts, halved
1 tbsp olive oil
1 cup heavy cream
1/2 cup chicken broth
1 tsp garlic powder
1 cup spinach, fresh
1/2 cup sun-dried tomatoes
1/2 cup parmesan cheese
Salt and black pepper to taste`,
  instructions: `Season chicken breasts with salt, pepper, and garlic powder.
Heat olive oil in a large skillet over medium-high heat and sear chicken for 5 minutes on each side.
Remove chicken from skillet and set aside.
Add chicken broth, heavy cream, and garlic powder to the skillet, bringing to a simmer.
Stir in spinach and sun-dried tomatoes; let simmer until spinach is wilted.
Stir in parmesan cheese until sauce is smooth.
Return chicken to skillet and coat with the creamy sauce.
Cook for another 2-3 minutes until heated through.`,
  nutrition: `Calories: 410 kcal
Protein: 32g
Carbs: 6g
Fat: 28g
Sodium: 540mg
Fiber: 1g
Sugar: 2g
Cholesterol: 120mg
Calcium: 10%
Iron: 8%
Potassium: 390mg
Vitamin A: 15%
Vitamin C: 6%
Saturated Fat: 14g
Trans Fat: 0.5g`
};

const getRecipePreset = (text: string) => {
  const normalized = (text || '').toLowerCase();
  for (const preset of RECIPE_PRESETS) {
    if (preset.keywords.some(kw => normalized.includes(kw))) {
      return preset;
    }
  }
  return DEFAULT_PRESET;
};

const validateRecipeContent = (text: string): { isValid: boolean; error?: string } => {
  const lowercaseText = (text || '').toLowerCase();
  
  if (lowercaseText.length < 80) {
    return {
      isValid: false,
      error: "The 'About Recipe' article content is too short. Please write a complete recipe article first."
    };
  }

  const ingredientKeywords = ['ingredient', 'cup', 'tbsp', 'tsp', 'tablespoon', 'teaspoon', 'spoon', 'grams', 'ounces', 'oz', 'ml', 'flour', 'sugar', 'salt', 'oil', 'butter', 'water', 'garlic', 'onion', 'egg', 'eggs', 'chicken', 'pepper', 'yeast', 'milk', 'cheese'];
  const hasIngredients = ingredientKeywords.some(keyword => lowercaseText.includes(keyword));

  const cookingKeywords = ['instruction', 'direction', 'step', 'preparation', 'method', 'cook', 'bake', 'heat', 'preheat', 'boil', 'stir', 'mix', 'sauté', 'simmer', 'pan', 'oven', 'skillet', 'fry', 'chop', 'whisk', 'drain', 'season', 'grill', 'roast'];
  const hasInstructions = cookingKeywords.some(keyword => lowercaseText.includes(keyword));

  const recipeIdentifiers = ['recipe', 'dish', 'make', 'prepare', 'serve', 'delicious', 'taste', 'flavor', 'meal', 'cook', 'homemade', 'classic', 'easy', 'quick', 'tagine', 'pizza', 'burger', 'pasta', 'salad', 'cookie', 'salmon', 'soup', 'taco'];
  const hasRecipeTitleInfo = recipeIdentifiers.some(keyword => lowercaseText.includes(keyword));

  if (!hasRecipeTitleInfo) {
    return {
      isValid: false,
      error: "The article does not seem to contain recipe details or a dish description. Please provide a valid recipe title/description in the 'About Recipe' content."
    };
  }

  if (!hasIngredients) {
    return {
      isValid: false,
      error: "No ingredients could be detected in the 'About Recipe' content. Please include ingredients (e.g. cups, tbsp, flour, sugar, eggs)."
    };
  }

  if (!hasInstructions) {
    return {
      isValid: false,
      error: "No cooking steps or instructions could be detected in the 'About Recipe' content. Please include instructions (e.g. preheat, mix, bake, stir)."
    };
  }

  return { isValid: true };
};

/**
 * Build an SEO title that ALWAYS contains the focus keyword.
 * Templates are tried from richest to shortest; the first one
 * whose keyword fits intact wins. If even the bare keyword
 * exceeds 60 chars it is intelligently truncated.
 */
const getSeoTitle = (titleStr: string, focusKeyword?: string) => {
  if (!titleStr && !focusKeyword) return '';
  // Use the keyword as the core subject — it MUST appear in the title
  const kw = (focusKeyword || getFocusKeyword(titleStr) || titleStr).trim();

  // Templates ordered from most descriptive to shortest.
  // [KW] is replaced with the focus keyword.
  const templates = [
    `[KW] Recipe - Easy & Authentic Guide`,
    `[KW] Recipe - Quick & Easy`,
    `Best [KW] Recipe (30-Min)`,
    `Easy [KW] Recipe`,
    `How to Make [KW]`,
    `[KW] Recipe`,
    `[KW]`,
  ];

  for (const tpl of templates) {
    const candidate = tpl.replace('[KW]', kw);
    if (candidate.length <= 60) return candidate;
  }

  // Keyword itself is > 60 chars — truncate it just enough
  const truncated = kw.substring(0, 56).trimEnd() + '...';
  return truncated;
};

const getMetaDescription = (titleStr: string, focusKeywordStr: string, plainText: string) => {
  const keyword = focusKeywordStr || titleStr.toLowerCase();
  const prefix = `Learn how to make the ultimate ${keyword} at home!`;
  const suffix = `This quick and easy recipe features simple steps and fresh ingredients for perfect results.`;
  
  let cleanDesc = '';
  if (plainText) {
    const bodyText = plainText.replace(/\s+/g, ' ').trim();
    cleanDesc = `${prefix} ${bodyText}`;
  } else {
    cleanDesc = `${prefix} ${suffix}`;
  }

  if (cleanDesc.length > 155) {
    cleanDesc = cleanDesc.slice(0, 152) + '...';
  }
  return cleanDesc;
};

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({ initialData, onSubmit, isLoading }: RecipeFormProps) {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const isHydrating = useSelector((state: RootState) => state.auth.isHydrating);
  const { data: categories } = useGetAdminCategoriesQuery();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.images || []);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSeoTab, setActiveSeoTab] = useState<'basic' | 'scoring' | 'headings' | 'social' | 'linking' | 'faq'>('basic');
  const [socialPlatform, setSocialPlatform] = useState<'facebook' | 'twitter' | 'opengraph'>('opengraph');
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [faqsList, setFaqsList] = useState<{ question: string; answer: string }[]>([]);

  // AI SEO Assistant helpers
  const [generateAiMetadata, { isLoading: isGeneratingAi }] = useGenerateAiMetadataMutation();
  const [aiSuggestions, setAiSuggestions] = useState<{ action: string; output: string } | null>(null);
  const [generatingField, setGeneratingField] = useState<'title' | 'image' | 'ingredients' | 'instructions' | 'nutrition' | 'times' | null>(null);

  const handleAiGenerateField = async (field: 'title' | 'image' | 'ingredients' | 'instructions' | 'nutrition' | 'times') => {
    let currentTitle = watch('title') || '';

    if (field === 'image') {
      const promptedTitle = prompt(
        "Please enter or confirm the recipe name for image generation:",
        currentTitle
      );
      if (promptedTitle === null) {
        return;
      }
      
      const trimmedTitle = promptedTitle.trim();
      if (!trimmedTitle) {
        showToast('error', 'Recipe name is required for image generation.');
        return;
      }
      
      if (!currentTitle || trimmedTitle !== currentTitle) {
        setValue('title', trimmedTitle);
        currentTitle = trimmedTitle;
      }

      setGeneratingField('image');
      try {
        const res = await generateAiMetadata({
          recipeId: initialData?.id,
          action: 'image',
          recipeTitle: currentTitle,
          aboutRecipeText: 'Generating image only.'
        }).unwrap();

        if (res.output) {
          setValue('imageUrl', res.output);
          showToast('success', 'Image generated successfully!');
        } else {
          showToast('error', 'Failed to generate image URL.');
        }
      } catch (err: any) {
        console.error('Image generation error:', err);
        let errorMsg = 'Failed to generate main image.';
        if (err) {
          if (err.data && typeof err.data === 'object' && err.data.error) {
            errorMsg = err.data.error;
          } else if (err.data && typeof err.data === 'object' && err.data.message) {
            errorMsg = err.data.message;
          } else if (err.data && typeof err.data === 'string') {
            errorMsg = err.data;
          } else if (err.message) {
            errorMsg = err.message;
          } else if (err.error) {
            errorMsg = err.error;
          } else {
            try {
              errorMsg = typeof err === 'object' ? JSON.stringify(err) : String(err);
            } catch (e) {
              // ignore
            }
          }
        }
        showToast('error', errorMsg);
      } finally {
        setGeneratingField(null);
      }
      return;
    }

    // For all other fields (title, ingredients, instructions, nutrition), we must check the 'About Recipe' article content length
    const getTiptapPlainText = (node: any): string => {
      if (!node) return '';
      if (node.type === 'text' && node.text) {
        return node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(getTiptapPlainText).join(' ');
      }
      return '';
    };
    const plainText = getTiptapPlainText(watch('content')).trim();
    const validation = validateRecipeContent(plainText);
    if (!validation.isValid) {
      showToast('error', validation.error || "Please add a valid 'About Recipe' article content first.");
      return;
    }

    setGeneratingField(field);
    try {
      let actionStr = '';
      let targetField: 'title' | 'ingredientsText' | 'instructionsText' | 'nutritionText' | 'timeText' | null = null;
      let successMsg = '';

      if (field === 'title') {
        actionStr = 'recipeTitle';
        targetField = 'title';
        successMsg = 'Recipe title generated successfully!';
      } else if (field === 'ingredients') {
        actionStr = 'ingredients';
        targetField = 'ingredientsText';
        successMsg = 'Ingredients list generated successfully!';
      } else if (field === 'instructions') {
        actionStr = 'instructions';
        targetField = 'instructionsText';
        successMsg = 'Instructions list generated successfully!';
      } else if (field === 'nutrition') {
        actionStr = 'nutrition';
        targetField = 'nutritionText';
        successMsg = 'Nutrition info generated successfully!';
      } else if (field === 'times') {
        actionStr = 'times';
        targetField = 'timeText';
        successMsg = 'Times & servings info generated successfully!';
      }

      if (actionStr && targetField) {
        const res = await generateAiMetadata({
          recipeId: initialData?.id,
          action: actionStr,
          recipeTitle: currentTitle,
          aboutRecipeText: plainText
        }).unwrap();

        if (res.output) {
          let outputVal = res.output;
          if (targetField === 'timeText') {
            outputVal = res.output
              .split('\n')
              .filter((line: string) => !line.toLowerCase().includes('serv'))
              .join('\n');
          }
          setValue(targetField, outputVal);
          showToast('success', successMsg);
        } else {
          showToast('error', `Failed to generate values.`);
        }
      }
    } catch (err: any) {
      console.error(`${field} generation error:`, err);
      let errorMsg = `Failed to generate ${field}.`;
      if (err) {
        if (err.data && typeof err.data === 'object' && err.data.error) {
          errorMsg = err.data.error;
        } else if (err.data && typeof err.data === 'object' && err.data.message) {
          errorMsg = err.data.message;
        } else if (err.data && typeof err.data === 'string') {
          errorMsg = err.data;
        } else if (err.message) {
          errorMsg = err.message;
        } else if (err.error) {
          errorMsg = err.error;
        } else {
          try {
            errorMsg = typeof err === 'object' ? JSON.stringify(err) : String(err);
          } catch (e) {
            // ignore
          }
        }
      }
      showToast('error', errorMsg);
    } finally {
      setGeneratingField(null);
    }
  };

  const handleAiAction = async (action: string) => {
    const getTiptapPlainText = (node: any): string => {
      if (!node) return '';
      if (node.type === 'text' && node.text) {
        return node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(getTiptapPlainText).join(' ');
      }
      return '';
    };
    const plainText = getTiptapPlainText(watch('content')).trim();
    const validation = validateRecipeContent(plainText);
    if (!validation.isValid) {
      showToast('error', validation.error || "Please add a valid 'About Recipe' article content first.");
      return;
    }

    if (!initialData?.id) {
      let output = '';

      if (action === 'title') {
        // Titles must contain the focus keyword
        const seo = watch('seo');
        const title = watch('title');
        const kw = (seo?.focusKeyword?.trim() || getFocusKeyword(title || '', plainText)).trim() || (title || 'Recipe');

        const buildTitle = (tpl: string) => {
          const candidate = tpl.replace('[KW]', kw);
          if (candidate.length <= 60) return candidate;
          // Keyword too long for this template — try shorter
          return null;
        };

        const t1 = buildTitle(`[KW] Recipe - Easy & Authentic Guide`)
          ?? buildTitle(`[KW] Recipe - Quick & Easy`)
          ?? buildTitle(`Easy [KW] Recipe`)
          ?? buildTitle(`[KW] Recipe`)
          ?? kw.substring(0, 57) + '...';

        const t2 = buildTitle(`Best [KW] Recipe (30-Min)`)
          ?? buildTitle(`Best [KW] Recipe`)
          ?? buildTitle(`[KW] Recipe`)
          ?? kw.substring(0, 57) + '...';

        const t3 = buildTitle(`How to Make [KW]`)
          ?? buildTitle(`[KW] Recipe`)
          ?? kw.substring(0, 57) + '...';

        output = `[Suggested SEO Title 1] ${t1}\n[Suggested SEO Title 2] ${t2}\n[Suggested SEO Title 3] ${t3}`;
      } else if (action === 'meta') {
        const title = watch('title');
        const bodyText = plainText ? plainText.replace(/\s+/g, ' ').trim() : 'fresh kitchen ingredients, simple steps, and pro chef tips.';
        const baseMeta = `Learn how to make the ultimate ${title || 'recipe'} at home! This guide features ${bodyText}`;
        output = baseMeta.length > 160 ? baseMeta.slice(0, 157) + '...' : baseMeta;
      } else if (action === 'keywords') {
        const title = watch('title');
        const kw = getFocusKeyword(title || '', plainText);
        output = `${kw || 'recipe'}, easy ${kw || 'recipe'}, authentic ${kw || 'recipe'}, homemade ${kw || 'recipe'}, step-by-step ${kw || 'recipe'}`;
      } else if (action === 'readability') {
        output = `Readability Score: 85/100 (Excellent)
Suggestions to improve readability:
1. Break down instructions into numbered lists of at most 2 sentences.
2. Use active cooking voice ('stew the broth' instead of 'the broth should be stewed').
3. Keep descriptions punchy. Use bullet points for tools or secondary toppings.`;
      } else if (action === 'times') {
        const textSeed = `${title || ''} ${plainText}`;
        const preset = getRecipePreset(textSeed);
        const prep = preset.prepTime || '15 mins';
        const cook = preset.cookTime || '20 mins';
        const parseMin = (val: string) => {
          const n = parseInt(val.replace(/[^0-9]/g, ''), 10);
          return isNaN(n) ? 0 : n;
        };
        const totalNum = parseMin(prep) + parseMin(cook);
        const total = totalNum > 0 ? `${totalNum} mins` : '35 mins';
        output = `Prep Time: ${prep}\nCook Time: ${cook}\nTotal Time: ${total}\nServings: ${preset.servings || 4}`;
      }
      setAiSuggestions({ action, output });
      showToast('success', `AI suggested values generated for ${action}!`);
      return;
    }

    try {
      const res = await generateAiMetadata({ recipeId: initialData.id, action }).unwrap();
      setAiSuggestions({ action, output: res.output });
      showToast('success', `AI suggested values generated for ${action}!`);
    } catch {
      showToast('error', 'Failed to consult AI SEO model.');
    }
  };

  // Hydrate custom FAQs from initialData
  useEffect(() => {
    if (initialData?.seo?.faqJson) {
      try {
        setFaqsList(JSON.parse(initialData.seo.faqJson));
      } catch (e) {
        setFaqsList([]);
      }
    }
  }, [initialData]);

  /* --- Toast notification state --- */
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Convert initialData.nutrition object to nutritionList array
  const initialNutrition = (() => {
    const list = [
      { label: 'Calories', value: '', unit: 'kcal' },
      { label: 'Protein', value: '', unit: 'g' },
      { label: 'Carbs', value: '', unit: 'g' },
      { label: 'Fat', value: '', unit: 'g' },
      { label: 'Fiber', value: '', unit: 'g' },
    ];

    if (!initialData?.nutrition) return list;

    const nutritionObj = initialData.nutrition as Record<string, string>;
    const processedKeys = new Set<string>();

    Object.keys(nutritionObj).forEach((key) => {
      const lowerKey = key.toLowerCase();
      const valStr = String(nutritionObj[key] || '');

      let value = valStr;
      let unit = '';
      
      if (valStr.endsWith('kcal')) {
        value = valStr.replace('kcal', '').trim();
        unit = 'kcal';
      } else if (valStr.endsWith('mg')) {
        value = valStr.replace('mg', '').trim();
        unit = 'mg';
      } else if (valStr.endsWith('g')) {
        value = valStr.replace('g', '').trim();
        unit = 'g';
      } else if (valStr.endsWith('%')) {
        value = valStr.replace('%', '').trim();
        unit = '%';
      }

      if (lowerKey === 'calories') {
        list[0].value = value;
        if (unit) list[0].unit = unit;
        processedKeys.add(key);
      } else if (lowerKey === 'protein') {
        list[1].value = value;
        if (unit) list[1].unit = unit;
        processedKeys.add(key);
      } else if (lowerKey === 'carbohydrates' || lowerKey === 'carbs') {
        list[2].value = value;
        if (unit) list[2].unit = unit;
        processedKeys.add(key);
      } else if (lowerKey === 'fat') {
        list[3].value = value;
        if (unit) list[3].unit = unit;
        processedKeys.add(key);
      } else if (lowerKey === 'fiber') {
        list[4].value = value;
        if (unit) list[4].unit = unit;
        processedKeys.add(key);
      }
    });

    Object.keys(nutritionObj).forEach((key) => {
      if (processedKeys.has(key)) return;
      
      const valStr = String(nutritionObj[key] || '');
      let value = valStr;
      let unit = '';
      
      if (valStr.endsWith('kcal')) {
        value = valStr.replace('kcal', '').trim();
        unit = 'kcal';
      } else if (valStr.endsWith('mg')) {
        value = valStr.replace('mg', '').trim();
        unit = 'mg';
      } else if (valStr.endsWith('g')) {
        value = valStr.replace('g', '').trim();
        unit = 'g';
      } else if (valStr.endsWith('%')) {
        value = valStr.replace('%', '').trim();
        unit = '%';
      }

      const label = key.charAt(0).toUpperCase() + key.slice(1);
      list.push({ label, value, unit });
    });

    return list;
  })();


  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      imageUrl: initialData?.imageUrl || '',
      videoUrl: (initialData as any)?.videoUrl || '',
      content: initialData?.content || { type: 'doc', content: [] },
      categoryIds: initialData?.categories.map((c) => c.id) || [],
      prepTime: initialData?.prepTime || '',
      cookTime: initialData?.cookTime || '',
      servings: initialData?.servings || undefined,
      difficulty: (initialData?.difficulty as any) || undefined,
      allowComments: initialData?.allowComments ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      status: initialData?.status || 'PUBLISHED',
      ingredientsJson: [],
      ingredientsText: (() => {
        const raw = Array.isArray(initialData?.ingredientsJson)
          ? initialData.ingredientsJson
          : (typeof initialData?.ingredientsJson === 'string'
            ? JSON.parse(initialData.ingredientsJson as string)
            : []);
        return raw.map((ing: any) => `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim().replace(/\s+/g, ' ')).join('\n');
      })(),
      instructions: Array.isArray((initialData as any)?.instructions)
        ? (initialData as any).instructions
        : (typeof (initialData as any)?.instructions === 'string'
          ? JSON.parse((initialData as any).instructions)
          : []) as any,
      instructionsText: (() => {
        const raw = Array.isArray((initialData as any)?.instructions)
          ? (initialData as any).instructions
          : (typeof (initialData as any)?.instructions === 'string'
            ? JSON.parse((initialData as any).instructions)
            : []);
        return raw.map((step: any) => step.text || '').filter(Boolean).join('\n');
      })(),
      nutritionText: (() => {
        if (!initialData?.nutrition) return '';
        const n = initialData.nutrition as Record<string, string>;
        return Object.keys(n).map(key => {
          let displayKey = key.charAt(0).toUpperCase() + key.slice(1);
          if (displayKey.toLowerCase() === 'carbohydrates' || displayKey.toLowerCase() === 'carbs') displayKey = 'Carbs';
          return `${displayKey}: ${n[key] || ''}`;
        }).join('\n');
      })(),
      timeText: (() => {
        if (initialData?.cookTime && initialData.cookTime.startsWith('[') && initialData.cookTime.endsWith(']')) {
          try {
            const list = JSON.parse(initialData.cookTime);
            if (Array.isArray(list)) {
              return list.map((item: any) => `${item.label}: ${item.value}`).join('\n');
            }
          } catch (e) {
            // fallback
          }
        }
        const parts = [];
        if (initialData?.prepTime) parts.push(`Prep Time: ${initialData.prepTime}`);
        if (initialData?.cookTime) parts.push(`Cook Time: ${initialData.cookTime}`);
        if (initialData?.totalTime) parts.push(`Total Time: ${initialData.totalTime}`);
        return parts.join('\n');
      })(),
      seo: {
        title: initialData?.seo?.title || '',
        description: initialData?.seo?.description || '',
        seoTitle: initialData?.seo?.seoTitle || '',
        metaDescription: initialData?.seo?.metaDescription || '',
        focusKeyword: initialData?.seo?.focusKeyword || '',
        canonicalUrl: initialData?.seo?.canonicalUrl || '',
        ogImage: initialData?.seo?.ogImage || '',
        robotsMeta: initialData?.seo?.robotsMeta || 'index, follow',
        faqJson: initialData?.seo?.faqJson || '',
      },
      nutritionList: initialNutrition,
      images: initialData?.images || [],
      slug: initialData?.slug || '',
    },
  });

  const selectedCategoryIds = watch('categoryIds') || [];
  const imageUrl = watch('imageUrl');
  const videoUrl = watch('videoUrl');
  const isFeatured = watch('isFeatured');
  const status = watch('status');
  const difficulty = watch('difficulty');
  const prepTime = watch('prepTime') || '';
  const cookTime = watch('cookTime') || '';

  const title = watch('title');
  const slug = watch('slug');
  const seo = watch('seo');
  const content = watch('content');

  const slugReg = register('slug');
  const focusKeywordReg = register('seo.focusKeyword');
  const seoTitleReg = register('seo.seoTitle');
  const metaDescriptionReg = register('seo.metaDescription');

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData);
  const [canEditSlug, setCanEditSlug] = useState(false);
  const [isFocusKeywordEdited, setIsFocusKeywordEdited] = useState(!!initialData?.seo?.focusKeyword);
  const [isSeoTitleEdited, setIsSeoTitleEdited] = useState(!!initialData?.seo?.seoTitle);
  const [isMetaDescriptionEdited, setIsMetaDescriptionEdited] = useState(!!initialData?.seo?.metaDescription);

  // Helper to generate a slug
  const generateSlugHelper = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-slug generation — from focus keyword (cleaner, more SEO-friendly)
  useEffect(() => {
    if (title && !isSlugManuallyEdited) {
      const keyword = getFocusKeyword(title);
      setValue('slug', generateSlugHelper(keyword || title));
    }
  }, [title, setValue, isSlugManuallyEdited]);

  // Track last forced-generation checklist results
  const [seoValidation, setSeoValidation] = useState<Record<string, { status: 'pass' | 'fail' | 'warning'; label: string; message: string }> | null>(null);

  // Auto-SEO generation in real-time
  useEffect(() => {
    if (!title && !content) return;

    const getTiptapPlainText = (node: any): string => {
      if (!node) return '';
      if (node.type === 'text' && node.text) {
        return node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(getTiptapPlainText).join(' ');
      }
      return '';
    };

    const plainText = getTiptapPlainText(content);
    const generatedKeyword = getFocusKeyword(title);
    const generatedTitle = getSeoTitle(title, generatedKeyword);
    const generatedMeta = getMetaDescription(title, generatedKeyword, plainText);

    if (!isFocusKeywordEdited && generatedKeyword && seo?.focusKeyword !== generatedKeyword) {
      setValue('seo.focusKeyword', generatedKeyword);
    }
    if (!isSeoTitleEdited && generatedTitle && seo?.seoTitle !== generatedTitle) {
      setValue('seo.seoTitle', generatedTitle);
    }
    if (!isMetaDescriptionEdited && generatedMeta && seo?.metaDescription !== generatedMeta) {
      setValue('seo.metaDescription', generatedMeta);
    }
  }, [title, content, isFocusKeywordEdited, isSeoTitleEdited, isMetaDescriptionEdited, setValue, seo]);

  // FAQ managers
  const addFaqItem = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const newList = [...faqsList, { question: newFaqQuestion, answer: newFaqAnswer }];
    setFaqsList(newList);
    setValue('seo.faqJson', JSON.stringify(newList));
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const removeFaqItem = (index: number) => {
    const newList = faqsList.filter((_, i) => i !== index);
    setFaqsList(newList);
    setValue('seo.faqJson', JSON.stringify(newList));
  };

  // Content watch
  const contentText = typeof content === 'string' 
    ? content 
    : (content ? JSON.stringify(content) : '');

  // Real-time analyzers
  const seoAnalysis = analyzeRecipeSEO({
    title: title || '',
    seoTitle: seo?.seoTitle || '',
    metaDescription: seo?.metaDescription || '',
    focusKeyword: seo?.focusKeyword || '',
    slug: slug || '',
    contentHtml: contentText,
    hasAltText: !!imageUrl,
  });

  const readabilityAnalysis = analyzeReadability(contentText, seo?.focusKeyword || '');

  // Fetch all recipes for linking candidates
  const { data: allRecipesResponse } = useGetAdminRecipesQuery({ limit: 100 });
  const allRecipesList = allRecipesResponse?.data || [];
  const selectedCategories = categories?.filter(c => selectedCategoryIds.includes(c.id)) || [];

  const linkingSuggestions = getInternalLinkingSuggestions(
    title || '',
    selectedCategories,
    allRecipesList
  );

  // Helper to extract YouTube embed URL
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
  };
  const embedUrl = getEmbedUrl(videoUrl);

  useEffect(() => {
    if (videoUrl && embedUrl && showVideoUrlInput) {
      const timer = setTimeout(() => setShowVideoUrlInput(false), 500);
      return () => clearTimeout(timer);
    }
  }, [videoUrl, embedUrl, showVideoUrlInput]);







  /* --- Image upload --- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isHydrating || !token) {
      showToast('error', 'Please wait for authentication to complete');
      return;
    }
    const formData = new FormData();
    formData.append('image', file);
    try {
      const result = await uploadImage(formData).unwrap();
      setValue('imageUrl', result.imageUrl);
      setShowImageUrlInput(false);
      showToast('success', 'Image uploaded successfully!');
    } catch (err: any) {
      showToast('error', 'Failed to upload image.');
    }
  };

  /* --- Gallery image upload --- */
  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (isHydrating || !token) {
      showToast('error', 'Please wait for authentication to complete');
      return;
    }
    setIsUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const result = await uploadImage(formData).unwrap();
        urls.push(result.imageUrl);
      }
      const newImages = [...galleryImages, ...urls];
      setGalleryImages(newImages);
      setValue('images', newImages);
      showToast('success', `${urls.length} image(s) uploaded successfully!`);
    } catch (err: any) {
      showToast('error', 'Failed to upload gallery images.');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const next = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(next);
    setValue('images', next);
  };

  /* --- Form submission --- */
  const onFormSubmit = async (data: RecipeFormValues) => {
    // Convert nutritionText back to the format the backend expects
    const nutrition: Record<string, string> = {};
    const nutLines = (data.nutritionText || '').split('\n');
    nutLines.forEach(line => {
      const clean = line.trim();
      if (!clean) return;
      const colonIdx = clean.indexOf(':');
      if (colonIdx !== -1) {
        const label = clean.slice(0, colonIdx).trim().toLowerCase();
        const value = clean.slice(colonIdx + 1).trim();
        let key = label;
        if (key === 'carbs') key = 'carbohydrates';
        if (key) {
          nutrition[key] = value;
        }
      } else {
        const words = clean.split(/\s+/);
        if (words.length >= 2) {
          const label = words[0].toLowerCase();
          const value = words.slice(1).join(' ');
          let key = label;
          if (key === 'carbs') key = 'carbohydrates';
          if (key) {
            nutrition[key] = value;
          }
        }
      }
    });

    const ingredientsJson = (data.ingredientsText || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => ({
        name: line,
        quantity: '',
        unit: ''
      }));

    const instructions = (data.instructionsText || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => ({
        text: line
      }));

    let prepTime: string | null = null;
    let cookTime: string | null = null;
    let totalTime: string | null = null;
    let servings: number | null = data.servings || null;

    const timings: { label: string; value: string }[] = [];
    const timeLines = (data.timeText || '').split('\n');
    timeLines.forEach(line => {
      const clean = line.trim();
      if (!clean) return;
      const colonIdx = clean.indexOf(':');
      if (colonIdx !== -1) {
        const label = clean.slice(0, colonIdx).trim();
        const value = clean.slice(colonIdx + 1).trim();
        if (label.toLowerCase().includes('serv')) {
          const match = value.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (!isNaN(num) && !servings) servings = num;
          }
        } else {
          timings.push({ label, value });
          if (label.toLowerCase().includes('prep')) prepTime = value || null;
          else if (label.toLowerCase().includes('total')) totalTime = value || null;
        }
      } else {
        const words = clean.split(/\s+/);
        if (words.length >= 2) {
          const label = words[0];
          const value = words.slice(1).join(' ');
          if (label.toLowerCase().includes('serv')) {
            const match = value.match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (!isNaN(num) && !servings) servings = num;
            }
          } else {
            timings.push({ label, value });
            if (label.toLowerCase().includes('prep')) prepTime = value || null;
            else if (label.toLowerCase().includes('total')) totalTime = value || null;
          }
        }
      }
    });

    if (timings.length > 0) {
      cookTime = JSON.stringify(timings);
    }

    if (!totalTime) {
      let sumMins = 0;
      timings.forEach(t => {
        if (!t.label.toLowerCase().includes('total')) {
          const n = parseInt(t.value.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(n)) sumMins += n;
        }
      });
      if (sumMins > 0) totalTime = `${sumMins} mins`;
    }

    const formattedData = {
      ...data,
      ingredientsJson,
      instructions,
      prepTime,
      cookTime,
      totalTime,
      servings,
      seo: {
        ...data.seo,
        title: data.seo?.seoTitle || data.seo?.title || '',
        description: data.seo?.metaDescription || data.seo?.description || '',
      },
      nutrition
    };

    try {
      await onSubmit(formattedData);
      showToast('success', initialData ? 'Recipe updated successfully!' : 'Recipe created successfully!');
    } catch (err: any) {
      showToast('error', err?.data?.error || 'Something went wrong.');
    }
  };

  const onInvalidSubmit = () => {
    showToast('error', 'Title, Description, and Main Image are required.');
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onInvalidSubmit)} className="space-y-8 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl backdrop-blur-md ${toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 shrink-0"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-border/50 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">{initialData ? 'Edit Recipe' : 'Add New Recipe'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => {
            const data = watch();
            
            // Format nutrition
            const nutrition: Record<string, string> = {};
            (data.nutritionText || '')
              .split('\n')
              .map(line => line.trim())
              .filter(Boolean)
              .forEach(line => {
                const clean = line.replace(/[:-]/g, ' ').trim();
                const match = clean.match(/^([A-Za-z\s]+)\s+(\d+(?:\.\d+)?\s*[A-Za-z%]*)$/);
                if (match) {
                  const label = match[1].trim().toLowerCase();
                  const value = match[2].trim();
                  let key = label;
                  if (key === 'carbs') key = 'carbohydrates';
                  if (key) {
                    nutrition[key] = value;
                  }
                } else {
                  const words = clean.split(/\s+/);
                  if (words.length >= 2) {
                    const label = words[0].toLowerCase();
                    const value = words.slice(1).join(' ');
                    let key = label;
                    if (key === 'carbs') key = 'carbohydrates';
                    if (key) {
                      nutrition[key] = value;
                    }
                  }
                }
              });

            // Format ingredientsJson
            const ingredientsJson = (data.ingredientsText || '')
              .split('\n')
              .map(line => line.trim())
              .filter(Boolean)
              .map(line => ({
                name: line,
                quantity: '',
                unit: ''
              }));

            // Format instructions
            const instructions = (data.instructionsText || '')
              .split('\n')
              .map(line => line.trim())
              .filter(Boolean)
              .map(line => ({
                text: line
              }));

            let prepTime: string | null = null;
            let cookTime: string | null = null;
            let totalTime: string | null = null;
            let servings: number | null = data.servings || null;

            const timings: { label: string; value: string }[] = [];
            const timeLines = (data.timeText || '').split('\n');
            timeLines.forEach(line => {
              const clean = line.trim();
              if (!clean) return;
              const colonIdx = clean.indexOf(':');
              if (colonIdx !== -1) {
                const label = clean.slice(0, colonIdx).trim();
                const value = clean.slice(colonIdx + 1).trim();
                if (label.toLowerCase().includes('serv')) {
                  const match = value.match(/\d+/);
                  if (match) {
                    const num = parseInt(match[0], 10);
                    if (!isNaN(num) && !servings) servings = num;
                  }
                } else {
                  timings.push({ label, value });
                  if (label.toLowerCase().includes('prep')) prepTime = value || null;
                  else if (label.toLowerCase().includes('total')) totalTime = value || null;
                }
              } else {
                const words = clean.split(/\s+/);
                if (words.length >= 2) {
                  const label = words[0];
                  const value = words.slice(1).join(' ');
                  if (label.toLowerCase().includes('serv')) {
                    const match = value.match(/\d+/);
                    if (match) {
                      const num = parseInt(match[0], 10);
                      if (!isNaN(num) && !servings) servings = num;
                    }
                  } else {
                    timings.push({ label, value });
                    if (label.toLowerCase().includes('prep')) prepTime = value || null;
                    else if (label.toLowerCase().includes('total')) totalTime = value || null;
                  }
                }
              }
            });

            if (timings.length > 0) {
              cookTime = JSON.stringify(timings);
            }

            if (!totalTime) {
              let sumMins = 0;
              timings.forEach(t => {
                if (!t.label.toLowerCase().includes('total')) {
                  const n = parseInt(t.value.replace(/[^0-9]/g, ''), 10);
                  if (!isNaN(n)) sumMins += n;
                }
              });
              if (sumMins > 0) totalTime = `${sumMins} mins`;
            }

            const formattedPreviewData = {
              ...data,
              ingredientsJson,
              instructions,
              nutrition,
              prepTime,
              cookTime,
              totalTime,
              servings,
              seo: {
                ...data.seo,
                title: data.seo?.seoTitle || data.seo?.title || '',
                description: data.seo?.metaDescription || data.seo?.description || '',
              }
            };

            localStorage.setItem('recipe-preview', JSON.stringify(formattedPreviewData));
            window.open('/recipes/preview', '_blank');
          }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold transition-all hover:bg-secondary">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button type="submit" disabled={isLoading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Recipe
          </button>
        </div>
      </div>

      {/* ─── Top Row: Zero-Chrome Identity Bar (4 Columns) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {/* Col 1: Title & Summary */}
        <div className="flex flex-col space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recipe Title <span className="text-rose-500">*</span></label>
              <button
                type="button"
                onClick={() => handleAiGenerateField('title')}
                disabled={generatingField === 'title'}
                className="p-1 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-all flex items-center justify-center"
                title="AI Auto-Generate Title"
              >
                {generatingField === 'title' ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
              </button>
            </div>
            <input {...register('title')} placeholder="Recipe title..." className={`w-full h-11 rounded-xl border bg-card px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.title ? 'border-rose-500' : 'border-border'}`} />
          </div>
          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Short Description <span className="text-rose-500">*</span></label>
            <textarea {...register('summary')} placeholder="Brief summary..." className={`w-full rounded-xl border bg-card p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-[115px] ${errors.summary ? 'border-rose-500' : 'border-border'}`} />
          </div>
        </div>

        {/* Col 2: Main Image */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Main Image <span className="text-rose-500">*</span></label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAiGenerateField('image')}
                disabled={generatingField === 'image'}
                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-all flex items-center justify-center"
                title="AI Auto-Generate Image"
              >
                {generatingField === 'image' ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
              </button>
              <button type="button" onClick={() => setShowImageUrlInput(!showImageUrlInput)} className={`p-1.5 rounded-lg border ${showImageUrlInput ? 'bg-primary/20 border-primary text-primary' : 'bg-card'}`}><Link className="h-3 w-3" /></button>
            </div>
          </div>
          <div className={`relative w-full aspect-video rounded-2xl border-2 border-dashed bg-card overflow-hidden group transition-all ${errors.imageUrl ? 'border-rose-500/50' : 'border-border'}`}>
            {imageUrl ? (
              <div className="relative w-full h-full group/img">
                <img src={imageUrl} className="h-full w-full object-cover animate-fade-in" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xl hover:scale-105 active:scale-95"
                  >
                    <Upload className="w-3 h-3" />
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('imageUrl', '')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xl hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/50">
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:text-primary transition-all p-3 rounded-xl hover:bg-secondary/20"
                >
                  <Upload className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors animate-bounce-slow" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Upload Image</span>
                </div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase">or</div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAiGenerateField('image');
                  }}
                  disabled={generatingField === 'image'}
                  className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-xs font-bold flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {generatingField === 'image' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate Main Image
                </button>
              </div>
            )}
            <AnimatePresence>{showImageUrlInput && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute inset-x-0 bottom-0 p-3 bg-card/90 backdrop-blur-md border-t border-border z-20"><input {...register('imageUrl')} placeholder="Paste Image URL..." className="w-full h-9 rounded-lg border border-primary/30 bg-background px-3 text-[10px] font-bold outline-none" autoFocus /></motion.div>}</AnimatePresence>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        </div>

        {/* Col 3: Video Window */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recipe Video</label>
            <button type="button" onClick={() => setShowVideoUrlInput(!showVideoUrlInput)} className={`p-1.5 rounded-lg border ${showVideoUrlInput ? 'bg-primary/20 border-primary text-primary' : 'bg-card'}`}><Link className="h-3 w-3" /></button>
          </div>
          <div className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-border bg-card overflow-hidden group">
            {videoUrl ? (
              <div className="relative w-full h-full group/video">
                {embedUrl ? (
                  <iframe src={embedUrl} className="w-full h-full pointer-events-none" />
                ) : (
                  <video src={videoUrl} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={() => setShowVideoUrlInput(true)}
                    className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Link className="w-3 h-3" />
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('videoUrl', '');
                      setShowVideoUrlInput(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div onClick={() => setShowVideoUrlInput(true)} className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/30">
                <Video className="h-7 w-7 text-primary" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Insert Video</span>
              </div>
            )}
            <AnimatePresence>{showVideoUrlInput && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute inset-x-0 bottom-0 p-3 bg-card/90 backdrop-blur-md border-t border-border z-20"><input {...register('videoUrl')} placeholder="Paste Video URL..." className="w-full h-9 rounded-lg border border-primary/30 bg-background px-3 text-[10px] font-bold outline-none" autoFocus /></motion.div>}</AnimatePresence>
          </div>
        </div>

        {/* Col 4: Gallery */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gallery</label>
            <span className="text-[9px] font-bold text-primary uppercase">Assets: {galleryImages.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1.5 max-h-[175px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
            {galleryImages.map((url, idx) => (
              <div key={idx} className="relative h-14 w-full rounded-xl overflow-hidden group border border-border bg-card shrink-0">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100"><X className="h-2.5 w-2.5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => galleryInputRef.current?.click()} className="h-14 w-full rounded-xl border-2 border-dashed border-border bg-card flex items-center justify-center hover:border-primary/50 transition-all text-muted-foreground"><Plus className="h-3.5 w-3.5" /></button>
            <input type="file" ref={galleryInputRef} onChange={handleGalleryFileChange} className="hidden" accept="image/*" multiple />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Categories, Difficulty, and Times/Servings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories & Difficulty Card */}
            <div className="p-6 rounded-2xl bg-card border border-border min-h-[250px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categories (Optional)</label>
                  <div className="relative">
                    <select className="w-full h-11 appearance-none rounded-xl border border-border bg-background px-4 text-sm font-bold outline-none" value={selectedCategoryIds[0] || ''} onChange={(e) => { const val = Number(e.target.value); if (val) setValue('categoryIds', [val]); }}>
                      <option value="" disabled>Select category</option>
                      {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Difficulty</label>
                  <div className="flex items-center gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button key={level} type="button" onClick={() => setValue('difficulty', level as any)} className={`flex-1 h-9 rounded-lg border text-[11px] font-bold transition-all ${difficulty === level ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground'}`}>{level.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Servings</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Number of servings (e.g. 4)"
                    {...register('servings', { valueAsNumber: true })}
                    className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Times Card */}
            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between min-h-[250px]">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> Times (Optional)</label>
              <div className="relative flex-1 bg-background border border-border/80 rounded-xl p-4 mt-3 flex flex-col justify-between min-h-[140px]">
                <textarea
                  {...register('timeText')}
                  placeholder={`Prep Time: 20 mins\nCook Time: 30 mins\nTotal Time: 50 mins`}
                  className="w-full flex-1 bg-transparent border-none outline-none text-xs font-semibold focus:ring-0 transition-all resize-none custom-scrollbar"
                />
                <div className="flex items-center justify-between mt-2 shrink-0 border-t border-border/40 pt-2">
                  <p className="text-[9px] text-muted-foreground">
                    💡 'Label: Value', one per line.
                  </p>
                  <button
                    type="button"
                    disabled={generatingField !== null}
                    onClick={() => handleAiGenerateField('times')}
                    className="text-[9px] text-primary hover:text-primary/85 font-black uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {generatingField === 'times' ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <span>🪄</span>
                    )}
                    Generate times from description
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cooking Instructions, Ingredients, and Nutrition Info horizontally aligned */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cooking Instructions (Optional) */}
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-1.5"><List className="h-4 w-4 text-primary" /> Cooking Instructions (Optional)</label>
              <div className="relative rounded-2xl border border-border bg-card p-4 h-[250px] flex flex-col justify-between">
                <textarea
                  {...register('instructionsText')}
                  placeholder={`Describe your cooking steps, one per line:\ne.g.\nPreheat oven to 375°F.\nMix ingredients in a bowl.\nBake for 25 minutes.`}
                  className="w-full flex-1 bg-background border border-border/80 rounded-xl p-4 outline-none text-xs font-semibold focus:ring-2 focus:ring-primary/20 transition-all resize-none custom-scrollbar"
                />
                <div className="flex items-center justify-between mt-2 shrink-0 border-t border-border/40 pt-2">
                  <p className="text-[9px] text-muted-foreground">
                    💡 One step per line.
                  </p>
                  <button
                    type="button"
                    disabled={generatingField !== null}
                    onClick={() => handleAiGenerateField('instructions')}
                    className="text-[9px] text-primary hover:text-primary/85 font-black uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {generatingField === 'instructions' ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <span>🪄</span>
                    )}
                    Generate instructions from description
                  </button>
                </div>
              </div>
            </div>

            {/* Ingredients (Optional) */}
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-1.5"><List className="h-4 w-4 text-primary" /> Ingredients (Optional)</label>
              <div className="relative rounded-2xl border border-border bg-card p-4 h-[250px] flex flex-col justify-between">
                <textarea
                  {...register('ingredientsText')}
                  placeholder={`Enter ingredients, one per line:\ne.g.\n2 cups all-purpose flour\n1 tsp baking powder\n3 large eggs`}
                  className="w-full flex-1 bg-background border border-border/80 rounded-xl p-4 outline-none text-xs font-semibold focus:ring-2 focus:ring-primary/20 transition-all resize-none custom-scrollbar"
                />
                <div className="flex items-center justify-between mt-2 shrink-0 border-t border-border/40 pt-2">
                  <p className="text-[9px] text-muted-foreground">
                    💡 One ingredient per line.
                  </p>
                  <button
                    type="button"
                    disabled={generatingField !== null}
                    onClick={() => handleAiGenerateField('ingredients')}
                    className="text-[9px] text-primary hover:text-primary/85 font-black uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {generatingField === 'ingredients' ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <span>🪄</span>
                    )}
                    Generate ingredients from description
                  </button>
                </div>
              </div>
            </div>

            {/* Nutrition Info (Optional) */}
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-1.5"><Apple className="h-4 w-4 text-primary" /> Nutrition Info (Optional)</label>
              <div className="relative rounded-2xl border border-border bg-card p-4 h-[250px] flex flex-col justify-between">
                <textarea
                  {...register('nutritionText')}
                  placeholder={`Calories: 250 kcal\nProtein: 15g\nCarbs: 30g\nFat: 8g`}
                  className="w-full flex-1 bg-background border border-border/80 rounded-xl p-4 outline-none text-xs font-semibold focus:ring-2 focus:ring-primary/20 transition-all resize-none custom-scrollbar"
                />
                <div className="flex items-center justify-between mt-2 shrink-0 border-t border-border/40 pt-2">
                  <p className="text-[9px] text-muted-foreground">
                    💡 'Label: Value', one per line.
                  </p>
                  <button
                    type="button"
                    disabled={generatingField !== null}
                    onClick={() => handleAiGenerateField('nutrition')}
                    className="text-[9px] text-primary hover:text-primary/85 font-black uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {generatingField === 'nutrition' ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <span>🪄</span>
                    )}
                    Generate nutrition from instructions
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-amber-500" /> About Recipe</label>
            <Controller name="content" control={control} render={({ field }) => <InstructionsEditor initialContent={field.value} onChange={field.onChange} />} />
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">

          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Publish</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <select {...register('status')} className="w-full h-11 appearance-none rounded-xl border border-border bg-background pl-8 pr-4 text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Publish Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <div className="w-full h-11 flex items-center rounded-xl border border-border bg-background pl-10 text-sm font-bold">May 31, 2024</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Slug (URL)</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setValue('slug', generateSlugHelper(title));
                      setIsSlugManuallyEdited(false);
                      showToast('success', 'Slug updated from title!');
                    }}
                    className="text-[10px] font-bold text-primary hover:underline transition-all"
                  >
                    Set from Title
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center h-11 rounded-xl border border-border bg-background px-3 text-xs font-medium text-muted-foreground overflow-hidden">
                    <span className="opacity-50">/recipes/</span>
                    <input 
                      {...slugReg} 
                      onChange={(e) => {
                        slugReg.onChange(e);
                        setIsSlugManuallyEdited(true);
                      }}
                      readOnly={!canEditSlug}
                      className="bg-transparent border-none outline-none text-foreground ml-0.5 w-full disabled:opacity-50" 
                      placeholder="url-slug" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setCanEditSlug(!canEditSlug)} 
                    className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all ${canEditSlug ? 'bg-primary/20 border-primary text-primary' : 'border-border bg-background hover:bg-secondary'}`}
                  >
                    {canEditSlug ? <Check className="h-4 w-4 text-emerald-500" /> : <Edit2 className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Advanced Search Engine Optimization (SEO) — Right Sidebar ─── */}
          <div className="rounded-3xl bg-card border border-border/80 relative overflow-hidden shadow-2xl backdrop-blur-xl bg-gradient-to-br from-card to-background/40">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-indigo-500 to-primary/20 opacity-80" />

            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-sm font-bold flex items-center gap-2 tracking-tight">
                  <Globe className="h-4 w-4 text-primary animate-pulse" />
                  Advanced SEO
                </h2>
                <p className="text-[10px] font-semibold text-muted-foreground">
                  Supercharge your recipe's search discoverability.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/40">
                <button type="button" onClick={() => setActiveSeoTab('basic')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSeoTab === 'basic' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}>Basic</button>
                <button type="button" onClick={() => setActiveSeoTab('scoring')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSeoTab === 'scoring' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}>Scoring</button>
                <button type="button" onClick={() => setActiveSeoTab('headings')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSeoTab === 'headings' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}>Headings</button>
                <button type="button" onClick={() => setActiveSeoTab('social')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSeoTab === 'social' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}>Social</button>
                <button type="button" onClick={() => setActiveSeoTab('linking')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSeoTab === 'linking' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}>Linking</button>
                <button type="button" onClick={() => setActiveSeoTab('faq')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSeoTab === 'faq' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}>FAQ</button>
              </div>

              {activeSeoTab === 'basic' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-[#0b0c16]/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                        AI SEO Co-Pilot
                      </h4>
                      {isGeneratingAi && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />}
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold text-slate-400 leading-normal">💡 SEO fields are automatically kept in sync with title & "About Recipe". Use these tools to preview variations or readability suggestions.</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] font-black uppercase tracking-wider">
                        <button type="button" disabled={isGeneratingAi} onClick={() => handleAiAction('title')} className="px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95">Generate title</button>
                        <button type="button" disabled={isGeneratingAi} onClick={() => handleAiAction('meta')} className="px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95">Generate desc</button>
                        <button type="button" disabled={isGeneratingAi} onClick={() => handleAiAction('keywords')} className="px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95">Keywords</button>
                        <button type="button" disabled={isGeneratingAi} onClick={() => handleAiAction('readability')} className="px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95">Readability</button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const getTiptapPlainText = (node: any): string => {
                            if (!node) return '';
                            if (node.type === 'text' && node.text) return node.text;
                            if (node.content && Array.isArray(node.content)) {
                              return node.content.map(getTiptapPlainText).join(' ');
                            }
                            return '';
                          };
                          const plainText = getTiptapPlainText(watch('content')).trim();
                          const validation = validateRecipeContent(plainText);
                          if (!validation.isValid) {
                            showToast('error', validation.error || "Please add a valid 'About Recipe' article content first.");
                            return;
                          }
                          const currentTitle = watch('title');
                          const generatedKeyword = getFocusKeyword(currentTitle, plainText);
                          const generatedTitle = getSeoTitle(currentTitle, generatedKeyword);
                          const generatedMeta = getMetaDescription(currentTitle, generatedKeyword, plainText);
                          // Generate slug from focus keyword
                          const generatedSlug = generateSlugHelper(generatedKeyword || currentTitle);

                          setValue('seo.focusKeyword', generatedKeyword);
                          setValue('seo.seoTitle', generatedTitle);
                          setValue('seo.metaDescription', generatedMeta);
                          setValue('slug', generatedSlug);
                          
                          setIsFocusKeywordEdited(true);
                          setIsSeoTitleEdited(true);
                          setIsMetaDescriptionEdited(true);
                          setIsSlugManuallyEdited(true);

                          // Build real-time validation results
                          const kw = generatedKeyword.toLowerCase().trim();
                          const titleLen = generatedTitle.length;
                          const descLen = generatedMeta.length;
                          const slugLower = generatedSlug.toLowerCase();
                          const contentHtml = typeof watch('content') === 'string' ? watch('content') : JSON.stringify(watch('content') || '');
                          const h2 = (contentHtml.match(/<h2[^>]*>/gi) || []).length;
                          const h3 = (contentHtml.match(/<h3[^>]*>/gi) || []).length;
                          const links = (contentHtml.match(/<a\s+href=["']\//gi) || []).length;
                          const hasImage = !!watch('imageUrl');

                          setSeoValidation({
                            title: titleLen >= 50 && titleLen <= 60
                              ? { status: 'pass', label: 'SEO Title', message: 'SEO Title length is ideal (50-60 characters).' }
                              : { status: 'warning', label: 'SEO Title', message: `SEO Title is ${titleLen} chars — keep it 50-60 characters.` },
                            description: descLen >= 120 && descLen <= 160
                              ? { status: 'pass', label: 'Meta Description', message: 'Meta Description length is ideal (120-160 characters).' }
                              : { status: 'warning', label: 'Meta Description', message: `Meta Description is ${descLen} chars — aim for 120-160 characters.` },
                            keywordInTitle: generatedTitle.toLowerCase().includes(kw)
                              ? { status: 'pass', label: 'Keyword in Title', message: 'Target keyword found in your SEO Title.' }
                              : { status: 'fail', label: 'Keyword in Title', message: 'Target keyword is missing from SEO Title.' },
                            keywordInDescription: generatedMeta.toLowerCase().includes(kw)
                              ? { status: 'pass', label: 'Keyword in Description', message: 'Target keyword found in your Meta Description.' }
                              : { status: 'fail', label: 'Keyword in Description', message: 'Target keyword is missing from Meta Description.' },
                            keywordInSlug: slugLower.includes(kw.replace(/\s+/g, '-'))
                              ? { status: 'pass', label: 'Keyword in Slug', message: 'Target keyword found in the URL slug.' }
                              : { status: 'fail', label: 'Keyword in Slug', message: 'Target keyword is missing from the URL slug.' },
                            headings: (h2 > 0 || h3 > 0)
                              ? { status: 'pass', label: 'Headings', message: `Found heading tags (H2: ${h2}, H3: ${h3}) in content.` }
                              : { status: 'warning', label: 'Headings', message: 'Add H2 or H3 headers to break up your recipe instructions.' },
                            imagesAlt: hasImage
                              ? { status: 'pass', label: 'Image Alt', message: 'Descriptive alt texts configured on recipe images.' }
                              : { status: 'warning', label: 'Image Alt', message: 'Upload a main image and set alt text to boost image search rank.' },
                            internalLinks: links > 0
                              ? { status: 'pass', label: 'Internal Links', message: `Good internal linking. Found ${links} link(s) in content.` }
                              : { status: 'warning', label: 'Internal Links', message: 'No internal links detected. Add links to related recipes.' },
                          });

                          showToast('success', 'SEO fields generated & validated!');
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Force Generate SEO Fields
                      </button>
                    </div>
                  </div>

                  {aiSuggestions && (
                    <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3 relative">
                      <button type="button" onClick={() => setAiSuggestions(null)} className="absolute top-3 right-3 text-slate-400 hover:text-white"><X className="h-3.5 w-3.5" /></button>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400">AI Output ({aiSuggestions.action})</span>
                      <pre className="p-3 rounded-xl bg-black/40 text-[10px] font-semibold text-slate-200 font-mono whitespace-pre-wrap leading-relaxed border border-white/5">{aiSuggestions.output}</pre>
                      {aiSuggestions.action !== 'readability' && (
                        <button type="button" onClick={() => {
                          if (aiSuggestions.action === 'title') { setValue('seo.seoTitle', aiSuggestions.output.split('\n')[0].replace(/\[Suggested SEO Title \d\]\s*/g, '')); showToast('success', 'Applied AI Title!'); }
                          else if (aiSuggestions.action === 'meta') { setValue('seo.metaDescription', aiSuggestions.output); showToast('success', 'Applied Meta Description!'); }
                          else if (aiSuggestions.action === 'keywords') { setValue('seo.focusKeyword', aiSuggestions.output.split(',')[0].trim()); showToast('success', 'Applied Focus Keyword!'); }
                          setAiSuggestions(null);
                        }} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95">Apply suggestion</button>
                      )}
                    </div>
                  )}

                  {seoValidation && (
                    <div className="rounded-2xl border border-white/5 bg-black/30 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                        <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 animate-pulse" /> SEO Validation Results
                        </span>
                        <button type="button" onClick={() => setSeoValidation(null)} className="text-slate-500 hover:text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="divide-y divide-white/5">
                        {Object.values(seoValidation).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 px-3 py-2">
                            <span className={`mt-0.5 shrink-0 text-[8px] w-2 h-2 rounded-full ${
                              item.status === 'pass' ? 'bg-emerald-400' :
                              item.status === 'fail' ? 'bg-rose-500' : 'bg-amber-400'
                            }`} />
                            <div className="min-w-0">
                              <span className={`text-[9px] font-black uppercase tracking-wide block ${
                                item.status === 'pass' ? 'text-emerald-400' :
                                item.status === 'fail' ? 'text-rose-400' : 'text-amber-400'
                              }`}>{item.label}</span>
                              <p className="text-[9px] font-medium text-slate-400 leading-tight">{item.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Key className="h-3 w-3 text-primary" /> Focus Keyword</label>
                    <input 
                      {...focusKeywordReg} 
                      onChange={(e) => {
                        focusKeywordReg.onChange(e);
                        setIsFocusKeywordEdited(true);
                        // Also regenerate slug from the new keyword value
                        if (!isSlugManuallyEdited) {
                          setValue('slug', generateSlugHelper(e.target.value || title));
                        }
                      }}
                      placeholder="e.g. chocolate chip cookies" 
                      className="w-full h-10 rounded-xl border border-border bg-background px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    />
                    <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary animate-pulse" /> Slug is auto-generated from keyword. Aligning with focus terms improves crawl relevance.</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SEO Title</label>
                      <span className={`text-[9px] font-black uppercase ${seo?.seoTitle && seo.seoTitle.length >= 50 && seo.seoTitle.length <= 60 ? 'text-emerald-400' : 'text-amber-500'}`}>{seo?.seoTitle?.length || 0}/60</span>
                    </div>
                    <input 
                      {...seoTitleReg} 
                      onChange={(e) => {
                        seoTitleReg.onChange(e);
                        setIsSeoTitleEdited(true);
                      }}
                      placeholder={title || 'Recipe SEO title...'} 
                      className="w-full h-10 rounded-xl border border-border bg-background px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    />
                    <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden"><div className={`h-full transition-all duration-300 ${seo?.seoTitle && seo.seoTitle.length >= 50 && seo.seoTitle.length <= 60 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(((seo?.seoTitle?.length || 0) / 60) * 100, 100)}%` }} /></div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Meta Description</label>
                      <span className={`text-[9px] font-black uppercase ${seo?.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160 ? 'text-emerald-400' : 'text-amber-500'}`}>{seo?.metaDescription?.length || 0}/160</span>
                    </div>
                    <textarea 
                      {...metaDescriptionReg} 
                      onChange={(e) => {
                        metaDescriptionReg.onChange(e);
                        setIsMetaDescriptionEdited(true);
                      }}
                      placeholder="Concise meta description..." 
                      rows={3} 
                      className="w-full rounded-xl border border-border bg-background p-3 text-[10px] font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" 
                    />
                    <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden"><div className={`h-full transition-all duration-300 ${seo?.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(((seo?.metaDescription?.length || 0) / 160) * 100, 100)}%` }} /></div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recipe Slug</label>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            // Generate slug from focus keyword (not raw title)
                            const kw = seo?.focusKeyword || getFocusKeyword(title);
                            setValue('slug', generateSlugHelper(kw || title));
                            setIsSlugManuallyEdited(false);
                            showToast('success', 'Slug set from focus keyword!');
                          }}
                          className="text-[10px] font-bold text-primary hover:underline transition-all"
                        >
                          Set from Keyword
                        </button>
                        <span className="text-muted-foreground/30 text-[9px]">|</span>
                        <button 
                          type="button" 
                          onClick={() => setCanEditSlug(!canEditSlug)} 
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          {canEditSlug ? 'Save / Lock' : 'Edit'}
                        </button>
                      </div>
                    </div>
                    <input 
                      {...slugReg} 
                      onChange={(e) => {
                        slugReg.onChange(e);
                        setIsSlugManuallyEdited(true);
                      }} 
                      readOnly={!canEditSlug}
                      placeholder="recipe-slug-url" 
                      className="w-full h-10 rounded-xl border border-border bg-background px-4 text-[10px] font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Robots Meta</label>
                    <div className="relative">
                      <select {...register('seo.robotsMeta')} className="w-full h-10 appearance-none rounded-xl border border-border bg-background px-4 text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                        <option value="index, follow">Index, Follow (Default)</option>
                        <option value="noindex, follow">Noindex, Follow</option>
                        <option value="index, nofollow">Index, Nofollow</option>
                        <option value="noindex, nofollow">Noindex, Nofollow</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Eye className="h-3 w-3 text-primary" /> Google Preview</label>
                      <div className="flex items-center gap-1 bg-background/60 border border-border/40 p-0.5 rounded-lg">
                        <button type="button" onClick={() => setPreviewMode('desktop')} className={`p-1 rounded ${previewMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Monitor className="h-3 w-3" /></button>
                        <button type="button" onClick={() => setPreviewMode('mobile')} className={`p-1 rounded ${previewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Smartphone className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/60 border border-border/80 space-y-1.5 shadow-lg">
                      <div className="flex items-center gap-1 text-[9px] text-zinc-400 truncate"><Globe className="h-2.5 w-2.5 shrink-0 text-emerald-400" /><span>tastyrecipes.com › recipes › {slug || 'recipe-slug'}</span></div>
                      <h3 className={`font-bold text-indigo-400 leading-tight ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>{seo?.seoTitle || title || 'Enter SEO title...'}</h3>
                      <p className="text-[10px] text-zinc-300 leading-relaxed line-clamp-2">{seo?.metaDescription || 'Add a meta description to summarize your recipe...'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSeoTab === 'scoring' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 justify-center">
                    <div className="flex flex-col items-center p-4 rounded-2xl bg-black/40 border border-border/60 flex-1">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle className="text-muted/20" strokeWidth="6" stroke="currentColor" fill="transparent" r="30" cx="40" cy="40" />
                          <circle className="transition-all duration-1000 ease-out text-emerald-400" strokeWidth="6" strokeDasharray="188.4 188.4" style={{ strokeDashoffset: 188.4 - (seoAnalysis.score / 100) * 188.4 }} strokeLinecap="round" fill="transparent" r="30" cx="40" cy="40" />
                        </svg>
                        <span className="absolute text-base font-black text-foreground">{seoAnalysis.score}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-2">SEO Score</span>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-2xl bg-black/40 border border-border/60 flex-1">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle className="text-muted/20" strokeWidth="6" stroke="currentColor" fill="transparent" r="30" cx="40" cy="40" />
                          <circle className="transition-all duration-1000 ease-out text-primary" strokeWidth="6" strokeDasharray="188.4 188.4" style={{ strokeDashoffset: 188.4 - (readabilityAnalysis.score / 100) * 188.4 }} strokeLinecap="round" fill="transparent" r="30" cx="40" cy="40" />
                        </svg>
                        <span className="absolute text-base font-black text-foreground">{readabilityAnalysis.score}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-2">Readability</span>
                    </div>
                  </div>
                  <div className="space-y-2 bg-black/35 p-4 rounded-2xl border border-border/60">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5"><Sparkles className="h-3 w-3 animate-pulse" /> SEO Checklist</h4>
                    <div className="space-y-2">
                      {Object.entries(seoAnalysis.checks).map(([key, check]: any) => (
                        <div key={key} className="flex items-start gap-2 bg-background/40 p-2.5 rounded-xl border border-border/40">
                          {check.status === 'pass' ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> : check.status === 'warning' ? <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" /> : <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />}
                          <div><span className="text-[9px] font-bold uppercase tracking-wide block text-zinc-300">{key.replace(/([A-Z])/g, ' $1')}</span><p className="text-[9px] font-semibold text-muted-foreground">{check.message}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-background/40 rounded-xl border border-border/40 text-center"><span className="text-[9px] font-bold text-muted-foreground uppercase block">Avg Sentence</span><span className="text-sm font-black">{readabilityAnalysis.details.avgSentenceWords}w</span></div>
                    <div className="p-3 bg-background/40 rounded-xl border border-border/40 text-center"><span className="text-[9px] font-bold text-muted-foreground uppercase block">Avg Paragraph</span><span className="text-sm font-black">{readabilityAnalysis.details.avgParagraphWords}w</span></div>
                    <div className="p-3 bg-background/40 rounded-xl border border-border/40 text-center"><span className="text-[9px] font-bold text-muted-foreground uppercase block">Passive Voice</span><span className="text-sm font-black">{readabilityAnalysis.details.passiveSentencesPercent}%</span></div>
                    <div className="p-3 bg-background/40 rounded-xl border border-border/40 text-center"><span className="text-[9px] font-bold text-muted-foreground uppercase block">Keyword Density</span><span className="text-sm font-black">{Math.round(readabilityAnalysis.keywordDensity * 100) / 100}%</span></div>
                  </div>
                </div>
              )}

              {activeSeoTab === 'headings' && (
                <div className="space-y-5">
                  <div className="space-y-3 bg-black/35 p-4 rounded-2xl border border-border/60">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <List className="h-3 w-3 animate-pulse" /> Heading Structure Outline
                    </h3>
                    
                    {(() => {
                      const outline = getHeadings(content);
                      const multipleH1 = outline.filter(h => h.level === 1).length > 0;
                      const hasH2 = outline.filter(h => h.level === 2).length > 0;
                      
                      return (
                        <div className="space-y-3">
                          {multipleH1 && (
                            <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl text-[10px] text-rose-400">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <p><strong>SEO Warning:</strong> Multiple H1 tags detected in your editor content. Search engines prefer a single H1 (the recipe title). Use H2 for primary headings.</p>
                            </div>
                          )}
                          {!hasH2 && (
                            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl text-[10px] text-amber-400">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <p><strong>SEO Recommendation:</strong> Add H2 headings (e.g. "Ingredients", "Instructions") to organize your content for better indexing.</p>
                            </div>
                          )}

                          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                            {outline.length > 0 ? outline.map((h, idx) => (
                              <div key={idx} className="flex items-center gap-2" style={{ paddingLeft: `${(h.level - 1) * 8}px` }}>
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${h.level === 1 ? 'bg-rose-500/20 text-rose-400' : h.level === 2 ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                  H{h.level}
                                </span>
                                <span className={`text-[10px] truncate font-semibold ${h.level === 1 ? 'text-rose-400/90' : h.level === 2 ? 'text-zinc-200' : 'text-zinc-400'}`}>
                                  {h.text}
                                </span>
                              </div>
                            )) : (
                              <p className="text-[10px] text-muted-foreground italic text-center py-4">No headings found in the content. Use the editor to add H2/H3 tags.</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-3 bg-black/35 p-4 rounded-2xl border border-border/60">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 animate-pulse" /> Suggested SEO Headings
                    </h3>
                    <p className="text-[9px] text-muted-foreground">Click any heading below to copy it to your clipboard:</p>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {getSuggestedHeadings(title).map((sh, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            navigator.clipboard.writeText(sh.text);
                            showToast('success', `Copied heading: "${sh.text}"`);
                          }}
                          className="p-2.5 bg-background/55 border border-border/40 hover:border-primary/40 rounded-xl cursor-pointer flex justify-between items-center transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                              H{sh.level}
                            </span>
                            <span className="text-[10px] font-semibold text-zinc-300 group-hover:text-white transition-colors">{sh.text}</span>
                          </div>
                          <span className="text-[8px] font-bold uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSeoTab === 'social' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button type="button" onClick={() => setSocialPlatform('opengraph')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${socialPlatform === 'opengraph' ? 'bg-primary border-primary text-primary-foreground' : 'border-border/60 text-muted-foreground'}`}>Meta Tags</button>
                    <button type="button" onClick={() => setSocialPlatform('facebook')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${socialPlatform === 'facebook' ? 'bg-[#1877F2] border-[#1877F2] text-white' : 'border-border/60 text-muted-foreground'}`}>Facebook</button>
                    <button type="button" onClick={() => setSocialPlatform('twitter')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${socialPlatform === 'twitter' ? 'bg-white border-white text-black' : 'border-border/60 text-muted-foreground'}`}>Twitter/X</button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">OG Image URL</label><input {...register('seo.ogImage')} placeholder="Paste share image link..." className="w-full h-10 rounded-xl border border-border bg-background px-3 text-[10px] font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Canonical URL</label><input {...register('seo.canonicalUrl')} placeholder="https://tastyrecipes.com/..." className="w-full h-10 rounded-xl border border-border bg-background px-3 text-[10px] font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" /></div>
                  </div>
                  {socialPlatform === 'facebook' && (
                    <div className="rounded-xl overflow-hidden bg-[#242526] border border-[#3E4042] shadow-2xl">
                      <div className="h-36 w-full bg-zinc-800 relative flex items-center justify-center overflow-hidden">{seo?.ogImage || imageUrl ? <img src={seo?.ogImage || imageUrl} alt="Facebook Card" className="w-full h-full object-cover" /> : <ImagePlus className="h-8 w-8 text-muted/30" />}</div>
                      <div className="p-3 space-y-0.5"><span className="text-[9px] font-bold text-[#B0B3B8] uppercase">TASTYRECIPES.COM</span><h4 className="text-xs font-bold text-white leading-snug">{seo?.seoTitle || title || 'Recipe Title'}</h4><p className="text-[10px] text-[#E4E6EB] line-clamp-2">{seo?.metaDescription || 'Recipe description...'}</p></div>
                    </div>
                  )}
                  {socialPlatform === 'twitter' && (
                    <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
                      <div className="h-32 w-full bg-zinc-900 relative flex items-center justify-center overflow-hidden">{seo?.ogImage || imageUrl ? <img src={seo?.ogImage || imageUrl} alt="Twitter Card" className="w-full h-full object-cover" /> : <ImagePlus className="h-8 w-8 text-muted/30" />}</div>
                      <div className="p-3 bg-zinc-950/80 border-t border-zinc-900 space-y-0.5"><span className="text-[9px] font-bold text-zinc-500">tastyrecipes.com</span><h4 className="text-[11px] font-bold text-zinc-200 line-clamp-1">{seo?.seoTitle || title || 'Recipe Title'}</h4><p className="text-[10px] text-zinc-400 line-clamp-2">{seo?.metaDescription || 'Recipe description...'}</p></div>
                    </div>
                  )}
                  {socialPlatform === 'opengraph' && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-border/80 space-y-3">
                      <div className="space-y-0.5"><span className="text-[8px] font-black text-primary uppercase tracking-widest block">og:title</span><span className="text-[10px] font-bold text-zinc-300 block bg-secondary/35 p-2 rounded-lg border border-border/40">{seo?.seoTitle || title || 'Not configured'}</span></div>
                      <div className="space-y-0.5"><span className="text-[8px] font-black text-primary uppercase tracking-widest block">og:description</span><span className="text-[10px] font-bold text-zinc-300 block bg-secondary/35 p-2 rounded-lg border border-border/40">{seo?.metaDescription || 'Not configured'}</span></div>
                      <div className="space-y-0.5"><span className="text-[8px] font-black text-primary uppercase tracking-widest block">og:image</span><span className="text-[10px] font-mono text-zinc-400 block truncate bg-secondary/35 p-2 rounded-lg border border-border/40">{seo?.ogImage || imageUrl || 'Not configured'}</span></div>
                    </div>
                  )}
                </div>
              )}

              {activeSeoTab === 'linking' && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2"><Link className="h-3.5 w-3.5" /> Linking Suggestions</h3>
                  {linkingSuggestions.length > 0 ? (
                    <div className="space-y-3">
                      {linkingSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-border/60 space-y-2 hover:border-indigo-500/40 transition-all">
                          <h4 className="text-xs font-bold text-zinc-200">{suggestion.title}</h4>
                          <p className="text-[10px] font-bold text-indigo-400 select-all bg-background/55 p-2 rounded-lg border border-border/30">{suggestion.recommendedAnchor}</p>
                          <span className="text-[9px] text-muted-foreground">Reason: {suggestion.reason}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-black/20 text-muted-foreground text-[10px] font-semibold">No linking opportunities yet. Add more recipes or assign a category!</div>
                  )}
                </div>
              )}

              {activeSeoTab === 'faq' && (
                <div className="space-y-5">
                  <div className="space-y-3 bg-black/35 p-4 rounded-2xl border border-border/60">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">FAQ Builder</h3>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question</label><input value={newFaqQuestion} onChange={(e) => setNewFaqQuestion(e.target.value)} placeholder="e.g. Can I substitute butter with coconut oil?" className="w-full h-10 rounded-xl border border-border bg-background px-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Answer</label><textarea value={newFaqAnswer} onChange={(e) => setNewFaqAnswer(e.target.value)} placeholder="Yes! Coconut oil is a 1:1 substitute..." rows={2} className="w-full rounded-xl border border-border bg-background p-3 text-[10px] font-semibold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" /></div>
                    <button type="button" onClick={addFaqItem} className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add FAQ Item</button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active FAQs ({faqsList.length})</label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {faqsList.map((faq, idx) => (
                        <div key={idx} className="p-3 bg-background/55 border border-border/40 rounded-xl flex justify-between items-start gap-3">
                          <div className="space-y-0.5"><span className="text-[9px] font-bold text-indigo-400 block">Q: {faq.question}</span><p className="text-[9px] font-semibold text-muted-foreground">A: {faq.answer}</p></div>
                          <button type="button" onClick={() => removeFaqItem(idx)} className="text-rose-500 hover:text-rose-400 p-0.5"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Generated JSON-LD Schema</span>
                      <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-emerald-400 overflow-x-auto max-h-[120px] leading-relaxed">{JSON.stringify(generateFAQJsonLd(faqsList), null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

