import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowRight, Clock, Users, Star, Search, ChevronRight, ChevronLeft, Heart, Play, Mail,
  CheckCircle, ShieldCheck, Zap, Sparkles, X, Coffee, Salad, CookingPot, Cake, Leaf,
  WheatOff, Timer, CupSoda, Soup, Waves, Utensils,
  Pizza, Sandwich, Apple, Fish, Croissant, Carrot, Flame, Tag, LayoutGrid
} from "lucide-react";
import { Footer } from '@/components/layout/Footer';
import { api } from "@/lib/api-client";
import FeaturedRecipes from "@/components/home/FeaturedRecipes";
import DraggableSponsoredCard from "@/components/home/DraggableSponsoredCard";
import TopArticlesSection from "@/components/home/TopArticlesSection";
import { HeroSlider } from "@/components/home/HeroSlider";
import { cn } from "@/lib/utils";

interface HomePageProps {
  searchParams: Promise<{ page?: string; category?: string; tab?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  const categories = await api.categories.list().catch((err) => {
    console.error('Error fetching categories:', err);
    return [];
  });

  const recipesResponse = await api.recipes.list({ limit: 100 }).catch((err) => {
    console.error('Error fetching recipes:', err);
    return { data: [] };
  });
  const recipes = recipesResponse.data || [];

  const topRecipesResponse = await api.recipes.list({ limit: 12, topArticle: true }).catch((err) => {
    console.error('Error fetching top recipes:', err);
    return { data: [] };
  });
  const topRecipes = topRecipesResponse.data || [];

  const articles = await api.articles.list({ limit: 12 }).catch((err) => {
    console.error('Error fetching articles:', err);
    return [];
  });

  const heroSettings = await api.settings.getHero().catch((err) => {
    console.error('Error fetching hero settings:', err);
    return {
      title: "Good Food, Good Mood",
      subtitle: "Explore thousands of handpicked recipes from around the world.",
      ctaText: "Explore Recipes",
      imageUrl: null,
      images: []
    };
  });

  const stats = [
    { label: 'Recipes', value: '15K+', icon: Zap },
    { label: 'Happy Users', value: '500K+', icon: Users },
    { label: 'Categories', value: '50+', icon: Sparkles },
    { label: 'Saved Recipes', value: '100K+', icon: Heart },
  ];

  return (
    <div className="w-full bg-background text-foreground pb-6">

      {/* 1. Hero Slider Section */}
      <section className="relative w-full h-[45vh] min-h-[300px] border-b border-white/5 mb-16 bg-black">
        <HeroSlider
          images={heroSettings.images || []}
          fallbackImage={heroSettings.imageUrl}
        />
      </section>

      {/* 2. Explore by Category */}
      <section className="container mx-auto px-6 max-w-[1536px] py-2 border-t border-border">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-1 leading-none font-heading">Explore by Category</h2>
          </div>
          <Link href="/categories" className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em] group hover:text-white transition-colors">
            View all categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative group/nav">
          {/* Navigation Arrows */}
          <button className="absolute -left-6 top-[40%] -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex justify-start md:justify-center gap-4 overflow-x-auto pb-1 scrollbar-hide px-4">
            {categories.map((cat, i) => {
              const availableIcons: Record<string, any> = {
                Utensils, Coffee, Pizza, Sandwich, Cake, Leaf,
                Apple, Fish, Croissant, Carrot, Soup, CupSoda,
                Flame, Star, Heart, Clock, Tag, LayoutGrid
              };

              const fallbackIconMap: Record<string, any> = {
                'breakfast': Coffee,
                'lunch': Utensils,
                'dinner': CookingPot,
                'desserts': Cake,
                'vegan': Leaf,
                'gluten free': WheatOff,
                'quick & easy': Timer,
                'drinks': CupSoda,
                'salads': Salad,
                'soup': Soup,
              };

              const nameLower = cat.name.toLowerCase();

              let Icon = CookingPot;
              if (cat.icon && availableIcons[cat.icon]) {
                Icon = availableIcons[cat.icon];
              } else if (fallbackIconMap[nameLower]) {
                Icon = fallbackIconMap[nameLower];
              }

              const isGF = nameLower.includes('gluten free');
              const isQuick = nameLower.includes('quick');
              const isSelected = resolvedParams.category === cat.id.toString();
              const href = isSelected ? '/' : `/?category=${cat.id}`;

              return (
                <Link
                  key={cat.id || i}
                  href={href}
                  scroll={false}
                  className="flex flex-col items-center gap-2.5 group cursor-pointer min-w-[85px]"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110",
                    isSelected
                      ? "bg-primary/10 border border-primary shadow-lg shadow-primary/20"
                      : "bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.05] group-hover:border-primary/30"
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Icon className={cn(
                      "w-[26px] h-[26px] stroke-[1.5px] transition-transform duration-500 group-hover:scale-110",
                      isSelected ? "text-primary scale-110" : "text-primary/70 group-hover:text-primary"
                    )} />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <span className={cn(
                      "text-[11px] font-black uppercase tracking-[0.08em] transition-colors leading-none",
                      isSelected ? "text-primary" : "text-white/80 group-hover:text-primary"
                    )}>{cat.name}</span>
                    {isGF && (
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">GF</span>
                    )}
                    {isQuick && (
                      <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <button className="absolute -right-6 top-[40%] -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      <FeaturedRecipes recipes={recipes} selectedCategoryId={resolvedParams.category} />

      <TopArticlesSection
        items={[...topRecipes, ...articles]}
        title="Top Articles"
        subtitle="Deep dives into nutrition and lifestyle."
      />

      {/* 5. Why Choose Tasteful? */}
      <section className="container mx-auto px-6 max-w-[1536px] py-6 border-t border-border">
        <h2 className="text-2xl font-black text-white tracking-tighter mb-6 leading-none">Why Choose Tasteful?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          {[
            { title: 'Handpicked Recipes', desc: 'Only the best recipes.', icon: Sparkles },
            { title: 'Healthy & Delicious', desc: 'Nutritious & tasty.', icon: Heart },
            { title: 'Easy to Follow', desc: 'Step-by-step results.', icon: ShieldCheck },
            { title: 'Community Loved', desc: 'Join our food lovers.', icon: Users },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-card border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-black text-xs text-white mb-0.5 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-[9px] text-muted-foreground leading-relaxed font-medium max-w-[150px]">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Professional Ad Banner Section */}
      <section className="container mx-auto px-6 max-w-[1536px] pb-8 pt-4">
        <div className="relative bg-gradient-to-r from-card/80 via-card/95 to-card/80 border border-primary/10 hover:border-primary/30 rounded-3xl overflow-hidden flex flex-col lg:flex-row items-stretch shadow-[0_0_50px_rgba(234,179,8,0.03)] hover:shadow-[0_0_50px_rgba(234,179,8,0.08)] transition-all duration-700 group">
          {/* Left Image Section */}
          <div className="lg:w-[26%] relative min-h-[220px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
              alt="Culinary Masterclass"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[8s]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/40 to-card"></div>
            <span className="bg-primary text-primary-foreground text-[8px] font-black tracking-[0.25em] px-4 py-2 rounded-full uppercase absolute top-6 left-6 shadow-2xl backdrop-blur-md border border-white/10 animate-pulse">
              EXCLUSIVE PASS
            </span>
          </div>

          {/* Middle Content Section */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-[0.25em] text-primary mb-4 w-fit">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" /> SPONSORED PROMOTION
            </span>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-3 leading-tight font-heading">
              Culinary Masterclass <span className="text-primary">With Michelin-Star Chefs</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mb-8 max-w-xl leading-relaxed font-medium">
              Transform your cooking skills with 150+ ultra-HD video masterclasses. Learn professional culinary secrets, plating techniques, and recipe composition from legendary chefs.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md bg-background/60 backdrop-blur-md border border-white/5 rounded-2xl p-1.5 focus-within:border-primary/40 transition-all">
              <input
                type="email"
                placeholder="Enter email address"
                className="flex-1 bg-transparent px-4 py-3 text-[11px] text-white placeholder:text-muted-foreground/30 outline-none"
              />
              <button className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                Claim 30% Off <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Benefits Section */}
          <div className="lg:w-[32%] bg-white/[0.01] p-8 lg:p-12 flex flex-col justify-center gap-8 border-t lg:border-t-0 lg:border-l border-white/5">
            {[
              { title: '150+ HD Video Lessons', desc: 'Watch on any device, anytime', icon: Play },
              { title: 'Michelin Pro Secrets', desc: 'Expert techniques made simple', icon: Sparkles },
              { title: '30-Day Cooking Guarantee', desc: 'Unlock elite skills or full refund', icon: ShieldCheck },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all duration-500 shadow-md">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[12px] font-black text-white mb-1 tracking-tight leading-none group-hover/item:text-primary transition-colors">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium leading-tight">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Maximized Sticky Announcement Bar */}
      <DraggableSponsoredCard />
    </div>
  );
}
