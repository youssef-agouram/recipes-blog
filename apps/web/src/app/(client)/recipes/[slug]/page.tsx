import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import { Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  
  try {
    const recipe = await api.recipes.getBySlug(slug);

    return (
      <article className="container max-w-3xl px-4 py-12 md:py-20">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to recipes
        </Link>

        <header className="space-y-6 mb-12">
          <div className="flex flex-wrap gap-2">
            {recipe.categories.map((cat) => (
              <span 
                key={cat.id} 
                className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 px-2 py-0.5 rounded"
              >
                {cat.name}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
            {recipe.title}
          </h1>

          {recipe.summary && (
            <p className="text-xl text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-6 py-1">
              {recipe.summary}
            </p>
          )}

          <div className="flex items-center space-x-6 text-sm text-muted-foreground pt-4 border-t border-border/40">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" /> 
              <span>20 mins</span> {/* Placeholder for now */}
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" /> 
              <span>2 servings</span> {/* Placeholder for now */}
            </div>
          </div>
        </header>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted mb-12">
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 italic">
            Featured Image Placeholder
          </div>
        </div>

        <section className="prose prose-neutral dark:prose-invert max-w-none">
           {/* Simple Tiptap JSON rendering logic */}
           {recipe.content?.content?.map((node: any, idx: number) => {
             if (node.type === 'paragraph') {
               return (
                 <p key={idx} className="mb-6 text-lg leading-relaxed text-foreground/80">
                   {node.content?.map((textNode: any) => textNode.text).join('')}
                 </p>
               );
             }
             if (node.type === 'heading') {
                const Level = `h${node.attrs?.level || 2}` as any;
                return (
                  <Level key={idx} className="mt-10 mb-4 font-bold tracking-tight">
                    {node.content?.map((textNode: any) => textNode.text).join('')}
                  </Level>
                );
             }
             return null;
           })}
        </section>

        <footer className="mt-20 pt-10 border-t border-border/40">
           <h3 className="text-lg font-semibold mb-6">Ingredients</h3>
           <ul className="grid gap-3 sm:grid-cols-2">
             {recipe.ingredients.map(ing => (
               <li key={ing.id} className="flex items-center space-x-3 text-muted-foreground">
                 <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                 <span>{ing.name}</span>
               </li>
             ))}
             {recipe.ingredients.length === 0 && (
                <p className="text-sm italic text-muted-foreground">No ingredients listed.</p>
             )}
           </ul>
        </footer>
      </article>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
