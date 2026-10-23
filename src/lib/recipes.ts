import type { IconName } from '../components/icons';

// Task-first shortcuts: people arrive with a job ("get this under 100 KB"), not a tool name.
// Each one is a tool URL with its settings preset, so it also works as a bookmark.
export interface Recipe {
  title: string;
  blurb: string;
  to: string;
  icon: IconName;
}

export const RECIPES: Recipe[] = [
  {
    title: 'Get a photo under 100 KB',
    blurb: 'For forms and uploads with a size limit.',
    to: '/compress?target=100',
    icon: 'compress',
  },
  {
    title: 'Open iPhone photos anywhere',
    blurb: 'HEIC to JPG, the format every app reads.',
    to: '/convert/heic-to-jpg',
    icon: 'phone',
  },
  {
    title: 'Make a square profile picture',
    blurb: 'Crop to 1:1 from the middle.',
    to: '/crop?aspect=1:1',
    icon: 'crop',
  },
  {
    title: 'Hide where a photo was taken',
    blurb: 'Strip GPS, camera and timestamp data.',
    to: '/strip-metadata',
    icon: 'shield',
  },
  {
    title: 'Cut out a product shot',
    blurb: 'Transparent PNG, ready for any backdrop.',
    to: '/background-remover',
    icon: 'scissors',
  },
  {
    title: 'Speed up my website',
    blurb: 'WebP at 80%: same look, far fewer bytes.',
    to: '/compress?format=webp&q=80',
    icon: 'bolt',
  },
  {
    title: 'Turn scans into one PDF',
    blurb: 'Receipts, notes and pages, in order.',
    to: '/image-to-pdf',
    icon: 'pdf',
  },
  {
    title: 'Make icons for my site',
    blurb: 'favicon.ico, app icons and a manifest.',
    to: '/favicon',
    icon: 'star',
  },
];
