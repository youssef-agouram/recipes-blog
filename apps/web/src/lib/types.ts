export interface SeoMeta {
  id: number;
  title?: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Ingredient {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
  isFeatured: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  allowComments: boolean;
  ingredientsJson?: RecipeIngredient[];
  content: any; // Tiptap JSON content
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  ingredients: Ingredient[];
  seo?: SeoMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
