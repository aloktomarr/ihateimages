import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import Select from '../components/Select';
import Slider from '../components/Slider';
import { compressToTarget } from '../lib/targetSize';
import { normalizeType, type ProcessOptions, type TargetFormat } from '../lib/imageTypes';

type FormatChoice = 'same' | TargetFormat;
type Mode = 'quality' | 'target';

const SIZE_PRESETS = [20, 50, 100, 200, 500];

export default function Compress() {
  const [mode, setMode] = useState<Mode>('quality');
  const [format, setFormat] = useState<FormatChoice>('image/webp');
  const [quality, setQuality] = useState(75);
  const [limit, setLimit] = useState(false);
  const [longEdge, setLongEdge] = useState(2000);
  const [targetKb, setTargetKb] = useState(100);
  const [allowDownscale, setAllowDownscale] = useState(true);

  const isPng = format === 'image/png';

  const buildOptions = useCallback(
    (file: File): ProcessOptions => {
      const targetFormat: TargetFormat = format === 'same' ? normalizeType(file.type) : format;
      return {
        targetFormat,
        quality: quality / 100,
        resize: limit ? { mode: 'longEdge', longEdge } : { mode: 'none' },
      };
    },
    [format, quality, limit, longEdge],
  );

  const processFile = useCallback(
    (file: File) => {
      const targetFormat: TargetFormat = format === 'same' ? normalizeType(file.type) : format;
      return compressToTarget(file, {
        targetBytes: Math.max(5, targetKb) * 1024,
        targetFormat,
        allowDownscale,
      });
    },
    [format, targetKb, allowDownscale],
  );

  const controls = (
    <>
      <div>
        <span className="mb-1 block text-sm font-medium text-fg">Compress by</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('quality')}
            className={`btn-ghost flex-1 ${mode === 'quality' ? 'border-accent text-accent' : ''}`}
          >
            Quality
          </button>
          <button
            type="button"
            onClick={() => setMode('target')}
            className={`btn-ghost flex-1 ${mode === 'target' ? 'border-accent text-accent' : ''}`}
          >
            Target size
          </button>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-fg">Output format</span>
        <Select value={format} onChange={(e) => setFormat(e.target.value as FormatChoice)}>
          <option value="image/webp">WebP (best size)</option>
          <option value="image/avif">AVIF (smallest)</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG (lossless)</option>
          <option value="same">Keep original</option>
        </Select>
      </label>

      {mode === 'quality' ? (
        <>
          <Slider
            label="Quality"
            min={1}
            max={100}
            value={quality}
            suffix="%"
            onChange={setQuality}
            disabled={isPng}
          />

          <label className="flex items-center gap-2 text-sm text-fg">
            <input type="checkbox" checked={limit} onChange={(e) => setLimit(e.target.checked)} />
            Limit dimensions
          </label>
          {limit && (
            <Slider
              label="Max long edge"
              min={400}
              max={6000}
              step={100}
              value={longEdge}
              suffix=" px"
              onChange={setLongEdge}
            />
          )}
        </>
      ) : (
        <>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg">Maximum size</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                value={targetKb}
                onChange={(e) => setTargetKb(Math.max(5, Number(e.target.value) || 0))}
                className="field"
              />
              <span className="text-sm text-muted">KB</span>
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            {SIZE_PRESETS.map((kb) => (
              <button
                key={kb}
                type="button"
                onClick={() => setTargetKb(kb)}
                className={`btn-ghost px-3 py-1 text-xs ${targetKb === kb ? 'border-accent text-accent' : ''}`}
              >
                {kb} KB
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={allowDownscale}
              onChange={(e) => setAllowDownscale(e.target.checked)}
            />
            Shrink dimensions if needed
          </label>

          <p className="text-xs text-muted">
            Useful for government forms and any upload with a size limit. The image is compressed to
            fit under the size you set. PNG can only get small by shrinking dimensions, so WebP or
            JPEG work best here.
          </p>
        </>
      )}
    </>
  );

  return (
    <ImageToolShell
      title="Compress images"
      description="Shrink JPEG, PNG, WebP, AVIF and HEIC. Compress by quality or down to a maximum file size. No watermark, no upload."
      actionLabel="Compress"
      buildOptions={buildOptions}
      processFile={mode === 'target' ? processFile : undefined}
      controls={controls}
      slug="/compress"
    />
  );
}
