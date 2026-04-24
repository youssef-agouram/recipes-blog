import { PaginatedResponse, Recipe, Category } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "An unknown error occurred" }));
    throw new Error(error.error || "Failed to fetch data");
  }

  return response.json();
}

export const api = {
  recipes: {
    list: (params?: { page?: number; limit?: number; search?: string; categoryId?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.search) searchParams.append("search", params.search);
      if (params?.categoryId) searchParams.append("categoryId", params.categoryId.toString());
      
      const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
      return fetcher<PaginatedResponse<Recipe>>(`/recipes${query}`);
    },
    getBySlug: (slug: string) => fetcher<Recipe>(`/recipes/${slug}`),
  },
  categories: {
    list: () => fetcher<Category[]>("/categories"),
  },
};
