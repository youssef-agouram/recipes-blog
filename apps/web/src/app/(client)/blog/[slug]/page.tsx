import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import ArticleView from "@/components/articles/ArticleView";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const response = await api.articles.list({ limit: 100 });
    const list = Array.isArray(response) ? response : response?.data || [];
    return list.map((article: any) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for articles:", error);
    return [];
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  try {
    const article = await api.articles.getBySlug(slug);

    if (!article) {
      notFound();
    }

    return (
      <ArticleView article={article} />
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
