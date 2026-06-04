import { z } from 'zod';

export const RecipeSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().optional(),
  summary: z.string().max(1000).optional(),
  imageUrl: z.string().optional(),
  content: z.any(), // Will be Tiptap JSON
  categoryIds: z.array(z.number()).optional(),
  ingredientIds: z.array(z.number()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "TRASH"]).optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
  servings: z.number().int().min(1).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  allowComments: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTopArticle: z.boolean().optional(),
  ingredientsJson: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string().optional(),
  })).optional(),
  instructions: z.array(z.object({
    text: z.string(),
  })).optional(),
  images: z.array(z.string()).optional(),
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
  nutrition: z.record(z.string()).optional(),
});

export const CategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  description: z.string().nullable().optional().or(z.literal("")),
  imageUrl: z.string().nullable().optional().or(z.literal("")),
  icon: z.string().nullable().optional().or(z.literal("")),
  parentId: z.number().nullable().optional(),
  groupId: z.number().nullable().optional(),
  status: z.enum(["PUBLISHED", "HIDDEN"]).optional(),
  displayOnHome: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  menuOrder: z.number().int().optional(),
});

export const CategoryGroupSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
});

export const IngredientSchema = z.object({
  name: z.string().min(2).max(50),
});

export const ArticleSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(10),
  summary: z.string().optional(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  isTopArticle: z.boolean().optional(),
});

export const HeroSettingsSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  ctaText: z.string(),
});

export const SubscriberSchema = z.object({
  email: z.string().email(),
});

export const SiteSettingsSchema = z.object({
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  footerLogoUrl: z.string().nullable().optional(),
  brandName: z.string(),
  brandPart1: z.string().optional(),
  brandPart2: z.string().optional(),
  brandColor1: z.string().optional(),
  brandColor2: z.string().optional(),
  tagline: z.string(),
  stickyNavbar: z.boolean(),
  showSearchBar: z.boolean(),
  showAuthButtons: z.boolean(),
  showTopBar: z.boolean(),
  menuItems: z.any().optional(),
  profileMenu: z.any().optional(),
  footerLinks: z.any().optional(),
  socialLinks: z.any().optional(),
  copyrightText: z.string(),
  aboutText: z.string().nullable().optional(),
  commentSettings: z.any().optional(),
  adSettings: z.any().optional(),
  cloudinaryCloudName: z.string().nullable().optional(),
  cloudinaryApiKey: z.string().nullable().optional(),
  cloudinaryApiSecret: z.string().nullable().optional(),
  categoriesTitle: z.string().optional(),
  categoriesSubtitle: z.string().optional(),
  blogTitle: z.string().optional(),
  blogSubtitle: z.string().optional(),
  recipesTitle: z.string().optional(),
  recipesSubtitle: z.string().optional(),
});

export const SeoSettingsSchema = z.object({
  metaTitle: z.string().min(1).max(255),
  metaDescription: z.string().min(1).max(500),
  metaKeywords: z.string().optional().or(z.literal("")),
  ogImage: z.string().nullable().optional().or(z.literal("")),
  twitterCard: z.string().default("summary_large_image"),
  canonicalUrl: z.string().nullable().optional().or(z.literal("")),
  robotsTxt: z.string().nullable().optional().or(z.literal("")),
  brandName: z.string().min(1).max(255).default("TastyRecipes"),
  twitterUsername: z.string().min(1).max(255).default("@tastyrecipes"),
  themeColor: z.string().min(1).max(255).default("#5850ec"),
});

export const AnalyticsSettingsSchema = z.object({
  customScriptsCode: z.string().nullable().optional().or(z.literal("")),
  analyticsEnabled: z.boolean().default(true),
});

export const WebmasterToolsSchema = z.object({
  googleVerification: z.string().nullable().optional().or(z.literal("")),
  bingVerification: z.string().nullable().optional().or(z.literal("")),
  yandexVerification: z.string().nullable().optional().or(z.literal("")),
  pinterestVerify: z.string().nullable().optional().or(z.literal("")),
  sitemapUrl: z.string().nullable().optional().or(z.literal("")),
  autoSitemapSubmit: z.boolean().default(true),
  indexingStats: z.any().optional(),
  crawlErrors: z.any().optional(),
});

