import Link from "next/link";
export const revalidate = 60;
import {
  ArrowRight, Clock, Users, Star, Search, ChevronRight, ChevronLeft, Heart, Play, Mail,
  CheckCircle, ShieldCheck, Zap, Sparkles, X, Coffee, Salad, CookingPot, Cake, Leaf,
  WheatOff, Timer, CupSoda, Soup, Waves, Utensils,
  Pizza, Sandwich, Apple, Fish, Croissant, Carrot, Flame, Tag, LayoutGrid
} from "lucide-react";
import { Footer } from '@/components/layout/Footer';
import { api } from "@/lib/api-client";
import FeaturedRecipes from "@/components/home/FeaturedRecipes";
import TopArticlesSection from "@/components/home/TopArticlesSection";
import { HeroSlider } from "@/components/home/HeroSlider";
import { cn } from "@/lib/utils";
import Image from "next/image";
import DraggableSponsoredCard from "@/components/home/DraggableSponsoredCard";

export default async function HomePage() {

  const [
    categories,
    recipesResponse,
    topRecipesResponse,
    articles,
    heroSettings
  ] = await Promise.all([
    api.categories.list().catch((err) => {
      console.error('Error fetching categories:', err);
      return [];
    }),
    api.recipes.list({ limit: 15 }).catch((err) => {
      console.error('Error fetching recipes:', err);
      return { data: [] };
    }),
    api.recipes.list({ limit: 12, topArticle: true }).catch((err) => {
      console.error('Error fetching top recipes:', err);
      return { data: [] };
    }),
    api.articles.list({ limit: 12 }).catch((err) => {
      console.error('Error fetching articles:', err);
      return [];
    }),
    api.settings.getHero().catch((err) => {
      console.error('Error fetching hero settings:', err);
      return {
        title: "Good Food, Good Mood",
        subtitle: "Explore thousands of handpicked recipes from around the world.",
        ctaText: "Explore Recipes",
        imageUrl: null,
        images: []
      };
    })
  ]);

  const recipes = recipesResponse.data || [];
  const topRecipes = topRecipesResponse.data || [];

  const stats = [
    { label: 'Recipes', value: '15K+', icon: Zap },
    { label: 'Happy Users', value: '500K+', icon: Users },
    { label: 'Categories', value: '50+', icon: Sparkles },
    { label: 'Saved Recipes', value: '100K+', icon: Heart },
  ];

  return (
    <div className="w-full bg-background text-foreground pb-0 sm:pb-6">

      {/* 1. Hero Slider Section */}
      <section className="relative w-full h-[25vh] min-h-[180px] sm:h-[45vh] sm:min-h-[300px] border-b border-white/5 mb-8 sm:mb-16 bg-black">
        <HeroSlider
          images={heroSettings.images || []}
          fallbackImage={heroSettings.imageUrl}
        />
      </section>

      {/* 2. Explore by Category */}
      <section className="container mx-auto px-3 sm:px-6 max-w-[1536px] py-8 sm:py-4 border-t border-border">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-sm xs:text-base sm:text-3xl font-black text-white tracking-tight leading-none font-heading">Explore by Category</h2>
          </div>
          <Link href="/categories" className="flex items-center gap-1.5 text-[9px] sm:text-xs font-black text-primary uppercase tracking-wider sm:tracking-[0.2em] group hover:text-white transition-colors shrink-0">
            View all categories
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative group/nav">
          {/* Navigation Arrows */}
          <button className="hidden md:flex absolute -left-6 top-[40%] -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/10 bg-white/5 items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-nowrap justify-start md:justify-center gap-4 overflow-x-auto pb-2 scrollbar-hide px-0">
            {categories.map((cat, i) => {
              const availableIcons: Record<string, any> = {
                Utensils, Coffee, Pizza, Sandwich, Cake, Leaf,
                Apple, Fish, Croissant, Carrot, Soup, CupSoda,
                Flame, Star, Heart, Clock, Tag, LayoutGrid,
                CookingPot, Salad, WheatOff, Timer
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
              const matchedIconKey = cat.icon ? Object.keys(availableIcons).find(
                key => key.toLowerCase() === cat.icon?.toLowerCase()
              ) : null;

              if (matchedIconKey && availableIcons[matchedIconKey]) {
                Icon = availableIcons[matchedIconKey];
              } else if (fallbackIconMap[nameLower]) {
                Icon = fallbackIconMap[nameLower];
              }

              const isGF = nameLower.includes('gluten free');
              const isQuick = nameLower.includes('quick');
              const href = `/category/${cat.slug}`;

              return (
                <Link
                  key={cat.id || i}
                  href={href}
                  className="flex flex-col items-center gap-1.5 sm:gap-2.5 group cursor-pointer min-w-[70px] sm:min-w-[85px] shrink-0"
                >
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110",
                    "bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.05] group-hover:border-primary/30"
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Icon className={cn(
                      "w-5 h-5 sm:w-[26px] sm:h-[26px] stroke-[1.5px] transition-transform duration-500 group-hover:scale-110",
                      "text-primary/70 group-hover:text-primary"
                    )} />
                  </div>
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1.5 text-center">
                    <span className={cn(
                      "text-[9px] sm:text-[11px] font-black uppercase tracking-[0.08em] transition-colors leading-tight text-center max-w-[70px] sm:max-w-[85px] line-clamp-2",
                      "text-white/80 group-hover:text-primary"
                    )}>{cat.name}</span>
                    {isGF && (
                      <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">GF</span>
                    )}
                    {isQuick && (
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary animate-pulse" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <button className="hidden md:flex absolute -right-6 top-[40%] -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/10 bg-white/5 items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
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
      <section className="container mx-auto px-3 sm:px-6 max-w-[1536px] py-8 sm:py-6 border-t border-border">
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tighter mb-6 leading-none font-heading">Why Choose Tasteful?</h2>

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
      <section className="container mx-auto px-3 sm:px-6 max-w-[1536px] pb-8 sm:pb-8 pt-8 sm:pt-4">
        <div className="relative bg-gradient-to-r from-card/80 via-card/95 to-card/80 border border-primary/10 hover:border-primary/30 rounded-2xl sm:rounded-[32px] overflow-hidden flex flex-col lg:flex-row items-stretch shadow-[0_0_50px_rgba(234,179,8,0.03)] hover:shadow-[0_0_50px_rgba(234,179,8,0.08)] transition-all duration-700 group">
          {/* Left Image Section */}
          <div className="lg:w-[26%] relative min-h-[220px] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
              alt="Culinary Masterclass"
              fill
              sizes="(max-width: 1024px) 100vw, 26vw"
              className="object-cover group-hover:scale-105 transition-transform duration-[8s]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/40 to-card"></div>
            <span className="bg-primary text-primary-foreground text-[8px] font-black tracking-[0.25em] px-4 py-2 rounded-full uppercase absolute top-6 left-6 shadow-2xl backdrop-blur-md border border-white/10 animate-pulse">
              EXCLUSIVE PASS
            </span>
          </div>

          {/* Middle Content Section */}
          <div className="flex-1 p-5 sm:p-8 lg:p-12 flex flex-col justify-center">
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
          <div className="lg:w-[32%] bg-white/[0.01] p-5 sm:p-8 lg:p-12 flex flex-col justify-center gap-5 sm:gap-8 border-t lg:border-t-0 lg:border-l border-white/5">
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
