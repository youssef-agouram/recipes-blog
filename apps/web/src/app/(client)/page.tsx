import Link from "next/link";
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

      {/* 6. Newsletter */}
      <section className="container mx-auto px-6 max-w-[1536px] pb-6 pt-4">
        <div className="relative bg-card border border-border rounded-xl overflow-hidden flex flex-col lg:flex-row items-stretch shadow-2xl">
          {/* Left Image Section */}
          <div className="lg:w-[22%] relative min-h-[150px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
              alt="Ingredients"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-background"></div>
          </div>

          {/* Middle Content Section */}
          <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
            <h2 className="text-xl font-black text-white tracking-tighter mb-2 leading-none">Join Our Newsletter</h2>
            <p className="text-[10px] text-muted-foreground mb-6 max-w-md leading-relaxed font-medium">
              Latest recipes and exclusive offers.
            </p>

            <div className="flex w-full max-w-md bg-background border border-border rounded-xl overflow-hidden p-1 focus-within:border-primary transition-all">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-transparent px-4 py-2 text-[11px] text-white placeholder:text-muted-foreground/30 outline-none"
              />
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-black text-[8px] uppercase tracking-[0.15em] hover:bg-primary/90 transition-all">
                Subscribe
              </button>
            </div>
          </div>

          {/* Right Benefits Section */}
          <div className="lg:w-[32%] bg-white/[0.01] p-8 lg:p-10 flex flex-col justify-center gap-6 border-l border-border">
            {[
              { title: 'Weekly new recipes', desc: 'Fresh every week', icon: Mail },
              { title: 'Exclusive tips', desc: 'Cooking hacks', icon: Sparkles },
              { title: 'No spam', desc: 'Unsubscribe anytime', icon: CheckCircle },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[11px] font-black text-white mb-0.5 tracking-tight leading-none">{item.title}</h4>
                    <p className="text-[9px] text-muted-foreground font-medium leading-tight">{item.desc}</p>
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
