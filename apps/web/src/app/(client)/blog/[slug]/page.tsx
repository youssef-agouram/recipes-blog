import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import ArticleView from "@/components/articles/ArticleView";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

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
