'use client';

import { useCreateArticleMutation } from '@/store/api/articleApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save, ChevronLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewArticlePage() {
  const router = useRouter();
  const [createArticle, { isLoading }] = useCreateArticleMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    category: 'Nutrition'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArticle(formData).unwrap();
      router.push('/admin/articles');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/articles" className="p-2 text-[#8b929d] hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#e4e6eb]">New Article</h1>
          <p className="text-sm text-[#8b929d]">Share a new story or culinary guide.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-[#272a35] bg-[#1a1d26] p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">Title</label>
              <input 
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full h-11 rounded-lg border border-[#272a35] bg-[#141821] px-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50"
                placeholder="Article title..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full h-11 rounded-lg border border-[#272a35] bg-[#141821] px-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50"
              >
                <option>Nutrition</option>
                <option>Cooking Tips</option>
                <option>Lifestyle</option>
                <option>Ingredients</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">Summary</label>
            <textarea 
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              className="w-full rounded-lg border border-[#272a35] bg-[#141821] p-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50 resize-none"
              placeholder="Short description for the card..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">Image URL</label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
                <input 
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full h-11 rounded-lg border border-[#272a35] bg-[#141821] pl-10 pr-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">Content</label>
            <textarea 
              required
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full rounded-lg border border-[#272a35] bg-[#141821] p-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50 resize-none font-serif"
              placeholder="Write your article content here..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link 
            href="/admin/articles"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#272a35] px-8 text-sm font-bold text-[#8b929d] transition-colors hover:bg-white/5"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#f29e1f] px-10 text-sm font-bold text-[#0f1117] transition-all hover:bg-[#f29e1f]/90 disabled:opacity-50 shadow-[0_4px_12px_rgba(242,158,31,0.2)]"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Publish Article
          </button>
        </div>
      </form>
    </div>
  );
}
