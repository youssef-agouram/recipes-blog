'use client';

import { RecipeForm } from '@/components/admin/RecipeForm';
import { useCreateRecipeMutation } from '@/store/api/recipeApi';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/recipes" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/40 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Recipe</h1>
            <p className="text-sm text-muted-foreground">Fill in the details to create a new masterpiece</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
