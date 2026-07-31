export type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export interface ResizeSpec {
  mode: 'none' | 'longEdge' | 'exact' | 'percent';
  longEdge?: number;
  width?: number;
  height?: number;
  percent?: number;
  keepAspect?: boolean;
}

/** A crop rectangle in source-image pixels. */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessOptions {
  targetFormat: TargetFormat;
  /** 0..1 lossy quality (ignored for PNG). */
  quality: number;
  resize?: ResizeSpec;
  /** Optional crop (source pixels) applied before resizing. */
  crop?: CropRect;
  /** Optional sharpen amount (0..~1). Used by the upscaler to recover crispness. */
  sharpen?: number;
}

export interface ProcessInput {
  buffer: ArrayBuffer;
  type: string;
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
  outType: string;
}

/** Pure geometry helper, shared by the worker and the main-thread fallback. */
export function computeSize(w: number, h: number, r?: ResizeSpec): { width: number; height: number } {
  if (!r || r.mode === 'none') return { width: w, height: h };

  if (r.mode === 'longEdge' && r.longEdge) {
    const long = Math.max(w, h);
    if (long <= r.longEdge) return { width: w, height: h };
    const s = r.longEdge / long;
    return { width: Math.round(w * s), height: Math.round(h * s) };
  }

  if (r.mode === 'percent' && r.percent) {
    const s = r.percent / 100;
    return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
  }

  if (r.mode === 'exact') {
    let nw = r.width ?? w;
    let nh = r.height ?? h;
    if (r.keepAspect) {
      if (r.width && !r.height) {
        nh = Math.round((r.width / w) * h);
      } else if (r.height && !r.width) {
        nw = Math.round((r.height / h) * w);
      } else {
        const scale = Math.min((r.width ?? w) / w, (r.height ?? h) / h);
        nw = Math.round(w * scale);
        nh = Math.round(h * scale);
      }
    }
    return { width: Math.max(1, nw), height: Math.max(1, nh) };
  }

  return { width: w, height: h };
}

export const FORMAT_LABEL: Record<TargetFormat, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
};

export const EXT: Record<TargetFormat, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export function normalizeType(mime: string): TargetFormat {
  if (mime === 'image/png') return 'image/png';
  if (mime === 'image/webp') return 'image/webp';
  if (mime === 'image/avif') return 'image/avif';
  return 'image/jpeg';
}

/** Clamp a crop rectangle to the image bounds, defaulting to the whole image. */
export function clampCrop(crop: CropRect | undefined, w: number, h: number): CropRect {
  if (!crop) return { x: 0, y: 0, width: w, height: h };
  const x = Math.max(0, Math.min(Math.round(crop.x), w - 1));
  const y = Math.max(0, Math.min(Math.round(crop.y), h - 1));
  const width = Math.max(1, Math.min(Math.round(crop.width), w - x));
  const height = Math.max(1, Math.min(Math.round(crop.height), h - y));
  return { x, y, width, height };
}
