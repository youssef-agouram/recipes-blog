'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  MessageSquare, CheckCircle, Clock, AlertTriangle, 
  Download, Settings, Search, Filter, 
  Eye, Edit2, Trash2, ChevronLeft, ChevronRight,
  ChevronDown, ExternalLink, Loader2, Check, X, ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useGetCommentsQuery, useUpdateCommentStatusMutation, useDeleteCommentMutation } from '@/store/api/commentApi';
import { toast } from 'sonner';

export default function AdminCommentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: comments = [], isLoading, refetch } = useGetCommentsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateCommentStatusMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredComments.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected comments?`)) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => deleteComment(id).unwrap()));
      toast.success('Selected comments deleted successfully');
      setSelectedIds([]);
    } catch (error) {
      toast.error('Failed to delete some comments');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const filteredComments = useMemo(() => {
    return comments.filter(c => 
      c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [comments, searchTerm]);

  // Synchronize selection with filtered comments using a guarded useEffect
  useEffect(() => {
    setSelectedIds(prev => {
      const filtered = prev.filter(id => filteredComments.some(c => c.id === id));
      const isSame = prev.length === filtered.length && prev.every((id, idx) => id === filtered[idx]);
      return isSame ? prev : filtered;
    });
  }, [filteredComments]);

  const stats = useMemo(() => {
    const total = comments.length;
    const approved = comments.filter(c => c.status === 'APPROVED').length;
    const pending = comments.filter(c => c.status === 'PENDING').length;
    const spam = comments.filter(c => c.status === 'SPAM').length;

    return [
      { label: 'Total Comments', value: total, sub: 'All comments received', icon: MessageSquare, color: 'bg-purple-500/10 text-purple-500' },
      { label: 'Approved', value: approved, sub: `${total ? ((approved/total)*100).toFixed(1) : 0}% of total`, icon: CheckCircle, color: 'bg-green-500/10 text-green-500' },
      { label: 'Pending', value: pending, sub: `${total ? ((pending/total)*100).toFixed(1) : 0}% of total`, icon: Clock, color: 'bg-orange-500/10 text-orange-500' },
      { label: 'Spam', value: spam, sub: `${total ? ((spam/total)*100).toFixed(1) : 0}% of total`, icon: AlertTriangle, color: 'bg-red-500/10 text-red-500' },
    ];
  }, [comments]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Comment ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error('Failed to update comment status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(id).unwrap();
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Comments Management</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-white transition-colors">Home</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60">Comments</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <Link 
            href="/admin/comments/settings"
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl hover:border-white/10 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-white group-hover:scale-110 transition-transform origin-right">
                {stat.value}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{stat.label}</h3>
            <p className="text-xs text-muted-foreground/60">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60">
              <Filter className="w-4 h-4" />
              <span>Filters:</span>
            </div>
            
            {selectedIds.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                disabled={isBulkDeleting}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
            
            <div className="flex-1 min-w-[200px] relative group ml-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search by comment text or user name..."
                className="bg-background border border-white/5 rounded-xl pl-11 pr-5 py-2.5 text-xs font-medium text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary w-full transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="w-12 px-6 py-5">
                  <input 
                    type="checkbox"
                    className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    checked={filteredComments.length > 0 && selectedIds.length === filteredComments.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Comment</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Recipe</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">User Details</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Status</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground italic text-sm">
                    No comments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <tr key={comment.id} className={`group hover:bg-white/[0.02] transition-colors ${selectedIds.includes(comment.id) ? 'bg-white/[0.01]' : ''}`}>
                    <td className="w-12 px-6 py-5">
                      <input 
                        type="checkbox"
                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        checked={selectedIds.includes(comment.id)}
                        onChange={() => handleSelectOne(comment.id)}
                      />
                    </td>
                    <td className="px-6 py-5 max-w-[300px]">
                      <div className="flex flex-col gap-2">
                        <p className="text-[13px] font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                          "{comment.text}"
                        </p>
                        {comment.rating && (
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= comment.rating! ? 'fill-primary text-primary' : 'text-white/10'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3 max-w-[250px]">
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          <Image 
                            src={comment.recipe?.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80'} 
                            alt={comment.recipe?.title || 'Recipe'} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-white/90 truncate group-hover:text-primary transition-colors">
                            {comment.recipe?.title || 'Unknown Recipe'}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 font-medium">
                            ID: {comment.recipeId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          <Image 
                            src={comment.user?.avatar || comment.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name || comment.name || 'U'}&background=random`} 
                            alt={comment.user?.name || comment.name || 'U'} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-white">{comment.user?.name || comment.name}</span>
                          <span className="text-[10px] font-medium text-muted-foreground/60 tracking-wider">
                            {comment.user ? 'Registered User' : 'Guest Comment'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        comment.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        comment.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {comment.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[12px] font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {comment.status !== 'APPROVED' && (
                          <button 
                            onClick={() => handleUpdateStatus(comment.id, 'APPROVED')}
                            className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" 
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {comment.status !== 'SPAM' && (
                          <button 
                            onClick={() => handleUpdateStatus(comment.id, 'SPAM')}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" 
                            title="Mark as Spam"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          className="p-2 bg-white/5 text-muted-foreground/40 hover:bg-red-500 hover:text-white rounded-lg transition-all" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  );
}
