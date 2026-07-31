import * as Comlink from 'comlink';
import type { ImageWorkerApi } from '../workers/image.worker';
import { clampCrop, computeSize, type ProcessOptions, type ProcessResult } from './imageTypes';
import { encodeAvif } from './avif';
import { sharpenImageData } from './sharpen';

let remote: Comlink.Remote<ImageWorkerApi> | null = null;

function supportsWorker(): boolean {
  return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
}

function getWorker(): Comlink.Remote<ImageWorkerApi> {
  if (!remote) {
    const worker = new Worker(new URL('../workers/image.worker.ts', import.meta.url), { type: 'module' });
    remote = Comlink.wrap<ImageWorkerApi>(worker);
  }
  return remote;
}

function isHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

// HEIC can't be decoded by the browser's native image pipeline, so we convert it to
// PNG first with libheif (heic2any), loaded on demand only when a HEIC file appears.
async function toDecodable(file: File): Promise<{ blob: Blob; type: string }> {
  if (isHeic(file)) {
    const heic2any = (await import('heic2any')).default;
    const out = await heic2any({ blob: file, toType: 'image/png' });
    const blob = (Array.isArray(out) ? out[0] : out) as Blob;
    return { blob, type: 'image/png' };
  }
  return { blob: file, type: file.type || 'image/*' };
}

// Fallback for the rare browser without Worker/OffscreenCanvas support.
async function processOnMain(blob: Blob, options: ProcessOptions): Promise<ProcessResult> {
  const bitmap = await createImageBitmap(blob);
  const src = clampCrop(options.crop, bitmap.width, bitmap.height);
  const { width, height } = computeSize(src.width, src.height, options.resize);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: options.targetFormat !== 'image/jpeg' });
  if (!ctx) throw new Error('Could not acquire 2D context');

  if (options.targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, src.x, src.y, src.width, src.height, 0, 0, width, height);
  bitmap.close();

  if (options.sharpen && options.sharpen > 0) {
    const id = ctx.getImageData(0, 0, width, height);
    sharpenImageData(id, options.sharpen);
    ctx.putImageData(id, 0, 0);
  }

  if (options.targetFormat === 'image/avif') {
    const data = ctx.getImageData(0, 0, width, height);
    const buf = await encodeAvif(data, options.quality);
    return { blob: new Blob([buf], { type: 'image/avif' }), width, height, outType: 'image/avif' };
  }

  const out: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Encoding failed'))),
      options.targetFormat,
      options.targetFormat === 'image/png' ? undefined : options.quality,
    );
  });
  return { blob: out, width, height, outType: out.type || options.targetFormat };
}

export async function processImage(file: File, options: ProcessOptions): Promise<ProcessResult> {
  const { blob, type } = await toDecodable(file);

  if (supportsWorker()) {
    const buffer = await blob.arrayBuffer();
    // Transfer (not copy) the pixel buffer into the worker for a zero-copy handoff.
    const input = Comlink.transfer({ buffer, type }, [buffer]);
    return getWorker().process(input, options);
  }

  return processOnMain(blob, options);
}
