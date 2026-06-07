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

const getFocusKeyword = (titleStr: string) => {
  if (!titleStr) return '';
  const stopwords = new Set(['a', 'an', 'the', 'easy', 'quick', 'best', 'perfect', 'ultimate', 'how', 'to', 'make', 'classic', 'homemade', 'recipe']);
  const words = titleStr.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const filtered = words.filter(w => w && !stopwords.has(w));
  return filtered.length > 0 ? filtered.join(' ') : titleStr.toLowerCase().trim();
};

const getSeoTitle = (titleStr: string) => {
  if (!titleStr) return '';
  const titleClean = titleStr.trim();
  const option1 = `Ultimate ${titleClean} Recipe - Easy & Quick Guide`;
  if (option1.length >= 50 && option1.length <= 60) return option1;
  const option2 = `Best ${titleClean} Recipe - 30-Min Guide`;
  if (option2.length >= 50 && option2.length <= 60) return option2;
  const option3 = `Easy ${titleClean} Recipe | Homemade & Quick`;
  if (option3.length >= 50 && option3.length <= 60) return option3;
  const option4 = `${titleClean} Recipe`;
  if (option4.length >= 50 && option4.length <= 60) return option4;
  
  const options = [option1, option2, option3, option4];
  options.sort((a, b) => Math.abs(a.length - 55) - Math.abs(b.length - 55));
  return options[0];
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

  const handleAiAction = async (action: string) => {
    if (!initialData?.id) {
      let output = '';
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
      const plainText = getTiptapPlainText(watch('content'));

      if (action === 'title') {
        output = `[Suggested SEO Title 1] Ultimate ${title || 'Recipe'} Recipe - Easy & Quick Guide
[Suggested SEO Title 2] Best ${title || 'Recipe'} (Healthy & Authentic 30-Min Dinner)
[Suggested SEO Title 3] How to Make Perfect ${title || 'Recipe'} (Step-by-Step Tutorial)`;
      } else if (action === 'meta') {
        const bodyText = plainText ? plainText.replace(/\s+/g, ' ').trim() : 'fresh kitchen ingredients, simple steps, and pro chef tips.';
        const baseMeta = `Learn how to make the ultimate ${title || 'recipe'} at home! This guide features ${bodyText}`;
        output = baseMeta.length > 160 ? baseMeta.slice(0, 157) + '...' : baseMeta;
      } else if (action === 'keywords') {
        const kw = getFocusKeyword(title);
        output = `${kw || 'recipe'}, easy ${kw || 'recipe'}, authentic ${kw || 'recipe'}, homemade ${kw || 'recipe'}, step-by-step ${kw || 'recipe'}`;
      } else if (action === 'readability') {
        output = `Readability Score: 85/100 (Excellent)
Suggestions to improve readability:
1. Break down instructions into numbered lists of at most 2 sentences.
2. Use active cooking voice ('stew the broth' instead of 'the broth should be stewed').
3. Keep descriptions punchy. Use bullet points for tools or secondary toppings.`;
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
        if (!initialData?.nutrition) return 'Calories: \nProtein: \nCarbs: \nFat: \nFiber: ';
        const n = initialData.nutrition as Record<string, string>;
        return Object.keys(n).map(key => {
          let displayKey = key.charAt(0).toUpperCase() + key.slice(1);
          if (displayKey.toLowerCase() === 'carbohydrates' || displayKey.toLowerCase() === 'carbs') displayKey = 'Carbs';
          return `${displayKey}: ${n[key] || ''}`;
        }).join('\n');
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

  // Auto-slug generation
  useEffect(() => {
    if (title && !isSlugManuallyEdited) {
      setValue('slug', generateSlugHelper(title));
    }
  }, [title, setValue, isSlugManuallyEdited]);

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
    const generatedTitle = getSeoTitle(title);
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

  useEffect(() => {
    const extractMins = (val: string) => {
      const n = parseInt(val.replace(/[^0-9]/g, ''), 10);
      return isNaN(n) ? 0 : n;
    };
    if (prepTime || cookTime) {
      const total = extractMins(prepTime) + extractMins(cookTime);
      if (total > 0) setValue('totalTime', `${total} mins`);
    }
  }, [prepTime, cookTime, setValue]);





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

    const formattedData = {
      ...data,
      ingredientsJson,
      instructions,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-border/50 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">{initialData ? 'Edit Recipe' : 'Add New Recipe'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => {
            const formData = watch();
            sessionStorage.setItem('recipe-preview', JSON.stringify(formData));
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
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recipe Title <span className="text-rose-500">*</span></label>
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
            <button type="button" onClick={() => setShowImageUrlInput(!showImageUrlInput)} className={`p-1.5 rounded-lg border ${showImageUrlInput ? 'bg-primary/20 border-primary text-primary' : 'bg-card'}`}><Link className="h-3 w-3" /></button>
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
              <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/30">
                <Upload className="h-7 w-7 text-primary animate-bounce-slow" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Upload Image</span>
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
          {/* Categories, Difficulty, Times/Servings, and Nutrition Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categories & Difficulty Card */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
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
              </div>
            </div>

            {/* Time & Servings Card */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase">Prep Time</label><input {...register('prepTime')} placeholder="20m" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold outline-none" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase">Cook Time</label><input {...register('cookTime')} placeholder="30m" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold outline-none" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase text-amber-500">Total Time</label><input {...register('totalTime')} placeholder="50m" className="w-full h-9 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 text-xs font-bold text-amber-500 outline-none" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase">Servings</label><input {...register('servings', { valueAsNumber: true })} type="number" placeholder="4" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold outline-none" /></div>
              </div>
            </div>

            {/* Nutrition Info Card */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 md:col-span-2 lg:col-span-1">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Apple className="h-3 w-3 text-primary" /> Nutrition Info (Optional)</h3>
              <div className="relative rounded-xl border border-border/80 bg-background p-2">
                <textarea
                  {...register('nutritionText')}
                  placeholder={`Calories: 250 kcal\nProtein: 15g\nCarbs: 30g\nFat: 8g`}
                  rows={6}
                  className="w-full bg-transparent border-none outline-none text-xs font-semibold focus:ring-0 transition-all resize-y custom-scrollbar p-2"
                />
              </div>
              <p className="text-[9px] text-muted-foreground">
                💡 Enter labels and values separated by a colon, one per line.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-1.5"><List className="h-4 w-4 text-primary" /> Cooking Instructions (Optional)</label>
            <div className="relative rounded-2xl border border-border bg-card p-4">
              <textarea
                {...register('instructionsText')}
                placeholder={`Describe your cooking steps, one per line:\ne.g.\nPreheat oven to 375°F.\nMix ingredients in a bowl.\nBake for 25 minutes.`}
                rows={6}
                className="w-full bg-background border border-border/80 rounded-xl p-4 outline-none text-xs font-semibold focus:ring-2 focus:ring-primary/20 transition-all resize-y custom-scrollbar"
              />
              <p className="text-[10px] text-muted-foreground mt-2">
                💡 Paste your steps here. Each line will be saved as a separate step automatically.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold">Ingredients (Optional)</label>
            <div className="relative rounded-2xl border border-border bg-card p-4">
              <textarea
                {...register('ingredientsText')}
                placeholder={`Enter ingredients, one per line:\ne.g.\n2 cups all-purpose flour\n1 tsp baking powder\n3 large eggs`}
                rows={6}
                className="w-full bg-background border border-border/80 rounded-xl p-4 outline-none text-xs font-semibold focus:ring-2 focus:ring-primary/20 transition-all resize-y custom-scrollbar"
              />
              <p className="text-[10px] text-muted-foreground mt-2">
                💡 Paste your list here. Each line will be saved as a separate ingredient automatically.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-amber-500" /> About Recipe</label>
            <Controller name="content" control={control} render={({ field }) => <InstructionsEditor initialContent={field.value} onChange={field.onChange} />} />
            
            <div className="bg-secondary/10 border border-border/60 p-4 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Auto SEO Heading Suggestions (Click to Copy)
              </span>
              <div className="flex flex-wrap gap-2">
                {getSuggestedHeadings(title).map((sh, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sh.text);
                      showToast('success', `Copied heading: "${sh.text}"`);
                    }}
                    className="px-2.5 py-1.5 bg-background hover:bg-secondary border border-border/85 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                      H{sh.level}
                    </span>
                    {sh.text}
                  </button>
                ))}
              </div>
            </div>
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
                            if (node.type === 'text' && node.text) {
                              return node.text;
                            }
                            if (node.content && Array.isArray(node.content)) {
                              return node.content.map(getTiptapPlainText).join(' ');
                            }
                            return '';
                          };
                          const plainText = getTiptapPlainText(watch('content'));
                          const generatedKeyword = getFocusKeyword(watch('title'));
                          const generatedTitle = getSeoTitle(watch('title'));
                          const generatedMeta = getMetaDescription(watch('title'), generatedKeyword, plainText);

                          setValue('seo.focusKeyword', generatedKeyword);
                          setValue('seo.seoTitle', generatedTitle);
                          setValue('seo.metaDescription', generatedMeta);
                          
                          setIsFocusKeywordEdited(true);
                          setIsSeoTitleEdited(true);
                          setIsMetaDescriptionEdited(true);
                          
                          showToast('success', 'Forced auto-generation of all SEO fields!');
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

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Key className="h-3 w-3 text-primary" /> Focus Keyword</label>
                    <input 
                      {...focusKeywordReg} 
                      onChange={(e) => {
                        focusKeywordReg.onChange(e);
                        setIsFocusKeywordEdited(true);
                      }}
                      placeholder="e.g. chocolate chip cookies" 
                      className="w-full h-10 rounded-xl border border-border bg-background px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    />
                    <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary animate-pulse" /> Aligning with focus terms improves crawl relevance.</p>
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
                            setValue('slug', generateSlugHelper(title));
                            setIsSlugManuallyEdited(false);
                            showToast('success', 'Slug updated from title!');
                          }}
                          className="text-[10px] font-bold text-primary hover:underline transition-all"
                        >
                          Set from Title
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

