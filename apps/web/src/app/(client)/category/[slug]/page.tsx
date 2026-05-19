import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { SITE_URL } from "@/lib/seo";
import { 
  ArrowLeft, Coffee, Salad, CookingPot, Cake, Leaf, 
  WheatOff, Timer, CupSoda, Soup, Utensils, Pizza, 
  Sandwich, Apple, Fish, Croissant, Carrot, Flame, 
  Heart, Sparkles, BookOpen, Star, Clock
} from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  try {
    // 1. Fetch all categories
    const categories = await api.categories.list().catch(() => []);
    
    // Find category matching the slug
    const category = categories.find(
      c => c.slug?.toLowerCase() === slug.toLowerCase() || 
           c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
    );

    if (!category) {
      notFound();
    }

    // 2. Fetch recipes for this category
    const recipesResponse = await api.recipes.list({ categoryId: category.id, limit: 100 }).catch(() => ({ data: [] }));
    const recipes = recipesResponse.data || [];

    // 3. Resolve category icon
    const availableIcons: Record<string, any> = {
      Utensils, Coffee, Pizza, Sandwich, Cake, Leaf,
      Apple, Fish, Croissant, Carrot, Soup, CupSoda,
      Flame, Star, Heart, Clock, Salad, CookingPot
    };

    const fallbackIconMap: Record<string, any> = {
      'breakfast': Coffee,
      'lunch': Utensils,
      'dinner': CookingPot,
      'desserts': Cake,
      'dessert': Cake,
      'vegan': Leaf,
      'gluten free': WheatOff,
      'quick & easy': Timer,
      'drinks': CupSoda,
      'salads': Salad,
      'soup': Soup,
      'fish': Fish,
    };

    const nameLower = category.name.toLowerCase();
    let CategoryIcon = CookingPot;
    if (category.icon && availableIcons[category.icon]) {
      CategoryIcon = availableIcons[category.icon];
    } else if (fallbackIconMap[nameLower]) {
      CategoryIcon = fallbackIconMap[nameLower];
    }

    // 4. Generate JSON-LD ItemList Schema
    const itemListJsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${category.name} Recipes`,
      "description": category.description || `Explore our handpicked collection of delicious ${category.name.toLowerCase()} recipes.`,
      "url": `${SITE_URL}/category/${category.slug}`,
      "numberOfItems": recipes.length,
      "itemListElement": recipes.map((recipe, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${SITE_URL}/recipes/${recipe.slug}`,
        "name": recipe.title
      }))
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": category.name,
          "item": `${SITE_URL}/category/${category.slug}`
        }
      ]
    };

    return (
      <div className="w-full bg-background text-foreground pb-20 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-b from-card/30 via-card/10 to-transparent border-b border-white/5 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.03),transparent_60%)]"></div>
          
          <div className="container mx-auto px-6 max-w-[1536px]">
            <Link 
              href="/" 
              className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.25em] text-primary hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Category Icon Capsule */}
              <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl backdrop-blur-md">
                <CategoryIcon className="w-8 h-8 stroke-[1.5px]" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none font-heading">
                    {category.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
                  {category.description || `Browse through our curated selection of premium ${category.name.toLowerCase()} recipes. Each recipe is detailed with step-by-step instructions, active preparation and cooking times, difficulty levels, and full nutritional breakdowns to ensure kitchen success.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="container mx-auto px-6 max-w-[1536px] pt-12">
          {/* Sidebar and Grid layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Content Area: Recipes Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Category Collection</h2>
                </div>
              </div>

              {recipes.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-card/10 border border-dashed rounded-[32px] border-white/5 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-muted-foreground mb-4">
                    <Sparkles className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">No Recipes Found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-6 font-medium">
                    We haven't added any recipes under {category.name} category yet. Stay tuned as our kitchen crafts new masterpieces!
                  </p>
                  <Link 
                    href="/" 
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-all shadow-lg active:scale-95"
                  >
                    Back to Homepage
                  </Link>
                </div>
              )}
            </div>

            {/* Right Content Area: Sidebar with Other Categories */}
            {categories.length > 1 && (
              <div className="lg:w-[320px] shrink-0">
                <div className="sticky top-28 bg-card/25 backdrop-blur-xl border border-white/5 rounded-[32px] p-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Explore Categories
                  </h3>
                  <div className="flex flex-col gap-2">
                    {categories
                      .filter(c => c.id !== category.id)
                      .map((cat) => {
                        const nameLower = cat.name.toLowerCase();
                        let Icon = CookingPot;
                        if (cat.icon && availableIcons[cat.icon]) {
                          Icon = availableIcons[cat.icon];
                        } else if (fallbackIconMap[nameLower]) {
                          Icon = fallbackIconMap[nameLower];
                        }
                        return (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03] hover:border-primary/20 transition-all group"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-primary/70 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">
                                {cat.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground/60 bg-white/[0.02] px-2 py-0.5 rounded-md">
                              {cat._count?.recipes ?? 0}
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
