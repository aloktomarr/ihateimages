import type { IconName } from '../components/icons';

export interface ToolMeta {
  slug: string;
  path: string;
  title: string;
  blurb: string;
  icon: IconName;
  live: boolean;
}

export const TOOLS: ToolMeta[] = [
  { slug: 'compress', path: '/compress', title: 'Compress', blurb: 'Shrink images up to ~90%, full resolution, no watermark.', icon: 'compress', live: true },
  { slug: 'convert', path: '/convert', title: 'Convert', blurb: 'JPEG, PNG, WebP, AVIF and HEIC to any format.', icon: 'convert', live: true },
  { slug: 'resize', path: '/resize', title: 'Resize', blurb: 'Scale by long edge, exact size or percentage.', icon: 'resize', live: true },
  { slug: 'strip-metadata', path: '/strip-metadata', title: 'Strip metadata', blurb: 'Remove GPS location and EXIF before sharing.', icon: 'shield', live: true },
  { slug: 'background', path: '/background-remover', title: 'Remove background', blurb: 'On-device AI cutout, full resolution, no watermark.', icon: 'scissors', live: true },
  { slug: 'crop', path: '/crop', title: 'Crop', blurb: 'Freeform and fixed aspect-ratio cropping.', icon: 'crop', live: true },
  { slug: 'upscale', path: '/upscale', title: 'Upscale', blurb: 'Enlarge 2x or 4x with high-quality resampling.', icon: 'upscale', live: true },
  { slug: 'favicon', path: '/favicon', title: 'Favicon and app icons', blurb: 'Every icon size plus web manifest, zipped.', icon: 'star', live: true },
  { slug: 'passport', path: '/passport-photo', title: 'Passport / ID photo', blurb: 'Crop to official sizes with correct DPI.', icon: 'badge', live: true },
  { slug: 'rotate', path: '/rotate', title: 'Rotate & flip', blurb: 'Rotate 90 degrees or flip images, in batch.', icon: 'rotate', live: true },
  { slug: 'image-to-pdf', path: '/image-to-pdf', title: 'Image to PDF', blurb: 'Combine images into a single PDF, in order.', icon: 'pdf', live: true },
];
