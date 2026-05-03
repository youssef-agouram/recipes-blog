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
    } catch (err) {
      console.error('Failed to create recipe:', err);
    }
  };

  return (
    <div className="max-w-[1200px]">
      <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
