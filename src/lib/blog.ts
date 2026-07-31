import data from './blog.data.json';

export interface BlogPostMeta {
  slug: string;
  path: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  excerpt: string;
}

export const BLOG_POSTS: BlogPostMeta[] = data.posts.map((p) => ({ ...p, path: `/blog/${p.slug}` }));

export const BLOG_BY_SLUG: Record<string, BlogPostMeta> = Object.fromEntries(
  BLOG_POSTS.map((p) => [p.slug, p]),
);

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
