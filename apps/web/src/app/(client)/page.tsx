import Link from "next/link";
import {
  ArrowRight, Clock, Users, Star, Search, ChevronRight, ChevronLeft, Heart, Play, Mail,
  CheckCircle, ShieldCheck, Zap, Sparkles, X, Coffee, Salad, CookingPot, Cake, Leaf,
  WheatOff, Timer, CupSoda, Soup, Waves, Utensils
} from "lucide-react";
import { Footer } from '@/components/layout/Footer';
import { api } from "@/lib/api-client";
import FeaturedRecipes from "@/components/home/FeaturedRecipes";
import DraggableSponsoredCard from "@/components/home/DraggableSponsoredCard";
import TopArticlesSection from "@/components/home/TopArticlesSection";

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  const categories = await api.categories.list().catch((err) => {
    console.error('Error fetching categories:', err);
    return [];
  });

  const recipesResponse = await api.recipes.list({ limit: 20, featured: true }).catch((err) => {
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
      imageUrl: null
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

      {/* 1. Hero Section */}
      <section className="container mx-auto px-6 max-w-[1536px] pt-4 pb-10">
        <div className="relative w-full min-h-[500px] lg:min-h-[560px] flex items-center py-16 px-8 lg:px-16 rounded-3xl border border-white/5 shadow-2xl">
          {/* Full Width Background Image & Overlays inside the container */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
            <img
              src={heroSettings.imageUrl || "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1920&q=80"}
              alt="Hero Background"
              className="w-full h-full object-cover scale-105 animate-slow-pan"
            />
            {/* Base darkening for contrast */}
            <div className="absolute inset-0 bg-background/40"></div>
            {/* Gradient and blur focusing on the left text area */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-3/4 bg-gradient-to-r from-background via-background/90 to-transparent backdrop-blur-md"></div>
          </div>

          <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
            {/* Left Hero Content */}
            <div className="w-full lg:w-3/5 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1 rounded-full mb-4 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Discover healthy & delicious recipes</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black text-white leading-[0.95] tracking-tighter mb-4 drop-shadow-2xl">
                {heroSettings.title.split(',')[0]}<span className="text-primary">,</span><br />
                <span className="text-primary">{heroSettings.title.split(',')[1] || heroSettings.title}</span>
              </h1>

              <p className="mt-2 text-sm text-white/80 max-w-md leading-relaxed font-medium drop-shadow-md">
                {heroSettings.subtitle}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/recipes"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-2xl hover:-translate-y-1 hover:shadow-primary/30 flex items-center gap-3 group/btn"
                >
                  <span>{heroSettings.ctaText || "Explore Recipes"}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-card overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Join 500k+ foodies</span>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full pt-6 border-t border-white/10">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex flex-col gap-0.5 group">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-primary drop-shadow-md" />
                      <span className="text-xl font-black text-white tracking-tighter drop-shadow-lg">{value}</span>
                    </div>
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] ml-5.5">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Sponsored Card (Floating over the image) */}
            <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
              <DraggableSponsoredCard />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Explore by Category */}
      <section className="container mx-auto px-6 max-w-[1536px] py-2 border-t border-border">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-1 leading-none font-heading">Explore by Category</h2>
          </div>
          <Link href="/categories" className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] group hover:text-white transition-colors">
            View all categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative group/nav">
          {/* Navigation Arrows */}
          <button className="absolute -left-6 top-[40%] -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide px-4">
            {categories.map((cat, i) => {
              const iconMap: Record<string, any> = {
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
              const Icon = iconMap[nameLower] || CookingPot; // Default cloche icon
              const isGF = nameLower.includes('gluten free');
              const isQuick = nameLower.includes('quick');

              return (
                <Link key={cat.id || i} href={`/categories/${cat.id}`} className="flex flex-col items-center gap-1.5 group cursor-pointer min-w-[70px]">
                  <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:bg-white/[0.05] group-hover:border-primary/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Icon className="w-5 h-5 text-primary stroke-[1.5px] transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-center">
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.1em] group-hover:text-primary transition-colors leading-none">{cat.name}</span>
                    {isGF && (
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">GF</span>
                    )}
                    {isQuick && (
                      <Zap className="w-3 h-3 text-primary animate-pulse" />
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

      <FeaturedRecipes recipes={recipes} />

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
      <div className="fixed bottom-0 left-0 w-full z-[100] bg-white/10 backdrop-blur-2xl border-t border-border py-8 overflow-hidden shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-20">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex items-center gap-6">
              <span className="text-[14px] font-black text-white uppercase tracking-[0.4em]">
                NEW HEALTHY RECIPES EVERY WEEK • JOIN 10,000+ FOOD LOVERS • GET 20% OFF PREMIUM COOKWARE • PREMIUM CULINARY GUIDES NOW AVAILABLE •
              </span>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
