'use client';

import { RecipeForm } from '@/components/admin/RecipeForm';
import { useUpdateRecipeMutation, useGetRecipeByIdQuery } from '@/store/api/recipeApi';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  
  console.log('EditRecipePage params:', params, 'resolved id:', id);

  const { data: recipe, isLoading: isFetching, error } = useGetRecipeByIdQuery(id, { 
    skip: !id || isNaN(id) 
  });
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();

  useEffect(() => {
    if (error) {
      console.error('Error fetching recipe (detailed):', error, JSON.stringify(error), (error as any)?.status, (error as any)?.data);
    }
  }, [error]);

  const handleSubmit = async (formData: any) => {
    try {
      await updateRecipe({ id, body: formData }).unwrap();
      router.push('/admin/recipes');
    } catch (err: any) {
      console.error('Failed to update recipe:', err);
      const message = err?.data?.error || err?.message || 'Failed to update recipe. Please try again.';
      throw { ...err, message };
    }
  };

  if (isFetching || (!recipe && !error && id && !isNaN(id))) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe || error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Recipe not found</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {error ? 'Failed to load recipe details. Please verify your connection.' : 'No recipe exists with the given ID.'}
        </p>
        <Link href="/admin/recipes" className="text-primary hover:underline mt-4 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <RecipeForm initialData={recipe} onSubmit={handleSubmit} isLoading={isUpdating} />
  );
}
