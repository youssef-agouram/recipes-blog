'use client';

import { useState } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, 
  Users as UsersIcon, UserCheck, UserPlus, 
  ShieldCheck, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { 
  useGetUsersQuery, 
  useGetUserStatsQuery, 
  useUpdateUserRoleMutation,
  useUpdateUserDetailsMutation,
  useDeleteUserMutation
} from '@/store/api/userApi';

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Administrator': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'Editor': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Author': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    default: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  }
};

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: users = [], isLoading: isUsersLoading } = useGetUsersQuery();
  const { data: userStats, isLoading: isStatsLoading } = useGetUserStatsQuery();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [updateUserDetails] = useUpdateUserDetailsMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [editingUser, setEditingUser] = useState<any>(null);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateRole({ id: userId, role: newRole }).unwrap();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId).unwrap();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUserDetails({
        id: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        status: editingUser.status,
      }).unwrap();
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: userStats?.totalUsers || 0, sub: 'All registered users', icon: UsersIcon, color: 'bg-purple-500/10 text-purple-500' },
    { label: 'Active Users', value: userStats?.activeUsers || 0, sub: 'Users with active status', icon: UserCheck, color: 'bg-green-500/10 text-green-500' },
    { label: 'Subscribers', value: userStats?.subscribers || 0, sub: 'Users with Subscriber role', icon: UserPlus, color: 'bg-orange-500/10 text-orange-500' },
    { label: 'Administrators', value: userStats?.admins || 0, sub: 'Users with admin access', icon: ShieldCheck, color: 'bg-blue-500/10 text-blue-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Users</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <span>Users</span>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60">All Users</span>
          </div>
        </div>
        <Link 
          href="/admin/users/new"
          className="flex items-center gap-2 px-6 py-3 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </Link>
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

      {/* Table Section */}
      <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        {/* Filters */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-background border border-white/5 rounded-xl px-5 py-2.5 pr-10 text-sm font-bold text-white/80 focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                <option>Bulk Actions</option>
                <option>Delete Selected</option>
                <option>Change Role</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all">
              Apply
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#5850ec] transition-colors" />
              <input 
                type="text"
                placeholder="Search users..."
                className="bg-background border border-white/5 rounded-xl pl-11 pr-5 py-2.5 text-sm font-medium text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[#5850ec] w-full md:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">
                  <input type="checkbox" className="rounded bg-background border-white/10 text-[#5850ec] focus:ring-offset-0 focus:ring-0" />
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">User</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Email</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Password</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Role</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Status</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 text-center">Recipes</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isUsersLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">No users found</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <input type="checkbox" className="rounded bg-background border-white/10 text-[#5850ec] focus:ring-offset-0 focus:ring-0" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:scale-105 transition-transform flex items-center justify-center">
                        {user.avatar ? (
                           <Image src={user.avatar} alt={user.name || 'User'} fill className="object-cover" />
                        ) : (
                           <UsersIcon className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-white group-hover:text-[#5850ec] transition-colors">{user.name || 'Anonymous User'}</span>
                        <span className="text-[11px] font-medium text-muted-foreground/60 tracking-wider">
                          Registered: {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">{user.email}</span>
                  </td>
                  <td className="px-6 py-5 max-w-[150px]">
                    <span className="text-sm font-mono text-muted-foreground/40 group-hover:text-muted-foreground transition-colors truncate block" title={user.password}>
                      {user.password ? `${user.password.substring(0, 15)}...` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isUpdatingRole}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border appearance-none focus:outline-none focus:ring-2 focus:ring-[#5850ec] cursor-pointer transition-colors ${getRoleColor(user.role)} disabled:opacity-50`}
                      style={{ backgroundImage: 'none' }}
                    >
                      <option value="Subscriber" className="bg-[#0c1021] text-orange-500 font-bold">SUBSCRIBER</option>
                      <option value="Author" className="bg-[#0c1021] text-cyan-500 font-bold">AUTHOR</option>
                      <option value="Editor" className="bg-[#0c1021] text-blue-500 font-bold">EDITOR</option>
                      <option value="Administrator" className="bg-[#0c1021] text-purple-500 font-bold">ADMINISTRATOR</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      user.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-white">-</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => alert(`Viewing profile for ${user.name || user.email}`)}
                        className="p-2 hover:bg-[#5850ec]/10 hover:text-[#5850ec] text-muted-foreground/40 rounded-lg transition-all" title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 hover:bg-[#5850ec]/10 hover:text-[#5850ec] text-muted-foreground/40 rounded-lg transition-all" title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/40 rounded-lg transition-all" title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground/40">
            Showing <span className="text-white/60">1</span> to <span className="text-white/60">{filteredUsers.length}</span> of <span className="text-white/60">{users.length}</span> users
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 hover:bg-white/5 text-muted-foreground rounded-xl transition-all disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, '...', 16].map((p, i) => (
              <button 
                key={i}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                  p === 1 ? 'bg-[#5850ec] text-white shadow-lg shadow-[#5850ec]/20' : 'hover:bg-white/5 text-muted-foreground'
                }`}
              >
                {p}
              </button>
            ))}
            <button className="p-2 hover:bg-white/5 text-muted-foreground rounded-xl transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-[#0c1021] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-6">Edit User Details</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Name</label>
                <input 
                  type="text" 
                  value={editingUser.name || ''} 
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email || ''} 
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
                <select 
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec] transition-all appearance-none cursor-pointer"
                >
                  <option value="Active" className="bg-[#0c1021]">Active</option>
                  <option value="Inactive" className="bg-[#0c1021]">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-[#5850ec] text-white text-sm font-bold hover:bg-[#4d45d1] transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
