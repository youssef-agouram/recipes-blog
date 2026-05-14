'use client';

import { Clock, Star, Share2, Bookmark, Printer, Heart, Minus, Plus, Flame, CheckCircle2, ChevronRight, PlayCircle, Apple } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BlogRenderer from '@/components/BlogRenderer';
import DraggableSidebarAd from "@/components/recipes/DraggableSidebarAd";
import CommentsSection from "@/components/recipes/CommentsSection";
import { Recipe } from "@/lib/types";

import { useState, useEffect } from "react";

interface RecipeViewProps {
  recipe: Recipe;
  relatedRecipes?: React.ReactNode;
}

export default function RecipeView({ recipe, relatedRecipes }: RecipeViewProps) {
  const [selectedImage, setSelectedImage] = useState(recipe.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80");
  const [servings, setServings] = useState(recipe.servings || 4);

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
    <div className="w-full bg-background min-h-screen pb-20">
      <article className="container mx-auto px-6 max-w-[1536px] pt-4">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <Link href="/recipes" className="hover:text-primary transition-colors">Recipes</Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <Link href={`/category/${recipe.categories?.[0]?.id || 1}`} className="hover:text-primary transition-colors">{recipe.categories?.[0]?.name || 'Category'}</Link>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <span className="text-white truncate max-w-[200px]">{recipe.title}</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-start gap-12 mb-16 animate-in fade-in duration-1000">
          {/* Left: Image Gallery Area */}
          <div className="w-full lg:w-[60%] space-y-6">
            <div className="relative aspect-[16/10] rounded-[48px] overflow-hidden shadow-2xl group border border-white/5">
              <Image
                src={selectedImage}
                alt={recipe.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-[3s]"
                priority
              />
              {/* Image Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <button className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/90 hover:bg-primary hover:text-primary-foreground transition-all shadow-2xl hover:scale-110 group/heart active:scale-95">
                <Heart className="w-6 h-6 group-hover/heart:fill-current" />
              </button>

              <div className="absolute bottom-8 left-8 flex items-center gap-4">
                <span className="px-6 py-2.5 rounded-2xl bg-primary text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20">
                  {recipe.categories?.[0]?.name || 'Recipe'}
                </span>
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

            {/* Thumbnail Gallery Slider */}
            {allImages.length > 1 && (
              <div className="relative group/gallery px-4">
                <div
                  id="thumbnail-slider"
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                >
                  {allImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      id={`thumb-${i}`}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative flex-none w-[160px] aspect-[4/3] rounded-[32px] overflow-hidden border transition-all duration-500 snap-center ${selectedImage === imgUrl
                          ? 'border-primary ring-4 ring-primary/20 scale-95 shadow-2xl'
                          : 'border-white/5 hover:border-primary/50 grayscale hover:grayscale-0 opacity-40 hover:opacity-100'
                        }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${recipe.title} photo ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col flex-1 w-full lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-white/10 overflow-hidden">
                    <Image src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" width={24} height={24} />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loved by 1.2k people</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black text-white leading-[0.95] tracking-tighter mb-8 font-heading drop-shadow-2xl">
              {recipe.title}
            </h1>

            <p className="text-[16px] text-muted-foreground leading-relaxed font-medium mb-10 max-w-xl">
              {recipe.summary || "Embark on a culinary journey with this masterpiece. Perfectly balanced flavors and textures that will leave your guests in awe."}
            </p>

            <div className="grid grid-cols-3 gap-8 mb-10 pb-10 border-b border-white/5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-lg font-black text-white">4.8</span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">324 Reviews</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="text-lg font-black text-white">{recipe.nutrition?.calories || 450}</span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Calories</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-lg font-black text-white capitalize">{recipe.difficulty || 'Easy'}</span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Difficulty</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="flex-1 min-w-[160px] bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-2xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3">
                <Printer className="w-4 h-4" /> Print Recipe
              </button>
              <div className="flex items-center gap-2">
                {[Share2, Bookmark].map((Icon, i) => (
                  <button key={i} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-primary/50 transition-all active:scale-90">
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Content Area (8 cols) */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Content / Story */}
            <section className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="flex items-center gap-3 mb-8 not-prose">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                <h2 className="text-3xl font-black text-white tracking-tighter font-heading">About This Recipe</h2>
              </div>
              <div className="text-[17px] text-muted-foreground leading-relaxed font-medium">
                {recipe.content ? (
                  <BlogRenderer content={recipe.content} />
                ) : (
                  <p>Master this delicious dish with our step-by-step guide and expert culinary tips. We've simplified the process to ensure professional results at home.</p>
                )}
              </div>
            </section>

            {/* Community Feedback */}
            <CommentsSection recipeId={recipe.id} />

          </div>

          {/* Right Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-24 h-fit">
            
            {/* Ingredients Sidebar */}
            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter font-heading">Ingredients</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">For {servings} Servings</p>
                </div>
                <div className="flex items-center gap-3 bg-background/50 border border-white/5 rounded-2xl p-1.5">
                  <button 
                    onClick={() => setServings(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all active:scale-90"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-black text-white w-6 text-center">{servings}</span>
                  <button 
                    onClick={() => setServings(prev => prev + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <ul className="space-y-4">
                {ingredientItems.map((ing: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 group cursor-pointer">
                    <div className="mt-1.5 w-4 h-4 rounded border border-white/10 flex items-center justify-center transition-all group-hover:border-primary group-hover:bg-primary/10">
                      <div className="w-1.5 h-1.5 rounded-sm bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[14px] font-medium text-white/70 leading-relaxed group-hover:text-white transition-colors">
                      <span className="font-bold text-white">{ing.quantity} {ing.unit}</span> {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full mt-10 py-4 rounded-[20px] bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-all group">
                Add All To Cart <ChevronRight className="inline w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Cooking Instructions (In Sidebar) */}
            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <PlayCircle className="w-20 h-20 text-white" />
              </div>
              
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter font-heading">Instructions</h3>
              </div>

              <div className="space-y-8">
                {[
                  { step: 1, title: "Prepare Base", desc: "Chop aromatics and heat pan over medium." },
                  { step: 2, title: "Initial Searing", desc: "Sear ingredients until golden brown." },
                  { step: 3, title: "Simmer & Infuse", desc: "Add liquid and simmer for 15-20 min." },
                  { step: 4, title: "Final Garnish", desc: "Adjust seasoning and add fresh herbs." }
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 group/step">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black text-white group-hover/step:border-primary group-hover/step:text-primary transition-all">
                        {s.step}
                      </div>
                      <div className="flex-1 w-px bg-white/5 my-2 group-last/step:hidden" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h4 className="text-[13px] font-black text-white mb-1 tracking-tight group-hover/step:text-primary transition-colors">{s.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Information */}
            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  <Apple className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tighter font-heading">Nutrition Info</h3>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Per Serving Estimation</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Protein', value: `${recipe.nutrition?.protein || '24g'}`, color: 'text-blue-400' },
                  { label: 'Carbs', value: `${recipe.nutrition?.carbohydrates || '38g'}`, color: 'text-amber-400' },
                  { label: 'Fat', value: `${recipe.nutrition?.fat || '12g'}`, color: 'text-red-400' },
                  { label: 'Fiber', value: `${recipe.nutrition?.fiber || '6g'}`, color: 'text-emerald-400' },
                ].map(nut => (
                  <div key={nut.label} className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">{nut.label}</span>
                    <span className={`text-xl font-black ${nut.color}`}>{nut.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <DraggableSidebarAd />
          </aside>
        </div>

        {/* Related Recipes Section */}
        {relatedRecipes}

        {/* Footer Ad Banner */}
        <section className="mt-24">
          <div className="relative w-full h-[240px] sm:h-[300px] rounded-[56px] overflow-hidden border border-white/5 group shadow-2xl">
            <Image
              src="/cooking_ad_banner_1778463092338.png"
              alt="Ad Banner"
              fill
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
    </div>
  );
}
