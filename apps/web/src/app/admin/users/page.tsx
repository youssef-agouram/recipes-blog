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

const dummyUsers = [
  { id: 1, name: 'John Doe', username: 'johndoe', email: 'john.doe@example.com', role: 'Administrator', status: 'Active', registeredOn: 'May 31, 2024 10:30 AM', recipes: 23, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Jane Smith', username: 'janesmith', email: 'jane.smith@example.com', role: 'Editor', status: 'Active', registeredOn: 'May 30, 2024 09:15 AM', recipes: 18, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Mike Johnson', username: 'mikejohnson', email: 'mike.johnson@example.com', role: 'Author', status: 'Active', registeredOn: 'May 29, 2024 04:45 AM', recipes: 12, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'Sarah Wilson', username: 'sarahwilson', email: 'sarah.wilson@example.com', role: 'Subscriber', status: 'Active', registeredOn: 'May 28, 2024 11:20 AM', recipes: 7, avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, name: 'David Brown', username: 'davidbrown', email: 'david.brown@example.com', role: 'Subscriber', status: 'Inactive', registeredOn: 'May 27, 2024 02:30 PM', recipes: 0, avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 6, name: 'Emily Davis', username: 'emilydavis', email: 'emily.davis@example.com', role: 'Author', status: 'Active', registeredOn: 'May 26, 2024 08:10 AM', recipes: 15, avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 7, name: 'Chris Martin', username: 'chrismartin', email: 'chris.martin@example.com', role: 'Subscriber', status: 'Active', registeredOn: 'May 25, 2024 03:55 PM', recipes: 3, avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: 8, name: 'Lisa Anderson', username: 'lisaanderson', email: 'lisa.anderson@example.com', role: 'Subscriber', status: 'Inactive', registeredOn: 'May 24, 2024 01:40 PM', recipes: 0, avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 9, name: 'Paul Taylor', username: 'paultaylor', email: 'paul.taylor@example.com', role: 'Author', status: 'Active', registeredOn: 'May 23, 2024 10:05 AM', recipes: 9, avatar: 'https://i.pravatar.cc/150?u=9' },
  { id: 10, name: 'Anna White', username: 'annawhite', email: 'anna.white@example.com', role: 'Subscriber', status: 'Active', registeredOn: 'May 22, 2024 05:25 PM', recipes: 2, avatar: 'https://i.pravatar.cc/150?u=10' },
];

const stats = [
  { label: 'Total Users', value: '156', sub: 'All registered users', icon: UsersIcon, color: 'bg-purple-500/10 text-purple-500' },
  { label: 'Active Users', value: '142', sub: 'Users with active status', icon: UserCheck, color: 'bg-green-500/10 text-green-500' },
  { label: 'Subscribers', value: '87', sub: 'Users subscribed to newsletter', icon: UserPlus, color: 'bg-orange-500/10 text-orange-500' },
  { label: 'Administrators', value: '3', sub: 'Users with admin access', icon: ShieldCheck, color: 'bg-blue-500/10 text-blue-500' },
];

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
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Role</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Status</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 text-center">Recipes</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dummyUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <input type="checkbox" className="rounded bg-background border-white/10 text-[#5850ec] focus:ring-offset-0 focus:ring-0" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                        <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-white group-hover:text-[#5850ec] transition-colors">{user.name}</span>
                        <span className="text-[11px] font-medium text-muted-foreground/60 tracking-wider">@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">{user.email}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      user.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-white">{user.recipes}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-[#5850ec]/10 hover:text-[#5850ec] text-muted-foreground/40 rounded-lg transition-all" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-[#5850ec]/10 hover:text-[#5850ec] text-muted-foreground/40 rounded-lg transition-all" title="Edit User">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/40 rounded-lg transition-all" title="Delete User">
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
            Showing <span className="text-white/60">1</span> to <span className="text-white/60">10</span> of <span className="text-white/60">156</span> users
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
