'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetAdminCategoriesQuery } from '@/store/api/categoryApi';
import { useGetCategoryGroupsQuery } from '@/store/api/categoryGroupApi';
import { useUploadImageMutation } from '@/store/api/recipeApi';
import { Category } from '@/lib/types';
import { 
  Loader2, Upload, ChevronDown, 
  CheckCircle, AlertCircle, X, 
  ArrowLeft, Save, Lightbulb, Check,
  Utensils, Coffee, Pizza, Sandwich, Cake, Leaf,
  Apple, Fish, Croissant, Carrot, Soup, CupSoda,
  Flame, Star, Heart, Clock, Tag, LayoutGrid, EyeOff,
  CookingPot, Salad, WheatOff, Timer
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(50),
  slug: z.string().min(2, 'Slug is required').max(50),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.number().nullable().optional(),
  groupId: z.number().nullable().optional(),
  status: z.enum(['PUBLISHED', 'HIDDEN']).default('PUBLISHED'),
  displayOnHome: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  menuOrder: z.number().int().default(0),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isLoading?: boolean;
}

const ICONS = [
  { id: 'Utensils', icon: Utensils },
  { id: 'Coffee', icon: Coffee },
  { id: 'Pizza', icon: Pizza },
  { id: 'Sandwich', icon: Sandwich },
  { id: 'Cake', icon: Cake },
  { id: 'Leaf', icon: Leaf },
  { id: 'Apple', icon: Apple },
  { id: 'Fish', icon: Fish },
  { id: 'Croissant', icon: Croissant },
  { id: 'Carrot', icon: Carrot },
  { id: 'Soup', icon: Soup },
  { id: 'CupSoda', icon: CupSoda },
  { id: 'Flame', icon: Flame },
  { id: 'Star', icon: Star },
  { id: 'Heart', icon: Heart },
  { id: 'Clock', icon: Clock },
  { id: 'Tag', icon: Tag },
  { id: 'LayoutGrid', icon: LayoutGrid },
  { id: 'CookingPot', icon: CookingPot },
  { id: 'Salad', icon: Salad },
  { id: 'WheatOff', icon: WheatOff },
  { id: 'Timer', icon: Timer },
];

