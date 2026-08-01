import { lazy, type ComponentType } from 'react';

type Loader = () => Promise<{ default: ComponentType }>;

// One place that knows how to load each tool chunk, reused for both lazy() and prefetch()
// so navigation feels instant (Addy Osmani: warm the chunk before the click).
const loaders: Record<string, Loader> = {
  '/compress': () => import('../pages/Compress'),
  '/convert': () => import('../pages/Convert'),
  '/resize': () => import('../pages/Resize'),
  '/strip-metadata': () => import('../pages/StripMetadata'),
  '/background-remover': () => import('../pages/BackgroundRemover'),
  '/crop': () => import('../pages/Crop'),
  '/upscale': () => import('../pages/Upscale'),
  '/favicon': () => import('../pages/Favicon'),
  '/passport-photo': () => import('../pages/PassportPhoto'),
  '/rotate': () => import('../pages/Rotate'),
  '/image-to-pdf': () => import('../pages/ImageToPdf'),
  '/about': () => import('../pages/About'),
  '/privacy': () => import('../pages/Privacy'),
  '/integrations': () => import('../pages/Integrations'),
  '/blog': () => import('../pages/Blog'),
};

// Shared dynamic chunks (one chunk serves many URLs).
const convertLandingLoader: Loader = () => import('../pages/ConvertLanding');
const blogPostLoader: Loader = () => import('../pages/BlogPost');

export const Lazy = {
  Compress: lazy(loaders['/compress']),
  Convert: lazy(loaders['/convert']),
  Resize: lazy(loaders['/resize']),
  StripMetadata: lazy(loaders['/strip-metadata']),
  BackgroundRemover: lazy(loaders['/background-remover']),
  Crop: lazy(loaders['/crop']),
  Upscale: lazy(loaders['/upscale']),
  Favicon: lazy(loaders['/favicon']),
  PassportPhoto: lazy(loaders['/passport-photo']),
  Rotate: lazy(loaders['/rotate']),
  ImageToPdf: lazy(loaders['/image-to-pdf']),
  About: lazy(loaders['/about']),
  Privacy: lazy(loaders['/privacy']),
  Integrations: lazy(loaders['/integrations']),
  Blog: lazy(loaders['/blog']),
  ConvertLanding: lazy(convertLandingLoader),
  BlogPost: lazy(blogPostLoader),
};

// Warm a single route chunk (call on hover / focus of a nav link).
export function prefetchRoute(path: string): void {
  loaders[path]?.().catch(() => {});
}

// Warm the shared conversion-landing chunk (hover on a "HEIC to JPG" style link).
export function prefetchConvertLanding(): void {
  convertLandingLoader().catch(() => {});
}

// After first paint, quietly prefetch every tool chunk while the browser is idle so the
// first click on any tool is instant. The heavy codecs/model stay lazy inside each page.
export function prefetchAllIdle(): void {
  const run = () => {
    Object.values(loaders).forEach((l) => l().catch(() => {}));
    convertLandingLoader().catch(() => {});
    blogPostLoader().catch(() => {});
  };
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
  }).requestIdleCallback;
  if (ric) ric(run, { timeout: 2500 });
  else setTimeout(run, 1500);
}
