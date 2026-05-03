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

export interface Recipe {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
  isFeatured: boolean;
  content: any; // Tiptap JSON content
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  ingredients: Ingredient[];
  seo?: SeoMeta;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
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
