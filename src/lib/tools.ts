import type { IconName } from '../components/icons';

export type ToolCategory = 'optimize' | 'edit' | 'create';

export interface ToolMeta {
  slug: string;
  path: string;
  title: string;
  /** Compact label for menus and chips. */
  short: string;
  blurb: string;
  icon: IconName;
  category: ToolCategory;
  /** Extra search terms for the command palette. */
  keywords: string[];
  /** Whether the tool works on a batch, or only the first image. */
  multiple: boolean;
  live: boolean;
}

export const CATEGORIES: { id: ToolCategory; title: string; blurb: string }[] = [
  { id: 'optimize', title: 'Optimize', blurb: 'Smaller, sharper, or a different format.' },
  { id: 'edit', title: 'Edit', blurb: 'Cut, crop, turn and clean up.' },
  { id: 'create', title: 'Create & protect', blurb: 'Icons, IDs, PDFs and privacy.' },
];

export const TOOLS: ToolMeta[] = [
  {
    slug: 'compress',
    path: '/compress',
    title: 'Compress',
    short: 'Compress',
    blurb: 'Shrink images up to ~90%, or to an exact size in KB.',
    icon: 'compress',
    category: 'optimize',
    keywords: ['shrink', 'reduce', 'smaller', 'optimize', 'kb', 'file size', 'minify'],
    multiple: true,
    live: true,
  },
  {
    slug: 'convert',
    path: '/convert',
    title: 'Convert',
    short: 'Convert',
    blurb: 'HEIC, JPG, PNG, WebP and AVIF, in any direction.',
    icon: 'convert',
    category: 'optimize',
    keywords: ['format', 'heic', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'change format'],
    multiple: true,
    live: true,
  },
  {
    slug: 'resize',
    path: '/resize',
    title: 'Resize',
    short: 'Resize',
    blurb: 'Scale by long edge, exact pixels or percentage.',
    icon: 'resize',
    category: 'optimize',
    keywords: ['dimensions', 'scale', 'width', 'height', 'pixels', 'smaller'],
    multiple: true,
    live: true,
  },
  {
    slug: 'upscale',
    path: '/upscale',
    title: 'Upscale',
    short: 'Upscale',
    blurb: 'Enlarge 2x or 4x with high-quality resampling.',
    icon: 'upscale',
    category: 'optimize',
    keywords: ['enlarge', 'bigger', 'enhance', 'super resolution', '2x', '4x'],
    multiple: true,
    live: true,
  },
  {
    slug: 'background',
    path: '/background-remover',
    title: 'Remove background',
    short: 'Background',
    blurb: 'On-device AI cutout to a transparent PNG.',
    icon: 'scissors',
    category: 'edit',
    keywords: ['cutout', 'transparent', 'erase', 'remove bg', 'product photo', 'ai'],
    multiple: false,
    live: true,
  },
  {
    slug: 'crop',
    path: '/crop',
    title: 'Crop',
    short: 'Crop',
    blurb: 'Freeform or fixed ratios like 1:1 and 16:9.',
    icon: 'crop',
    category: 'edit',
    keywords: ['trim', 'cut', 'square', 'aspect ratio', 'instagram', 'profile picture'],
    multiple: false,
    live: true,
  },
  {
    slug: 'rotate',
    path: '/rotate',
    title: 'Rotate & flip',
    short: 'Rotate',
    blurb: 'Turn 90 degrees or mirror, in batch.',
    icon: 'rotate',
    category: 'edit',
    keywords: ['turn', 'mirror', 'flip', 'orientation', 'sideways'],
    multiple: true,
    live: true,
  },
  {
    slug: 'strip-metadata',
    path: '/strip-metadata',
    title: 'Strip metadata',
    short: 'Metadata',
    blurb: 'Remove GPS location and EXIF before sharing.',
    icon: 'shield',
    category: 'create',
    keywords: ['exif', 'gps', 'location', 'privacy', 'clean', 'remove data'],
    multiple: true,
    live: true,
  },
  {
    slug: 'image-to-pdf',
    path: '/image-to-pdf',
    title: 'Image to PDF',
    short: 'PDF',
    blurb: 'Combine images into one PDF, in order.',
    icon: 'pdf',
    category: 'create',
    keywords: ['pdf', 'combine', 'merge', 'document', 'scan', 'jpg to pdf'],
    multiple: true,
    live: true,
  },
  {
    slug: 'passport',
    path: '/passport-photo',
    title: 'Passport photo',
    short: 'Passport',
    blurb: 'Official ID sizes at the correct print DPI.',
    icon: 'badge',
    category: 'create',
    keywords: ['id', 'visa', '2x2', '35x45', 'passport size', 'photo id'],
    multiple: false,
    live: true,
  },
  {
    slug: 'favicon',
    path: '/favicon',
    title: 'Favicon generator',
    short: 'Favicon',
    blurb: 'Every icon size plus a web manifest, zipped.',
    icon: 'star',
    category: 'create',
    keywords: ['icon', 'ico', 'app icon', 'apple touch', 'manifest', 'pwa'],
    multiple: false,
    live: true,
  },
];

export const TOOLS_BY_PATH: Record<string, ToolMeta> = Object.fromEntries(TOOLS.map((t) => [t.path, t]));

/** The tool that owns a pathname (conversion landings belong to Convert). */
export function toolForPath(pathname: string): ToolMeta | undefined {
  if (pathname.startsWith('/convert/')) return TOOLS_BY_PATH['/convert'];
  return TOOLS_BY_PATH[pathname];
}
