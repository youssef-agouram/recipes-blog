'use client';

import { useGetArticlesQuery, useDeleteArticleMutation, useToggleTopArticleMutation } from '@/store/api/articleApi';
import { Plus, Search, MoreHorizontal, Edit, Trash2, ExternalLink, Crown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ArticlesPage() {
  const { data: articles, isLoading } = useGetArticlesQuery();
  const [search, setSearch] = useState('');

  const filteredArticles = articles?.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const [deleteArticle] = useDeleteArticleMutation();
  const [toggleTopArticle] = useToggleTopArticleMutation();

  const handleToggleTopArticle = async (id: number) => {
    try {
      await toggleTopArticle(id).unwrap();
    } catch (err) {
      console.error('Failed to toggle top article status:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id).unwrap();
      } catch (err) {
        console.error('Failed to delete article:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e4e6eb]">Articles</h1>
          <p className="text-sm text-[#8b929d] mt-1">Manage your blog posts and culinary stories.</p>
        </div>
        <Link 
          href="/admin/articles/new" 
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#f29e1f] px-4 text-sm font-bold text-[#0f1117] transition-colors hover:bg-[#f29e1f]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Link>
      </div>

      <div className="rounded-xl border border-[#272a35] bg-[#1a1d26] overflow-hidden">
        <div className="p-4 border-b border-[#272a35] flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
            <input 
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#272a35] bg-[#141821] pl-10 pr-4 text-sm text-[#e4e6eb] placeholder:text-[#8b929d] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#272a35] bg-[#141821]/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b929d]">Article</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b929d]">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b929d]">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-[#8b929d]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272a35]">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-[#8b929d]">Loading...</td></tr>
              ) : filteredArticles?.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-[#8b929d]">No articles found.</td></tr>
              ) : filteredArticles?.map((article) => (
                <tr key={article.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 rounded-md overflow-hidden bg-[#141821] border border-[#272a35] shrink-0">
                        {article.imageUrl && <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#e4e6eb] truncate">{article.title}</p>
                        <p className="text-xs text-[#8b929d] truncate">/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#141821] text-[#f29e1f] border border-[#f29e1f]/20">
                      {article.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#8b929d]">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button
                        onClick={() => handleToggleTopArticle(article.id)}
                        title={article.isTopArticle ? "Remove from Top Articles" : "Set as Top Article"}
                        className={`p-2 rounded-lg border transition-all active:scale-95 ${
                          article.isTopArticle 
                            ? 'bg-[#f29e1f]/20 border-[#f29e1f]/50 text-[#f29e1f]' 
                            : 'text-[#8b929d] hover:text-white'
                        }`}
                      >
                        <Crown className={`h-4 w-4 ${article.isTopArticle ? 'fill-[#f29e1f]' : ''}`} />
                      </button>
                      <Link href={`/blog/${article.slug}`} target="_blank" className="p-2 text-[#8b929d] hover:text-white transition-colors"><ExternalLink className="h-4 w-4" /></Link>
                      <button className="p-2 text-[#8b929d] hover:text-white transition-colors"><Edit className="h-4 w-4" /></button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-[#8b929d] hover:text-[#ef4444] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
