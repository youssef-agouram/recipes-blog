export interface SeoMeta {
  id: number;
  title?: string;
  description?: string;
}

export interface CategoryGroup {
  id: number;
  name: string;
  description?: string;
  _count?: {
    categories: number;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: number;
  groupId?: number;
  status: 'PUBLISHED' | 'HIDDEN';
  displayOnHome: boolean;
  isFeatured: boolean;
  menuOrder: number;
}

export interface Ingredient {
  id: number;
  name: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit?: string;
}

export interface Recipe {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
  isFeatured: boolean;
  isTopArticle: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  nutrition?: {
    calories?: string;
    protein?: string;
    carbohydrates?: string;
    fat?: string;
    fiber?: string;
  };
  allowComments: boolean;
  ingredientsJson?: RecipeIngredient[];
  content: any; // Tiptap JSON content
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  ingredients: Ingredient[];
  seo?: SeoMeta;
  images: string[];
}

export interface Comment {
  id: number;
  text: string;
  rating?: number;
  status: 'PENDING' | 'APPROVED' | 'SPAM';
  recipeId: number;
  name?: string;
  avatar?: string;
  createdAt: string;
  likeCount: number;
  parentId?: number;
  user?: {
    name: string;
    avatar?: string;
  };
  replies?: Comment[];
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
