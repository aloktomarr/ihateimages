import * as Comlink from 'comlink';
import { clampCrop, computeSize, type ProcessInput, type ProcessOptions, type ProcessResult } from '../lib/imageTypes';
import { encodeAvif } from '../lib/avif';
import { sharpenImageData } from '../lib/sharpen';

// This code runs OFF the main thread. Decoding, resizing and encoding a large image
// can block for hundreds of ms, doing it here keeps the UI at 60fps (Addy Osmani's
// "get off the main thread" rule), using OffscreenCanvas so no DOM is required.
async function process(input: ProcessInput, options: ProcessOptions): Promise<ProcessResult> {
  const srcBlob = new Blob([input.buffer], { type: input.type || 'application/octet-stream' });
  const bitmap = await createImageBitmap(srcBlob);

  // Optional crop (source pixels), then optional resize of the cropped region.
  const src = clampCrop(options.crop, bitmap.width, bitmap.height);
  const { width, height } = computeSize(src.width, src.height, options.resize);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { alpha: options.targetFormat !== 'image/jpeg' });
  if (!ctx) throw new Error('Could not acquire 2D context');

  // JPEG has no alpha channel, flatten transparency onto white to avoid black boxes.
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

  const encodeOpts: ImageEncodeOptions = { type: options.targetFormat };
  if (options.targetFormat !== 'image/png') encodeOpts.quality = options.quality;
  const blob = await canvas.convertToBlob(encodeOpts);
  return { blob, width, height, outType: blob.type || options.targetFormat };
}

const api = { process };
export type ImageWorkerApi = typeof api;
Comlink.expose(api);
