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
  
  // Use all: 'true' to ensure we can find drafts
  const { data, isLoading: isFetching } = useGetAdminRecipesQuery({ limit: 100, all: 'true' as any });
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();

  const recipe = data?.data.find((r) => r.id === id);

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
    <RecipeForm initialData={recipe} onSubmit={handleSubmit} isLoading={isUpdating} />
  );
}
