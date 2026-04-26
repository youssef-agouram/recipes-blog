'use client';

import { useGetAdminRecipesQuery, useDeleteRecipeMutation, useToggleFeaturedRecipeMutation } from '@/store/api/recipeApi';
import { Plus, Edit, Trash2, Loader2, ExternalLink, Star } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminRecipesPage() {
  const { data, isLoading } = useGetAdminRecipesQuery({ limit: 50 });
  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();
  const [toggleFeatured] = useToggleFeaturedRecipeMutation();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id).unwrap();
      } catch (err) {
        console.error('Failed to delete recipe:', err);
      }
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await toggleFeatured(id).unwrap();
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
          <p className="text-sm text-muted-foreground">Manage your content and recipes</p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New Recipe
        </Link>
      </div>

      <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/40">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Categories</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data?.data.map((recipe) => (
              <tr key={recipe.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="flex items-center space-x-2">
                    <span>{recipe.title}</span>
                    <Link href={`/recipes/${recipe.slug}`} target="_blank">
                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {recipe.categories.map((cat) => (
                      <span key={cat.id} className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {format(new Date(recipe.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    {/* ⭐ Featured toggle */}
                    <button
                      onClick={() => handleToggleFeatured(recipe.id)}
                      title={recipe.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
                        recipe.isFeatured
                          ? 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100'
                          : 'border-border/40 hover:bg-muted'
                      }`}
                    >
                      <Star
                        className={`h-4 w-4 transition-colors ${
                          recipe.isFeatured
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>

                    <Link
                      href={`/admin/recipes/edit/${recipe.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/40 hover:bg-muted transition-colors"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      disabled={isDeleting}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/40 hover:bg-destructive/10 hover:border-destructive/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data?.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic">
                  No recipes found. Create your first recipe!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
