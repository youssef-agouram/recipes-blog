'use client';

import { useGetAdminRecipesQuery, useGetRecipeStatsQuery, useUpdateRecipeMutation, useCreateRecipeMutation, useDeleteRecipeMutation, useClearTrashRecipesMutation, useToggleFeaturedRecipeMutation } from '@/store/api/recipeApi';
import { 
  Plus, Edit2, Trash2, Loader2, Search, Bell, 
  Calendar, ChevronDown, Filter, Download, 
  MoreVertical, Copy, Eye, ArrowUpRight, ArrowDownRight,
  LayoutGrid, List, CheckCircle2, Clock, Ban,
  Crown, Star
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminRecipesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminRecipesQuery({ page, limit: 10, all: 'true' as any });
  const { data: statsData } = useGetRecipeStatsQuery();
  const [createRecipe] = useCreateRecipeMutation();
  const [updateRecipe] = useUpdateRecipeMutation();
  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();
  const [clearTrashRecipes, { isLoading: isClearing }] = useClearTrashRecipesMutation();
  const [toggleFeatured] = useToggleFeaturedRecipeMutation();

  const handleClearTrash = async () => {
    if (confirm('Are you sure you want to permanently delete all recipes in the trash? This action cannot be undone.')) {
      try {
        await clearTrashRecipes().unwrap();
      } catch (err) {
        console.error('Failed to clear trash:', err);
      }
    }
  };

  const handleMoveToTrash = async (id: number) => {
    if (confirm('Move this recipe to trash? It will no longer be visible on your site.')) {
      try {
        await updateRecipe({
          id,
          body: { status: 'TRASH' }
        }).unwrap();
      } catch (err) {
        console.error('Failed to move recipe to trash:', err);
      }
    }
  };

  const handleDuplicate = async (recipe: any) => {
    try {
      const baseTitle = `${recipe.title} (Copy)`;
      const finalTitle = baseTitle.length > 255 ? baseTitle.slice(0, 251) + '...' : baseTitle;

      const cleanedData = {
        title: finalTitle,
        summary: recipe.summary || '',
        imageUrl: recipe.imageUrl || '',
        images: Array.isArray(recipe.images) ? recipe.images : [],
        content: recipe.content || {},
        status: 'DRAFT' as any,
        prepTime: String(recipe.prepTime || ''),
        cookTime: String(recipe.cookTime || ''),
        servings: recipe.servings ? Number(recipe.servings) : undefined,
        difficulty: (['easy', 'medium', 'hard'].includes(recipe.difficulty?.toLowerCase()) 
          ? recipe.difficulty.toLowerCase() 
          : 'medium') as any,
        allowComments: Boolean(recipe.allowComments),
        isFeatured: Boolean(recipe.isFeatured),
        ingredientsJson: Array.isArray(recipe.ingredientsJson) ? recipe.ingredientsJson.map((ing: any) => ({
          name: String(ing.name || ''),
          quantity: String(ing.quantity || '')
        })) : [],
        categoryIds: recipe.categories?.map((c: any) => Number(c.id)) || [],
        ingredientIds: recipe.ingredients?.map((i: any) => Number(i.id)) || [],
        seo: recipe.seo ? {
          title: recipe.seo.title || '',
          description: recipe.seo.description || '',
        } : undefined
      };
      
      await createRecipe(cleanedData).unwrap();
    } catch (err) {
      console.error('Failed to duplicate recipe:', err);
    }
  };

  const handleToggleTopArticle = async (id: number, currentVal: boolean) => {
    try {
      await updateRecipe({
        id,
        body: { isTopArticle: !currentVal }
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle top article status:', err);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await toggleFeatured(id).unwrap();
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await updateRecipe({
        id,
        body: { status: currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading recipes...</p>
        </div>
      </div>
    );
  }

  const recipes = (data?.data || []).filter(r => r.status !== 'TRASH');
  const meta = data?.meta;

  return (
    <div className="space-y-8 pb-10">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-heading">Recipes</h1>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
            <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-white/40">Recipes</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden xl:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search recipes..." 
              className="h-11 w-64 rounded-xl border border-border bg-card pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <button className="h-11 w-11 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="relative">
            <button className="h-11 w-11 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-background text-[10px] font-black text-primary-foreground flex items-center justify-center">
              5
            </span>
          </div>
          <Link
            href="/admin/recipes/new"
            className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add New Recipe
          </Link>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Total Recipes', value: statsData?.total.toLocaleString() || '0', icon: LayoutGrid, color: 'primary' },
          { label: 'Published Recipes', value: statsData?.published.toLocaleString() || '0', icon: CheckCircle2, color: 'emerald' },
          { label: 'Draft Recipes', value: statsData?.draft.toLocaleString() || '0', icon: Clock, color: 'amber' },
          { label: 'Trash Recipes', value: statsData?.trash.toLocaleString() || '0', icon: Ban, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500`}>
                <stat.icon className="h-6 w-6" />
              </div>
              {stat.label === 'Trash Recipes' && Number(statsData?.trash) > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearTrash();
                  }}
                  disabled={isClearing}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" /> Clear Trash
                </button>
              )}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
            <p className="text-[10px] text-muted-foreground font-medium mt-2">Active in database</p>
          </div>
        ))}
      </div>

      {/* ─── Filters Bar ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { label: 'All Categories', options: [] },
            { label: 'All Status', options: [] },
            { label: 'All Difficulty', options: [] },
          ].map((filter, i) => (
            <div key={i} className="relative group">
              <button className="h-10 px-4 pr-10 rounded-xl border border-border bg-background text-xs font-bold flex items-center hover:bg-secondary transition-colors">
                {filter.label}
              </button>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
            </div>
          ))}
          <button className="h-10 px-4 rounded-xl border border-border bg-background text-xs font-bold flex items-center gap-2 hover:bg-secondary transition-colors">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="h-10 px-4 pr-10 rounded-xl border border-border bg-background text-xs font-bold flex items-center hover:bg-secondary transition-colors">
              Bulk Actions
            </button>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
          </div>
          <button className="h-10 px-4 rounded-xl border border-border bg-background text-xs font-bold flex items-center gap-2 hover:bg-secondary transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-[32px] border border-border bg-card shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="w-12 px-6 py-5">
                  <input type="checkbox" className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/20" />
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recipe</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Difficulty</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Views</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Date</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="group hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/20" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                        <img 
                          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100&q=80'} 
                          alt={recipe.title} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate max-w-[200px]">{recipe.title}</p>
                        <p className="text-[11px] font-medium text-muted-foreground truncate max-w-[240px]">
                          {recipe.summary || 'A rich and creamy recipe with special ingredients.'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full bg-${['emerald', 'amber', 'rose', 'indigo'][recipe.categories[0]?.id % 4 || 0]}-500`} />
                      <span className="text-xs font-bold text-white/90">{recipe.categories[0]?.name || 'Uncategorized'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      recipe.difficulty === 'easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      recipe.difficulty === 'hard' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {recipe.difficulty || 'Medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      recipe.status === 'PUBLISHED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {recipe.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      {recipe.views?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">{format(new Date(recipe.createdAt), 'MMM d, yyyy')}</p>
                      <p className="text-[10px] font-medium text-muted-foreground">{format(new Date(recipe.createdAt), 'hh:mm a')}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      {recipe.status === 'DRAFT' ? (
                        <button
                          onClick={() => handleToggleStatus(recipe.id, recipe.status)}
                          title="Publish Now"
                          className="h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase transition-all active:scale-95"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(recipe.id, recipe.status)}
                          title="Move to Draft"
                          className="h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase transition-all active:scale-95"
                        >
                          <Clock className="h-3 w-3" /> Draft
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleTopArticle(recipe.id, recipe.isTopArticle)}
                        title={recipe.isTopArticle ? "Remove from Top Articles" : "Set as Top Article"}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all active:scale-95 ${
                          recipe.isTopArticle 
                            ? 'bg-primary/20 border-primary/50 text-primary' 
                            : 'bg-background border-border text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <Crown className={`h-3.5 w-3.5 ${recipe.isTopArticle ? 'fill-primary' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(recipe.id)}
                        title={recipe.isFeatured ? "Remove from Featured" : "Set as Featured"}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all active:scale-95 ${
                          recipe.isFeatured 
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
                            : 'bg-background border-border text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 ${recipe.isFeatured ? 'fill-amber-500' : ''}`} />
                      </button>
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                        title="Preview Recipe"
                      >
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                      <Link
                        href={`/admin/recipes/edit/${recipe.id}`}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                        title="Edit Recipe"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                      <button 
                        onClick={() => handleDuplicate(recipe)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                        title="Duplicate Recipe"
                      >
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleMoveToTrash(recipe.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-rose-500/10 hover:border-rose-500/50 group/del transition-colors"
                        title="Move to Trash"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/del:text-rose-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* ─── Pagination ─── */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-border bg-secondary/10">
          <p className="text-xs font-bold text-muted-foreground">
            Showing <span className="text-white">{((page - 1) * 10) + 1} to {Math.min(page * 10, meta?.total || 0)}</span> of <span className="text-white">{meta?.total || 0}</span> recipes
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            {Array.from({ length: meta?.totalPages || 1 }, (_, i) => i + 1).map((n) => (
              <button 
                key={n} 
                onClick={() => setPage(n as number)}
                className={`h-9 w-9 flex items-center justify-center rounded-lg border text-xs font-black transition-all ${
                  n === page ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                }`}
              >
                {n}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(meta?.totalPages || 1, p + 1))}
              disabled={page === (meta?.totalPages || 1)}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
