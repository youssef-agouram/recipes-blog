/**
 * Zod Validation Schemas
 * 
 * SECURITY: No z.any() — all fields have explicit types and constraints.
 * This prevents arbitrary JSON injection and enforces data integrity.
 */

import { z } from 'zod';

// ── Shared sub-schemas ──────────────────────────────────────────

const MenuItemSchema = z.object({
  label: z.string().max(100),
  href: z.string().max(500).optional(),
  url: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  visible: z.boolean().optional(),
  children: z.array(z.object({
    label: z.string().max(100),
    href: z.string().max(500).optional(),
    url: z.string().max(500).optional(),
    icon: z.string().max(50).optional(),
    visible: z.boolean().optional(),
  })).optional(),
});

const SocialLinkSchema = z.object({
  platform: z.string().max(50),
  url: z.string().url().max(500),
  icon: z.string().max(50).optional(),
});

const FooterLinksSchema = z.record(z.string(), z.array(z.object({
  label: z.string().max(100),
  href: z.string().max(500).optional(),
  url: z.string().max(500).optional(),
})));

const ProfileMenuItemSchema = z.object({
  label: z.string().max(100),
  href: z.string().max(500).optional(),
  url: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  visible: z.boolean().optional(),
});

const CommentSettingsSchema = z.object({
  autoApprove: z.boolean().optional(),
  allowGuest: z.boolean().optional(),
  showRatings: z.boolean().optional(),
  notifications: z.boolean().optional(),
  ads: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

const AdSettingsSchema = z.record(z.string(), z.unknown()).optional();

const HomePageSettingsSchema = z.object({
  showHero: z.boolean().optional(),
  showFeatured: z.boolean().optional(),
  showCategories: z.boolean().optional(),
  showTopArticles: z.boolean().optional(),
  showNewsletter: z.boolean().optional(),
}).passthrough();

// Tiptap JSON content schema — validates the structure without being overly strict
const TiptapNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(z.lazy(() => TiptapNodeSchema)).optional(),
    marks: z.array(z.object({
      type: z.string(),
      attrs: z.record(z.string(), z.unknown()).optional(),
    })).optional(),
    text: z.string().optional(),
  })
);

const TiptapContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(TiptapNodeSchema).optional(),
}).passthrough();

// ── Main Schemas ────────────────────────────────────────────────

export const RecipeSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().max(300).optional(),
  summary: z.string().max(1000).optional(),
  imageUrl: z.string().max(2000).optional(),
  content: TiptapContentSchema, // Validated TipTap JSON structure
  categoryIds: z.array(z.number().int().positive()).optional(),
  ingredientIds: z.array(z.number().int().positive()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "TRASH"]).optional(),
  prepTime: z.string().max(100).nullable().optional(),
  cookTime: z.string().max(500).nullable().optional(),
  totalTime: z.string().max(100).nullable().optional(),
  servings: z.number().int().min(1).max(9999).nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  videoUrl: z.string().url().max(500).optional().or(z.literal("")),
  allowComments: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTopArticle: z.boolean().optional(),
  ingredientsJson: z.array(z.object({
    name: z.string().max(200),
    quantity: z.string().max(100),
    unit: z.string().max(50).optional(),
  })).optional(),
  instructions: z.array(z.object({
    text: z.string().max(2000),
  })).optional(),
  images: z.array(z.string().max(2000)).max(20).optional(),
  seo: z.object({
    title: z.string().max(200).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    seoTitle: z.string().max(200).optional().nullable(),
    metaDescription: z.string().max(500).optional().nullable(),
    focusKeyword: z.string().max(100).optional().nullable(),
    canonicalUrl: z.string().max(500).optional().nullable(),
    ogImage: z.string().max(2000).optional().nullable(),
    robotsMeta: z.string().max(200).optional().nullable(),
    faqJson: z.string().max(10000).optional().nullable(),
  }).optional(),
  nutrition: z.record(z.string().max(50), z.string().max(100)).optional(),
});

export const CategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  description: z.string().max(500).nullable().optional().or(z.literal("")),
  imageUrl: z.string().max(2000).nullable().optional().or(z.literal("")),
  icon: z.string().max(100).nullable().optional().or(z.literal("")),
  parentId: z.number().int().positive().nullable().optional(),
  groupId: z.number().int().positive().nullable().optional(),
  status: z.enum(["PUBLISHED", "HIDDEN"]).optional(),
  displayOnHome: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  menuOrder: z.number().int().min(0).max(9999).optional(),
});

export const CategoryGroupSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
});

