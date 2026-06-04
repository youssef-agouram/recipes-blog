
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.RecipeScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  summary: 'summary',
  content: 'content',
  imageUrl: 'imageUrl',
  images: 'images',
  isFeatured: 'isFeatured',
  isTopArticle: 'isTopArticle',
  status: 'status',
  prepTime: 'prepTime',
  cookTime: 'cookTime',
  totalTime: 'totalTime',
  servings: 'servings',
  difficulty: 'difficulty',
  videoUrl: 'videoUrl',
  nutrition: 'nutrition',
  views: 'views',
  allowComments: 'allowComments',
  ingredientsJson: 'ingredientsJson',
  instructions: 'instructions',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  text: 'text',
  rating: 'rating',
  status: 'status',
  likeCount: 'likeCount',
  recipeId: 'recipeId',
  userId: 'userId',
  parentId: 'parentId',
  name: 'name',
  email: 'email',
  avatar: 'avatar',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  imageUrl: 'imageUrl',
  icon: 'icon',
  parentId: 'parentId',
  groupId: 'groupId',
  status: 'status',
  displayOnHome: 'displayOnHome',
  isFeatured: 'isFeatured',
  menuOrder: 'menuOrder'
};

exports.Prisma.CategoryGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IngredientScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  password: 'password',
  role: 'role',
  status: 'status',
  avatar: 'avatar',
  createdAt: 'createdAt'
};

exports.Prisma.SavedRecipeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  recipeId: 'recipeId',
  createdAt: 'createdAt'
};

exports.Prisma.FavoriteRecipeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  recipeId: 'recipeId',
  createdAt: 'createdAt'
};

exports.Prisma.SavedArticleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  articleId: 'articleId',
  createdAt: 'createdAt'
};

exports.Prisma.FavoriteArticleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  articleId: 'articleId',
  createdAt: 'createdAt'
};

