'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InstructionsEditor } from '../editor/InstructionsEditor';
import { useGetAdminCategoriesQuery } from '@/store/api/categoryApi';
import { useUploadImageMutation } from '@/store/api/recipeApi';
import { Recipe, RecipeIngredient } from '@/lib/types';
import {
  Loader2, Upload, Clock, Users, Trash2, ChevronDown,
  CheckCircle, AlertCircle, X, Plus, ImagePlus,
  ArrowLeft, Eye, Save, Star, Calendar, Edit2, Lightbulb, Check, List, Play, Video, ExternalLink, Link, Apple
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
    title: z.string().optional(),
    description: z.string().optional(),
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
      seo: initialData?.seo || { title: '', description: '' },
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
    </form>
  );
}
