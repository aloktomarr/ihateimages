// Generates public/sitemap.xml from the static routes plus the programmatic conversion pages.
// Runs automatically before `npm run build` (see the "prebuild" script) and can be run directly:
//   node scripts/gen-sitemap.mjs
// Set the domain with VITE_SITE_URL so it matches SITE_URL in src/lib/seo.ts.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SITE_URL = process.env.VITE_SITE_URL || 'https://ihateimages.app';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/compress', priority: '0.9', changefreq: 'monthly' },
  { path: '/convert', priority: '0.9', changefreq: 'monthly' },
  { path: '/resize', priority: '0.9', changefreq: 'monthly' },
  { path: '/strip-metadata', priority: '0.8', changefreq: 'monthly' },
  { path: '/background-remover', priority: '0.9', changefreq: 'monthly' },
  { path: '/crop', priority: '0.8', changefreq: 'monthly' },
  { path: '/upscale', priority: '0.8', changefreq: 'monthly' },
  { path: '/favicon', priority: '0.8', changefreq: 'monthly' },
  { path: '/passport-photo', priority: '0.8', changefreq: 'monthly' },
  { path: '/rotate', priority: '0.8', changefreq: 'monthly' },
  { path: '/image-to-pdf', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.4', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

const { conversions } = JSON.parse(
  readFileSync(resolve(root, 'src/lib/landing.data.json'), 'utf8'),
);
const conversionRoutes = conversions.map(({ from, to }) => ({
  path: `/convert/${from}-to-${to}`,
  priority: '0.7',
  changefreq: 'monthly',
}));

const { posts } = JSON.parse(readFileSync(resolve(root, 'src/lib/blog.data.json'), 'utf8'));
const blogRoutes = [
  { path: '/blog', priority: '0.6', changefreq: 'weekly' },
  ...posts.map((p) => ({ path: `/blog/${p.slug}`, priority: '0.6', changefreq: 'monthly' })),
];

const routes = [...staticRoutes, ...conversionRoutes, ...blogRoutes];

const body = routes
  .map(
    (r) =>
      `  <url>\n    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

writeFileSync(resolve(root, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml written with ${routes.length} URLs (${SITE_URL}).`);
