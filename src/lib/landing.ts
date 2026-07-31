import type { TargetFormat } from './imageTypes';
import data from './landing.data.json';

// Programmatic SEO (Level 2): one landing page per format conversion, e.g. /convert/heic-to-jpg.
// The pair list lives in landing.data.json so the app and scripts/gen-sitemap.mjs share one source.

interface FormatInfo {
  label: string;
  mime: string;
  about: string;
}

const FORMATS: Record<string, FormatInfo> = {
  jpg: {
    label: 'JPG',
    mime: 'image/jpeg',
    about:
      'JPG (JPEG) is the most widely supported photo format and produces small, lossy files that open everywhere.',
  },
  png: {
    label: 'PNG',
    mime: 'image/png',
    about:
      'PNG is a lossless format with transparency support, ideal for logos, graphics and screenshots.',
  },
  webp: {
    label: 'WebP',
    mime: 'image/webp',
    about:
      'WebP is a modern Google format that is typically 25 to 35 percent smaller than JPG or PNG at similar quality.',
  },
  avif: {
    label: 'AVIF',
    mime: 'image/avif',
    about:
      'AVIF is a next-generation format with the best compression, great for fast-loading websites.',
  },
  heic: {
    label: 'HEIC',
    mime: 'image/heic',
    about:
      'HEIC is Apple\u2019s high-efficiency format used by iPhone cameras, but many apps and websites cannot open it.',
  },
};

export interface ConversionMeta {
  slug: string;
  path: string;
  from: string;
  to: string;
  fromLabel: string;
  toLabel: string;
  targetMime: TargetFormat;
  fromAbout: string;
  toAbout: string;
}

export const CONVERSIONS: ConversionMeta[] = data.conversions.map(({ from, to }) => {
  const f = FORMATS[from];
  const t = FORMATS[to];
  return {
    slug: `${from}-to-${to}`,
    path: `/convert/${from}-to-${to}`,
    from,
    to,
    fromLabel: f.label,
    toLabel: t.label,
    targetMime: t.mime as TargetFormat,
    fromAbout: f.about,
    toAbout: t.about,
  };
});

export const CONVERSIONS_BY_SLUG: Record<string, ConversionMeta> = Object.fromEntries(
  CONVERSIONS.map((c) => [c.slug, c]),
);

// A hand-picked, high-intent subset used for internal linking on Home and the Convert hub.
export const POPULAR_CONVERSIONS: ConversionMeta[] = [
  'heic-to-jpg',
  'heic-to-png',
  'webp-to-png',
  'webp-to-jpg',
  'png-to-webp',
  'jpg-to-webp',
  'png-to-jpg',
  'avif-to-png',
]
  .map((s) => CONVERSIONS_BY_SLUG[s])
  .filter(Boolean);

// Shared step + FAQ copy so the visible page and the HowTo/FAQPage structured data stay in sync.
export function conversionSteps(c: ConversionMeta): { name: string; text: string }[] {
  return [
    {
      name: `Add your ${c.fromLabel} files`,
      text: `Drag and drop your ${c.fromLabel} images onto the upload box, or click to browse. Nothing is uploaded to a server.`,
    },
    {
      name: 'Adjust quality (optional)',
      text: `Use the quality slider if you want a smaller ${c.toLabel} file.`,
    },
    {
      name: `Download your ${c.toLabel} files`,
      text: `Click Convert to ${c.toLabel} and download each image, or grab them all as a ZIP.`,
    },
  ];
}

export function conversionFaq(c: ConversionMeta): { q: string; a: string }[] {
  return [
    {
      q: `Do my ${c.fromLabel} files get uploaded?`,
      a: `No. The conversion runs entirely in your browser, so your ${c.fromLabel} files never leave your device.`,
    },
    {
      q: `Is the ${c.fromLabel} to ${c.toLabel} converter free?`,
      a: `Yes. It is completely free with no watermark, no sign-up and no file-size limits.`,
    },
    {
      q: `Can I convert several ${c.fromLabel} files at once?`,
      a: `Yes. Drop as many ${c.fromLabel} files as you like and download them individually or as a single ZIP.`,
    },
  ];
}
