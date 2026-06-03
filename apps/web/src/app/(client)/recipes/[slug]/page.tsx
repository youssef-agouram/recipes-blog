import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import RecipeView from "@/components/recipes/RecipeView";
import { RelatedRecipes } from "@/components/recipes/RelatedRecipes";
import { 
  generateAdvancedRecipeJsonLd, 
  generateFAQJsonLd, 
  generateBreadcrumbListJsonLd 
} from "@/lib/seoAnalyzer";

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const response = await api.recipes.list({ limit: 100 });
    const list = response?.data || [];
    return list.map((recipe: any) => ({
      slug: recipe.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for recipes:", error);
    return [];
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;

  try {
    const recipe = await api.recipes.getBySlug(slug);

    if (!recipe) {
      notFound();
    }

    // Generate JSON-LD schemas
    const recipeJsonLd = generateAdvancedRecipeJsonLd(recipe);
    const breadcrumbJsonLd = generateBreadcrumbListJsonLd(recipe.categories || [], recipe.slug, recipe.title);

    // Auto-generate detailed cooking FAQ answers
    const faqs = [
      {
        question: `How long does it take to prepare ${recipe.title}?`,
        answer: `It takes a total of ${recipe.totalTime || "30 minutes"} to prepare and cook this recipe, including ${recipe.prepTime || "15 minutes"} prep time and ${recipe.cookTime || "15 minutes"} cook time.`,
      },
      {
        question: `What is the difficulty level of this recipe?`,
        answer: `This recipe is rated as ${recipe.difficulty || "medium"} difficulty, making it perfect for both home cooks and culinary enthusiasts.`,
      },
      {
        question: `How many servings does this recipe yield?`,
        answer: `This recipe yields approximately ${recipe.servings || "4"} servings.`,
      }
    ];
    const faqJsonLd = generateFAQJsonLd(faqs);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <RecipeView 
          recipe={recipe} 
          relatedRecipes={
            <RelatedRecipes 
              categoryId={recipe.categories?.[0]?.id || 1} 
              currentRecipeId={recipe.id} 
            />
          }
        />
      </>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}