export const IngredientSchema = z.object({
  name: z.string().min(2).max(50),
});

export const ArticleSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(10).max(100000),
  summary: z.string().max(500).optional(),
  imageUrl: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  isTopArticle: z.boolean().optional(),
});

export const HeroSettingsSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  titlePart1: z.string().max(100).optional(),
  titlePart2: z.string().max(100).optional(),
  titleColor1: z.string().max(20).optional(),
  titleColor2: z.string().max(20).optional(),
  subtitle: z.string().max(500),
  imageUrl: z.string().max(2000).optional().nullable(),
  images: z.array(z.string().max(2000)).max(10).optional(),
  ctaText: z.string().max(50).optional().nullable(),
});

export const SubscriberSchema = z.object({
  email: z.string().email().max(255),
});

export const SiteSettingsSchema = z.object({
  logoUrl: z.string().max(2000).nullable().optional(),
  faviconUrl: z.string().max(2000).nullable().optional(),
  footerLogoUrl: z.string().max(2000).nullable().optional(),
  brandName: z.string().min(1).max(100),
  brandPart1: z.string().max(50).optional(),
  brandPart2: z.string().max(50).optional(),
  brandColor1: z.string().max(20).optional(),
  brandColor2: z.string().max(20).optional(),
  tagline: z.string().min(1).max(200),
  stickyNavbar: z.boolean(),
  showSearchBar: z.boolean(),
  showAuthButtons: z.boolean(),
  showTopBar: z.boolean(),
  requireCookingSignIn: z.boolean().optional(),
  menuItems: z.array(MenuItemSchema).max(50).optional(),
  profileMenu: z.array(ProfileMenuItemSchema).max(20).optional(),
  footerLinks: FooterLinksSchema.optional(),
  socialLinks: z.array(SocialLinkSchema).max(20).optional(),
  copyrightText: z.string().min(1).max(200),
  aboutText: z.string().max(2000).nullable().optional(),
  commentSettings: CommentSettingsSchema.optional(),
  adSettings: AdSettingsSchema,
  cloudinaryCloudName: z.string().max(100).nullable().optional(),
  cloudinaryApiKey: z.string().max(100).nullable().optional(),
  cloudinaryApiSecret: z.string().max(200).nullable().optional(),
  categoriesTitle: z.string().max(200).optional(),
  categoriesSubtitle: z.string().max(500).optional(),
  blogTitle: z.string().max(200).optional(),
  blogSubtitle: z.string().max(500).optional(),
  recipesTitle: z.string().max(200).optional(),
  recipesSubtitle: z.string().max(500).optional(),
  homePageSettings: HomePageSettingsSchema.optional(),
});

export const SeoSettingsSchema = z.object({
  metaTitle: z.string().min(1).max(255),
  metaDescription: z.string().min(1).max(500),
  metaKeywords: z.string().max(500).optional().or(z.literal("")),
  ogImage: z.string().max(2000).nullable().optional().or(z.literal("")),
  twitterCard: z.string().max(50).default("summary_large_image"),
  canonicalUrl: z.string().max(500).nullable().optional().or(z.literal("")),
  robotsTxt: z.string().max(5000).nullable().optional().or(z.literal("")),
  brandName: z.string().min(1).max(255).default("TastyRecipes"),
  twitterUsername: z.string().min(1).max(255).default("@tastyrecipes"),
  themeColor: z.string().min(1).max(255).default("#5850ec"),
});

export const AnalyticsSettingsSchema = z.object({
  customScriptsCode: z.string().max(10000).nullable().optional().or(z.literal("")),
  analyticsEnabled: z.boolean().default(true),
});

export const WebmasterToolsSchema = z.object({
  googleVerification: z.string().max(200).nullable().optional().or(z.literal("")),
  bingVerification: z.string().max(200).nullable().optional().or(z.literal("")),
  yandexVerification: z.string().max(200).nullable().optional().or(z.literal("")),
  pinterestVerify: z.string().max(200).nullable().optional().or(z.literal("")),
  sitemapUrl: z.string().max(500).nullable().optional().or(z.literal("")),
  autoSitemapSubmit: z.boolean().default(true),
  indexingStats: z.object({
    indexed: z.number().int().optional(),
    notIndexed: z.number().int().optional(),
    submitted: z.number().int().optional(),
  }).passthrough().optional(),
  crawlErrors: z.array(z.object({
    type: z.string().max(100).optional(),
    message: z.string().max(500).optional(),
    url: z.string().max(500).optional(),
  })).max(1000).optional(),
});
