import { processImage } from './imageEngine';
import type { ProcessResult, ResizeSpec, TargetFormat } from './imageTypes';

interface TargetOptions {
  targetBytes: number;
  targetFormat: TargetFormat;
  allowDownscale?: boolean;
}

function smaller(a: ProcessResult | null, b: ProcessResult): ProcessResult {
  return !a || b.blob.size < a.blob.size ? b : a;
}

// Compress an image to fit under a target byte size. It searches the quality setting, and if the
// smallest quality still overshoots, it shrinks the dimensions and tries again. Returns the best
// result that fits under the target, or the smallest one it could produce. Uses the normal engine,
// so HEIC input and every output format still work.
export async function compressToTarget(file: File, opts: TargetOptions): Promise<ProcessResult> {
  const { targetBytes, targetFormat, allowDownscale = true } = opts;
  const lossy = targetFormat !== 'image/png';
  const scales = allowDownscale ? [1, 0.8, 0.6, 0.45, 0.32, 0.2] : [1];

  let best: ProcessResult | null = null;

  for (const scale of scales) {
    const resize: ResizeSpec =
      scale < 1 ? { mode: 'percent', percent: Math.round(scale * 100) } : { mode: 'none' };

    // PNG has no quality control, so the only lever is the size.
    if (!lossy) {
      const out = await processImage(file, { targetFormat, quality: 1, resize });
      best = smaller(best, out);
      if (out.blob.size <= targetBytes) return out;
      continue;
    }

    // Binary search the quality for the best image that still fits under the target.
    let lo = 0.05;
    let hi = 0.95;
    let underTarget: ProcessResult | null = null;
    for (let i = 0; i < 7; i++) {
      const q = (lo + hi) / 2;
      const out = await processImage(file, { targetFormat, quality: q, resize });
      best = smaller(best, out);
      if (out.blob.size <= targetBytes) {
        underTarget = out;
        lo = q;
      } else {
        hi = q;
      }
    }
    if (underTarget) return underTarget;
  }

  return best as ProcessResult;
}
