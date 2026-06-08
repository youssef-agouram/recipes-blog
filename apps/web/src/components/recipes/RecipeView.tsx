'use client';

import { Clock, Star, Share2, Bookmark, Printer, Heart, Minus, Plus, Flame, CheckCircle2, ChevronRight, PlayCircle, Apple, ShoppingBag, ClipboardList, Activity, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BlogRenderer from '@/components/BlogRenderer';
import { Recipe } from "@/lib/types";
import dynamic from 'next/dynamic';

const DraggableSidebarAd = dynamic(() => import("@/components/recipes/DraggableSidebarAd"), { ssr: false });
const CommentsSection = dynamic(() => import("@/components/recipes/CommentsSection"), { ssr: false });

import { useState, useEffect } from "react";
import {
  useSaveRecipeMutation,
  useUnsaveRecipeMutation,
  useFavoriteRecipeMutation,
  useUnfavoriteRecipeMutation,
  useGetSavedRecipesQuery,
  useGetFavoritedRecipesQuery
} from "@/store/api/recipeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface RecipeViewProps {
  recipe: Recipe;
  relatedRecipes?: React.ReactNode;
}

export default function RecipeView({ recipe, relatedRecipes }: RecipeViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [saveRecipe] = useSaveRecipeMutation();
  const [unsaveRecipe] = useUnsaveRecipeMutation();
  const [favoriteRecipe] = useFavoriteRecipeMutation();
  const [unfavoriteRecipe] = useUnfavoriteRecipeMutation();

  const [isSaved, setIsSaved] = useState(recipe.isSaved);
  const [isFavorited, setIsFavorited] = useState(recipe.isFavorited);

  const { data: savedRecipes } = useGetSavedRecipesQuery(undefined, { skip: !isAuthenticated });
  const { data: favoritedRecipes } = useGetFavoritedRecipesQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (savedRecipes) {
      setIsSaved(savedRecipes.some(r => r.id === recipe.id));
    }
  }, [savedRecipes, recipe.id]);

  useEffect(() => {
    if (favoritedRecipes) {
      setIsFavorited(favoritedRecipes.some(r => r.id === recipe.id));
    }
  }, [favoritedRecipes, recipe.id]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save recipes");
      router.push("/login");
      return;
    }

    try {
      if (isSaved) {
        setIsSaved(false);
        await unsaveRecipe(recipe.id).unwrap();
        toast.success("Recipe removed from saved collection");
      } else {
        setIsSaved(true);
        await saveRecipe(recipe.id).unwrap();
        toast.success("Recipe added to saved collection");
      }
    } catch (error) {
      setIsSaved(!isSaved); // revert
      toast.error("Something went wrong");
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to favorite recipes");
      router.push("/login");
      return;
    }

    try {
      if (isFavorited) {
        setIsFavorited(false);
        await unfavoriteRecipe(recipe.id).unwrap();
        toast.success("Recipe removed from favorites");
      } else {
        setIsFavorited(true);
        await favoriteRecipe(recipe.id).unwrap();
        toast.success("Recipe added to favorites");
      }
    } catch (error) {
      setIsFavorited(!isFavorited); // revert
      toast.error("Something went wrong");
    }
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return null;
  };

  const isDirectVideo = (url?: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('storage.googleapis.com') || url.includes('res.cloudinary.com');
  };

  const embedUrl = getEmbedUrl(recipe.videoUrl);
  const [selectedImage, setSelectedImage] = useState(recipe.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80");
  const [servings, setServings] = useState(recipe.servings || 4);
  const [openCookingGuide, setOpenCookingGuide] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [openSections, setOpenSections] = useState({
    ingredients: false,
    instructions: false,
    nutrition: false,
  });

  const toggleSection = (section: 'ingredients' | 'instructions' | 'nutrition') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCookingGuideClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setOpenCookingGuide(true);
      setTimeout(() => {
        document.getElementById('cooking-guide-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    setOpenCookingGuide(true);
    setTimeout(() => {
      document.getElementById('cooking-guide-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const ingredientItems = Array.isArray(recipe.ingredientsJson)
    ? recipe.ingredientsJson
    : typeof recipe.ingredientsJson === 'string'
      ? JSON.parse(recipe.ingredientsJson)
      : [];

  const instructionItems = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : typeof recipe.instructions === 'string'
      ? JSON.parse(recipe.instructions)
      : [];

  const allImages = [recipe.imageUrl, ...(recipe.images || [])].filter(Boolean) as string[];

  // Auto-scroll thumbnail into view
  useEffect(() => {
    const currentIndex = allImages.indexOf(selectedImage);
    const el = document.getElementById(`thumb-${currentIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedImage, allImages]);

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          /* Force backgrounds and colors to appear */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            background-color: #05060b !important;
          }

          /* Hide UI elements that shouldn't be printed */
          .print-hidden, 
          header, 
          footer, 
          aside, 
          .fixed, 
          button:not(.print-only) {
            display: none !important;
          }

          /* Ensure the container takes full width and has padding */
          .container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
          }

          /* Preserve the dark card backgrounds */
          .bg-card, .bg-white\/\[0\.02\], .bg-black\/40 {
            background-color: rgba(255, 255, 255, 0.05) !important;
          }

          /* Ensure text colors are maintained or adjusted for legibility */
          .text-white { color: white !important; }
          .text-muted-foreground { color: #94a3b8 !important; }
          .text-primary { color: #f59e0b !important; }

          /* Layout adjustments for print */
          .flex-col.lg\\:flex-row {
            flex-direction: column !important;
          }
          .w-full.lg\\:w-\\[55\\%\\] {
            width: 100% !important;
          }
          
          /* Prevent page breaks inside important sections */
          article, section, .grid {
            page-break-inside: avoid;
          }
        }

        /* Custom scrollbar styling for the About Recipes container */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(245, 158, 11, 0.05); /* Very subtle primary gold track */
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.4); /* Vibrant theme gold handle by default */
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.95); /* Fully glowing gold theme handle on hover */
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(245, 158, 11, 0.4) rgba(245, 158, 11, 0.05);
        }
      ` }} />
      <article className="container mx-auto px-2 md:px-6 max-w-[1536px] pt-4">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <Link href="/recipes" className="hover:text-primary transition-colors">Recipes</Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <Link href={recipe.categories?.[0]?.slug ? `/category/${recipe.categories[0].slug}` : '/categories'} className="hover:text-primary transition-colors">{recipe.categories?.[0]?.name || 'Category'}</Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <span className="text-white truncate max-w-[200px]">{recipe.title}</span>
        </div>

        {/* Mobile Header: Title & Description beside Main Image */}
        <div className="flex md:hidden items-start gap-4 mb-4 md:mb-6">
          {/* Main Image Container */}
          <div className="relative w-[46%] aspect-square xs:aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 shrink-0 shadow-lg">
            <Image
              src={selectedImage}
              alt={recipe.title}
              fill
              sizes="150px"
              className="object-cover"
              priority
            />
            {/* Simple Category Badge overlay */}
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[6px] xs:text-[7px] font-black uppercase tracking-wider text-white">
              {recipe.categories?.[0]?.name || 'Recipe'}
            </span>
          </div>

          {/* Title & Short Description */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-primary">
              <Clock className="w-3 h-3" />
              <span>{recipe.totalTime || '30 MIN'}</span>
              <span>•</span>
              <span className="capitalize">{recipe.difficulty || 'Easy'}</span>
            </div>
            <h1 className="text-base xs:text-lg font-black text-white leading-tight tracking-tight font-heading line-clamp-3">
              {recipe.title}
            </h1>
            <p className="text-[9px] xs:text-[10px] text-muted-foreground leading-snug font-medium line-clamp-3">
              {recipe.summary || "Embark on a culinary journey with this masterpiece."}
            </p>
            {/* Compact action icons — mobile only */}
            <div className="flex items-center gap-1.5 pt-2 pb-2">
              <button
                onClick={() => window.print()}
                className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-primary/50 transition-all active:scale-90"
                title="Print recipe"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { toast.info("Sharing link copied!"); navigator.clipboard.writeText(window.location.href); }}
                className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-primary/50 transition-all active:scale-90"
                title="Share recipe"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSaveToggle}
                className={cn(
                  "flex-1 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-90",
                  isSaved
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-primary/50"
                )}
                title={isSaved ? "Unsave recipe" : "Save recipe"}
              >
                <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={cn(
                  "flex-1 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-90",
                  isFavorited
                    ? "bg-rose-500/20 border-rose-500 text-rose-500"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-rose-500/50"
                )}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
              </button>
            </div>

            <button
              onClick={handleCookingGuideClick}
              className="mt-1 w-full py-2 rounded-xl bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary/95"
            >
              <CheckCircle2 className="w-3 h-3" />
              Cooking Guide
            </button>
          </div>
        </div>

        {/* Unified 2-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-12 mb-8 md:mb-16 animate-in fade-in duration-1000">

          {/* Left Column: Visuals, Stats, Actions, Ingredients, Instructions, Nutrition */}
          <div className="w-full lg:w-[55%] flex flex-col gap-4 md:gap-8">
            <div className="hidden md:block relative aspect-[16/10] rounded-2xl sm:rounded-[22px] overflow-hidden shadow-2xl group border border-white/5 mb-4">
              <Image src={selectedImage} alt={recipe.title} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover group-hover:scale-105 transition-transform duration-[3s]" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-8 right-8 flex flex-col gap-3">
                <button onClick={handleSaveToggle} className={cn("w-14 h-14 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95", isSaved ? "bg-primary text-primary-foreground" : "bg-black/40 text-white/90 hover:bg-primary hover:text-primary-foreground")} title={isSaved ? "Unsave recipe" : "Save recipe"}>
                  <Bookmark className={cn("w-6 h-6", isSaved && "fill-current")} />
                </button>
                <button onClick={handleFavoriteToggle} className={cn("w-14 h-14 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95", isFavorited ? "bg-rose-500 text-white" : "bg-black/40 text-white/90 hover:bg-rose-500")} title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
                  <Heart className={cn("w-6 h-6", isFavorited && "fill-current")} />
                </button>
              </div>
              <div className="absolute bottom-8 left-8 flex items-center gap-4">
                <Link href={recipe.categories?.[0]?.slug ? `/category/${recipe.categories[0].slug}` : '/categories'} className="px-6 py-2.5 rounded-2xl bg-primary text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 hover:bg-white hover:text-black transition-colors">{recipe.categories?.[0]?.name || 'Recipe'}</Link>
                <div className="px-5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/90 flex items-center gap-2.5 shadow-2xl">
                  <PlayCircle className="w-4 h-4 text-primary" /> Watch Video
                </div>
              </div>
              <div className="absolute bottom-8 right-8">
                <div className="px-5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/90 flex items-center gap-2.5 shadow-2xl">
                  <Clock className="w-4 h-4 text-primary" /> {recipe.totalTime || '30 MIN'}
                </div>
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="relative group/gallery -mx-6 px-6 overflow-hidden mb-4">
                <div id="thumbnail-slider" className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth touch-pan-x">
                  {allImages.map((imgUrl, i) => (
                    <button key={i} id={`thumb-${i}`} onClick={() => setSelectedImage(imgUrl)} className={`relative flex-none w-[76px] h-[57px] xs:w-[100px] xs:h-[75px] sm:w-[160px] sm:h-[120px] rounded-xl sm:rounded-[22px] overflow-hidden border transition-all duration-300 snap-center ${selectedImage === imgUrl ? 'border-primary ring-2 ring-primary/25 scale-95 shadow-xl animate-pulse-once' : 'border-white/5 opacity-60 hover:opacity-100'}`}>
                      <Image src={imgUrl} alt={`${recipe.title} photo ${i + 1}`} fill sizes="160px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recipe.videoUrl && (
              <div className="hidden md:block">
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="flex items-center gap-3 not-prose">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                    <h3 className="text-xl font-black text-white tracking-tighter font-heading">Watch the Recipe</h3>
                  </div>
                  {embedUrl ? (
                    <div className="relative aspect-video rounded-xl sm:rounded-[22px] overflow-hidden border border-white/5 shadow-2xl group">
                      <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : isDirectVideo(recipe.videoUrl) ? (
                    <div className="relative aspect-video rounded-xl sm:rounded-[22px] overflow-hidden border border-white/5 shadow-2xl group bg-black">
                      <video src={recipe.videoUrl} className="absolute inset-0 w-full h-full" controls />
                    </div>
                  ) : (
                    <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-6 aspect-video rounded-xl sm:rounded-[22px] bg-card/40 border border-white/5 hover:border-primary/50 transition-all group overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><PlayCircle className="w-8 h-8" /></div>
                      <div className="text-center"><p className="text-base font-black text-white tracking-tight">Watch on External Platform</p><p className="text-xs text-muted-foreground font-medium">Click to view video on source site</p></div>
                    </a>
                  )}
                </section>
              </div>
            )}



            <div className="hidden md:flex w-full items-center gap-2 mb-4">
              <button
                onClick={() => window.print()}
                className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-primary/50 transition-all active:scale-90"
                title="Print recipe"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={() => { toast.info("Sharing link copied!"); navigator.clipboard.writeText(window.location.href); }}
                className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-primary/50 transition-all active:scale-90"
                title="Share recipe"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleSaveToggle}
                className={cn(
                  "flex-1 h-14 rounded-2xl border flex items-center justify-center transition-all active:scale-90",
                  isSaved
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-primary/50"
                )}
                title={isSaved ? "Unsave recipe" : "Save recipe"}
              >
                <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={cn(
                  "flex-1 h-14 rounded-2xl border flex items-center justify-center transition-all active:scale-90",
                  isFavorited
                    ? "bg-rose-500/20 border-rose-500 text-rose-500"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-rose-500/50"
                )}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
              </button>
            </div>

            {/* Cooking Guide Button — desktop only */}
            <button
              onClick={handleCookingGuideClick}
              className="hidden md:flex w-full h-12 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary/95 mb-6"
            >
              <CheckCircle2 className="w-4 h-4" />
              Cooking Guide
            </button>

            {/* Unified Accordion Card */}
            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-[22px] shadow-2xl overflow-hidden divide-y divide-white/5">
              
              {/* Ingredients Section */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleSection('ingredients')}
                  className="w-full flex items-center justify-between p-5 sm:p-7 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tighter font-heading">Ingredients</h3>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">For {servings} Servings</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", openSections.ingredients && "rotate-180")} />
                </button>

                {openSections.ingredients && (
                  <div className="px-5 pb-6 sm:px-7 sm:pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 bg-background/50 border border-white/5 rounded-2xl p-1.5 w-fit mb-6">
                      <button onClick={() => setServings(prev => Math.max(1, prev - 1))} className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="text-sm font-black text-white w-6 text-center">{servings}</span>
                      <button onClick={() => setServings(prev => prev + 1)} className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <ul className="space-y-4">
                      {ingredientItems.length > 0 ? ingredientItems.map((ing: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-4 group cursor-pointer">
                          <div className="mt-1.5 w-4 h-4 rounded border border-white/10 flex items-center justify-center transition-all group-hover:border-primary group-hover:bg-primary/10"><div className="w-1.5 h-1.5 rounded-sm bg-primary opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                          <span className="text-[14px] font-medium text-white/70 leading-relaxed group-hover:text-white transition-colors"><span className="font-bold text-white">{ing.quantity} {ing.unit}</span> {ing.name}</span>
                        </li>
                      )) : <p className="text-[11px] text-muted-foreground italic">No ingredients listed yet.</p>}
                    </ul>
                  </div>
                )}
              </div>

              {/* Instructions Section */}
              <div id="instructions" className="flex flex-col scroll-mt-20">
                <button
                  onClick={() => toggleSection('instructions')}
                  className="w-full flex items-center justify-between p-5 sm:p-7 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tighter font-heading">Instructions</h3>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Step by Step Guide</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", openSections.instructions && "rotate-180")} />
                </button>

                {openSections.instructions && (
                  <div className="px-5 pb-6 sm:px-7 sm:pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-6">
                      {(() => {
                        if (instructionItems.length === 0) {
                          return <p className="text-[11px] text-muted-foreground italic">No instructions provided yet.</p>;
                        }
                        
                        const processedSteps = instructionItems.map((s: any) => {
                          const textStr = s.text || '';
                          const match = textStr.match(/^\s*(?:step|phase|no\.?|n°)?\s*(\d+)\s*(?:[\.\-\:\)]\s*|\s+)/i);
                          let rawText = textStr;
                          let extractedNum: number | null = null;
                          if (match) {
                            rawText = textStr.substring(match[0].length).trim();
                            extractedNum = parseInt(match[1], 10);
                          }
                          
                          // Parse title and points
                          const lines = rawText.split('\n')
                            .map((line: string) => line.trim())
                            .filter(Boolean);
                          
                          const title = lines.length > 0 ? lines[0] : '';
                          const points = lines.slice(1).map((line: string) => {
                            return line.replace(/^\s*[•\-\*\t]+\s*/, '').trim();
                          });

                          return {
                            title,
                            points,
                            extractedNum,
                          };
                        });

                        const hasExplicitNumbers = processedSteps.some((s: any) => s.extractedNum !== null);

                        if (hasExplicitNumbers) {
                          return (
                            <div className="space-y-6">
                              {processedSteps.map((s: any, idx: number) => {
                                if (s.extractedNum !== null) {
                                  return (
                                    <div key={idx} className="animate-in fade-in duration-300">
                                      <h4 className="text-[14px] font-bold text-white tracking-tight">
                                        {s.extractedNum}. {s.title}
                                      </h4>
                                      {s.points.length > 0 && (
                                        <ul className="mt-2 space-y-1.5 pl-4">
                                          {s.points.map((pt: string, ptIdx: number) => (
                                            <li key={ptIdx} className="flex items-start gap-2 text-[12.5px] text-muted-foreground leading-relaxed font-medium hover:text-white transition-colors">
                                              <span className="text-primary mt-1.5 text-[8px]">•</span>
                                              <span>{pt}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={idx} className="pl-4 group/tip animate-in fade-in duration-300">
                                      <h5 className={cn("text-[13px] tracking-tight transition-colors", s.points.length > 0 ? "font-semibold text-white/90" : "font-medium text-muted-foreground hover:text-white")}>
                                        {s.title}
                                      </h5>
                                      {s.points.length > 0 && (
                                        <ul className="mt-1.5 space-y-1 pl-4">
                                          {s.points.map((pt: string, ptIdx: number) => (
                                            <li key={ptIdx} className="flex items-start gap-2 text-[12px] text-muted-foreground leading-relaxed font-medium hover:text-white transition-colors">
                                              <span className="text-primary/70 mt-1.5 text-[6px]">•</span>
                                              <span>{pt}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          );
                        } else {
                          // No explicit numbers in the steps - display in original chronological sequence
                          return (
                            <div className="space-y-6">
                              {processedSteps.map((s: any, idx: number) => (
                                <div key={idx} className="animate-in fade-in duration-300">
                                  <h4 className="text-[14px] font-bold text-white tracking-tight">
                                    {idx + 1}. {s.title}
                                  </h4>
                                  {s.points.length > 0 && (
                                    <ul className="mt-2 space-y-1.5 pl-4">
                                      {s.points.map((pt: string, ptIdx: number) => (
                                        <li key={ptIdx} className="flex items-start gap-2 text-[12.5px] text-muted-foreground leading-relaxed font-medium hover:text-white transition-colors">
                                          <span className="text-primary mt-1.5 text-[8px]">•</span>
                                          <span>{pt}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Nutrition Info Section */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleSection('nutrition')}
                  className="w-full flex items-center justify-between p-5 sm:p-7 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tighter font-heading">Nutrition Information</h3>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Per Serving Estimation</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", openSections.nutrition && "rotate-180")} />
                </button>

                {openSections.nutrition && (
                  <div className="px-5 pb-6 sm:px-7 sm:pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {(() => {
                        const standardList = [
                          { label: 'Calories', value: recipe.nutrition?.calories ? `${recipe.nutrition.calories}` : '', color: 'text-orange-400' },
                          { label: 'Protein', value: recipe.nutrition?.protein ? `${recipe.nutrition.protein}g` : '', color: 'text-blue-400' },
                          { label: 'Carbs', value: recipe.nutrition?.carbohydrates ? `${recipe.nutrition.carbohydrates}g` : '', color: 'text-amber-400' },
                          { label: 'Fat', value: recipe.nutrition?.fat ? `${recipe.nutrition.fat}g` : '', color: 'text-red-400' },
                          { label: 'Fiber', value: recipe.nutrition?.fiber ? `${recipe.nutrition.fiber}g` : '', color: 'text-emerald-400' },
                        ];

                        const displayedKeys = new Set(['calories', 'protein', 'carbohydrates', 'fat', 'fiber']);
                        const items = [...standardList];

                        if (recipe.nutrition) {
                          const customColors = [
                            'text-purple-400',
                            'text-teal-400',
                            'text-indigo-400',
                            'text-pink-400',
                            'text-yellow-400',
                          ];
                          let colorIndex = 0;

                          Object.keys(recipe.nutrition).forEach((key) => {
                            const lowerKey = key.toLowerCase();
                            if (displayedKeys.has(lowerKey)) return;

                            const label = key.charAt(0).toUpperCase() + key.slice(1);
                            const val = String((recipe.nutrition as any)[key] || '');
                            if (val) {
                              items.push({
                                label,
                                value: val,
                                color: customColors[colorIndex % customColors.length],
                              });
                              colorIndex++;
                            }
                          });
                        }

                        const finalItems = items.map(item => {
                          if (item.value) return item;
                          if (item.label === 'Calories') return { ...item, value: '0' };
                          return { ...item, value: '0g' };
                        });

                        return finalItems.map(nut => (
                          <div key={nut.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all flex flex-col justify-center animate-in fade-in duration-300">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">{nut.label}</span>
                            <span className={`text-xl font-black ${nut.color}`}>{nut.value}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Title, Summary, About, Video Mobile, Community Feedback */}
          <div className="flex flex-col flex-1 w-full gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-white/10 overflow-hidden">
                    <Image src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" width={24} height={24} />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loved by 1.2k people</span>
            </div>

            <h1 className="hidden md:block text-5xl sm:text-6xl lg:text-[72px] font-black text-white leading-[0.95] tracking-tighter font-heading drop-shadow-2xl mb-4">
              {recipe.title}
            </h1>

            <p className="hidden md:block text-[16px] text-muted-foreground leading-relaxed font-medium max-w-xl mb-4">
              {recipe.summary || "Embark on a culinary journey with this masterpiece. Perfectly balanced flavors and textures that will leave your guests in awe."}
            </p>

             <section id="cooking-guide-section" className="max-w-none pb-4 border-b border-white/5 mb-4 scroll-mt-20">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowAuthModal(true);
                  }
                  setOpenCookingGuide(!openCookingGuide);
                }}
                className="w-full flex items-center justify-between py-2 text-left not-prose group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h3 className="text-xl font-black text-white tracking-tighter font-heading group-hover:text-primary transition-colors">Cooking Guide</h3>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", openCookingGuide && "rotate-180")} />
              </button>

              {!isAuthenticated && openCookingGuide && (
                <div className="relative mt-4 rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01] p-6 text-center backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05060b]/80" />
                  <div className="relative z-10 flex flex-col items-center py-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">Step-by-Step Cooking Guide is Locked</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mb-4">
                      Sign in or create a free account to unlock our exclusive cooking guide, chef tips, and ingredients scaler.
                    </p>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-6 py-2.5 rounded-xl bg-primary text-[11px] font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                      Unlock Guide
                    </button>
                  </div>
                </div>
              )}

              {isAuthenticated && openCookingGuide && (
                <div className="prose prose-neutral dark:prose-invert text-[14px] text-muted-foreground leading-relaxed font-medium max-h-[420px] overflow-y-auto pr-4 custom-scrollbar snap-y snap-mandatory scroll-smooth animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
                  {recipe.content ? (
                    <BlogRenderer content={recipe.content} />
                  ) : (
                    <p>Master this delicious dish with our step-by-step guide and expert culinary tips. We've simplified the process to ensure professional results at home.</p>
                  )}
                </div>
              )}
            </section>

            {recipe.videoUrl && (
              <div className="block md:hidden pb-4 md:pb-8 border-b border-white/5 mb-4">
                <section className="space-y-6">
                  <div className="flex items-center gap-3 not-prose">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                    <h3 className="text-xl font-black text-white tracking-tighter font-heading">Watch the Recipe</h3>
                  </div>
                  {embedUrl ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                      <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : isDirectVideo(recipe.videoUrl) ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-black">
                      <video src={recipe.videoUrl} className="absolute inset-0 w-full h-full" controls />
                    </div>
                  ) : (
                    <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-6 aspect-video rounded-xl bg-card/40 border border-white/5 hover:border-primary/50 transition-all group overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><PlayCircle className="w-8 h-8" /></div>
                      <div className="text-center"><p className="text-base font-black text-white tracking-tight">Watch on External Platform</p><p className="text-xs text-muted-foreground font-medium">Click to view video on source site</p></div>
                    </a>
                  )}
                </section>
              </div>
            )}

            {/* Community Feedback — desktop full card */}
            <div className="hidden md:flex flex-col w-full h-[600px]">
              <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-[22px] p-5 sm:p-8 shadow-2xl print:hidden flex flex-col flex-1 h-full min-h-[400px]">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in duration-700">
                  <CommentsSection recipeId={recipe.id} className="animate-in fade-in duration-700" />
                </div>
              </div>
            </div>

            {/* Community Feedback — mobile compact */}
            <div className="block md:hidden print:hidden">
              <div className="bg-card/40 border border-white/5 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-5 bg-primary rounded-full" />
                  <h3 className="text-sm font-black text-white tracking-tight">Community Feedback</h3>
                </div>
                <CommentsSection recipeId={recipe.id} className="animate-in fade-in duration-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="print:hidden">
          {relatedRecipes}
        </div>

        <section className="mt-24 print:hidden">
          <div className="relative w-full h-[240px] sm:h-[300px] rounded-2xl sm:rounded-[22px] lg:rounded-[56px] overflow-hidden border border-white/5 group shadow-2xl">
            <Image
              src="/cooking_ad_banner_1778463092338.png"
              alt="Ad Banner"
              fill
              sizes="(max-width: 1536px) 100vw, 1536px"
              className="object-cover group-hover:scale-105 transition-transform duration-[10s]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent flex flex-col justify-center px-16">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-4 drop-shadow-lg">Elevate Your Cooking</span>
              <h4 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-8 max-w-[500px] font-heading drop-shadow-2xl">
                Premium Kitchen Collection Now 30% Off
              </h4>
              <button className="w-fit px-10 py-4 rounded-full bg-primary text-[12px] font-black uppercase tracking-[0.25em] text-primary-foreground hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95">
                Explore The Shop
              </button>
            </div>
          </div>
        </section>

      </article>
      <DraggableSidebarAd />

      {/* Sleek Custom Sign In / Register Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative w-full max-w-sm bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            
            <h3 className="text-xl font-black text-white tracking-tight font-heading mb-2">
              Unlock Cooking Guide
            </h3>
            
            <p className="text-xs text-muted-foreground leading-relaxed mb-6 px-2">
              Sign in to unlock the step-by-step cooking guide.
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="h-11 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  router.push(`/login?redirect=/recipes/${recipe.slug}`);
                }}
                className="h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
