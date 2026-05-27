export function ArticleCardSkeleton() {
  return (
    <div className="group flex flex-col bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/5 h-full">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] w-full bg-white/5 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-white/10 rounded animate-pulse w-full" />
          <div className="h-5 bg-white/10 rounded animate-pulse w-3/4" />
        </div>
        
        {/* Summary Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-4/6" />
        </div>

        {/* Footer Skeleton */}
        <div className="pt-5 border-t border-white/5 flex items-center justify-between mt-auto">
          <div className="h-3 bg-white/5 rounded animate-pulse w-16" />
          <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
