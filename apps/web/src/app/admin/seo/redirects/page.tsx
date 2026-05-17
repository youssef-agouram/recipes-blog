'use client';

import { useState } from 'react';
import { 
  Shuffle, Loader2, Save, Trash2, Edit2, Plus, Check, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  useGetRedirectsQuery,
  useCreateRedirectMutation,
  useUpdateRedirectMutation,
  useDeleteRedirectMutation
} from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function RedirectsPage() {
  const { data: redirects, isLoading, refetch } = useGetRedirectsQuery();
  const [createRedirect] = useCreateRedirectMutation();
  const [updateRedirect] = useUpdateRedirectMutation();
  const [deleteRedirect] = useDeleteRedirectMutation();

  // Dialog and form states
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    sourceUrl: '',
    destUrl: '',
    type: '301',
    active: true
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRedirect({
        sourceUrl: formData.sourceUrl,
        destUrl: formData.destUrl,
        type: parseInt(formData.type),
        active: formData.active
      }).unwrap();
      toast.success('Redirect rule created successfully!');
      setShowAddForm(false);
      setFormData({ sourceUrl: '', destUrl: '', type: '301', active: true });
      refetch();
    } catch (err: any) {
      toast.error(err.data?.error || 'Failed to create redirect. Ensure source URL is unique.');
    }
  };

  const handleToggle = async (item: any) => {
    try {
      await updateRedirect({
        id: item.id,
        body: {
          ...item,
          active: !item.active
        }
      }).unwrap();
      toast.success('Redirect status toggled successfully.');
      refetch();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleSaveEdit = async (item: any) => {
    try {
      await updateRedirect({
        id: item.id,
        body: {
          sourceUrl: formData.sourceUrl,
          destUrl: formData.destUrl,
          type: parseInt(formData.type),
          active: formData.active
        }
      }).unwrap();
      toast.success('Redirect rule updated successfully!');
      setIsEditing(null);
      refetch();
    } catch {
      toast.error('Failed to update redirect rule.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this redirect rule?')) return;
    try {
      await deleteRedirect(id).unwrap();
      toast.success('Redirect rule deleted successfully.');
      refetch();
    } catch {
      toast.error('Failed to delete redirect rule.');
    }
  };

  const startEdit = (item: any) => {
    setIsEditing(item.id);
    setFormData({
      sourceUrl: item.sourceUrl,
      destUrl: item.destUrl,
      type: item.type.toString(),
      active: item.active
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Redirect Manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-indigo-400" />
            Redirects Rules Hub
          </h2>
          <p className="text-[11px] text-muted-foreground/60">Configure permanent (301) and temporary (302) HTTP redirects to preserve search engine page ratings.</p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setIsEditing(null);
            setFormData({ sourceUrl: '', destUrl: '', type: '301', active: true });
          }}
          className="h-11 px-6 inline-flex items-center justify-center gap-2 bg-[#5850ec] hover:bg-[#4a42df] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Redirect Rule
        </button>
      </div>

      {/* Insert Add Redirect Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-[#0b0c16]/90 border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6 animate-in slide-in-from-top duration-300">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#5850ec]" /> Add New Redirect Rule
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Source Path / URL</label>
              <input
                type="text"
                required
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                placeholder="/recipes/old-slug"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Destination Path / URL</label>
              <input
                type="text"
                required
                value={formData.destUrl}
                onChange={(e) => setFormData({ ...formData, destUrl: e.target.value })}
                placeholder="/recipes/new-slug"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">HTTP Redirect Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
              >
                <option value="301">301 - Permanent Move</option>
                <option value="302">302 - Temporary Move</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Save Redirect Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules list table */}
      <div className="bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full" />
        
        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="pb-3">Source URL Path</th>
                <th className="pb-3">Destination Path</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(redirects || []).map((item: any) => {
                const isItemEditing = isEditing === item.id;
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    {/* Source Path */}
                    <td className="py-4 font-mono text-[#a5b4fc] max-w-[240px] truncate">
                      {isItemEditing ? (
                        <input
                          type="text"
                          value={formData.sourceUrl}
                          onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white font-mono"
                        />
                      ) : (
                        item.sourceUrl
                      )}
                    </td>

                    {/* Destination Path */}
                    <td className="py-4 font-mono text-slate-300 max-w-[240px] truncate">
                      {isItemEditing ? (
                        <input
                          type="text"
                          value={formData.destUrl}
                          onChange={(e) => setFormData({ ...formData, destUrl: e.target.value })}
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white font-mono"
                        />
                      ) : (
                        item.destUrl
                      )}
                    </td>

                    {/* Redirect Type */}
                    <td className="py-4">
                      {isItemEditing ? (
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <option value="301">301</option>
                          <option value="302">302</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                          item.type === 301 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          HTTP {item.type}
                        </span>
                      )}
                    </td>

                    {/* Toggle Active status */}
                    <td className="py-4">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                          item.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-700/25 text-slate-500 border border-slate-700/35'
                        }`}
                      >
                        {item.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isItemEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(item)}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Save Changes"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setIsEditing(null)}
                              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 bg-white/5 hover:bg-white/10 text-indigo-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit Redirect"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Redirect"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!redirects || redirects.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                    No active redirect rules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
