// Central SEO metadata for every route. RouteSeo.tsx applies these to the document head on
// navigation (title, description, canonical, Open Graph, Twitter, JSON-LD structured data).
//
// IMPORTANT: set SITE_URL to your real production domain before deploying. It drives canonical
// URLs, the sitemap and all absolute Open Graph / structured-data links.
import { CONVERSIONS, conversionFaq, conversionSteps, type ConversionMeta } from './landing';
import { TOOL_CONTENT } from './toolContent';
import { BLOG_POSTS, type BlogPostMeta } from './blog';

export const SITE_URL =
  (import.meta.env as Record<string, string | undefined>).VITE_SITE_URL || 'https://ihateimages.com';
export const SITE_NAME = 'iHateImages';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface SeoMeta {
  title: string;
  description: string;
  jsonLd?: object | object[];
}

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Are my images uploaded to a server?',
    a: 'No. Every tool runs 100% in your browser using JavaScript and WebAssembly, so your images never leave your device.',
  },
  {
    q: 'Is iHateImages free?',
    a: 'Yes. Every tool is completely free with no watermark, no sign-up and no file limits.',
  },
  {
    q: 'Which image formats are supported?',
    a: 'JPEG, PNG, WebP, AVIF and HEIC. You can convert between any of them, including HEIC photos from an iPhone.',
  },
  {
    q: 'Do you add a watermark or reduce quality?',
    a: 'Never. Output is clean, full resolution and only compressed by the amount you choose.',
  },
  {
    q: 'Does it work offline?',
    a: 'Yes. After your first visit the app is cached, so it keeps working without an internet connection.',
  },
];

const app = (name: string, path: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: `${name} - ${SITE_NAME}`,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web browser',
  url: `${SITE_URL}${path}`,
  description,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: ['100% on-device', 'No upload', 'No watermark', 'No sign-up', 'Works offline'],
});

const crumbs = (name: string, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${path}` },
  ],
});

const tool = (name: string, path: string, title: string, description: string): SeoMeta => {
  const content = TOOL_CONTENT[path];
  const jsonLd: object[] = [app(name, path, description), crumbs(name, path)];
  if (content) jsonLd.push(faqPage(content.faq));
  return { title, description, jsonLd };
};

const howTo = (c: ConversionMeta) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: `How to convert ${c.fromLabel} to ${c.toLabel}`,
  step: conversionSteps(c).map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
});

const faqPage = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

const conversionSeo = (c: ConversionMeta): SeoMeta => {
  const description = `Convert ${c.fromLabel} to ${c.toLabel} online for free. Batch ${c.fromLabel}-to-${c.toLabel} conversion runs 100% in your browser with no upload, no watermark and full quality.`;
  return {
    title: `Convert ${c.fromLabel} to ${c.toLabel} Online Free - No Upload | iHateImages`,
    description,
    jsonLd: [
      app(`${c.fromLabel} to ${c.toLabel} Converter`, c.path, description),
      howTo(c),
      faqPage(conversionFaq(c)),
      crumbs(`${c.fromLabel} to ${c.toLabel}`, c.path),
    ],
  };
};

const blogPosting = (p: BlogPostMeta) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: p.title,
  description: p.description,
  datePublished: p.date,
  dateModified: p.date,
  author: { '@type': 'Organization', name: SITE_NAME },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
  },
  mainEntityOfPage: `${SITE_URL}${p.path}`,
  image: OG_IMAGE,
});

const homeJsonLd = [
  { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/favicon.svg`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web browser',
    description:
      'Free, private image tools that run entirely in your browser. Compress, convert, resize, crop, upscale and remove backgrounds with no upload and no watermark.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Person', name: 'Alok Tomar', url: 'https://x.com/AlokTom19637918' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
];

