import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import Select from '../components/Select';
import { normalizeType, type ProcessOptions, type TargetFormat } from '../lib/imageTypes';

type FormatChoice = 'same' | TargetFormat;

export default function Upscale() {
  const [factor, setFactor] = useState(2);
  const [sharpen, setSharpen] = useState(true);
  const [format, setFormat] = useState<FormatChoice>('same');

  const buildOptions = useCallback(
    (file: File): ProcessOptions => {
      const targetFormat: TargetFormat = format === 'same' ? normalizeType(file.type) : format;
      return {
        targetFormat,
        quality: 0.92,
        resize: { mode: 'percent', percent: factor * 100 },
        sharpen: sharpen ? 0.4 : 0,
      };
    },
    [factor, sharpen, format],
  );

  const controls = (
    <>
      <div>
        <span className="mb-1 block text-sm font-medium text-fg">Scale</span>
        <div className="flex gap-2">
          {[2, 4].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFactor(f)}
              className={`btn-ghost flex-1 ${factor === f ? 'border-accent text-accent' : ''}`}
            >
              {f}x
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} />
        Sharpen after upscaling
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-fg">Output format</span>
        <Select value={format} onChange={(e) => setFormat(e.target.value as FormatChoice)}>
          <option value="same">Keep original</option>
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/webp">WebP</option>
          <option value="image/avif">AVIF</option>
        </Select>
      </label>

      <p className="text-xs text-muted">
        Enlarges with high-quality resampling plus optional sharpening. Large images at 4x can take
        a few seconds.
      </p>
    </>
  );

  return (
    <ImageToolShell
      title="Upscale images"
      description="Enlarge images 2x or 4x with high-quality resampling and sharpening. Batch, no watermark, no upload."
      actionLabel="Upscale"
      buildOptions={buildOptions}
      controls={controls}
      slug="/upscale"
    />
  );
}
