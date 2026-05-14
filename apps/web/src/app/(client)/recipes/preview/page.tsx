'use client';

import { useEffect, useState } from 'react';
import RecipeView from '@/components/recipes/RecipeView';
import { Loader2 } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { useGetAdminCategoriesQuery } from '@/store/api/categoryApi';

export default function RecipePreviewPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: categories } = useGetAdminCategoriesQuery();

  useEffect(() => {
    const previewData = sessionStorage.getItem('recipe-preview');
    if (previewData && categories) {
      try {
        const data = JSON.parse(previewData);

        // Map category IDs to full category objects
        const recipeCategories = categories.filter(c =>
          data.categoryIds?.includes(c.id)
        );

        // Map form data to Recipe type
        const mockRecipe: Recipe = {
          id: 0,
          title: data.title,
          summary: data.summary,
          imageUrl: data.imageUrl,
          content: data.content,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          servings: data.servings,
          difficulty: data.difficulty,
          isFeatured: data.isFeatured,
          status: data.status,
          ingredientsJson: data.ingredientsJson,
          images: data.images || [],
          slug: data.slug || 'preview',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          categories: recipeCategories as any,
          allowComments: data.allowComments,
          authorId: 0,
        };
        setRecipe(mockRecipe);
        setLoading(false);
      } catch (err) {
        console.error('Failed to parse preview data', err);
        setLoading(false);
      }
    } else if (!previewData) {
      setLoading(false);
    }
  }, [categories]);

  if (loading || (sessionStorage.getItem('recipe-preview') && !categories)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">No preview data found. Please go back to the editor and click Preview.</p>
      </div>
    );
  }

  return <RecipeView recipe={recipe} />;
}
