import { Recipe, Category } from './types';
import { SITE_URL } from './seo';

// Structured Schema Interfaces
export interface SchemaFAQ {
  question: string;
  answer: string;
}

export interface SchemaNutrition {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
}

/**
 * 1. Advanced JSON-LD Generators
 */
export function generateAdvancedRecipeJsonLd(recipe: Recipe) {
  const defaultImage = `${SITE_URL}/images/og-default.jpg`;
  const imageUrl = recipe.imageUrl || defaultImage;

  // Format ingredients
  const ingredientsArray = recipe.ingredientsJson
    ? recipe.ingredientsJson.map((ing) => `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim())
    : [];

  // Format instructions
  const instructionsArray = recipe.instructions
    ? recipe.instructions.map((inst, idx) => ({
        '@type': 'HowToStep',
        name: `Step ${idx + 1}`,
        text: inst.text,
        url: `${SITE_URL}/recipes/${recipe.slug}#step-${idx + 1}`,
      }))
    : [];

  // Helper to extract numeric minutes
  const parseDuration = (timeStr?: string | null) => {
    if (!timeStr) return undefined;
    if (timeStr.startsWith('[') && timeStr.endsWith(']')) {
      try {
        const parsed = JSON.parse(timeStr);
        if (Array.isArray(parsed)) {
          let totalMins = 0;
          parsed.forEach((item: any) => {
            const digits = item.value?.replace(/\D/g, '');
            if (digits) {
              const num = parseInt(digits, 10);
              if (!isNaN(num)) totalMins += num;
            }
          });
          return totalMins > 0 ? `PT${totalMins}M` : undefined;
        }
      } catch (e) {
        // fallback
      }
    }
    const digits = timeStr.replace(/\D/g, '');
    return digits ? `PT${digits}M` : undefined;
  };

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: [imageUrl],
    author: {
      '@type': 'Person',
      name: 'TastyRecipes Chef',
    },
    datePublished: new Date(recipe.createdAt).toISOString(),
    description: recipe.summary || recipe.title,
    prepTime: parseDuration(recipe.prepTime),
    cookTime: parseDuration(recipe.cookTime),
    totalTime: parseDuration(recipe.totalTime),
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeIngredient: ingredientsArray,
    recipeInstructions: instructionsArray,
  };

  // Embed nutrition schema dynamically if present
  if (recipe.nutrition && (recipe.nutrition.calories || recipe.nutrition.protein || recipe.nutrition.carbohydrates || recipe.nutrition.fat)) {
    jsonLd.nutrition = {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} kcal` : undefined,
      proteinContent: recipe.nutrition.protein ? `${recipe.nutrition.protein} g` : undefined,
      carbohydrateContent: recipe.nutrition.carbohydrates ? `${recipe.nutrition.carbohydrates} g` : undefined,
      fatContent: recipe.nutrition.fat ? `${recipe.nutrition.fat} g` : undefined,
      fiberContent: recipe.nutrition.fiber ? `${recipe.nutrition.fiber} g` : undefined,
    };
  }

  return jsonLd;
}

export function generateFAQJsonLd(faqs: SchemaFAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbListJsonLd(categories: Category[], recipeSlug: string, recipeTitle: string) {
  const listItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
  ];

  if (categories && categories.length > 0) {
    listItems.push({
      '@type': 'ListItem',
      position: 2,
      name: categories[0].name,
      item: `${SITE_URL}/categories/${categories[0].slug}`,
    });
  }

  listItems.push({
    '@type': 'ListItem',
    position: listItems.length + 1,
    name: recipeTitle,
    item: `${SITE_URL}/recipes/${recipeSlug}`,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItems,
  };
}

function getPlainText(html: string): string {
  if (!html) return '';
  // 1. Try to parse as JSON (Tiptap format)
  try {
    const parsed = JSON.parse(html);
    if (parsed && typeof parsed === 'object') {
      const extractText = (node: any): string => {
        if (!node) return '';
        if (node.type === 'text') return node.text || '';
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join(' ');
        }
        return '';
      };
      return extractText(parsed);
    }
  } catch (e) {
    // Not JSON, continue to HTML regex replacement
  }

  // 2. Strip HTML tags
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseContentStats(html: string): { h2Count: number; h3Count: number; linkCount: number } {
  let h2Count = 0;
  let h3Count = 0;
  let linkCount = 0;

  if (!html) return { h2Count, h3Count, linkCount };

  // 1. Try to parse as JSON (Tiptap format)
  try {
    const parsed = JSON.parse(html);
    if (parsed && typeof parsed === 'object') {
      const traverse = (node: any) => {
        if (!node || typeof node !== 'object') return;
        
        if (node.type === 'heading') {
          const level = node.attrs?.level;
          if (level === 2) h2Count++;
          else if (level === 3) h3Count++;
        }
        
        if (node.marks && Array.isArray(node.marks)) {
          for (const mark of node.marks) {
            if (mark.type === 'link') {
              const href = mark.attrs?.href;
              if (href && (href.startsWith('/') || href.startsWith(SITE_URL) || href.includes('localhost'))) {
                linkCount++;
              }
            }
          }
        }
        
        if (Array.isArray(node.content)) {
          node.content.forEach(traverse);
        }
      };
      traverse(parsed);
      return { h2Count, h3Count, linkCount };
    }
  } catch (e) {
    // Not JSON, fallback to HTML regex matching
  }

  // 2. HTML regex matching
  h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  
  // Count internal links (href starting with / or matching SITE_URL)
  const aMatches = html.matchAll(/<a\s+[^>]*href=["']([^"']*)["']/gi);
  for (const match of aMatches) {
    const href = match[1];
    if (href && (href.startsWith('/') || href.startsWith(SITE_URL) || href.includes('localhost'))) {
      linkCount++;
    }
  }

  return { h2Count, h3Count, linkCount };
}

/**
 * 2. SEO Scoring Service
 */
export interface SeoAnalysisResult {
  score: number;
  checks: {
    title: { status: 'pass' | 'warning' | 'fail'; message: string; points: number };
    description: { status: 'pass' | 'warning' | 'fail'; message: string; points: number };
    keywordInTitle: { status: 'pass' | 'fail'; message: string; points: number };
    keywordInDescription: { status: 'pass' | 'fail'; message: string; points: number };
    keywordInSlug: { status: 'pass' | 'fail'; message: string; points: number };
    headings: { status: 'pass' | 'warning' | 'fail'; message: string; points: number };
    imagesAlt: { status: 'pass' | 'warning'; message: string; points: number };
    internalLinks: { status: 'pass' | 'warning'; message: string; points: number };
  };
}

export function analyzeRecipeSEO({
  title,
  seoTitle,
  metaDescription,
  focusKeyword,
  slug,
  contentHtml,
  hasAltText,
}: {
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  slug?: string;
  contentHtml?: string;
  hasAltText?: boolean;
}): SeoAnalysisResult {
  const activeTitle = seoTitle || title || '';
  const activeDesc = metaDescription || '';
  const keyword = focusKeyword?.toLowerCase().trim() || '';
  const activeSlug = slug || '';
  const html = contentHtml || '';

  const checks: any = {};
  let totalScore = 0;

  // Title length analysis
  const titleLen = activeTitle.length;
  if (titleLen >= 50 && titleLen <= 60) {
    checks.title = { status: 'pass', message: 'SEO Title length is ideal (50-60 characters).', points: 15 };
  } else if (titleLen > 0) {
    checks.title = { status: 'warning', message: 'SEO Title length is outside the sweet spot (50-60 chars).', points: 8 };
  } else {
    checks.title = { status: 'fail', message: 'SEO Title is missing.', points: 0 };
  }
  totalScore += checks.title.points;

  // Description length analysis
  const descLen = activeDesc.length;
  if (descLen >= 120 && descLen <= 160) {
    checks.description = { status: 'pass', message: 'Meta Description length is ideal (120-160 characters).', points: 15 };
  } else if (descLen > 0) {
    checks.description = { status: 'warning', message: 'Meta Description length is suboptimal (keep inside 120-160 chars).', points: 8 };
  } else {
    checks.description = { status: 'fail', message: 'Meta Description is missing.', points: 0 };
  }
  totalScore += checks.description.points;

  // Keyword checks
  if (keyword) {
    const inTitle = activeTitle.toLowerCase().includes(keyword);
    checks.keywordInTitle = inTitle
      ? { status: 'pass', message: 'Target keyword found in your SEO Title.', points: 15 }
      : { status: 'fail', message: 'Target keyword is missing from SEO Title.', points: 0 };

    const inDesc = activeDesc.toLowerCase().includes(keyword);
    checks.keywordInDescription = inDesc
      ? { status: 'pass', message: 'Target keyword found in your Meta Description.', points: 15 }
      : { status: 'fail', message: 'Target keyword is missing from Meta Description.', points: 0 };

    const inSlug = activeSlug.toLowerCase().includes(keyword.replace(/\s+/g, '-'));
    checks.keywordInSlug = inSlug
      ? { status: 'pass', message: 'Target keyword found in the URL slug.', points: 10 }
      : { status: 'fail', message: 'Target keyword is missing from the URL slug.', points: 0 };
  } else {
    checks.keywordInTitle = { status: 'fail', message: 'No target keyword configured.', points: 0 };
    checks.keywordInDescription = { status: 'fail', message: 'No target keyword configured.', points: 0 };
    checks.keywordInSlug = { status: 'fail', message: 'No target keyword configured.', points: 0 };
  }
  totalScore += checks.keywordInTitle.points + checks.keywordInDescription.points + checks.keywordInSlug.points;

  // Heading hierarchy and internal links analysis
  const { h2Count, h3Count, linkCount } = parseContentStats(html);

  if (h2Count > 0 || h3Count > 0) {
    checks.headings = { status: 'pass', message: `Great! Found heading tags (H2: ${h2Count}, H3: ${h3Count}) in content.`, points: 10 };
  } else {
    checks.headings = { status: 'warning', message: 'Add H2 or H3 headers to break up your recipe instructions.', points: 4 };
  }
  totalScore += checks.headings.points;

  // Alt tag analysis
  if (hasAltText) {
    checks.imagesAlt = { status: 'pass', message: 'Descriptive alt texts configured on recipe images.', points: 10 };
  } else {
    checks.imagesAlt = { status: 'warning', message: 'Some images are missing alt texts. Add descriptive labels to boost search images rank.', points: 5 };
  }
  totalScore += checks.imagesAlt.points;

  // Internal Links check
  if (linkCount > 0) {
    checks.internalLinks = { status: 'pass', message: `Good internal linking structure. Found ${linkCount} links.`, points: 10 };
  } else {
    checks.internalLinks = { status: 'warning', message: 'No internal links detected. Add links to related recipes.', points: 5 };
  }
  totalScore += checks.internalLinks.points;

  return {
    score: Math.min(totalScore, 100),
    checks,
  };
}

/**
 * 3. Readability Scoring Service
 */
export interface ReadabilityAnalysisResult {
  score: number;
  sentenceLengthScore: number;
  paragraphLengthScore: number;
  passiveVoiceScore: number;
  keywordDensityScore: number;
  keywordDensity: number;
  details: {
    avgSentenceWords: number;
    avgParagraphWords: number;
    passiveSentencesPercent: number;
  };
}

export function analyzeReadability(text: string, focusKeyword?: string): ReadabilityAnalysisResult {
  const cleanText = getPlainText(text);
  const words = cleanText.split(' ').filter(Boolean);
  const wordCount = words.length;

  if (wordCount < 10) {
    return {
      score: 50,
      sentenceLengthScore: 50,
      paragraphLengthScore: 50,
      passiveVoiceScore: 100,
      keywordDensityScore: 100,
      keywordDensity: 0,
      details: { avgSentenceWords: 0, avgParagraphWords: 0, passiveSentencesPercent: 0 },
    };
  }

  // Sentence analysis
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const totalSentences = sentences.length || 1;
  const avgSentenceWords = wordCount / totalSentences;
  
  // Sentence length score (ideal is 12-18 words per sentence)
  let sentenceLengthScore = 100;
  if (avgSentenceWords > 22) {
    sentenceLengthScore = Math.max(100 - (avgSentenceWords - 22) * 5, 40);
  }

  // Paragraph analysis
  const paragraphs = text.split(/<\/p>|<br\s*\/?>/).map(p => p.replace(/<[^>]*>/g, ' ').trim()).filter(Boolean);
  const totalParagraphs = paragraphs.length || 1;
  const avgParagraphWords = wordCount / totalParagraphs;
  
  // Paragraph length score (ideal is < 100 words)
  let paragraphLengthScore = 100;
  if (avgParagraphWords > 120) {
    paragraphLengthScore = Math.max(100 - (avgParagraphWords - 120) * 1.5, 40);
  }

  // Passive voice heuristics: search sentence matches for passive verbs (is cooked, were blended)
  const passiveVoicePattern = /\b(is|am|are|was|were|be|been|being)\s+([a-z]+ed|added|taken|stirred|poured|blended|baked|roasted|cooked|melted|served)\b/gi;
  const passiveMatches = cleanText.match(passiveVoicePattern) || [];
  const passiveSentencesPercent = (passiveMatches.length / totalSentences) * 100;

  // Passive voice score (should be < 10%)
  let passiveVoiceScore = 100;
  if (passiveSentencesPercent > 10) {
    passiveVoiceScore = Math.max(100 - (passiveSentencesPercent - 10) * 4, 30);
  }

  // Keyword density
  let keywordDensity = 0;
  let keywordDensityScore = 100;
  if (focusKeyword && wordCount > 0) {
    const kw = focusKeyword.toLowerCase().trim();
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    const matches = cleanText.match(regex) || [];
    keywordDensity = (matches.length / wordCount) * 100;

    // Ideal density is 1.0% to 2.5%
    if (keywordDensity < 1.0) {
      keywordDensityScore = Math.max(100 - (1.0 - keywordDensity) * 60, 40);
    } else if (keywordDensity > 2.5) {
      keywordDensityScore = Math.max(100 - (keywordDensity - 2.5) * 40, 40);
    }
  }

  // Final average readability score
  const score = Math.round(
    (sentenceLengthScore + paragraphLengthScore + passiveVoiceScore + keywordDensityScore) / 4
  );

  return {
    score,
    sentenceLengthScore,
    paragraphLengthScore,
    passiveVoiceScore,
    keywordDensityScore,
    keywordDensity,
    details: {
      avgSentenceWords: Math.round(avgSentenceWords * 10) / 10,
      avgParagraphWords: Math.round(avgParagraphWords),
      passiveSentencesPercent: Math.round(passiveSentencesPercent),
    },
  };
}

/**
 * 4. Internal Linking Suggestion Engine
 */
export interface LinkOpportunity {
  recipeId: number;
  title: string;
  url: string;
  reason: string;
  recommendedAnchor: string;
}

export function getInternalLinkingSuggestions(
  currentRecipeTitle: string,
  categories: Category[],
  allRecipes: Recipe[]
): LinkOpportunity[] {
  const suggestions: LinkOpportunity[] = [];
  const currentTitleLower = currentRecipeTitle.toLowerCase();

  // Find recipes sharing key words
  const wordsToMatch = ['chocolate', 'cookie', 'pasta', 'soup', 'salad', 'cake', 'chicken', 'sauce', 'vegan', 'gluten', 'healthy', 'pie', 'dessert'];
  const activeWord = wordsToMatch.find(w => currentTitleLower.includes(w));

  const candidates = allRecipes.filter(r => r.title !== currentRecipeTitle);

  // Score candidate recipes
  const scored = candidates.map(r => {
    let score = 0;
    const titleLower = r.title.toLowerCase();

    // 1. Shared category
    if (categories && categories.length > 0 && r.categories?.some(c => c.id === categories[0].id)) {
      score += 30;
    }

    // 2. Shared active semantic keyword
    if (activeWord && titleLower.includes(activeWord)) {
      score += 40;
    }

    return { recipe: r, score };
  });

  // Sort and pick top 3
  const topScored = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

  topScored.forEach(s => {
    suggestions.push({
      recipeId: s.recipe.id,
      title: s.recipe.title,
      url: `/recipes/${s.recipe.slug}`,
      reason: s.score >= 70 ? 'Shares semantic recipe topics and primary category.' : 'Belongs to same recipes group category.',
      recommendedAnchor: `If you enjoyed this, try our delicious [${s.recipe.title}] next!`,
    });
  });

  return suggestions;
}
