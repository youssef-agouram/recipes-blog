'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useGetAdminCategoriesQuery } from '@/store/api/categoryApi';
import { Recipe } from '@/lib/types';
import { Loader2, Save, X, Tags } from 'lucide-react';
import { useEffect } from 'react';

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().optional(),
  content: z.any(), // Tiptap JSON
  categoryIds: z.array(z.number()).min(1, 'Select at least one category'),
  ingredientIds: z.array(z.number()).optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: RecipeFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({ initialData, onSubmit, isLoading }: RecipeFormProps) {
  const { data: categories } = useGetAdminCategoriesQuery();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
      content: initialData?.content || { type: 'doc', content: [] },
      categoryIds: initialData?.categories.map((c) => c.id) || [],
      ingredientIds: initialData?.ingredients.map((i) => i.id) || [],
      seo: initialData?.seo || { title: '', description: '' },
    },
  });

  const selectedCategoryIds = watch('categoryIds') || [];

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.content || '<p>Start writing your recipe here...</p>',
    onUpdate: ({ editor }) => {
      setValue('content', editor.getJSON());
    },
  });

  // Sync editor content if initialData changes (e.g. on edit page load)
  useEffect(() => {
    if (initialData && editor) {
      editor.commands.setContent(initialData.content);
    }
  }, [initialData, editor]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipe Title</label>
            <input
              {...register('title')}
              className="flex h-12 w-full rounded-md border border-input bg-background px-4 text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. Classic Tomato Basil Pasta"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Summary / Excerpt</label>
            <textarea
              {...register('summary')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="A brief description of the recipe..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <div className="rounded-md border border-input bg-background overflow-hidden min-h-[400px]">
              <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 focus:outline-none min-h-[400px]" />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border/40 bg-card p-6 space-y-6 shadow-sm">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center"><Tags className="mr-2 h-4 w-4" /> Categories</h3>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                {categories?.map((cat) => (
                  <label key={cat.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      value={cat.id}
                      checked={selectedCategoryIds.includes(cat.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      onChange={(e) => {
                         const val = Number(e.target.value);
                         const current = selectedCategoryIds;
                         if (e.target.checked) {
                           setValue('categoryIds', [...current, val]);
                         } else {
                           setValue('categoryIds', current.filter(id => id !== val));
                         }
                      }}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
              {errors.categoryIds && <p className="text-xs text-destructive">{errors.categoryIds.message}</p>}
            </div>

            <div className="pt-6 border-t border-border/40 space-y-4">
              <h3 className="font-semibold">SEO Meta</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">SEO Title</label>
                  <input
                    {...register('seo.title')}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">SEO Description</label>
                  <textarea
                    {...register('seo.description')}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Recipe
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