exports.Prisma.SeoSettingsScalarFieldEnum = {
  id: 'id',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  metaKeywords: 'metaKeywords',
  ogImage: 'ogImage',
  twitterCard: 'twitterCard',
  canonicalUrl: 'canonicalUrl',
  robotsTxt: 'robotsTxt',
  brandName: 'brandName',
  twitterUsername: 'twitterUsername',
  themeColor: 'themeColor',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RecipeSeoScalarFieldEnum = {
  id: 'id',
  metaTitle: 'metaTitle',
  seoTitle: 'seoTitle',
  metaDescription: 'metaDescription',
  metaKeywords: 'metaKeywords',
  focusKeyword: 'focusKeyword',
  canonicalUrl: 'canonicalUrl',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  robotsMeta: 'robotsMeta',
  faqJson: 'faqJson',
  recipeId: 'recipeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategorySeoScalarFieldEnum = {
  id: 'id',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  metaKeywords: 'metaKeywords',
  focusKeyword: 'focusKeyword',
  canonicalUrl: 'canonicalUrl',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnalyticsSettingsScalarFieldEnum = {
  id: 'id',
  customScriptsCode: 'customScriptsCode',
  analyticsEnabled: 'analyticsEnabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WebmasterToolsScalarFieldEnum = {
  id: 'id',
  googleVerification: 'googleVerification',
  bingVerification: 'bingVerification',
  yandexVerification: 'yandexVerification',
  pinterestVerify: 'pinterestVerify',
  sitemapUrl: 'sitemapUrl',
  autoSitemapSubmit: 'autoSitemapSubmit',
  indexingStats: 'indexingStats',
  crawlErrors: 'crawlErrors',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CrawlReportScalarFieldEnum = {
  id: 'id',
  url: 'url',
  status: 'status',
  statusCode: 'statusCode',
  errorMessage: 'errorMessage',
  lastCrawled: 'lastCrawled',
  issues: 'issues',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ArticleScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  content: 'content',
  summary: 'summary',
  imageUrl: 'imageUrl',
  category: 'category',
  isTopArticle: 'isTopArticle',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SiteSettingsScalarFieldEnum = {
  id: 'id',
  logoUrl: 'logoUrl',
  faviconUrl: 'faviconUrl',
  footerLogoUrl: 'footerLogoUrl',
  brandName: 'brandName',
  tagline: 'tagline',
  stickyNavbar: 'stickyNavbar',
  showSearchBar: 'showSearchBar',
  showAuthButtons: 'showAuthButtons',
  showTopBar: 'showTopBar',
  menuItems: 'menuItems',
  profileMenu: 'profileMenu',
  footerLinks: 'footerLinks',
  socialLinks: 'socialLinks',
  copyrightText: 'copyrightText',
  aboutText: 'aboutText',
  commentSettings: 'commentSettings',
  adSettings: 'adSettings',
  cloudinaryCloudName: 'cloudinaryCloudName',
  cloudinaryApiKey: 'cloudinaryApiKey',
  cloudinaryApiSecret: 'cloudinaryApiSecret',
  categoriesTitle: 'categoriesTitle',
  categoriesSubtitle: 'categoriesSubtitle',
  blogTitle: 'blogTitle',
  blogSubtitle: 'blogSubtitle',
  recipesTitle: 'recipesTitle',
  recipesSubtitle: 'recipesSubtitle'
};

exports.Prisma.HeroSettingsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  subtitle: 'subtitle',
  imageUrl: 'imageUrl',
  images: 'images',
  ctaText: 'ctaText'
};

exports.Prisma.SubscriberScalarFieldEnum = {
  id: 'id',
  email: 'email',
  createdAt: 'createdAt'
};

exports.Prisma.VisitScalarFieldEnum = {
  id: 'id',
  path: 'path',
  ip: 'ip',
  userAgent: 'userAgent',
  sessionId: 'sessionId',
  duration: 'duration',
  createdAt: 'createdAt'
};

exports.Prisma.TechnicalSeoReportScalarFieldEnum = {
  id: 'id',
  issueType: 'issueType',
  pageUrl: 'pageUrl',
  severity: 'severity',
  detectionDate: 'detectionDate',
  resolutionStatus: 'resolutionStatus',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CrawlErrorScalarFieldEnum = {
  id: 'id',
  issueType: 'issueType',
  pageUrl: 'pageUrl',
  targetUrl: 'targetUrl',
  severity: 'severity',
  detectionDate: 'detectionDate',
  resolutionStatus: 'resolutionStatus',
  errorMessage: 'errorMessage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SeoHealthReportScalarFieldEnum = {
  id: 'id',
  healthScore: 'healthScore',
  sitemapStatus: 'sitemapStatus',
  robotsStatus: 'robotsStatus',
  sslStatus: 'sslStatus',
  mobileFriendly: 'mobileFriendly',
  indexedPages: 'indexedPages',
  crawlErrorsCount: 'crawlErrorsCount',
  duplicateMetaCount: 'duplicateMetaCount',
  detectionDate: 'detectionDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RedirectScalarFieldEnum = {
  id: 'id',
  sourceUrl: 'sourceUrl',
  destUrl: 'destUrl',
  type: 'type',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PerformanceReportScalarFieldEnum = {
  id: 'id',
  device: 'device',
  lcp: 'lcp',
  fid: 'fid',
  cls: 'cls',
  ttfb: 'ttfb',
  score: 'score',
  url: 'url',
  detectionDate: 'detectionDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BacklinkReportScalarFieldEnum = {
  id: 'id',
  sourceUrl: 'sourceUrl',
  targetUrl: 'targetUrl',
  domainRating: 'domainRating',
  anchorText: 'anchorText',
  status: 'status',
  discoveryDate: 'discoveryDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AiSeoRecommendationScalarFieldEnum = {
  id: 'id',
  recType: 'recType',
  aiOutput: 'aiOutput',
  recipeId: 'recipeId',
  scoreImprovement: 'scoreImprovement',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AiGeneratedMetadataScalarFieldEnum = {
  id: 'id',
  recipeId: 'recipeId',
  suggestedTitle: 'suggestedTitle',
  suggestedMeta: 'suggestedMeta',
  suggestedKeywords: 'suggestedKeywords',
  readabilityScore: 'readabilityScore',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AiSeoAuditScalarFieldEnum = {
  id: 'id',
  auditScore: 'auditScore',
  strengthsJson: 'strengthsJson',
  weaknessesJson: 'weaknessesJson',
  missingOptJson: 'missingOptJson',
  technicalIssuesJson: 'technicalIssuesJson',
  recommendationsJson: 'recommendationsJson',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.KeywordOpportunityScalarFieldEnum = {
  id: 'id',
  keyword: 'keyword',
  competition: 'competition',
  trendingStatus: 'trendingStatus',
  trafficPotential: 'trafficPotential',
  rankDifficulty: 'rankDifficulty',
  recipeId: 'recipeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InternalLinkingSuggestionScalarFieldEnum = {
  id: 'id',
  sourceUrl: 'sourceUrl',
  targetUrl: 'targetUrl',
  recommendedAnchor: 'recommendedAnchor',
  relevanceScore: 'relevanceScore',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Recipe: 'Recipe',
  Comment: 'Comment',
  Category: 'Category',
  CategoryGroup: 'CategoryGroup',
  Ingredient: 'Ingredient',
  User: 'User',
  SavedRecipe: 'SavedRecipe',
  FavoriteRecipe: 'FavoriteRecipe',
  SavedArticle: 'SavedArticle',
  FavoriteArticle: 'FavoriteArticle',
  SeoSettings: 'SeoSettings',
  RecipeSeo: 'RecipeSeo',
  CategorySeo: 'CategorySeo',
  AnalyticsSettings: 'AnalyticsSettings',
  WebmasterTools: 'WebmasterTools',
  CrawlReport: 'CrawlReport',
  Article: 'Article',
  SiteSettings: 'SiteSettings',
  HeroSettings: 'HeroSettings',
  Subscriber: 'Subscriber',
  Visit: 'Visit',
  TechnicalSeoReport: 'TechnicalSeoReport',
  CrawlError: 'CrawlError',
  SeoHealthReport: 'SeoHealthReport',
  Redirect: 'Redirect',
  PerformanceReport: 'PerformanceReport',
  BacklinkReport: 'BacklinkReport',
  AiSeoRecommendation: 'AiSeoRecommendation',
  AiGeneratedMetadata: 'AiGeneratedMetadata',
  AiSeoAudit: 'AiSeoAudit',
  KeywordOpportunity: 'KeywordOpportunity',
  InternalLinkingSuggestion: 'InternalLinkingSuggestion'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
