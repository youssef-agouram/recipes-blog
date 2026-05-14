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
  ArrowLeft, Eye, Save, Star, Calendar, Edit2, Lightbulb, Check
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const ingredientRowSchema = z.object({
  name: z.string().min(1, 'Required'),
  quantity: z.string().min(1, 'Required'),
  unit: z.string().optional(),
});

const recipeFormSchema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  summary: z.string().max(160).optional(),
  imageUrl: z.string().optional(),
  content: z.any(),
  categoryIds: z.array(z.number()).min(1, 'Select at least one category'),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
  servings: z.number().int().min(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  allowComments: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'TRASH']).default('PUBLISHED'),
  ingredientsJson: z.array(ingredientRowSchema).default([]),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  nutrition: z.object({
    calories: z.string().optional(),
    protein: z.string().optional(),
    carbohydrates: z.string().optional(),
    fat: z.string().optional(),
    fiber: z.string().optional(),
  }).optional(),
  images: z.array(z.string()).optional(),
  slug: z.string().optional(),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: RecipeFormValues) => Promise<void>;
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

  /* --- Toast notification state --- */
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }, []);

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
      seo: initialData?.seo || { title: '', description: '' },
      images: initialData?.images || [],
      slug: initialData?.slug || '',
    },
  });

  const selectedCategoryIds = watch('categoryIds') || [];
  const imageUrl = watch('imageUrl');
  const summary = watch('summary') || '';
  const title = watch('title') || '';
  const isFeatured = watch('isFeatured');
  const status = watch('status');
  const difficulty = watch('difficulty');
  const slug = watch('slug');
  const prepTime = watch('prepTime') || '';
  const cookTime = watch('cookTime') || '';

  // Auto-calculate total time based on prepTime and cookTime
  useEffect(() => {
    const extractMins = (val: string) => {
      const n = parseInt(val.replace(/[^0-9]/g, ''), 10);
      return isNaN(n) ? 0 : n;
    };
    
    if (prepTime || cookTime) {
      const total = extractMins(prepTime) + extractMins(cookTime);
      if (total > 0) {
        setValue('totalTime', `${total} mins`);
      }
    }
  }, [prepTime, cookTime, setValue]);

  /* --- Ingredients (managed via react-hook-form array) --- */
  const ingredients = watch('ingredientsJson') || [];

  // Seed initial ingredients if empty
  useEffect(() => {
    if (!initialData && ingredients.length === 0) {
      setValue('ingredientsJson', [
        { name: '', quantity: '', unit: '' },
      ]);
    }
  }, [initialData, ingredients.length, setValue]);

  const addIngredient = () => {
    setValue('ingredientsJson', [...ingredients, { name: '', quantity: '', unit: '' }]);
  };

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
      showToast('success', 'Image uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err?.data?.error || err?.message || 'Failed to upload image. Please try again.';
      const status = err?.status ? ` (${err.status})` : '';
      showToast('error', `${errorMessage}${status}`);
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
      console.error('Gallery upload error:', err);
      const errorMessage = err?.data?.error || err?.message || 'Failed to upload some images.';
      const status = err?.status ? ` (${err.status})` : '';
      showToast('error', `${errorMessage}${status}`);
    } finally {
      setIsUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    const next = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(next);
    setValue('images', next);
  };

  /* --- Form submission with error handling --- */
  const onFormSubmit = async (data: RecipeFormValues) => {
    try {
      await onSubmit(data);
      showToast('success', initialData ? 'Recipe updated successfully!' : 'Recipe created successfully!');
    } catch (err: any) {
      const message = err?.data?.error || err?.message || 'Something went wrong. Please try again.';
      showToast('error', message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl backdrop-blur-md ${toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
              }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 shrink-0 hover:opacity-70 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-border/50 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">{initialData ? 'Edit Recipe' : 'Add New Recipe'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const formData = watch();
              sessionStorage.setItem('recipe-preview', JSON.stringify(formData));
              window.open('/recipes/preview', '_blank');
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold transition-all hover:bg-secondary active:scale-95"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <div className="flex items-center">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-l-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Recipe
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-10 items-center justify-center rounded-r-xl bg-primary/90 border-l border-primary-foreground/10 text-primary-foreground hover:bg-primary transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* ─── Left Column ─── */}
        <div className="space-y-8">

          {/* Recipe Title & Summary */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Recipe Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('title')}
                  placeholder="Enter recipe title..."
                  className="w-full h-12 rounded-xl border border-border bg-card px-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <span className="absolute right-3 bottom-[-20px] text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {title.length} / 100
                </span>
              </div>
              {errors.title && <p className="text-xs text-rose-500 font-medium mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Short Description <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  {...register('summary')}
                  rows={4}
                  maxLength={160}
                  placeholder="Write a short description about this recipe..."
                  className="w-full rounded-xl border border-border bg-card p-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
                <span className="absolute right-3 bottom-[-20px] text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {summary.length} / 160
                </span>
              </div>
            </div>
          </div>

          {/* Category & Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Categories <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 appearance-none rounded-xl border border-border bg-card px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={selectedCategoryIds[0] || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val) setValue('categoryIds', [val]);
                  }}
                >
                  <option value="" disabled>Select categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.categoryIds && <p className="text-xs text-rose-500 font-medium">{errors.categoryIds.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Difficulty Level <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 h-12">
                {[
                  { value: 'easy', label: 'Easy', color: 'emerald' },
                  { value: 'medium', label: 'Medium', color: 'amber' },
                  { value: 'hard', label: 'Hard', color: 'rose' },
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setValue('difficulty', level.value as any)}
                    className={`flex-1 flex items-center justify-center gap-2 h-10 px-3 rounded-full border text-xs font-bold transition-all ${difficulty === level.value
                        ? `bg-${level.color}-500/10 border-${level.color}-500/50 text-${level.color}-400 ring-2 ring-${level.color}-500/20`
                        : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/50'
                      }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${difficulty === level.value ? `bg-${level.color}-400` : 'border border-muted-foreground'}`} />
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time & Servings Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Preparation Time
              </label>
              <input
                {...register('prepTime')}
                placeholder="e.g. 20 mins"
                className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Cooking Time
              </label>
              <input
                {...register('cookTime')}
                placeholder="e.g. 30 mins"
                className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Servings
              </label>
              <input
                {...register('servings', { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 4 people"
                className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                Total Time
              </label>
              <input
                {...register('totalTime')}
                placeholder="e.g. 50 mins"
                className="w-full h-11 rounded-xl border border-border bg-amber-500/5 px-4 text-sm font-bold text-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-amber-500/30"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isFeatured ? 'bg-primary/20 text-primary' : 'bg-card text-muted-foreground'}`}>
                <Star className={`h-5 w-5 ${isFeatured ? 'fill-current' : ''}`} />
              </div>
              <div>
                <p className="text-sm font-bold">Featured Recipe</p>
                <p className="text-xs text-muted-foreground font-medium">Mark this recipe as featured</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValue('isFeatured', !isFeatured)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFeatured ? 'bg-primary' : 'bg-border'
                }`}
            >
              <motion.span
                animate={{ x: isFeatured ? 22 : 4 }}
                className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>

          {/* Ingredients */}
          <div className="space-y-4 pt-4">
            <label className="text-sm font-semibold flex items-center gap-1.5">
              Ingredients <span className="text-rose-500">*</span>
            </label>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ingredient</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {ingredients.map((ing, index) => (
                    <tr key={index} className="group">
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="e.g. Olive Oil"
                          value={ing.name}
                          onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                          className="w-full h-10 px-3 bg-transparent border border-transparent group-hover:border-border/50 rounded-lg focus:bg-background focus:border-primary/30 outline-none transition-all text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="e.g. 2"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                          className="w-full h-10 px-3 bg-transparent border border-transparent group-hover:border-border/50 rounded-lg focus:bg-background focus:border-primary/30 outline-none transition-all text-sm"
                        />
                      </td>
                      <td className="p-2 w-32">
                        <div className="relative">
                          <select
                            value={ing.unit || ''}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                            className="w-full h-10 px-3 pr-8 appearance-none bg-transparent border border-transparent group-hover:border-border/50 rounded-lg focus:bg-background focus:border-primary/30 outline-none transition-all text-sm"
                          >
                            <option value="">e.g. tbsp</option>
                            <option value="tsp">tsp</option>
                            <option value="tbsp">tbsp</option>
                            <option value="cup">cup</option>
                            <option value="g">grams</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="l">liter</option>
                            <option value="piece">piece</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={addIngredient}
                className="w-full py-4 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 transition-colors border-t border-dashed border-border"
              >
                <Plus className="h-4 w-4" />
                Add Ingredient
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 pt-4">
            <label className="text-sm font-semibold flex items-center gap-1.5">
              Instructions <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <InstructionsEditor
                  initialContent={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-8">

          {/* Main Image Upload */}
          <div className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-1.5">
              Upload Main Image <span className="text-rose-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[16/10] flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${imageUrl
                  ? 'border-border overflow-hidden'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/30'
                }`}
            >
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold border border-white/30">
                      Change Image
                    </div>
                  </div>
                </>
              ) : isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-bold text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-bold">Drag & drop an image here</p>
                  <p className="text-xs text-muted-foreground my-1">or</p>
                  <div className="h-9 px-4 rounded-xl border border-border bg-background flex items-center justify-center text-xs font-bold transition-colors hover:bg-secondary">
                    Browse File
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4 font-medium">Recommended size: 1200x800px (16:9)</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-4">
            <label className="text-sm font-semibold">Images Gallery</label>
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                  <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {galleryImages.length < 8 && (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isUploadingGallery}
                  className="aspect-square rounded-xl border-2 border-dashed border-border bg-card flex items-center justify-center hover:border-primary/50 hover:bg-secondary/30 transition-all text-muted-foreground hover:text-primary"
                >
                  {isUploadingGallery ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </button>
              )}
              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleGalleryFileChange}
                className="hidden"
                accept="image/*"
                multiple
              />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              You can upload up to 8 images
            </p>
          </div>

          {/* Publish Settings */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Publish</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <select
                    {...register('status')}
                    className="w-full h-11 appearance-none rounded-xl border border-border bg-background pl-8 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Publish Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <div className="w-full h-11 flex items-center rounded-xl border border-border bg-background pl-10 pr-4 text-sm font-bold">
                    May 31, 2024 10:30 AM
                  </div>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Slug (URL)</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center h-11 rounded-xl border border-border bg-background px-3 text-xs font-medium text-muted-foreground overflow-hidden">
                    <span className="opacity-50">/recipes/</span>
                    <input
                      {...register('slug')}
                      className="bg-transparent border-none outline-none text-foreground ml-0.5 w-full"
                      placeholder="recipe-url-slug"
                    />
                  </div>
                  <button type="button" className="h-11 w-11 flex items-center justify-center rounded-xl border border-border bg-background hover:bg-secondary transition-colors">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nutrition Information</h3>
            <div className="space-y-4">
              {[
                { key: 'calories', label: 'Calories', unit: 'kcal', color: 'rose' },
                { key: 'protein', label: 'Protein', unit: 'g', color: 'blue' },
                { key: 'carbohydrates', label: 'Carbs', unit: 'g', color: 'amber' },
                { key: 'fat', label: 'Fat', unit: 'g', color: 'orange' },
                { key: 'fiber', label: 'Fiber', unit: 'g', color: 'emerald' },
              ].map(({ key, label, unit, color }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 bg-${color}-400`} />
                  <label className="text-xs font-semibold text-muted-foreground w-24 shrink-0">{label}</label>
                  <div className="relative flex-1">
                    <input
                      {...register(`nutrition.${key as keyof typeof register}` as const)}
                      placeholder="0"
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 pr-12 text-sm font-bold text-right focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Tips</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Use a clear and descriptive title.",
                "Add high quality images for better engagement.",
                "Write detailed instructions for best results.",
                "Featured recipes will be shown on the homepage."
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-2.5 w-2.5 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </form>
  );
}
