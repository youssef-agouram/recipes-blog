import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Users, Play } from "lucide-react";
import { api } from "@/lib/api-client";

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const categories = await api.categories.list().catch(() => []);
  const recipesResponse = await api.recipes.list({ limit: 6 }).catch(() => ({ data: [] }));
  const recipes = recipesResponse.data || [];

  return (
    <div className="w-full bg-brand-bg text-brand-dark overflow-hidden font-sans">
      
      {/* 1. Hero Section */}
      <section className="container mx-auto px-6 max-w-7xl pt-4 pb-12">
        <div className="relative w-full h-[500px] rounded-3xl overflow-hidden flex items-center justify-center text-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745a872f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
              alt="Cooking pan hero" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Hero Content */}
          <div className="relative z-20 max-w-3xl mx-auto px-4 flex flex-col items-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight uppercase leading-[1.1]">
              Unleash Culinary<br />Excellence
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-xl font-medium">
              Taste the world of flavors, discover handcrafted recipes, and let the aroma of our creations fill your kitchen.
            </p>
            <Link 
              href="/recipes" 
              className="mt-8 bg-brand-orange text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-orange-500 transition-colors shadow-lg"
            >
              Explore Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Diverse Palette Section */}
      <section className="container mx-auto px-6 max-w-7xl pb-16">
        <div className="bg-[#d0e7fb] rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-12">
          {/* Left Side */}
          <div className="md:w-1/2 flex flex-col items-start">
            <span className="bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Explore
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark uppercase leading-tight mb-4 tracking-tight">
              Our Diverse<br />Palette
            </h2>
            <p className="text-gray-700 text-sm md:text-base mb-8 max-w-md">
              Dive into a world of flavors! Our diverse palette caters to all tastes, whether you're a fan of hearty meats, refreshing salads, or sweet delights. Find the right dish to satisfy your cravings.
            </p>
            <Link 
              href="/categories" 
              className="border-2 border-brand-dark text-brand-dark px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-brand-dark hover:text-white transition-colors"
            >
              See More
            </Link>
          </div>
          
          {/* Right Side (List) */}
          <div className="md:w-1/2 w-full grid grid-cols-1 gap-4">
            {categories.slice(0, 5).map((category, i) => {
              let icon = '🍽️';
              const nameLower = category.name.toLowerCase();
              if (nameLower.includes('breakfast')) icon = '🍳';
              else if (nameLower.includes('vegan') || nameLower.includes('salad') || nameLower.includes('veg')) icon = '🥗';
              else if (nameLower.includes('meat') || nameLower.includes('beef') || nameLower.includes('chicken') || nameLower.includes('pork')) icon = '🥩';
              else if (nameLower.includes('dessert') || nameLower.includes('sweet') || nameLower.includes('cake')) icon = '🧁';
              else if (nameLower.includes('quick') || nameLower.includes('easy') || nameLower.includes('fast')) icon = '⏱️';

              return (
                <Link href={`/category/${category.id}`} key={category.id || i} className="flex items-center justify-between py-4 border-b border-blue-200 last:border-0 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                      {icon}
                    </div>
                  </div>
                  <span className="font-bold text-base uppercase tracking-wider">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Featured Recipes */}
      <section className="container mx-auto px-6 max-w-7xl pb-16">
        <div className="flex items-end justify-between mb-8 border-b border-gray-300 pb-4">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-brand-dark">Featured Recipes</h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recipes.slice(0, 2).map((recipe, i) => (
            <Link href={`/recipes/${recipe.slug}`} key={recipe.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group cursor-pointer hover:shadow-md transition-shadow relative">
              {i === 1 && (
                <div className="absolute top-4 right-4 z-10 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg transform rotate-12">
                  NEW
                </div>
              )}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={recipe.imageUrl || "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-3 tracking-tight line-clamp-1">{recipe.title}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
                  {recipe.summary || "No description available."}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> 40 Min</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4"/> 4 Servings</span>
                  </div>
                  <button className="border border-brand-dark text-brand-dark px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors">
                    View Recipe
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Embark On A Journey (Categories + Grid) */}
      <section className="container mx-auto px-6 max-w-7xl pb-20">
        <div className="text-center mb-10">
          <span className="bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">
            Recipes
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-brand-dark mb-4">
            Embark On A<br />Journey
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            With our diverse collection of recipes, we have something to satisfy every palate.
          </p>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link href="/recipes" className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors bg-brand-green text-white border-brand-green">
            All
          </Link>
          {categories.map((cat) => (
            <Link 
              key={cat.id}
              href={`/category/${cat.id}`}
              className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors border-gray-300 text-gray-500 hover:border-gray-400 hover:text-brand-dark"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, i) => (
            <Link href={`/recipes/${recipe.slug}`} key={recipe.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                {/* Randomly add a green tag to some cards */}
                {(i === 2 || i === 3 || i === 4) && (
                   <div className="absolute bottom-4 right-4 z-10 w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm transform -rotate-12 border-2 border-white">
                     9.5
                   </div>
                )}
                <img 
                  src={recipe.imageUrl || "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold mb-2 tracking-tight line-clamp-1">{recipe.title}</h3>
                <p className="text-xs text-gray-500 mb-6 flex-1 line-clamp-2">
                  {recipe.summary || "No description available."}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 30 Min</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3"/> 2 P</span>
                  </div>
                  <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-colors">
                    View Recipe
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Chronicle / Articles */}
      <section className="container mx-auto px-6 max-w-7xl pb-24">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* Left Text */}
          <div className="md:w-1/3 flex flex-col justify-center pr-8">
            <span className="bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block w-max">
              Articles
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark uppercase leading-tight mb-4 tracking-tight">
              Our Culinary<br />Chronicle
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              We explore the latest trends in gastronomy, share expert tips on creating culinary masterpieces, and uncover the secrets of the world's most renowned chefs.
            </p>
            <Link 
              href="/articles" 
              className="border-2 border-brand-dark text-brand-dark px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-brand-dark hover:text-white transition-colors w-max"
            >
              Read More
            </Link>
          </div>
          
          {/* Right Images */}
          <div className="md:w-2/3 grid grid-cols-2 gap-4 h-[400px]">
             <div className="flex flex-col gap-4 h-full">
               <div className="rounded-3xl overflow-hidden h-1/2">
                 <img src="https://images.unsplash.com/photo-1544025162-83690dbe8f66?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Cooking Steak" className="w-full h-full object-cover" />
               </div>
               <div className="rounded-3xl overflow-hidden h-1/2 relative group">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-10"></div>
                  <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-1" />
                  </button>
                 <img src="https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Cooking Pot" className="w-full h-full object-cover" />
               </div>
             </div>
             <div className="rounded-3xl overflow-hidden h-full">
                <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Chefs" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
      </section>

      {/* 6. Newsletter */}
      <section className="container mx-auto px-6 max-w-7xl pb-12">
        <div className="bg-gradient-to-r from-[#ff7a70] to-[#ff5d50] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Background decorative elements could go here */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-4">
              Join For Joy
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white uppercase leading-tight mb-6 tracking-tight">
              Join The Fun<br />Subscribe Now!
            </h2>
            <p className="text-white/90 text-sm mb-10 max-w-md mx-auto">
              Subscribe to our newsletter for a weekly serving of recipes, cooking tips, and culinary insights straight to your inbox.
            </p>
            
            <div className="w-full max-w-md bg-white rounded-full p-1.5 flex items-center shadow-xl">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="flex-1 bg-transparent border-none outline-none px-6 text-sm text-gray-700 placeholder-gray-400 font-medium"
              />
              <button className="bg-brand-dark text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
