'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InstructionsEditor } from '../editor/InstructionsEditor';
import { useGetAdminCategoriesQuery } from '@/store/api/categoryApi';
import { useUploadImageMutation } from '@/store/api/recipeApi';
import { Recipe, RecipeIngredient } from '@/lib/types';
import { Loader2, Upload, Clock, Users, Trash2, GripVertical, ChevronDown, Award, MessageCircle, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

const ingredientRowSchema = z.object({
  name: z.string().min(1, 'Required'),
  quantity: z.string().min(1, 'Required'),
});

const recipeFormSchema = z.object({
  title: z.string().min(3, 'Title is required').max(255),
  summary: z.string().max(160).optional(),
  imageUrl: z.string().optional(),
  content: z.any(),
  categoryIds: z.array(z.number()).min(1, 'Select at least one category'),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.number().int().min(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  allowComments: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  ingredientsJson: z.array(ingredientRowSchema).default([]),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: RecipeFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({ initialData, onSubmit, isLoading }: RecipeFormProps) {
  const { data: categories } = useGetAdminCategoriesQuery();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      difficulty: initialData?.difficulty || undefined,
      allowComments: initialData?.allowComments ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      status: initialData?.status || 'PUBLISHED',
      ingredientsJson: Array.isArray(initialData?.ingredientsJson)
        ? initialData.ingredientsJson
        : (typeof initialData?.ingredientsJson === 'string'
          ? JSON.parse(initialData.ingredientsJson as string)
          : []) as RecipeIngredient[],
      seo: initialData?.seo || { title: '', description: '' },
    },
  });

  const selectedCategoryIds = watch('categoryIds') || [];
  const imageUrl = watch('imageUrl');
  const summary = watch('summary') || '';
  const allowComments = watch('allowComments');
  const isFeatured = watch('isFeatured');

  /* --- Ingredients (managed via react-hook-form array) --- */
  const ingredients = watch('ingredientsJson') || [];
  const nextId = useRef(1);

  // Seed initial ingredients if empty
  useEffect(() => {
    if (!initialData && ingredients.length === 0) {
      setValue('ingredientsJson', [
        { name: '', quantity: '' },
        { name: '', quantity: '' },
      ]);
    }
  }, [initialData, ingredients.length, setValue]);

  const addIngredient = () => {
    setValue('ingredientsJson', [...ingredients, { name: '', quantity: '' }]);
  };

  const removeIngredient = (index: number) => {
    const next = [...ingredients];
    next.splice(index, 1);
    setValue('ingredientsJson', next);
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
    const next = [...ingredients];
    next[index] = { ...next[index], [field]: value };
    setValue('ingredientsJson', next);
  };

  /* --- Image upload --- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const result = await uploadImage(formData).unwrap();
      setValue('imageUrl', result.imageUrl);
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
          toast.type === 'success'
            ? 'border-[#8cc63f]/30 bg-[#8cc63f]/10 text-[#8cc63f]'
            : 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 shrink-0 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e4e6eb]">Add New Recipe</h1>
          <p className="text-sm text-[#8b929d] mt-1">Create a delicious new recipe to share with your audience.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setValue('status', 'DRAFT'); handleSubmit(onFormSubmit)(); }}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#272a35] bg-transparent px-4 text-sm font-medium text-[#e4e6eb] transition-colors hover:bg-[#1a1d26] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => { setValue('status', 'PUBLISHED'); handleSubmit(onFormSubmit)(); }}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#f29e1f] px-5 text-sm font-medium text-[#0f1117] transition-colors hover:bg-[#f29e1f]/90 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ─── Left Column ─── */}
        <div className="space-y-6">
          {/* Recipe Title */}
          <div className="rounded-lg border border-[#272a35] bg-[#1a1d26] p-5 space-y-4">
            <label className="text-sm font-medium text-[#e4e6eb]">
              Recipe Title <span className="text-[#ef4444]">*</span>
            </label>
            <input
              {...register('title')}
              className="flex h-11 w-full rounded-lg border border-[#272a35] bg-[#141821] px-3.5 text-sm text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
              placeholder="Enter recipe title..."
            />
            {errors.title && <p className="text-xs text-[#ef4444]">{errors.title.message}</p>}
          </div>

          {/* Category */}
          <div className="rounded-lg border border-[#272a35] bg-[#1a1d26] p-5 space-y-4">
            <label className="text-sm font-medium text-[#e4e6eb]">
              Category <span className="text-[#ef4444]">*</span>
            </label>
            <div className="relative">
              <select
                className="flex h-11 w-full appearance-none rounded-lg border border-[#272a35] bg-[#141821] px-3.5 text-sm text-[#e4e6eb] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
                value={selectedCategoryIds[0] || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val) setValue('categoryIds', [val]);
                }}
              >
                <option value="" disabled className="text-[#8b929d]">Select a category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
            </div>
            {errors.categoryIds && <p className="text-xs text-[#ef4444]">{errors.categoryIds.message}</p>}
          </div>

          {/* Short Description */}
          <div className="rounded-lg border border-[#272a35] bg-[#1a1d26] p-5 space-y-4">
            <label className="text-sm font-medium text-[#e4e6eb]">
              Short Description <span className="text-[#ef4444]">*</span>
            </label>
            <textarea
              {...register('summary')}
              rows={4}
              maxLength={160}
              className="flex w-full resize-none rounded-lg border border-[#272a35] bg-[#141821] px-3.5 py-3 text-sm text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
              placeholder="A brief description of the recipe..."
            />
            <div className="text-right text-xs text-[#8b929d]">{summary.length}/160</div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-[#272a35] bg-[#1a1d26] p-5 space-y-4">
            <label className="text-sm font-medium text-[#e4e6eb]">
              Instructions <span className="text-[#ef4444]">*</span>
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
        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="rounded-lg border border-[#272a35] bg-[#1a1d26] p-5 space-y-4">
            <label className="text-sm font-medium text-[#e4e6eb]">Recipe Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#272a35] bg-[#141821] px-6 py-10 transition-colors hover:border-[#f29e1f]/30"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="h-full w-full rounded-md object-cover" />
              ) : isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[#8b929d]" />
              ) : (
                <>
                  <Upload className="h-10 w-10 text-[#8b929d] mb-3" />
                  <p className="text-sm text-[#8b929d]">Click to upload or drag and drop</p>
                  <p className="text-xs text-[#8b929d]/60 mt-1">PNG, JPG or up to 5MB</p>
                </>
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

          {/* Recipe Details */}
          <div className="rounded-lg border border-[#272a35] bg-[#1a1d26] p-5 space-y-4">
            <label className="text-sm font-medium text-[#e4e6eb]">Recipe Details</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-[#8b929d]">Prep Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
                  <input
                    {...register('prepTime')}
                    type="text"
                    placeholder="e.g. 15 min"
                    className="flex h-10 w-full rounded-lg border border-[#272a35] bg-[#141821] pl-9 pr-3 text-sm text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#8b929d]">Cook Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
                  <input
                    {...register('cookTime')}
                    type="text"
                    placeholder="e.g. 30 min"
                    className="flex h-10 w-full rounded-lg border border-[#272a35] bg-[#141821] pl-9 pr-3 text-sm text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#8b929d]">Servings</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
                  <input
                    {...register('servings', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    placeholder="e.g. 4"
                    className="flex h-10 w-full rounded-lg border border-[#272a35] bg-[#141821] pl-9 pr-3 text-sm text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#8b929d]">Difficulty</label>
                <div className="relative">
                  <select
                    {...register('difficulty')}
                    className="flex h-10 w-full appearance-none rounded-lg border border-[#272a35] bg-[#141821] px-3 text-sm text-[#8b929d] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
                    defaultValue=""
                  >
                    <option value="" disabled>Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="rounded-lg border border-[#272a35] bg-[#1a1d26] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#e4e6eb]">Ingredients</label>
              <button
                type="button"
                onClick={addIngredient}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#f29e1f] hover:text-[#f29e1f]/80 transition-colors"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-[#8b929d]/40 shrink-0" />
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="flex h-9 flex-1 rounded-lg border border-[#272a35] bg-[#141821] px-3 text-sm text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    className="flex h-9 w-[100px] rounded-lg border border-[#272a35] bg-[#141821] px-3 text-sm text-[#e4e6eb] placeholder:text-[#8b929d]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8b929d] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="rounded-lg border border-[#272a35] bg-[#1a1d26] p-5 space-y-4">
            <label className="text-sm font-medium text-[#e4e6eb]">Additional Options</label>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141821]">
                  <Award className="h-4 w-4 text-[#8b929d]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e4e6eb]">Featured Recipe</p>
                  <p className="text-xs text-[#8b929d]">Mark this recipe as featured</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValue('isFeatured', !isFeatured)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isFeatured ? 'bg-[#f29e1f]' : 'bg-[#272a35]'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                    isFeatured ? 'translate-x-[18px]' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141821]">
                  <MessageCircle className="h-4 w-4 text-[#8b929d]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e4e6eb]">Allow Comments</p>
                  <p className="text-xs text-[#8b929d]">Allow users to comment on this recipe</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValue('allowComments', !allowComments)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  allowComments ? 'bg-[#f29e1f]' : 'bg-[#272a35]'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                    allowComments ? 'translate-x-[18px]' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
