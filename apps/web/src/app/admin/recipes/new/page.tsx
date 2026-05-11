'use client';

import { RecipeForm } from '@/components/admin/RecipeForm';
import { useCreateRecipeMutation } from '@/store/api/recipeApi';
import { useRouter } from 'next/navigation';

export default function NewRecipePage() {
  const router = useRouter();
  const [createRecipe, { isLoading }] = useCreateRecipeMutation();

  const handleSubmit = async (data: any) => {
    try {
      await createRecipe(data).unwrap();
      router.push('/admin/recipes');
    } catch (err: any) {
      const message = err?.data?.error || err?.message || 'Failed to create recipe. Please try again.';
      throw { ...err, message };
    }
  };

  return <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />;
}