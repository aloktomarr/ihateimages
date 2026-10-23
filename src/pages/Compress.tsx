import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ImageToolShell from '../components/ImageToolShell';
import Slider from '../components/Slider';
import { Field, FormatPicker, Presets, Segmented, Toggle } from '../components/controls';
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
  const [searchParams] = useSearchParams();

  const isPng = format === 'image/png';

  // Apply presets from the URL once on load, e.g. /compress?target=100&format=jpeg.
  useEffect(() => {
    const target = searchParams.get('target');
    const modeParam = searchParams.get('mode');
    const formatParam = searchParams.get('format');
    const qParam = searchParams.get('q');
    if (target) {
      const kb = parseInt(target.replace(/kb$/i, ''), 10);
      if (kb > 0) {
        setTargetKb(Math.max(5, kb));
        setMode('target');
      }
    }
    if (modeParam === 'target' || modeParam === 'quality') setMode(modeParam);
    if (formatParam) {
      const map: Record<string, FormatChoice> = {
        webp: 'image/webp',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        avif: 'image/avif',
        same: 'same',
      };
      const chosen = map[formatParam.toLowerCase()];
      if (chosen) setFormat(chosen);
    }
    if (qParam) {
      const q = parseInt(qParam, 10);
      if (q >= 1 && q <= 100) setQuality(q);
    }
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <Segmented
        label="Compress by"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'quality', label: 'Quality' },
          { value: 'target', label: 'Target size' },
        ]}
      />

      <FormatPicker
        value={format}
        onChange={setFormat}
        options={['image/webp', 'image/avif', 'image/jpeg', 'image/png', 'same'] as FormatChoice[]}
      />

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
            hint={isPng ? 'PNG is lossless, so quality does not apply.' : '75 to 85 is the sweet spot for photos.'}
          />

          <Toggle
            label="Limit dimensions"
            description="Cap the long edge to shrink even further."
            checked={limit}
            onChange={setLimit}
          />
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
          <Field
            label="Maximum file size"
            hint="For forms and uploads with a size limit. WebP and JPEG get there best; PNG can only shrink by losing pixels."
          >
            <div className="relative">
              <input
                type="number"
                min={5}
                value={targetKb}
                onChange={(e) => setTargetKb(Math.max(5, Number(e.target.value) || 0))}
                className="field tabular pr-12 text-[15px] font-semibold"
                aria-label="Maximum file size in KB"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted">
                KB
              </span>
            </div>
            <div className="mt-2.5">
              <Presets options={SIZE_PRESETS} value={targetKb} onChange={setTargetKb} format={(kb) => `${kb} KB`} />
            </div>
          </Field>

          <Toggle
            label="Shrink dimensions if needed"
            description="Lets very small targets succeed."
            checked={allowDownscale}
            onChange={setAllowDownscale}
          />
        </>
      )}
    </>
  );

  return (
    <ImageToolShell
      title="Compress images"
      description="Shrink JPEG, PNG, WebP, AVIF and HEIC by quality, or down to an exact file size. Full resolution, no watermark, no upload."
      actionLabel="Compress"
      buildOptions={buildOptions}
      processFile={mode === 'target' ? processFile : undefined}
      controls={controls}
      slug="/compress"
    />
  );
}
