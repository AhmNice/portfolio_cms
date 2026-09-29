export type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CreateArticleDTO {
  title: string;
  slug: string;
  coverImage: string;
  techStack: string[];
  category?: string;
  excerpt?: string;
  article:File | string | null;
  status?: Status;
  featured?: boolean;
  authorId: string;
  projectId?: string;
  publishedAt?: Date;
}

export interface UpdateArticleDTO {
  title?: string;
  slug?: string;
  coverImage?: string;
  techStack?: string[];
  category?: string;
  excerpt?: string;
  content?: string;
  status?: Status;
  featured?: boolean;
  projectId?: string;
  publishedAt?: Date;
}
export interface MinimalArticleDTO {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  techStack: string[];
  category: string | null;
  excerpt: string | null;
  status: Status;
  featured: boolean;
  authorId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface ArticleDTO {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  techStack: string[];
  category: string | null;
  excerpt: string | null;
  content: string;
  status: Status;
  featured: boolean;
  authorId: string;
  projectId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
