'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, Clock, ArrowRight, BookOpen, Sparkles, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  category?: string;
  isTopArticle?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogPageContentProps {
  initialArticles: Article[];
}

export default function BlogPageContent({ initialArticles }: BlogPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Dynamically extract categories from articles list
  const categories = ["All", ...Array.from(new Set(initialArticles.map(a => a.category).filter(Boolean))) as string[]];

  // Filter articles based on search query and category
  const filteredArticles = initialArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Find the top/featured article for the hero banner
  const featuredArticle = filteredArticles.find(a => a.isTopArticle) || filteredArticles[0];
  const regularArticles = featuredArticle 
    ? filteredArticles.filter(a => a.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <div className="w-full bg-background text-foreground pb-24 min-h-screen">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card/30 via-card/10 to-transparent border-b border-white/5 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,158,31,0.04),transparent_60%)]"></div>
        <div className="container mx-auto px-6 max-w-[1536px] relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Our Culinary Journal
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none font-heading mb-6">
            Stories, Guides & <span className="text-primary">Tips</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium mb-8">
            Dive into our articles written by food experts, professional chefs, and kitchen enthusiasts. Learn techniques, get nutritional advice, and stay inspired.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search articles, guides, tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card/40 backdrop-blur-md rounded-2xl border border-white/10 text-white placeholder-muted-foreground/50 text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 max-w-[1536px] mt-12">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-12 scrollbar-hide">
          <div className="flex items-center gap-2 text-muted-foreground mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Filter:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 active:scale-95",
                selectedCategory === cat
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/10"
                  : "bg-card/40 border-white/5 text-muted-foreground hover:text-white hover:bg-card"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article Banner */}
        {featuredArticle && searchQuery === "" && selectedCategory === "All" && (
          <div className="mb-16">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4">Featured Story</h2>
            <div className="group/featured relative grid grid-cols-1 lg:grid-cols-12 gap-8 bg-card/20 rounded-[32px] overflow-hidden border border-white/5 p-6 hover:shadow-2xl hover:border-white/10 transition-all duration-500">
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[300px] rounded-2xl overflow-hidden">
                <Image
                  src={featuredArticle.imageUrl || "https://images.unsplash.com/photo-1490818387583-1baba5e6382b?auto=format&fit=crop&w=1200&q=80"}
                  alt={featuredArticle.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover/featured:scale-[1.02] transition-transform duration-[1.5s]"
                />
                <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-[0.2em] shadow-xl">
                  {featuredArticle.category || 'Featured'}
                </span>
              </div>
              <div className="lg:col-span-5 flex flex-col justify-center py-4">
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {new Date(featuredArticle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    5 MIN READ
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4 tracking-tighter group-hover/featured:text-primary transition-colors font-heading">
                  {featuredArticle.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-6 line-clamp-4">
                  {featuredArticle.summary || "Embark on a unique culinary discovery. In this featured article, we bring you insights, techniques, and recipes that make home cooking an absolute delight."}
                </p>
                <Link
                  href={`/blog/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-primary hover:border-primary hover:text-primary-foreground text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest self-start transition-all duration-300"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Regular Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div>
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-6">
              {searchQuery || selectedCategory !== "All" ? "Filter Results" : "Latest Articles"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchQuery || selectedCategory !== "All" ? filteredArticles : regularArticles).map((article) => (
                <div
                  key={article.id}
                  className="group/card flex flex-col bg-card/25 rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-500 h-full"
                >
                  <Link href={`/blog/${article.slug}`} className="flex flex-col flex-1">
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      {article.imageUrl ? (
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover/card:scale-105 transition-transform duration-[1.5s]"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/[0.02] flex items-center justify-center text-muted-foreground/20 italic text-xs">
                          No image available
                        </div>
                      )}
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[8px] font-black uppercase tracking-widest">
                        {article.category || 'Lifestyle'}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          5 MIN READ
                        </span>
                      </div>

                      <h3 className="text-[14px] font-black text-white leading-snug mb-2 group-hover/card:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-3">
                        {article.summary || "Explore expert culinary insights, kitchen tips, and lifestyle enhancement guides in this article."}
                      </p>

                      <button className="flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-wider group/btn mt-auto text-left">
                        <span className="border-b pb-0.5 border-primary">
                          Read Article
                        </span>
                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform text-primary" />
                      </button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-card/10 rounded-[32px] border border-white/5 p-6">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">No articles found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find any articles matching your search query. Try checking your spelling or selecting a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
