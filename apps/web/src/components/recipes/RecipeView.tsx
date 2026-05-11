'use client';

import { Clock, Star, Share2, Bookmark, Printer, Heart, Minus, Plus, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BlogRenderer from '@/components/BlogRenderer';
import DraggableSidebarAd from "@/components/recipes/DraggableSidebarAd";
import { Recipe } from "@/lib/types";

import { useState, useEffect } from "react";

interface RecipeViewProps {
  recipe: Recipe;
}

export default function RecipeView({ recipe }: RecipeViewProps) {
  const [selectedImage, setSelectedImage] = useState(recipe.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80");

  const ingredientItems = Array.isArray(recipe.ingredientsJson)
    ? recipe.ingredientsJson
    : typeof recipe.ingredientsJson === 'string'
      ? JSON.parse(recipe.ingredientsJson)
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
    <div className="w-full bg-background min-h-screen pb-10">
      <article className="container mx-auto px-6 max-w-[1536px] pt-4">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-white/20">&gt;</span>
          <Link href="/recipes" className="hover:text-primary transition-colors">Recipes</Link>
          <span className="text-white/20">&gt;</span>
          <Link href={`/category/${recipe.categories?.[0]?.id || 1}`} className="hover:text-primary transition-colors">{recipe.categories?.[0]?.name || 'Category'}</Link>
          <span className="text-white/20">&gt;</span>
          <span className="text-white truncate max-w-[200px]">{recipe.title}</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-12">
          {/* Left: Image Gallery Area */}
          <div className="w-full lg:w-[55%] shrink-0 space-y-4">
            <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden shadow-2xl group border border-white/5">
              <Image
                src={selectedImage}
                alt={recipe.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-[2s]"
                priority
              />
              {/* Image Overlays */}
              <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 hover:bg-primary transition-all shadow-xl hover:scale-110">
                <Heart className="w-4 h-4" />
              </button>
              <div className="absolute bottom-6 left-6">
                <span className="px-5 py-2 rounded-full bg-primary text-[10px] font-black uppercase tracking-[0.15em] text-primary-foreground shadow-lg">
                  {recipe.categories?.[0]?.name || 'Dessert'}
                </span>
              </div>
              <div className="absolute bottom-6 right-6">
                <span className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/90 flex items-center gap-1.5 shadow-lg">
                  <Clock className="w-3.5 h-3.5 text-white/70" /> {recipe.cookTime || '0'}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery Slider */}
            {allImages.length > 1 && (
              <div className="relative group">
                {/* Left Arrow */}
                <button 
                  onClick={() => {
                    const currentIndex = allImages.indexOf(selectedImage);
                    const nextIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                    setSelectedImage(allImages[nextIndex]);
                    const el = document.getElementById('thumbnail-slider');
                    if (el) el.scrollBy({ left: -160, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary shadow-xl"
                >
                  <Plus className="w-4 h-4 rotate-[225deg]" />
                </button>

                <div 
                  id="thumbnail-slider"
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                >
                  {allImages.map((imgUrl, i) => (
                    <button 
                      key={i} 
                      id={`thumb-${i}`}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative flex-none w-[140px] aspect-[4/3] rounded-[24px] overflow-hidden border transition-all duration-300 snap-center ${
                        selectedImage === imgUrl 
                          ? 'border-primary ring-2 ring-primary/20 scale-95 shadow-2xl shadow-primary/20' 
                          : 'border-white/5 hover:border-primary/50 bg-card/30'
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${recipe.title} photo ${i + 1}`}
                        fill
                        className={`object-cover transition-opacity duration-300 ${
                          selectedImage === imgUrl ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Right Arrow */}
                <button 
                  onClick={() => {
                    const currentIndex = allImages.indexOf(selectedImage);
                    const nextIndex = (currentIndex + 1) % allImages.length;
                    setSelectedImage(allImages[nextIndex]);
                    const el = document.getElementById('thumbnail-slider');
                    if (el) el.scrollBy({ left: 160, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary shadow-xl"
                >
                   <Plus className="w-4 h-4 -rotate-45" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col justify-center flex-1 lg:max-w-[600px]">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.05] tracking-tighter mb-6 font-heading">
              {recipe.title}
            </h1>

            <p className="text-[15px] text-muted-foreground leading-relaxed font-medium mb-8">
              {recipe.summary || "No description provided."}
            </p>

            <div className="flex items-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary fill-primary drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <span className="text-xs font-bold text-white tracking-wide">4.8 <span className="text-muted-foreground font-medium ml-1">(324 reviews)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold text-white tracking-wide">{recipe.prepTime || '15'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                </div>
                <span className="text-xs font-bold text-white capitalize tracking-wide">{recipe.difficulty || 'Easy'}</span>
              </div>
            </div>

            <div className="flex items-center gap-8 border-t border-white/5 pt-6">
              <button className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-white hover:text-primary transition-colors group">
                <Share2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" /> Share
              </button>
              <button className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-white hover:text-primary transition-colors group">
                <Bookmark className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" /> Save
              </button>
              <button className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-white hover:text-primary transition-colors group">
                <Printer className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" /> Print
              </button>
            </div>
          </div>
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left: Article, Ingredients, Instructions */}
          <div className="lg:col-span-2 space-y-8">

            {/* About This Recipe (Article Content) */}
            <section className="prose prose-neutral dark:prose-invert max-w-none font-body">
              <h2 className="text-2xl font-black text-white tracking-tighter mb-4 font-heading not-prose">About This Recipe</h2>
              <div className="text-sm text-muted-foreground leading-loose font-medium">
                {recipe.content ? (
                  <BlogRenderer content={recipe.content} />
                ) : (
                  <p>No content available for this recipe.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">

            {/* Nutrition Information Card */}
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[24px] p-6 shadow-xl">
              <h3 className="text-xl font-black text-white tracking-tighter mb-1 font-heading">Nutrition Information</h3>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-6">(Per Serving)</p>

              <div className="space-y-1 mb-8">
                {[
                  { label: 'Calories', value: '520 kcal', icon: Flame },
                  { label: 'Protein', value: '18 g' },
                  { label: 'Carbohydrates', value: '54 g' },
                  { label: 'Fat', value: '28 g' },
                  { label: 'Fiber', value: '2 g' },
                ].map(nut => (
                  <div key={nut.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors">{nut.label}</span>
                    </div>
                    <span className="text-xs font-black text-white">{nut.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-5 border-t border-border/50">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</span>
                  </div>
                  <p className="text-[13px] font-bold text-white ml-3.5">{recipe.categories?.[0]?.name || 'Dinner'}</p>
                </div>
              </div>
            </div>

            {/* Sidebar Sponsored Card */}
            <DraggableSidebarAd />

            {/* Ingredients Box in Sidebar */}
            {ingredientItems.length > 0 && (
              <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[24px] p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                  <h3 className="text-xl font-black text-white tracking-tighter font-heading">Ingredients</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-background/80 border border-white/5 rounded-xl px-2 py-1">
                      <button className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-all"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-black text-white w-4 text-center">{recipe.servings || 4}</span>
                      <button className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-all"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
                <ul className="space-y-3">
                  {ingredientItems.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="text-[13px] font-medium text-white/80 leading-relaxed group-hover:text-white transition-colors">
                        <span className="font-bold text-white">{ing.quantity} {ing.unit}</span> {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
        {/* Footer Advertisement Banner */}
        <section className="mt-16 mb-8">
          <div className="relative w-full h-[180px] sm:h-[220px] rounded-[32px] overflow-hidden border border-white/5 group shadow-2xl">
            <Image 
              src="/cooking_ad_banner_1778463092338.png" 
              alt="Premium Kitchenware Advertisement" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-[5s]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 drop-shadow-lg">Sponsored</span>
              <h4 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4 max-w-[400px] font-heading drop-shadow-xl">
                Upgrade Your Kitchen With Premium Professional Tools
              </h4>
              <button className="w-fit px-8 py-3 rounded-full bg-primary text-[11px] font-black uppercase tracking-widest text-primary-foreground hover:bg-white hover:text-black transition-all shadow-xl active:scale-95">
                Shop Collection
              </button>
            </div>
            <div className="absolute top-4 right-6 text-[9px] font-bold text-white/40 uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
              Advertisement
            </div>
          </div>
        </section>

      </article>

    </div>
  );
}
