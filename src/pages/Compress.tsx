import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import Select from '../components/Select';
import Slider from '../components/Slider';
import { normalizeType, type ProcessOptions, type TargetFormat } from '../lib/imageTypes';

type FormatChoice = 'same' | TargetFormat;

export default function Compress() {
  const [format, setFormat] = useState<FormatChoice>('image/webp');
  const [quality, setQuality] = useState(75);
  const [limit, setLimit] = useState(false);
  const [longEdge, setLongEdge] = useState(2000);

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

  const controls = (
    <>
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
  );

  return (
    <ImageToolShell
      title="Compress images"
      description="Shrink JPEG, PNG, WebP, AVIF and HEIC at full resolution. No watermark, no upload."
      actionLabel="Compress"
      buildOptions={buildOptions}
      controls={controls}
      slug="/compress"
    />
  );
}
