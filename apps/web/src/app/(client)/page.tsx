import Link from "next/link";
export const revalidate = 60;
import dynamic from "next/dynamic";
import {
  Users, ChevronRight, Heart, Play, ShieldCheck, Zap, Sparkles
} from "lucide-react";
import { api } from "@/lib/api-client";
import { HeroSlider } from "@/components/home/HeroSlider";
import Image from "next/image";

// Dynamic imports for below-the-fold heavy components
const FeaturedRecipes = dynamic(() => import("@/components/home/FeaturedRecipes"), {
  loading: () => <div className="container mx-auto px-3 sm:px-6 max-w-[1536px] py-8"><div className="h-96 bg-card/10 rounded-[32px] animate-pulse" /></div>,
});
const TopArticlesSection = dynamic(() => import("@/components/home/TopArticlesSection"), {
  loading: () => <div className="container mx-auto px-3 sm:px-6 max-w-[1536px] py-8"><div className="h-96 bg-card/10 rounded-[32px] animate-pulse" /></div>,
});
const CategoriesSlider = dynamic(() => import("@/components/home/CategoriesSlider"), {
  loading: () => <div className="h-24 bg-card/10 rounded-2xl animate-pulse" />,
});
const DraggableSponsoredCard = dynamic(() => import("@/components/home/DraggableSponsoredCard"));

