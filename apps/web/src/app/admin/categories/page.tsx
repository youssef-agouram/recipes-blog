'use client';

import { 
  useGetAdminCategoriesQuery, 
  useCreateCategoryMutation, 
  useDeleteCategoryMutation 
} from '@/store/api/categoryApi';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useGetAdminCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [newName, setNewName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName }).unwrap();
      setNewName('');
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this category? Recipes using it will stay but lose this tag.')) {
      try {
        await deleteCategory(id).unwrap();
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">Organize your recipes into groups</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Create Form */}
        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm h-fit">
          <h3 className="font-semibold mb-4">Add New Category</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !newName.trim()}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/40">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {categories?.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{cat.name}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/40 hover:bg-destructive/10 hover:border-destructive/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories?.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-10 text-center text-muted-foreground italic">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
