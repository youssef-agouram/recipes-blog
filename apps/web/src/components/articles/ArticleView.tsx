'use client';

import { Calendar, User, Share2, Bookmark, Heart, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BlogRenderer from '@/components/BlogRenderer';
import { useState, useEffect } from "react";
import { 
  useSaveArticleMutation, 
  useUnsaveArticleMutation, 
  useFavoriteArticleMutation, 
  useUnfavoriteArticleMutation,
  useGetSavedArticlesQuery,
  useGetFavoritedArticlesQuery
} from "@/store/api/articleApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ArticleViewProps {
  article: any;
}

export default function ArticleView({ article }: ArticleViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [saveArticle] = useSaveArticleMutation();
  const [unsaveArticle] = useUnsaveArticleMutation();
  const [favoriteArticle] = useFavoriteArticleMutation();
  const [unfavoriteArticle] = useUnfavoriteArticleMutation();

  const [isSaved, setIsSaved] = useState(article.isSaved);
  const [isFavorited, setIsFavorited] = useState(article.isFavorited);

  const { data: savedArticles } = useGetSavedArticlesQuery(undefined, { skip: !isAuthenticated });
  const { data: favoritedArticles } = useGetFavoritedArticlesQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (savedArticles) {
      setIsSaved(savedArticles.some(a => a.id === article.id));
    }
  }, [savedArticles, article.id]);

  useEffect(() => {
    if (favoritedArticles) {
      setIsFavorited(favoritedArticles.some(a => a.id === article.id));
    }
  }, [favoritedArticles, article.id]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save articles");
      router.push("/login");
      return;
    }

    try {
      if (isSaved) {
        setIsSaved(false);
        await unsaveArticle(article.id).unwrap();
        toast.success("Article removed from saved collection");
      } else {
        setIsSaved(true);
        await saveArticle(article.id).unwrap();
        toast.success("Article added to saved collection");
      }
    } catch (error) {
      setIsSaved(!isSaved); // revert
      toast.error("Something went wrong");
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to favorite articles");
      router.push("/login");
      return;
    }

    try {
      if (isFavorited) {
        setIsFavorited(false);
        await unfavoriteArticle(article.id).unwrap();
        toast.success("Article removed from favorites");
      } else {
        setIsFavorited(true);
        await favoriteArticle(article.id).unwrap();
        toast.success("Article added to favorites");
      }
    } catch (error) {
      setIsFavorited(!isFavorited); // revert
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      <article className="container mx-auto px-6 max-w-[1536px] pt-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <span className="text-white truncate max-w-[200px]">{article.title}</span>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                {article.category || 'Lifestyle'}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5 text-primary" />
                5 MIN READ
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter mb-8 font-heading">
              {article.title}
            </h1>

            <div className="flex items-center justify-center gap-8 py-6 border-y border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10">
                  <Image src="https://i.pravatar.cc/150?u=author" alt="Author" width={40} height={40} />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white leading-none mb-1">Emma Wilson</span>
                  <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Lead Editor</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative aspect-[21/9] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl mb-16">
            <Image
              src={article.imageUrl || "https://images.unsplash.com/photo-1490818387583-1baba5e6382b?auto=format&fit=crop&w=1200&q=80"}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            
            {/* Actions Overlay */}
            <div className="absolute top-8 right-8 flex flex-col gap-3">
              <button 
                onClick={handleSaveToggle}
                className={cn(
                  "w-12 h-12 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95",
                  isSaved 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-black/40 text-white hover:bg-primary"
                )}
              >
                <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
              </button>
              <button 
                onClick={handleFavoriteToggle}
                className={cn(
                  "w-12 h-12 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95",
                  isFavorited 
                    ? "bg-rose-500 text-white" 
                    : "bg-black/40 text-white hover:bg-rose-500"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none mb-16">
            <div className="text-xl text-white/90 leading-relaxed font-medium mb-12 italic border-l-4 border-primary pl-8 py-2 bg-primary/5 rounded-r-3xl">
              {article.summary || "A deep dive into the world of culinary arts and lifestyle improvements."}
            </div>
            
            <div className="text-lg text-muted-foreground leading-loose font-medium article-content">
              {article.content ? (
                <BlogRenderer content={article.content} />
              ) : (
                <p>Loading content...</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between py-10 border-t border-white/5">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleFavoriteToggle}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all active:scale-95",
                  isFavorited 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
              >
                <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {isFavorited ? 'Favorited' : 'Add to Favorites'}
                </span>
              </button>
              <button 
                onClick={handleSaveToggle}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all active:scale-95",
                  isSaved 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
              >
                <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {isSaved ? 'Saved' : 'Save for Later'}
                </span>
              </button>
            </div>

            <button 
              onClick={() => { toast.info("Link copied!"); navigator.clipboard.writeText(window.location.href); }}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">Share Story</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
