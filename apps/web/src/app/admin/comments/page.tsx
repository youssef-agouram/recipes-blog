'use client';

import { useState } from 'react';
import { 
  MessageSquare, CheckCircle, Clock, AlertTriangle, 
  Download, Settings, Search, Filter, 
  Eye, Edit2, Trash2, ChevronLeft, ChevronRight,
  ChevronDown, ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const dummyComments = [
  { id: 1, text: 'This recipe was absolutely delicious! My family loved it. I will make it again.', recipe: 'Spaghetti Carbonara', user: 'Sarah Johnson', username: 'sarahj', status: 'Approved', date: 'May 31, 2024 10:30 AM', avatar: 'https://i.pravatar.cc/150?u=11' },
  { id: 2, text: 'Can I use chicken instead of beef in this recipe?', recipe: 'Beef Tacos', user: 'Mike Davis', username: 'miked', status: 'Pending', date: 'May 31, 2024 09:15 AM', avatar: 'https://i.pravatar.cc/150?u=12' },
  { id: 3, text: 'The instructions were easy to follow and the result was perfect!', recipe: 'Classic Pancakes', user: 'Emily Wilson', username: 'emilyw', status: 'Approved', date: 'May 30, 2024 08:45 PM', avatar: 'https://i.pravatar.cc/150?u=13' },
  { id: 4, text: 'Too much salt. I had to add more ingredients to balance it out.', recipe: 'Creamy Tomato Soup', user: 'David Brown', username: 'davidb', status: 'Spam', date: 'May 30, 2024 06:20 PM', avatar: 'https://i.pravatar.cc/150?u=14' },
  { id: 5, text: 'What type of cheese works best for this recipe?', recipe: 'Mac and Cheese', user: 'Jessica Taylor', username: 'jessicat', status: 'Pending', date: 'May 30, 2024 03:10 PM', avatar: 'https://i.pravatar.cc/150?u=15' },
  { id: 6, text: 'Super tasty and quick to make. Thanks for sharing!', recipe: 'Garlic Butter Shrimp', user: 'Chris Miller', username: 'chrism', status: 'Approved', date: 'May 29, 2024 11:05 AM', avatar: 'https://i.pravatar.cc/150?u=16' },
  { id: 7, text: 'My kids didn\'t like this at all.', recipe: 'Vegetable Stir Fry', user: 'Anna Lee', username: 'annalee', status: 'Spam', date: 'May 29, 2024 09:30 AM', avatar: 'https://i.pravatar.cc/150?u=17' },
];

const stats = [
  { label: 'Total Comments', value: '324', sub: 'All comments received', icon: MessageSquare, color: 'bg-purple-500/10 text-purple-500' },
  { label: 'Approved Comments', value: '285', sub: '87.9% of total', icon: CheckCircle, color: 'bg-green-500/10 text-green-500' },
  { label: 'Pending Comments', value: '28', sub: '8.6% of total', icon: Clock, color: 'bg-orange-500/10 text-orange-500' },
  { label: 'Spam Comments', value: '11', sub: '3.5% of total', icon: AlertTriangle, color: 'bg-red-500/10 text-red-500' },
];

export default function AdminCommentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Comments</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-white transition-colors">Home</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60">Comments</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all">
            <Download className="w-4 h-4" />
            <span>Export Comments</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/20 active:scale-95">
            <Settings className="w-4 h-4" />
            <span>Comment Settings</span>
          </button>
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

      {/* Filters Section */}
      <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            {[ 'All Comments', 'All Recipes', 'All Users', 'All Status' ].map((label) => (
              <div key={label} className="relative min-w-[140px]">
                <select className="appearance-none w-full bg-background border border-white/5 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-white/80 focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                  <option>{label}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
              </div>
            ))}
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>

            <div className="flex-1 min-w-[200px] relative group ml-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#5850ec] transition-colors" />
              <input 
                type="text"
                placeholder="Search comments..."
                className="bg-background border border-white/5 rounded-xl pl-11 pr-5 py-2.5 text-xs font-medium text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[#5850ec] w-full transition-all"
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
                <th className="px-6 py-5 w-12">
                  <input type="checkbox" className="rounded bg-background border-white/10 text-[#5850ec] focus:ring-offset-0 focus:ring-0" />
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Comment</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Recipe</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">User</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Status</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">Date</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dummyComments.map((comment) => (
                <tr key={comment.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <input type="checkbox" className="rounded bg-background border-white/10 text-[#5850ec] focus:ring-offset-0 focus:ring-0" />
                  </td>
                  <td className="px-6 py-5 max-w-[300px]">
                    <div className="flex items-start gap-4">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                        <Image src={comment.avatar} alt={comment.user} fill className="object-cover" />
                      </div>
                      <p className="text-[13px] font-medium text-slate-400 leading-relaxed group-hover:text-white transition-colors line-clamp-2">
                        {comment.text}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Link href="#" className="text-[13px] font-bold text-[#5850ec] hover:underline flex items-center gap-1">
                      {comment.recipe}
                    </Link>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white">{comment.user}</span>
                      <span className="text-[11px] font-medium text-muted-foreground/60 tracking-wider">@{comment.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      comment.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                      comment.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[12px] font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                      {comment.date}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-[#5850ec]/10 hover:text-[#5850ec] text-muted-foreground/40 rounded-lg transition-all" title="View Comment">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-[#5850ec]/10 hover:text-[#5850ec] text-muted-foreground/40 rounded-lg transition-all" title="Edit Comment">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/40 rounded-lg transition-all" title="Delete Comment">
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
            Showing <span className="text-white/60">1</span> to <span className="text-white/60">7</span> of <span className="text-white/60">324</span> comments
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-2 hover:bg-white/5 text-muted-foreground rounded-xl transition-all disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, '...', 47].map((p, i) => (
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
