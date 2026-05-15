'use client';

import Link from "next/link";
import { ArrowRight, Bookmark, Heart } from "lucide-react";
import Image from "next/image";
import { useSaveArticleMutation, useUnsaveArticleMutation, useFavoriteArticleMutation, useUnfavoriteArticleMutation } from "@/store/api/articleApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ArticleCardProps {
  article: any;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [saveArticle] = useSaveArticleMutation();
  const [unsaveArticle] = useUnsaveArticleMutation();
  const [favoriteArticle] = useFavoriteArticleMutation();
  const [unfavoriteArticle] = useUnfavoriteArticleMutation();

  const [isSaved, setIsSaved] = useState(article.isSaved);
  const [isFavorited, setIsFavorited] = useState(article.isFavorited);

  useEffect(() => {
    setIsSaved(article.isSaved);
    setIsFavorited(article.isFavorited);
  }, [article.isSaved, article.isFavorited]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to save articles");
      router.push("/login");
      return;
    }

    try {
      if (isSaved) {
        setIsSaved(false);
        await unsaveArticle(article.id).unwrap();
        toast.success("Removed from saved");
      } else {
        setIsSaved(true);
        await saveArticle(article.id).unwrap();
        toast.success("Added to saved");
      }
    } catch (error) {
      setIsSaved(!isSaved); // revert on error
      toast.error("Something went wrong");
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to favorite articles");
      router.push("/login");
      return;
    }

    try {
      if (isFavorited) {
        setIsFavorited(false);
        await unfavoriteArticle(article.id).unwrap();
        toast.success("Removed from favorites");
      } else {
        setIsFavorited(true);
        await favoriteArticle(article.id).unwrap();
        toast.success("Added to favorites");
      }
    } catch (error) {
      setIsFavorited(!isFavorited); // revert on error
      toast.error("Something went wrong");
    }
  };

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 shadow-xl hover:shadow-primary/5 hover:-translate-y-2 h-full"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleSaveToggle}
            className={cn(
              "w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
              isSaved 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "bg-black/40 text-white hover:bg-primary"
            )}
          >
            <Bookmark className={cn("w-4.5 h-4.5", isSaved && "fill-current")} />
          </button>
          <button
            onClick={handleFavoriteToggle}
            className={cn(
              "w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
              isFavorited 
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                : "bg-black/40 text-white hover:bg-rose-500"
            )}
          >
            <Heart className={cn("w-4.5 h-4.5", isFavorited && "fill-current")} />
          </button>
        </div>
        
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 rounded-lg bg-primary/90 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-primary-foreground shadow-lg">
            {article.category || 'Article'}
          </span>
        </div>

        <Image
          src={article.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"}
          alt={article.title}
          fill
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-black text-white leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2 font-heading">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-6 line-clamp-3 flex-1">
          {article.summary || "Deep dives into nutrition, lifestyle, and culinary secrets."}
        </p>
        <div className="pt-5 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
            Read Story
          </span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