export const SEO_BY_PATH: Record<string, SeoMeta> = {
  '/': {
    title: 'iHateImages - Free Private Image Tools, No Upload, No Watermark',
    description:
      'Free, private image tools that run 100% in your browser. Compress, convert, resize, crop, upscale and remove backgrounds with no upload, no watermark and no sign-up.',
    jsonLd: homeJsonLd,
  },
  '/compress': tool(
    'Image Compressor',
    '/compress',
    'Compress Images Online Free - No Upload | iHateImages',
    'Compress JPEG, PNG, WebP, AVIF and HEIC online for free. Shrink image size up to 90% at full resolution in your browser. No upload, no watermark.',
  ),
  '/convert': tool(
    'Image Converter',
    '/convert',
    'Convert Images Free - HEIC, WebP, AVIF, PNG, JPG | iHateImages',
    'Convert images online free: HEIC to JPG, PNG to WebP, JPG to AVIF and more. Batch convert in your browser with no upload and no watermark.',
  ),
  '/resize': tool(
    'Image Resizer',
    '/resize',
    'Resize Images Online Free - No Upload | iHateImages',
    'Resize images online free by exact size, percentage or long edge. Batch resize in your browser with no upload, no watermark and full quality.',
  ),
  '/strip-metadata': tool(
    'EXIF Metadata Remover',
    '/strip-metadata',
    'Remove EXIF & GPS Metadata from Photos | iHateImages',
    'Remove EXIF, GPS location and camera data from photos online. Protect your privacy before sharing, 100% in your browser. No upload, free.',
  ),
  '/background-remover': tool(
    'Background Remover',
    '/background-remover',
    'Remove Image Background Free - On-Device AI | iHateImages',
    'Remove image backgrounds free with on-device AI and get a transparent PNG cutout in your browser. No upload, no watermark, no sign-up.',
  ),
  '/crop': tool(
    'Image Cropper',
    '/crop',
    'Crop Image Online Free - Any Aspect Ratio | iHateImages',
    'Crop images online free to any aspect ratio (1:1, 4:3, 16:9) or freeform. Full-resolution crop in your browser with no upload and no watermark.',
  ),
  '/upscale': tool(
    'Image Upscaler',
    '/upscale',
    'Upscale Images 2x & 4x Online Free | iHateImages',
    'Upscale images 2x or 4x online free with high-quality resampling and sharpening. Enlarge photos in your browser. No upload, no watermark.',
  ),
  '/favicon': tool(
    'Favicon Generator',
    '/favicon',
    'Favicon Generator - ICO, PNG, Manifest | iHateImages',
    'Free favicon generator. Turn any image into favicon.ico, PNGs, an apple-touch-icon and a web manifest, zipped. In your browser, no upload.',
  ),
  '/passport-photo': tool(
    'Passport Photo Maker',
    '/passport-photo',
    'Passport Photo Maker - US, UK, EU Sizes | iHateImages',
    'Free passport and ID photo maker. Crop to official US, UK, EU, India and more sizes at the correct DPI. In your browser, no upload, no watermark.',
  ),
  '/rotate': tool(
    'Image Rotator',
    '/rotate',
    'Rotate & Flip Images Online Free | iHateImages',
    'Rotate images 90 degrees or flip them horizontally and vertically online for free. Batch, in your browser, no upload, no watermark.',
  ),
  '/image-to-pdf': tool(
    'Image to PDF Converter',
    '/image-to-pdf',
    'Image to PDF - Convert JPG & PNG to PDF Free | iHateImages',
    'Combine JPG, PNG, WebP, AVIF and HEIC images into a single PDF online for free. In your browser, no upload, no watermark.',
  ),
  '/about': {
    title: 'About iHateImages - Free, Private Image Tools',
    description:
      'iHateImages is a free, privacy-first image toolkit that runs 100% in your browser. Learn how it works and why your images never leave your device.',
    jsonLd: crumbs('About', '/about'),
  },
  '/privacy': {
    title: 'Privacy Policy | iHateImages',
    description:
      'iHateImages processes images entirely in your browser. No uploads and no accounts. Read how your data is handled.',
    jsonLd: crumbs('Privacy', '/privacy'),
  },
  '/integrations': {
    title: 'Integrations and Workflow - Share, Open With, URL Presets | iHateImages',
    description:
      'Send images to iHateImages from your phone share sheet, the desktop Open with menu, a right-click browser extension, or URL presets. Everything still runs 100% in your browser.',
    jsonLd: crumbs('Integrations', '/integrations'),
  },
};

// Programmatic conversion landing pages (Level 2 SEO): one entry per format pair.
for (const c of CONVERSIONS) {
  SEO_BY_PATH[c.path] = conversionSeo(c);
}

// Blog index and posts.
SEO_BY_PATH['/blog'] = {
  title: 'Blog | iHateImages',
  description: 'Notes on private, in-browser image processing and how iHateImages is built.',
  jsonLd: [
    { '@context': 'https://schema.org', '@type': 'Blog', name: 'iHateImages Blog', url: `${SITE_URL}/blog` },
    crumbs('Blog', '/blog'),
  ],
};
for (const p of BLOG_POSTS) {
  SEO_BY_PATH[p.path] = {
    title: `${p.title} | iHateImages`,
    description: p.description,
    jsonLd: [blogPosting(p), crumbs(p.title, p.path)],
  };
}

export const DEFAULT_SEO: SeoMeta = SEO_BY_PATH['/'];
