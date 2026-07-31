import { clampCrop, computeSize, type ProcessOptions } from './imageTypes';

// Safe canvas ceiling. Browsers refuse to create canvases larger than roughly this per side
// (Chrome/Safari ~16384), so we clamp to it to avoid silent failures on very large images.
const MAX_SIDE = 16384;

type AnyCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export interface Prepared {
  canvasW: number;
  canvasH: number;
  downscaled: boolean;
  draw: (ctx: AnyCtx) => void;
}

// Shared geometry + drawing for both the worker and the main-thread fallback: applies crop,
// resize, an oversize safety clamp, then optional rotation and flipping in one pass.
export function prepare(bitmap: ImageBitmap, options: ProcessOptions): Prepared {
  const src = clampCrop(options.crop, bitmap.width, bitmap.height);
  let base = computeSize(src.width, src.height, options.resize);

  let downscaled = false;
  const longest = Math.max(base.width, base.height);
  if (longest > MAX_SIDE) {
    const s = MAX_SIDE / longest;
    base = {
      width: Math.max(1, Math.round(base.width * s)),
      height: Math.max(1, Math.round(base.height * s)),
    };
    downscaled = true;
  }

  const rot = (((options.transform?.rotate ?? 0) % 360) + 360) % 360;
  const swap = rot === 90 || rot === 270;
  const canvasW = swap ? base.height : base.width;
  const canvasH = swap ? base.width : base.height;
  const flipH = options.transform?.flipH ? -1 : 1;
  const flipV = options.transform?.flipV ? -1 : 1;

  const draw = (ctx: AnyCtx) => {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(canvasW / 2, canvasH / 2);
    if (rot) ctx.rotate((rot * Math.PI) / 180);
    if (flipH !== 1 || flipV !== 1) ctx.scale(flipH, flipV);
    ctx.drawImage(
      bitmap,
      src.x,
      src.y,
      src.width,
      src.height,
      -base.width / 2,
      -base.height / 2,
      base.width,
      base.height,
    );
    ctx.restore();
  };

  return { canvasW, canvasH, downscaled, draw };
}
