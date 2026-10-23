import type { IconName } from '../components/icons';
import { CONVERSIONS_BY_SLUG } from './landing';

// Picks the most likely next step for whatever the user dropped on the home page, using only
// what the browser already knows about the files (type, name and size). Nothing is uploaded.
export interface Suggestion {
  title: string;
  reason: string;
  to: string;
  icon: IconName;
}

type Kind = 'heic' | 'jpg' | 'png' | 'webp' | 'avif' | 'gif' | 'other';

export function kindOf(file: File): Kind {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (/\.(heic|heif)$/.test(name) || type.includes('heic') || type.includes('heif')) return 'heic';
  if (type === 'image/jpeg' || /\.jpe?g$/.test(name)) return 'jpg';
  if (type === 'image/png' || name.endsWith('.png')) return 'png';
  if (type === 'image/webp' || name.endsWith('.webp')) return 'webp';
  if (type === 'image/avif' || name.endsWith('.avif')) return 'avif';
  if (type === 'image/gif' || name.endsWith('.gif')) return 'gif';
  return 'other';
}

/** Short format label for a file, e.g. "HEIC" or "JPG". */
export function formatLabel(file: File): string {
  const k = kindOf(file);
  if (k !== 'other') return k.toUpperCase();
  const ext = file.name.split('.').pop();
  return ext && ext !== file.name ? ext.toUpperCase() : 'Image';
}

function convertTo(from: Kind, to: string): string {
  const slug = `${from}-to-${to}`;
  return CONVERSIONS_BY_SLUG[slug] ? `/convert/${slug}` : '/convert';
}

export function suggestFor(files: File[]): Suggestion[] {
  if (!files.length) return [];
  const kinds = new Set(files.map(kindOf));
  const only = kinds.size === 1 ? [...kinds][0] : null;
  const total = files.reduce((s, f) => s + f.size, 0);
  const many = files.length > 1;
  const out: Suggestion[] = [];

  if (kinds.has('heic')) {
    out.push({
      title: 'Convert to JPG',
      reason: 'HEIC does not open in most apps. JPG opens everywhere.',
      to: only === 'heic' ? convertTo('heic', 'jpg') : '/convert',
      icon: 'convert',
    });
  }

  if (total > 300 * 1024 || !out.length) {
    out.push({
      title: many ? 'Compress them' : 'Compress it',
      reason:
        total > 1024 * 1024
          ? 'Cut the file size by up to 90% with no visible change.'
          : 'Make it lighter for the web, email or chat.',
      to: '/compress',
      icon: 'compress',
    });
  }

  if (many) {
    out.push({
      title: 'Combine into a PDF',
      reason: `${files.length} images become one tidy document.`,
      to: '/image-to-pdf',
      icon: 'pdf',
    });
  }

  if (only === 'png' || only === 'jpg') {
    out.push({
      title: 'Convert to WebP',
      reason: 'Around 30% smaller than ' + only.toUpperCase() + ' at the same quality.',
      to: convertTo(only, 'webp'),
      icon: 'convert',
    });
  }

  if (only === 'webp' || only === 'avif') {
    out.push({
      title: only === 'avif' ? 'Convert to PNG' : 'Convert to JPG',
      reason: 'For apps and sites that still refuse ' + only.toUpperCase() + '.',
      to: convertTo(only, only === 'avif' ? 'png' : 'jpg'),
      icon: 'convert',
    });
  }

  if (!many) {
    out.push({
      title: 'Remove the background',
      reason: 'A clean cutout from on-device AI.',
      to: '/background-remover',
      icon: 'scissors',
    });
  }

  out.push({
    title: 'Strip location data',
    reason: 'Remove GPS and camera details before you share.',
    to: '/strip-metadata',
    icon: 'shield',
  });

  // Keep the first four distinct destinations.
  const seen = new Set<string>();
  return out.filter((s) => (seen.has(s.to) ? false : (seen.add(s.to), true))).slice(0, 4);
}
