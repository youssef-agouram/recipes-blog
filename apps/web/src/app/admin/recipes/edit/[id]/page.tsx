'use client';

import { RecipeForm } from '@/components/admin/RecipeForm';
import { useUpdateRecipeMutation, useGetAdminRecipesQuery } from '@/store/api/recipeApi';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  // Reuse the general recipes query for now, or add a getRecipeById if needed
  const { data, isLoading: isFetching } = useGetAdminRecipesQuery({ limit: 100 });
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();

  const recipe = data?.data.find((r) => r.id === id);

  const handleSubmit = async (formData: any) => {
    try {
      await updateRecipe({ id, body: formData }).unwrap();
      router.push('/admin/recipes');
    } catch (err) {
      console.error('Failed to update recipe:', err);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Recipe not found</h2>
        <Link href="/admin/recipes" className="text-primary hover:underline mt-4 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/recipes" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/40 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Recipe</h1>
            <p className="text-sm text-muted-foreground">Modify your recipe details</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <RecipeForm initialData={recipe} onSubmit={handleSubmit} isLoading={isUpdating} />
      </div>
    </div>
  );
}