export function CategoryForm({ initialData, onSubmit, isLoading }: CategoryFormProps) {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const isHydrating = useSelector((state: RootState) => state.auth.isHydrating);
  const { data: categories } = useGetAdminCategoriesQuery();
  const { data: groups } = useGetCategoryGroupsQuery();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
      icon: initialData?.icon || 'Utensils',
      parentId: initialData?.parentId || null,
      groupId: initialData?.groupId || null,
      status: initialData?.status || 'PUBLISHED',
      displayOnHome: initialData?.displayOnHome ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      menuOrder: initialData?.menuOrder || 0,
    },
  });

  const name = watch('name');
  const slug = watch('slug');
  const imageUrl = watch('imageUrl');
  const selectedIcon = watch('icon');
  const status = watch('status');
  const displayOnHome = watch('displayOnHome');
  const isFeatured = watch('isFeatured');

  // Auto-generate slug from name
  useEffect(() => {
    if (!initialData && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug);
    }
  }, [name, setValue, initialData]);

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
      const errorMessage = err?.data?.error || err?.message || 'Failed to upload image. Please try again.';
      showToast('error', errorMessage);
    }
  };

  const onFormSubmit = async (data: CategoryFormValues) => {
    try {
      await onSubmit(data);
      showToast('success', initialData ? 'Category updated successfully!' : 'Category created successfully!');
      router.push('/admin/categories');
    } catch (err: any) {
      const message = err?.data?.error || err?.message || 'Something went wrong. Please try again.';
      showToast('error', message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl backdrop-blur-md ${
            toast.type === 'success'
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
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <span>Categories</span>
            <ChevronDown className="h-3 w-3 -rotate-90" />
            <span>{initialData ? 'Edit Category' : 'Add New Category'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">{initialData ? 'Edit Category' : 'Add New Category'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/categories')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold transition-all hover:bg-secondary active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-95"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {initialData ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* ─── Left Column ─── */}
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-card border border-border/50 space-y-6">
            <div>
              <h2 className="text-lg font-bold">Category Information</h2>
              <p className="text-sm text-muted-foreground">Add a new recipe category to organize your recipes better.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('name')}
                  placeholder="Enter category name..."
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <p className="text-[11px] text-muted-foreground">This name will be displayed on your website.</p>
                {errors.name && <p className="text-xs text-rose-500 font-medium mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('slug')}
                  placeholder="enter-category-slug"
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <p className="text-[11px] text-muted-foreground">The "slug" is the URL-friendly version of the name. Usually, all lowercase and hyphenated.</p>
                {errors.slug && <p className="text-xs text-rose-500 font-medium mt-1">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  Parent Category
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 appearance-none rounded-xl border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={watch('parentId') || ''}
                    onChange={(e) => setValue('parentId', e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">None</option>
                    {categories?.filter(c => c.id !== initialData?.id).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground">Select a parent category to create a subcategory.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  Category Group
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 appearance-none rounded-xl border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={watch('groupId') || ''}
                    onChange={(e) => setValue('groupId', e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">None</option>
                    {groups?.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground">Organize categories into groups (e.g., Diet, Courses).</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Enter category description..."
                  className="w-full rounded-xl border border-border bg-background p-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
                <p className="text-[11px] text-muted-foreground">This description will be shown on the category page.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Category Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-[21/9] flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                    imageUrl 
                      ? 'border-border overflow-hidden' 
                      : 'border-border bg-background hover:border-primary/50 hover:bg-secondary/30'
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
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-bold">Drag & drop an image here or</p>
                      <div className="mt-2 text-primary text-xs font-bold">Choose Image</div>
                      <p className="text-[10px] text-muted-foreground mt-4 font-medium">Recommended size: 800x600px. JPG, PNG or WebP.</p>
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

              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold">Status</label>
                <div className="flex p-1.5 rounded-2xl bg-background border border-border w-fit gap-1">
                  <button
                    type="button"
                    onClick={() => setValue('status', 'PUBLISHED')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      status === 'PUBLISHED'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <CheckCircle className={`h-3.5 w-3.5 ${status === 'PUBLISHED' ? 'animate-bounce-short' : ''}`} />
                    Published
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('status', 'HIDDEN')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      status === 'HIDDEN'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <EyeOff className={`h-3.5 w-3.5 ${status === 'HIDDEN' ? 'animate-pulse' : ''}`} />
                    Hidden
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">Published categories are visible on your website, while Hidden ones are only visible in this dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-8">
          {/* Category Icon */}
          <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-6">
            <div>
              <h3 className="text-base font-bold">Category Icon</h3>
              <p className="text-xs text-muted-foreground">Choose an icon to represent this category.</p>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {ICONS.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue('icon', item.id)}
                    className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
                      selectedIcon === item.id
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                        : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
                    }`}
                  >
                    <IconComp className="h-5 w-5" />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-primary hover:bg-secondary transition-all"
            >
              Browse All Icons
            </button>
          </div>

          {/* Display Settings */}
          <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-6">
            <div>
              <h3 className="text-base font-bold">Display Settings</h3>
              <p className="text-xs text-muted-foreground">Configure how this category will be displayed.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Display in Homepage</p>
                  <p className="text-[11px] text-muted-foreground">Show this category in the homepage section.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('displayOnHome', !displayOnHome)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    displayOnHome ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <motion.span
                    animate={{ x: displayOnHome ? 22 : 4 }}
                    className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Featured Category</p>
                  <p className="text-[11px] text-muted-foreground">Mark as featured to highlight this category.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('isFeatured', !isFeatured)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isFeatured ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <motion.span
                    animate={{ x: isFeatured ? 22 : 4 }}
                    className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Menu Order</label>
                <input
                  type="number"
                  {...register('menuOrder', { valueAsNumber: true })}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <p className="text-[11px] text-muted-foreground">Set the display order of this category.</p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              <h3 className="text-sm font-bold">Tips</h3>
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Organize your categories logically to help users find recipes easily.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
