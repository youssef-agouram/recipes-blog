'use client';

import { 
  useGetAdminCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation,
  useDeleteCategoryMutation 
} from '@/store/api/categoryApi';
import {
  useGetCategoryGroupsQuery,
  useCreateCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
  useDeleteCategoryGroupMutation
} from '@/store/api/categoryGroupApi';
import { 
  Plus, Trash2, Loader2, Search, Filter, 
  GripVertical, Edit2, LayoutGrid, CheckCircle2, 
  EyeOff, Folder, Lightbulb, ChevronDown 
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { data: categories, isLoading } = useGetAdminCategoriesQuery();
  const { data: groups, isLoading: isLoadingGroups } = useGetCategoryGroupsQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  
  const [createGroup] = useCreateCategoryGroupMutation();
  const [updateGroup] = useUpdateCategoryGroupMutation();
  const [deleteGroup] = useDeleteCategoryGroupMutation();

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{ id: number; name: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');


  const handleDelete = async (id: number) => {
    if (confirm('Delete this category? Recipes using it will stay but lose this tag.')) {
      try {
        await deleteCategory(id).unwrap();
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await updateCategory({
        id,
        status: currentStatus === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED'
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (confirm('Delete this group? Categories in it will remain but become ungrouped.')) {
      try {
        await deleteGroup(id).unwrap();
        if (selectedGroupId === id) setSelectedGroupId('all');
      } catch (err) {
        console.error('Failed to delete group:', err);
      }
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await createGroup({ name: newGroupName }).unwrap();
      setNewGroupName('');
      setIsAddGroupModalOpen(false);
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editingGroup.name.trim()) return;
    try {
      await updateGroup({ id: editingGroup.id, name: editingGroup.name }).unwrap();
      setEditingGroup(null);
      setIsEditGroupModalOpen(false);
    } catch (err) {
      console.error('Failed to update group:', err);
    }
  };

  const filteredCategories = categories?.filter(cat => {
    if (selectedGroupId === 'all') return true;
    return cat.groupId === selectedGroupId;
  });

  if (isLoading || isLoadingGroups) {
// ... (rest of loading state)
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Categories', value: categories?.length || 0, icon: LayoutGrid, color: 'primary', desc: 'All recipe categories' },
    { label: 'Published', value: categories?.filter(c => c.status === 'PUBLISHED').length || 0, icon: CheckCircle2, color: 'emerald', desc: 'Visible on website' },
    { label: 'Hidden', value: categories?.filter(c => c.status === 'HIDDEN').length || 0, icon: EyeOff, color: 'amber', desc: 'Not visible on website' },
    { label: 'Total Groups', value: groups?.length || 0, icon: Folder, color: 'indigo', desc: 'Organizational groups' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-heading">Categories</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Organize and manage recipe categories.</p>
        </div>
        <button
          onClick={() => router.push('/admin/categories/new')}
          className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add New Category
        </button>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-5">
            <div className={`h-14 w-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 shrink-0`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{stat.label}</p>
              <h3 className="text-2xl font-black text-white">{stat.value}</h3>
              <p className="text-[10px] text-muted-foreground font-medium">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* ─── Left Column ─── */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Category Groups</h3>
              <button 
                onClick={() => setIsAddGroupModalOpen(true)}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-6">Organize categories into groups for better management.</p>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedGroupId('all')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                  selectedGroupId === 'all'
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-white'
                }`}
              >
                All Categories
                <span className={`px-2 py-0.5 rounded-lg text-[10px] ${selectedGroupId === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {categories?.length || 0}
                </span>
              </button>
              
              {groups?.map((group) => (
                <div key={group.id} className="relative group/group-item">
                  <button
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                      selectedGroupId === group.id
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-white'
                    }`}
                  >
                    <span className="truncate mr-8">{group.name}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] ${selectedGroupId === group.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                      {group._count?.categories || 0}
                    </span>
                  </button>
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/group-item:opacity-100 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGroup({ id: group.id, name: group.name });
                        setIsEditGroupModalOpen(true);
                      }}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title="Edit Group"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      title="Delete Group"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Tip</p>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">Drag and drop categories to reorder them.</p>
            </div>
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-white font-heading">All Categories</h3>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="h-10 px-4 pr-10 rounded-xl border border-border bg-card text-xs font-bold flex items-center hover:bg-secondary transition-colors">
                  Bulk Actions
                </button>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
              </div>
              <button className="h-10 px-5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95">
                Apply
              </button>
              <div className="h-10 w-px bg-border mx-1" />
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search categories..." 
                  className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <button className="h-10 px-4 rounded-xl border border-border bg-card text-xs font-bold flex items-center gap-2 hover:bg-secondary transition-colors">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-card shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="w-12 px-6 py-5">
                      <input type="checkbox" className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/20" />
                    </th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Recipes</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredCategories?.map((cat, i) => (
                    <tr key={cat.id} className="group hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-move" />
                          <input type="checkbox" className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/20" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center p-1.5">
                            <img 
                              src={`https://images.unsplash.com/photo-${[
                                '1495147466023-ac5c588e2e94', '1546069901-ba9599a7e63c', '1473093226795-af9932fe5856', 
                                '1551024506-0bccd828d307', '1512621776951-a57141f2eefd'
                              ][i % 5]}?auto=format&fit=crop&w=100&q=80`} 
                              className="h-full w-full object-cover rounded-lg"
                            />
                          </div>
                          <span className="text-sm font-black text-white">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-muted-foreground truncate max-w-[300px]">
                          {cat.description || "No description provided for this category."}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-white">{cat._count?.recipes || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(cat.id, cat.status)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
                            cat.status === 'PUBLISHED' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          {cat.status === 'PUBLISHED' ? 'Published' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => router.push(`/admin/categories/${cat.id}`)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-rose-500/10 hover:border-rose-500/50 group/del transition-colors"
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
                Showing <span className="text-white">1 to {categories?.length || 0}</span> of <span className="text-white">{categories?.length || 0}</span> categories
              </p>
              <div className="flex items-center gap-2">
                <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary transition-colors cursor-not-allowed disabled:opacity-50">
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
                <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-primary bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20">1</button>
                <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary text-xs font-black">2</button>
                <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary text-xs font-black">3</button>
                <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary transition-colors">
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Add Group Modal ─── */}
      <AnimatePresence>
        {isAddGroupModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md p-8 rounded-[32px] bg-card border border-border shadow-2xl"
            >
              <h2 className="text-2xl font-black text-white mb-2 font-heading">Add New Group</h2>
              <p className="text-sm text-muted-foreground mb-8">Create a new organizational group for categories.</p>
              
              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Group Name</label>
                  <input
                    autoFocus
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Courses, Diet, Season"
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddGroupModalOpen(false)}
                    className="flex-1 h-12 rounded-xl border border-border bg-background text-sm font-bold hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newGroupName.trim()}
                    className="flex-1 h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ─── Edit Group Modal ─── */}
      <AnimatePresence>
        {isEditGroupModalOpen && editingGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md p-8 rounded-[32px] bg-card border border-border shadow-2xl"
            >
              <h2 className="text-2xl font-black text-white mb-2 font-heading">Edit Group Name</h2>
              <p className="text-sm text-muted-foreground mb-8">Change the name of your organizational group.</p>
              
              <form onSubmit={handleUpdateGroup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Group Name</label>
                  <input
                    autoFocus
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                    placeholder="e.g. Courses, Diet, Season"
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditGroupModalOpen(false);
                      setEditingGroup(null);
                    }}
                    className="flex-1 h-12 rounded-xl border border-border bg-background text-sm font-bold hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editingGroup.name.trim()}
                    className="flex-1 h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
