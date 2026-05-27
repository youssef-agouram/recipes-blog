import { ArticleCardSkeleton } from "@/components/articles/ArticleCardSkeleton";
import { Sparkles, Search, Filter } from "lucide-react";

export default function BlogLoading() {
  return (
    <div className="w-full bg-background text-foreground pb-24 min-h-screen">
      {/* Page Header Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card/30 via-card/10 to-transparent border-b border-white/5 py-20">
        <div className="container mx-auto px-6 max-w-[1536px] relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <div className="w-24 h-2 bg-primary/20 rounded animate-pulse" />
          </div>
          <div className="h-10 sm:h-14 bg-white/10 rounded animate-pulse w-3/4 max-w-md mb-6" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-full max-w-2xl mb-2" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-2/3 max-w-xl mb-8" />

          {/* Search bar skeleton */}
          <div className="max-w-xl mx-auto w-full relative">
            <div className="w-full h-14 bg-card/40 rounded-2xl border border-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="container mx-auto px-6 max-w-[1536px] mt-12">
        {/* Category Filter Tabs Skeleton */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-12 scrollbar-hide">
          <div className="flex items-center gap-2 text-muted-foreground mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <div className="w-10 h-3 bg-white/10 rounded animate-pulse" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-5 py-4 w-20 rounded-xl bg-card/40 border border-white/5 animate-pulse shrink-0" />
          ))}
        </div>

        {/* Featured Article Banner Skeleton */}
        <div className="mb-16">
          <div className="w-32 h-3 bg-primary/20 rounded mb-4 animate-pulse" />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 bg-card/20 rounded-[32px] overflow-hidden border border-white/5 p-6">
            <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[300px] rounded-2xl bg-white/5 animate-pulse" />
            <div className="lg:col-span-5 flex flex-col justify-center py-4">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-3 bg-white/10 rounded animate-pulse" />
                <div className="w-20 h-3 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="w-full h-8 bg-white/10 rounded animate-pulse mb-4" />
              <div className="w-5/6 h-8 bg-white/10 rounded animate-pulse mb-6" />
              <div className="space-y-2 mb-6">
                <div className="w-full h-3 bg-white/5 rounded animate-pulse" />
                <div className="w-full h-3 bg-white/5 rounded animate-pulse" />
                <div className="w-3/4 h-3 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="w-32 h-10 bg-white/5 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Regular Articles Grid Skeleton */}
        <div>
          <div className="w-32 h-3 bg-primary/20 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