export default async function HomePage() {

  const [
    categories,
    recipesResponse,
    topRecipesResponse,
    articles,
    heroSettings,
    siteSettings
  ] = await Promise.all([
    api.categories.list().catch((err) => {
      console.error('Error fetching categories:', err);
      return [];
    }),
    api.recipes.list({ limit: 10 }).catch((err) => {
      console.error('Error fetching recipes:', err);
      return { data: [] };
    }),
    api.recipes.list({ limit: 6, topArticle: true }).catch((err) => {
      console.error('Error fetching top recipes:', err);
      return { data: [] };
    }),
    api.articles.list({ limit: 6 }).catch((err) => {
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
    }),
    api.settings.getSite().catch((err) => {
      console.error('Error fetching site settings:', err);
      return {};
    })
  ]);

  const recipes = recipesResponse.data || [];
  const topRecipes = topRecipesResponse.data || [];

  const homePageSettings = (siteSettings as any)?.homePageSettings || {};

  const whyChooseTitle = homePageSettings.whyChooseTitle || 'Why Choose Tasteful?';
  const featureCards = homePageSettings.featureCards || [
    { icon: 'Sparkles', title: 'Handpicked Recipes', desc: 'Only the best recipes.' },
    { icon: 'Heart', title: 'Healthy & Delicious', desc: 'Nutritious & tasty.' },
    { icon: 'ShieldCheck', title: 'Easy to Follow', desc: 'Step-by-step results.' },
    { icon: 'Users', title: 'Community Loved', desc: 'Join our food lovers.' },
  ];
  const promoBanner = homePageSettings.promoBanner || {};

  const stats = [
    { label: 'Recipes', value: '15K+', icon: Zap },
    { label: 'Happy Users', value: '500K+', icon: Users },
    { label: 'Categories', value: '50+', icon: Sparkles },
    { label: 'Saved Recipes', value: '100K+', icon: Heart },
  ];

  // Map icon name strings to actual icon components
  const iconMap: Record<string, any> = { Sparkles, Heart, ShieldCheck, Users, Zap, Play };
  const getIcon = (name: string) => iconMap[name] || Sparkles;

  return (
    <div className="w-full bg-background text-foreground pb-0 sm:pb-6">

      {/* 1. Hero Slider Section */}
      <section className="relative w-full h-[35vh] min-h-[260px] sm:h-[60vh] sm:min-h-[500px] border-b border-white/5 mb-8 sm:mb-16 bg-black">
        <HeroSlider
          images={heroSettings.images || []}
          fallbackImage={heroSettings.imageUrl}
        />
        {/* Dynamic Centered Cinematic Glass Card Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-6 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none">
          <div className="max-w-xl sm:max-w-2xl bg-black/60 backdrop-blur-md border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-[0_24px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Badge */}
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f29e1f]/10 border border-[#f29e1f]/20 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#f29e1f] w-fit">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Recipes
            </span>

            {/* Title */}
            {heroSettings.titlePart1 || heroSettings.title ? (
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight font-heading leading-[1.15]">
                <span style={{ color: heroSettings.titleColor1 || '#ffffff' }}>
                  {heroSettings.titlePart1 || (heroSettings.title?.includes(',') ? heroSettings.title.substring(0, heroSettings.title.indexOf(',') + 1) : heroSettings.title)}
                </span>
                {` `}
                <span style={{ color: heroSettings.titleColor2 || '#f29e1f' }}>
                  {heroSettings.titlePart2 || (heroSettings.title?.includes(',') ? heroSettings.title.substring(heroSettings.title.indexOf(',') + 1).trim() : '')}
                </span>
              </h1>
            ) : null}

            {/* Subtitle */}
            {heroSettings.subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-white/70 font-medium leading-relaxed max-w-lg">
                {heroSettings.subtitle}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/recipes" className="flex items-center gap-2 px-6 py-3 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-lg shadow-[#5850ec]/20 hover:shadow-[#5850ec]/30 hover:-translate-y-0.5 active:scale-95">
                <span>Explore Recipes</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/categories" className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-black rounded-xl transition-all hover:-translate-y-0.5 active:scale-95">
                <span>Categories</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Explore by Category */}
      <section className="container mx-auto px-3 sm:px-6 max-w-[1536px] py-4 sm:py-6 border-t border-border">
        <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
          <div>
            <h2 className="text-sm xs:text-base sm:text-3xl font-black text-white tracking-tight leading-none font-heading">Explore by Category</h2>
          </div>
          <Link href="/categories" className="hidden sm:flex items-center gap-1.5 text-[9px] sm:text-xs font-black text-primary uppercase tracking-wider sm:tracking-[0.2em] group hover:text-white transition-colors shrink-0">
            View all categories
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <CategoriesSlider categories={categories} />
      </section>

      <FeaturedRecipes recipes={recipes} />

      <TopArticlesSection
        items={[...topRecipes, ...articles]}
        title="Top Articles"
        subtitle="Deep dives into nutrition and lifestyle."
      />

      {/* 5. Why Choose Tasteful? */}
      <section className="container mx-auto px-3 sm:px-6 max-w-[1536px] py-8 sm:py-6 border-t border-border">
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tighter mb-6 leading-none font-heading">{whyChooseTitle}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          {featureCards.map((item: any, i: number) => {
            const Icon = getIcon(item.icon);
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

      <section className="container mx-auto px-3 sm:px-6 max-w-[1536px] pb-8 sm:pb-8 pt-8 sm:pt-4">
        <div className="relative bg-gradient-to-r from-card/80 via-card/95 to-card/80 border border-primary/10 hover:border-primary/30 rounded-2xl sm:rounded-[22px] overflow-hidden flex flex-col lg:flex-row items-stretch shadow-[0_0_50px_rgba(234,179,8,0.03)] hover:shadow-[0_0_50px_rgba(234,179,8,0.08)] transition-all duration-700 group">
          {/* Left Image Section */}
          <div className="lg:w-[26%] relative min-h-[220px] overflow-hidden">
            <Image
              src={promoBanner.imageUrl || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"}
              alt={promoBanner.titlePart1 || "Culinary Masterclass"}
              fill
              sizes="(max-width: 1024px) 100vw, 26vw"
              className="object-cover group-hover:scale-105 transition-transform duration-[8s]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/40 to-card"></div>
            <span className="bg-primary text-primary-foreground text-[8px] font-black tracking-[0.25em] px-4 py-2 rounded-full uppercase absolute top-6 left-6 shadow-2xl backdrop-blur-md border border-white/10 animate-pulse">
              {promoBanner.exclusiveLabel || 'EXCLUSIVE PASS'}
            </span>
          </div>

          {/* Middle Content Section */}
          <div className="flex-1 p-5 sm:p-8 lg:p-12 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-[0.25em] text-primary mb-4 w-fit">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" /> {promoBanner.badgeText || 'SPONSORED PROMOTION'}
            </span>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-3 leading-tight font-heading">
              {promoBanner.titlePart1 || 'Culinary Masterclass '}<span className="text-primary">{promoBanner.titlePart2 || 'With Michelin-Star Chefs'}</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mb-2 max-w-xl leading-relaxed font-medium">
              {promoBanner.description || 'Transform your cooking skills with 150+ ultra-HD video masterclasses. Learn professional culinary secrets, plating techniques, and recipe composition from legendary chefs.'}
            </p>
          </div>

          {/* Right Benefits Section */}
          <div className="lg:w-[32%] bg-white/[0.01] p-5 sm:p-8 lg:p-12 flex flex-col justify-center gap-5 sm:gap-8 border-t lg:border-t-0 lg:border-l border-white/5">
            {(promoBanner.benefits || [
              { icon: 'Play', title: '150+ HD Video Lessons', desc: 'Watch on any device, anytime' },
              { icon: 'Sparkles', title: 'Michelin Pro Secrets', desc: 'Expert techniques made simple' },
              { icon: 'ShieldCheck', title: '30-Day Cooking Guarantee', desc: 'Unlock elite skills or full refund' },
            ]).map((item: any, i: number) => {
              const Icon = getIcon(item.icon);
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
