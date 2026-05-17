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
  summary: z.string().max(160).optional().or(z.literal('')),
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
  instructions: z.array(instructionStepSchema).default([]),
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
  const [activeSeoTab, setActiveSeoTab] = useState<'basic' | 'scoring' | 'social' | 'linking' | 'faq'>('basic');
  const [socialPlatform, setSocialPlatform] = useState<'facebook' | 'twitter' | 'opengraph'>('opengraph');
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [faqsList, setFaqsList] = useState<{ question: string; answer: string }[]>([]);

  // AI SEO Assistant helpers
  const [generateAiMetadata, { isLoading: isGeneratingAi }] = useGenerateAiMetadataMutation();
  const [aiSuggestions, setAiSuggestions] = useState<{ action: string; output: string } | null>(null);

  const handleAiAction = async (action: string) => {
    if (!initialData?.id) return;
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
  const initialNutrition = initialData?.nutrition ? [
    { label: 'Calories', value: initialData.nutrition.calories || '', unit: 'kcal' },
    { label: 'Protein', value: initialData.nutrition.protein || '', unit: 'g' },
    { label: 'Carbs', value: initialData.nutrition.carbohydrates || '', unit: 'g' },
    { label: 'Fat', value: initialData.nutrition.fat || '', unit: 'g' },
    { label: 'Fiber', value: initialData.nutrition.fiber || '', unit: 'g' },
  ] : [
    { label: 'Calories', value: '', unit: 'kcal' },
    { label: 'Protein', value: '', unit: 'g' },
    { label: 'Carbs', value: '', unit: 'g' },
    { label: 'Fat', value: '', unit: 'g' },
    { label: 'Fiber', value: '', unit: 'g' },
  ];

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
      ingredientsJson: Array.isArray(initialData?.ingredientsJson)
        ? initialData.ingredientsJson
        : (typeof initialData?.ingredientsJson === 'string'
          ? JSON.parse(initialData.ingredientsJson as string)
          : []) as any,
      instructions: Array.isArray((initialData as any)?.instructions)
        ? (initialData as any).instructions
        : (typeof (initialData as any)?.instructions === 'string'
          ? JSON.parse((initialData as any).instructions)
          : []) as any,
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
  const nutritionList = watch('nutritionList') || [];

  const title = watch('title');
  const slug = watch('slug');
  const seo = watch('seo');

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Helper to generate a slug
  const generateSlugHelper = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-slug generation for NEW recipes
  useEffect(() => {
    if (!initialData && title && !isSlugManuallyEdited) {
      setValue('slug', generateSlugHelper(title));
    }
  }, [title, setValue, initialData, isSlugManuallyEdited]);

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
  const content = watch('content');
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

  /* --- Ingredients --- */
  const ingredients = watch('ingredientsJson') || [];
  useEffect(() => {
    if (!initialData && ingredients.length === 0) {
      setValue('ingredientsJson', [{ name: '', quantity: '', unit: '' }]);
    }
  }, [initialData, ingredients.length, setValue]);

  const addIngredient = () => setValue('ingredientsJson', [...ingredients, { name: '', quantity: '', unit: '' }]);
  const removeIngredient = (index: number) => {
    const next = [...ingredients];
    next.splice(index, 1);
    setValue('ingredientsJson', next);
  };
  const updateIngredient = (index: number, field: keyof any, value: string) => {
    const next = [...ingredients];
    next[index] = { ...next[index], [field]: value };
    setValue('ingredientsJson', next);
  };

  /* --- Instructions Steps --- */
  const instructionSteps = watch('instructions') || [];
  useEffect(() => {
    if (!initialData && instructionSteps.length === 0) {
      setValue('instructions', [{ text: '' }]);
    }
  }, [initialData, instructionSteps.length, setValue]);

  const addStep = () => setValue('instructions', [...instructionSteps, { text: '' }]);
  const removeStep = (index: number) => {
    const next = [...instructionSteps];
    next.splice(index, 1);
    setValue('instructions', next);
  };
  const updateStep = (index: number, value: string) => {
    const next = [...instructionSteps];
    next[index] = { text: value };
    setValue('instructions', next);
  };

  /* --- Nutrition --- */
  const addNutrition = () => setValue('nutritionList', [...nutritionList, { label: 'New', value: '', unit: 'g' }]);
  const removeNutrition = (index: number) => {
    const next = [...nutritionList];
    next.splice(index, 1);
    setValue('nutritionList', next);
  };
  const updateNutrition = (index: number, field: keyof any, value: string) => {
    const next = [...nutritionList];
    next[index] = { ...next[index], [field]: value };
    setValue('nutritionList', next);
  };

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
    // Convert nutritionList back to the format the backend expects
    const caloriesItem = data.nutritionList.find(n => n.label.toLowerCase() === 'calories');
    const proteinItem = data.nutritionList.find(n => n.label.toLowerCase() === 'protein');
    const carbsItem = data.nutritionList.find(n => n.label.toLowerCase() === 'carbs' || n.label.toLowerCase() === 'carbohydrates');
    const fatItem = data.nutritionList.find(n => n.label.toLowerCase() === 'fat');
    const fiberItem = data.nutritionList.find(n => n.label.toLowerCase() === 'fiber');

    const formattedData = {
      ...data,
      seo: {
        ...data.seo,
        title: data.seo?.seoTitle || data.seo?.title || '',
        description: data.seo?.metaDescription || data.seo?.description || '',
      },
      nutrition: {
        calories: caloriesItem?.value || '',
        protein: proteinItem?.value || '',
        carbohydrates: carbsItem?.value || '',
        fat: fatItem?.value || '',
        fiber: fiberItem?.value || '',
      }
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
            {imageUrl ? <img src={imageUrl} className="h-full w-full object-cover" /> : <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/30"><Upload className="h-7 w-7 text-primary" /><span className="text-[10px] font-bold uppercase text-muted-foreground">Upload Image</span></div>}
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
            {videoUrl ? (embedUrl ? <iframe src={embedUrl} className="w-full h-full pointer-events-none" /> : <video src={videoUrl} className="h-full w-full object-cover" />) : <div onClick={() => setShowVideoUrlInput(true)} className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/30"><Video className="h-7 w-7 text-primary" /><span className="text-[10px] font-bold uppercase text-muted-foreground">Insert Video</span></div>}
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
          <div className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-1.5"><List className="h-4 w-4 text-primary" /> Cooking Instructions (Optional)</label>
            <div className="space-y-3">
              {instructionSteps.map((step, index) => (
                <div key={index} className="flex gap-3 group">
                  <div className="flex-none h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">{index + 1}</div>
                  <div className="flex-1 relative">
                    <textarea value={step.text} onChange={(e) => updateStep(index, e.target.value)} placeholder={`Step ${index + 1}: Describe what to do...`} rows={2} className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" />
                    {instructionSteps.length > 1 && <button type="button" onClick={() => removeStep(index)} className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg"><X className="h-3 w-3" /></button>}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addStep} className="w-full py-3 rounded-xl border-2 border-dashed border-border bg-card/50 text-sm font-bold text-muted-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Add Next Step</button>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-amber-500" /> About Recipe</label>
            <Controller name="content" control={control} render={({ field }) => <InstructionsEditor initialContent={field.value} onChange={field.onChange} />} />
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          {/* Categories & Difficulty */}
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

          {/* Time & Servings */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase">Prep Time</label><input {...register('prepTime')} placeholder="20m" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold outline-none" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase">Cook Time</label><input {...register('cookTime')} placeholder="30m" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold outline-none" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase text-amber-500">Total Time</label><input {...register('totalTime')} placeholder="50m" className="w-full h-9 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 text-xs font-bold text-amber-500 outline-none" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase">Servings</label><input {...register('servings', { valueAsNumber: true })} type="number" placeholder="4" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold outline-none" /></div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <label className="text-sm font-semibold">Ingredients (Optional)</label>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <table className="w-full text-left">
                <tbody className="divide-y divide-border/50">
                  {ingredients.map((ing, index) => (
                    <tr key={index}>
                      <td className="p-2"><input type="text" placeholder="Name" value={ing.name} onChange={(e) => updateIngredient(index, 'name', e.target.value)} className="w-full h-8 px-2 bg-transparent outline-none text-[12px]" /></td>
                      <td className="p-2 w-12"><input type="text" placeholder="0" value={ing.quantity} onChange={(e) => updateIngredient(index, 'quantity', e.target.value)} className="w-full h-8 bg-transparent outline-none text-[12px] text-center" /></td>
                      <td className="p-2 w-16 text-center"><button type="button" onClick={() => removeIngredient(index)} className="text-muted-foreground hover:text-rose-500"><Trash2 className="h-3 w-3" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addIngredient} className="w-full py-2 flex items-center justify-center gap-2 text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors border-t border-dashed border-border"><Plus className="h-3 w-3" /> Add Ingredient</button>
            </div>
          </div>

          {/* Dynamic Nutrition */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Apple className="h-3 w-3 text-primary" /> Nutrition Info (Optional)</h3>
            <div className="space-y-3">
              {nutritionList.map((nut, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <input value={nut.label} onChange={(e) => updateNutrition(index, 'label', e.target.value)} className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight w-20 bg-transparent border-none outline-none focus:text-primary transition-colors" />
                  <div className="relative flex-1">
                    <input value={nut.value} onChange={(e) => updateNutrition(index, 'value', e.target.value)} placeholder="0" className="w-full h-8 rounded-lg border border-border bg-background px-3 pr-10 text-[10px] font-black text-right outline-none focus:border-primary/30 transition-all" />
                    <input value={nut.unit} onChange={(e) => updateNutrition(index, 'unit', e.target.value)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-muted-foreground uppercase w-8 bg-transparent border-none outline-none text-right" />
                  </div>
                  {index >= 5 && <button type="button" onClick={() => removeNutrition(index)} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-all"><Trash2 className="h-3 w-3" /></button>}
                </div>
              ))}
              <button type="button" onClick={addNutrition} className="w-full py-2 rounded-xl border-2 border-dashed border-border bg-secondary/20 text-[10px] font-bold text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"><Plus className="h-3 w-3" /> Add New Nutrition</button>
            </div>
          </div>

          {/* Publish Settings */}
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
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Slug (URL)</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center h-11 rounded-xl border border-border bg-background px-3 text-xs font-medium text-muted-foreground overflow-hidden">
                    <span className="opacity-50">/recipes/</span>
                    <input {...register('slug')} className="bg-transparent border-none outline-none text-foreground ml-0.5 w-full" placeholder="url-slug" />
                  </div>
                  <button type="button" className="h-11 w-11 flex items-center justify-center rounded-xl border border-border bg-background hover:bg-secondary"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search Engine Optimization (SEO) & Live Previews ─── */}
      <div className="p-8 rounded-3xl bg-card border border-border/80 relative overflow-hidden group shadow-2xl backdrop-blur-xl bg-gradient-to-br from-card to-background/40">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-indigo-500 to-primary/20 opacity-80" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
              <Globe className="h-5 w-5 text-primary animate-pulse" /> 
              Advanced Search Engine Optimization (SEO)
            </h2>
            <p className="text-xs font-semibold text-muted-foreground">
              Supercharge your recipe search discoverability using structured schemas, scores, and mockups.
            </p>
          </div>
          
          {/* Sub-Tabs Selector */}
          <div className="flex flex-wrap items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/40">
            <button
              type="button"
              onClick={() => setActiveSeoTab('basic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSeoTab === 'basic' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Basic Inputs
            </button>
            <button
              type="button"
              onClick={() => setActiveSeoTab('scoring')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSeoTab === 'scoring' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Real-Time Scoring
            </button>
            <button
              type="button"
              onClick={() => setActiveSeoTab('social')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSeoTab === 'social' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Social Previews
            </button>
            <button
              type="button"
              onClick={() => setActiveSeoTab('linking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSeoTab === 'linking' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Internal Linking
            </button>
            <button
              type="button"
              onClick={() => setActiveSeoTab('faq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSeoTab === 'faq' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
            >
              FAQ Schema
            </button>
          </div>
        </div>

        {/* ─── TAB: BASIC SEO INPUTS ─── */}
        {activeSeoTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              {/* AI SEO Assist Toolbar */}
              <div className="p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-[#0b0c16]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                    AI SEO Co-Pilot Actions
                  </h4>
                  {isGeneratingAi && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />}
                </div>

                {!initialData?.id ? (
                  <p className="text-[10px] font-semibold text-slate-400 leading-normal">
                    💡 Please save this recipe as a draft or publish it first to unlock the real-time AI metadata generators.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider">
                    <button
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={() => handleAiAction('title')}
                      className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      Generate title
                    </button>
                    <button
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={() => handleAiAction('meta')}
                      className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      Generate description
                    </button>
                    <button
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={() => handleAiAction('keywords')}
                      className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      Suggest keywords
                    </button>
                    <button
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={() => handleAiAction('readability')}
                      className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      Improve readability
                    </button>
                  </div>
                )}
              </div>

              {/* AI Generated Suggestions Banner */}
              {aiSuggestions && (
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3 relative">
                  <button 
                    type="button" 
                    onClick={() => setAiSuggestions(null)} 
                    className="absolute top-3 right-3 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400">
                    AI Suggested Output ({aiSuggestions.action})
                  </span>

                  <pre className="p-3.5 rounded-xl bg-black/40 text-[11px] font-semibold text-slate-200 font-mono whitespace-pre-wrap leading-relaxed border border-white/5">
                    {aiSuggestions.output}
                  </pre>

                  {/* Apply actions */}
                  {aiSuggestions.action !== 'readability' && (
                    <button
                      type="button"
                      onClick={() => {
                        // Apply first suggestion automatically
                        if (aiSuggestions.action === 'title') {
                          const suggestedTitle = aiSuggestions.output.split('\n')[0].replace(/\[Suggested SEO Title \d\]\s*/g, '');
                          setValue('seo.seoTitle', suggestedTitle);
                          showToast('success', 'Applied AI Title Suggestion!');
                        } else if (aiSuggestions.action === 'meta') {
                          setValue('seo.metaDescription', aiSuggestions.output);
                          showToast('success', 'Applied AI Meta Description!');
                        } else if (aiSuggestions.action === 'keywords') {
                          const firstKw = aiSuggestions.output.split(',')[0].trim();
                          setValue('seo.focusKeyword', firstKw);
                          showToast('success', 'Applied Focus Keyword suggestion!');
                        }
                        setAiSuggestions(null);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      Apply suggestion
                    </button>
                  )}
                </div>
              )}
              {/* Focus Keyword */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-primary" /> Focus Keyword
                </label>
                <input
                  {...register('seo.focusKeyword')}
                  placeholder="e.g. chocolate chip cookies"
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" /> Aligning with focus terms guarantees search crawl relevance.
                </p>
              </div>

              {/* SEO Title */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    SEO Title
                  </label>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${seo?.seoTitle && seo.seoTitle.length >= 50 && seo.seoTitle.length <= 60 ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {seo?.seoTitle?.length || 0} / 60 Chars
                  </span>
                </div>
                <input
                  {...register('seo.seoTitle')}
                  placeholder={title || 'Recipe SEO title...'}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                {/* Title progress bar */}
                <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${seo?.seoTitle && seo.seoTitle.length >= 50 && seo.seoTitle.length <= 60 ? 'bg-emerald-500' : 'bg-primary'}`} 
                    style={{ width: `${Math.min(((seo?.seoTitle?.length || 0) / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Meta Description
                  </label>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${seo?.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160 ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {seo?.metaDescription?.length || 0} / 160 Chars
                  </span>
                </div>
                <textarea
                  {...register('seo.metaDescription')}
                  placeholder="Provide a concise meta description summarizing the recipe details..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background p-4 text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none animate-none"
                />
                {/* Description progress bar */}
                <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${seo?.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160 ? 'bg-emerald-500' : 'bg-primary'}`} 
                    style={{ width: `${Math.min(((seo?.metaDescription?.length || 0) / 160) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Custom Slug Overwrite */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Recipe Slug
                  </label>
                  <input
                    {...register('slug')}
                    onChange={(e) => {
                      setIsSlugManuallyEdited(true);
                      setValue('slug', e.target.value);
                    }}
                    placeholder="recipe-slug-url"
                    className="w-full h-11 rounded-xl border border-border bg-background px-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* Robots Meta tag selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Robots Crawl Meta
                  </label>
                  <div className="relative">
                    <select
                      {...register('seo.robotsMeta')}
                      className="w-full h-11 appearance-none rounded-xl border border-border bg-background px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="index, follow">Index, Follow (Default)</option>
                      <option value="noindex, follow">Noindex, Follow</option>
                      <option value="index, nofollow">Index, Nofollow</option>
                      <option value="noindex, nofollow">Noindex, Nofollow</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live Google preview */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" /> Live Google Listing Preview
                </label>
                
                <div className="flex items-center gap-1.5 bg-background/60 border border-border/40 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1 rounded ${previewMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1 rounded ${previewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {previewMode === 'mobile' ? (
                /* Mobile Google snippet mockup */
                <div className="p-5 rounded-2xl bg-black/60 border border-border/80 flex flex-col space-y-2 shadow-2xl relative max-w-sm mx-auto">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold truncate">
                    <Globe className="h-3 w-3 shrink-0 text-emerald-400" />
                    <span>tastyrecipes.com</span>
                    <span>&rsaquo;</span>
                    <span className="text-zinc-500 truncate">recipes &rsaquo; {slug || 'chocolate-cookies'}</span>
                  </div>
                  <h3 className="text-base font-bold text-indigo-400 leading-tight hover:underline cursor-pointer">
                    {seo?.seoTitle || title || 'Please enter an SEO title...'}
                  </h3>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                    {seo?.metaDescription || 'Add a meta description to summarize your gourmet recipe steps here, making it look delicious in search engines!'}
                  </p>
                </div>
              ) : (
                /* Desktop Google snippet mockup */
                <div className="p-6 rounded-2xl bg-black/60 border border-border/80 flex flex-col space-y-2 shadow-2xl relative w-full">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <span className="truncate">https://tastyrecipes.com/recipes/{slug || 'chocolate-cookies'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-indigo-400 leading-snug hover:underline cursor-pointer">
                    {seo?.seoTitle || title || 'Please enter an SEO title...'}
                  </h3>
                  <p className="text-[12px] text-zinc-300 leading-relaxed font-normal">
                    {seo?.metaDescription || 'Add a meta description to summarize your gourmet recipe steps here, making it look delicious in search engines!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: REAL-TIME SCORING & AUDITS ─── */}
        {activeSeoTab === 'scoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 items-start">
            {/* Animated Score Circles side-by-side */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-black/40 border border-border/60 backdrop-blur-md relative group">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-muted/20" strokeWidth="6" stroke="currentColor" fill="transparent" r="30" cx="42" cy="42" />
                    <circle 
                      className="transition-all duration-1000 ease-out text-emerald-400" 
                      strokeWidth="6" 
                      strokeDasharray="188.4 188.4" 
                      style={{ strokeDashoffset: 188.4 - (seoAnalysis.score / 100) * 188.4 }} 
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="30" cx="42" cy="42" 
                    />
                  </svg>
                  <span className="absolute text-lg font-black text-foreground">{seoAnalysis.score}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-3">SEO Score</span>
              </div>

              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-black/40 border border-border/60 backdrop-blur-md relative group">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-muted/20" strokeWidth="6" stroke="currentColor" fill="transparent" r="30" cx="42" cy="42" />
                    <circle 
                      className="transition-all duration-1000 ease-out text-primary" 
                      strokeWidth="6" 
                      strokeDasharray="188.4 188.4" 
                      style={{ strokeDashoffset: 188.4 - (readabilityAnalysis.score / 100) * 188.4 }} 
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="30" cx="42" cy="42" 
                    />
                  </svg>
                  <span className="absolute text-lg font-black text-foreground">{readabilityAnalysis.score}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-3">Readability Score</span>
              </div>
            </div>

            {/* Checklist recommendations */}
            <div className="space-y-6 bg-black/35 p-6 rounded-2xl border border-border/60">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 animate-pulse" /> Gourmet SEO Recommendations Checklist
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(seoAnalysis.checks).map(([key, check]: any) => (
                    <div key={key} className="flex items-start gap-2 bg-background/40 p-3 rounded-xl border border-border/40">
                      {check.status === 'pass' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : check.status === 'warning' ? (
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide block text-zinc-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <p className="text-[10px] font-semibold text-muted-foreground leading-normal">{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/40 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Readability Metrics Overview</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-background/40 rounded-xl border border-border/40 text-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Avg Sentence</span>
                    <span className="text-sm font-black text-foreground">{readabilityAnalysis.details.avgSentenceWords} words</span>
                  </div>
                  <div className="p-3 bg-background/40 rounded-xl border border-border/40 text-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Avg Paragraph</span>
                    <span className="text-sm font-black text-foreground">{readabilityAnalysis.details.avgParagraphWords} words</span>
                  </div>
                  <div className="p-3 bg-background/40 rounded-xl border border-border/40 text-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Passive Voice</span>
                    <span className="text-sm font-black text-foreground">{readabilityAnalysis.details.passiveSentencesPercent}%</span>
                  </div>
                  <div className="p-3 bg-background/40 rounded-xl border border-border/40 text-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Keyword Density</span>
                    <span className="text-sm font-black text-foreground">{Math.round(readabilityAnalysis.keywordDensity * 100) / 100}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: SOCIAL PREVIEW SIMULATOR ─── */}
        {activeSeoTab === 'social' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Social Media Selector</label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSocialPlatform('opengraph')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${socialPlatform === 'opengraph' ? 'bg-primary border-primary text-primary-foreground' : 'border-border/60 text-muted-foreground hover:text-foreground'}`}
                >
                  Meta Tags Preview
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform('facebook')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${socialPlatform === 'facebook' ? 'bg-[#1877F2] border-[#1877F2] text-white shadow-lg' : 'border-border/60 text-muted-foreground hover:text-foreground'}`}
                >
                  Facebook Preview
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform('twitter')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${socialPlatform === 'twitter' ? 'bg-white border-white text-black shadow-lg' : 'border-border/60 text-muted-foreground hover:text-foreground'}`}
                >
                  Twitter / X Card
                </button>
              </div>

              {/* Dynamic open graph inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">OG Social Share Image URL</label>
                  <input
                    {...register('seo.ogImage')}
                    placeholder="Paste direct share image link..."
                    className="w-full h-11 rounded-xl border border-border bg-background px-4 text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Canonical URL Override</label>
                  <input
                    {...register('seo.canonicalUrl')}
                    placeholder="https://tastyrecipes.com/recipes/..."
                    className="w-full h-11 rounded-xl border border-border bg-background px-4 text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Previews containers */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary" /> Live Mockup Display
              </label>

              {socialPlatform === 'facebook' && (
                /* Simulated Facebook Card */
                <div className="rounded-xl overflow-hidden bg-[#242526] border border-[#3E4042] max-w-sm mx-auto shadow-2xl">
                  <div className="h-48 w-full bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                    {seo?.ogImage || imageUrl ? (
                      <img src={seo?.ogImage || imageUrl} alt="Facebook Shared Card" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="h-10 w-10 text-muted/30" />
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wider">TASTYRECIPES.COM</span>
                    <h4 className="text-sm font-bold text-white leading-snug">{seo?.seoTitle || title || 'Gourmet Culinary Recipe'}</h4>
                    <p className="text-[11px] text-[#E4E6EB] line-clamp-2 leading-relaxed">
                      {seo?.metaDescription || 'Click to view the ingredients, full video instructions, and details for this recipe.'}
                    </p>
                  </div>
                </div>
              )}

              {socialPlatform === 'twitter' && (
                /* Simulated Twitter Card */
                <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 max-w-sm mx-auto shadow-2xl">
                  <div className="h-44 w-full bg-zinc-900 relative flex items-center justify-center overflow-hidden">
                    {seo?.ogImage || imageUrl ? (
                      <img src={seo?.ogImage || imageUrl} alt="Twitter Shared Card" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="h-10 w-10 text-muted/30" />
                    )}
                  </div>
                  <div className="p-3 bg-zinc-950/80 border-t border-zinc-900 space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-500">tastyrecipes.com</span>
                    <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{seo?.seoTitle || title || 'Gourmet Culinary Recipe'}</h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 leading-normal">
                      {seo?.metaDescription || 'Click to view the ingredients, full video instructions, and details for this recipe.'}
                    </p>
                  </div>
                </div>
              )}

              {socialPlatform === 'opengraph' && (
                /* Standard OpenGraph metadata preview */
                <div className="p-5 rounded-2xl bg-black/40 border border-border/80 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest block">meta property="og:title"</span>
                    <span className="text-xs font-bold text-zinc-300 block bg-secondary/35 p-2 rounded-lg border border-border/40">{seo?.seoTitle || title || 'Not configured'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest block">meta property="og:description"</span>
                    <span className="text-xs font-bold text-zinc-300 block bg-secondary/35 p-2 rounded-lg border border-border/40">{seo?.metaDescription || 'Not configured'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest block">meta property="og:image"</span>
                    <span className="text-xs font-mono text-zinc-400 block truncate bg-secondary/35 p-2 rounded-lg border border-border/40">{seo?.ogImage || imageUrl || 'Not configured'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: INTERNAL LINKING OPPORTUNITIES ─── */}
        {activeSeoTab === 'linking' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Link className="h-4 w-4" /> Real-Time Internal Linking Suggestions
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase bg-secondary/35 px-2.5 py-1 rounded-full border border-border/40">
                Matches active database records
              </span>
            </div>

            {linkingSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {linkingSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-border/60 space-y-4 hover:border-indigo-500/40 transition-all group">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-indigo-400 block tracking-widest">Recommended Recipe</span>
                      <h4 className="text-sm font-bold text-zinc-200 group-hover:text-primary transition-colors">{suggestion.title}</h4>
                    </div>

                    <div className="p-3 bg-secondary/20 rounded-xl border border-border/40 space-y-1.5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Copy Link Anchor Text</span>
                      <p className="text-[11px] font-bold text-indigo-400 tracking-tight select-all leading-normal cursor-pointer bg-background/55 p-2 rounded-lg border border-border/30">
                        {suggestion.recommendedAnchor}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                      <span>Reason: {suggestion.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-black/20 text-muted-foreground">
                No linking opportunities detected yet. Add more recipes or assign a primary category to start!
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: FAQ STRUCTURED SCHEMA BUILDER ─── */}
        {activeSeoTab === 'faq' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* FAQ Manager inputs */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Structured FAQ List Builder</h3>
              
              <div className="space-y-4 bg-black/35 p-5 rounded-2xl border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question String</label>
                  <input
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="e.g. Can I substitute butter with coconut oil?"
                    className="w-full h-11 rounded-xl border border-border bg-background px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Answer String</label>
                  <textarea
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="e.g. Yes! Coconut oil is a 1:1 substitute for butter in this baking recipe..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background p-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none animate-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add FAQ Item
                </button>
              </div>
            </div>

            {/* Active FAQs list & JSON-LD preview */}
            <div className="space-y-6">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active FAQs ({faqsList.length})</label>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {faqsList.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-background/55 border border-border/40 rounded-xl flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 block">Q: {faq.question}</span>
                      <p className="text-[10px] font-semibold text-muted-foreground leading-normal">A: {faq.answer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFaqItem(idx)}
                      className="text-rose-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* JSON-LD Preview block */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Generated FAQ Schema.org JSON-LD</span>
                <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-emerald-400 overflow-x-auto max-h-[150px] leading-relaxed">
                  {JSON.stringify(generateFAQJsonLd(faqsList), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
