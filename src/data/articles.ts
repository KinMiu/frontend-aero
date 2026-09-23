import { api } from "@/api/client";

export interface ArticleSection {
  type: "paragraph" | "heading" | "list" | "quote"
  text?: string
  items?: string[]
}

export interface Article {
  slug: string
  title: string
  date: string
  category: string
  image: string
  excerpt: string
  prev?: { slug: string; title: string }
  next?: { slug: string; title: string }
  sections: ArticleSection[]
}

export interface StoredArticle {
  id: string
  slug: string
  title: string
  date: string
  category: string
  image: string
  excerpt: string
  sections: ArticleSection[]
  createdAt: string
}

export async function getStoredArticles(): Promise<StoredArticle[]> {
  return api.get<StoredArticle[]>("/articles");
}

export async function getStoredArticleBySlug(slug: string): Promise<StoredArticle | undefined> {
  try {
    return await api.get<StoredArticle>(`/articles/${slug}`);
  } catch {
    return undefined;
  }
}

export async function addStoredArticle(data: Omit<StoredArticle, "id" | "createdAt" | "slug"> & { slug?: string }): Promise<StoredArticle> {
  return api.post<StoredArticle>("/articles", data);
}

export async function updateStoredArticle(id: string, updates: Partial<Omit<StoredArticle, "id" | "createdAt">>): Promise<StoredArticle> {
  return api.put<StoredArticle>(`/articles/${id}`, updates);
}

export async function deleteStoredArticle(id: string): Promise<void> {
  await api.delete(`/articles/${id}`);
}
