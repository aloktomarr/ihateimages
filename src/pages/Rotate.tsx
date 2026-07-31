import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import Select from '../components/Select';
import { normalizeType, type ProcessOptions, type TargetFormat } from '../lib/imageTypes';

type FormatChoice = 'same' | TargetFormat;
type Rot = 0 | 90 | 180 | 270;

export default function Rotate() {
  const [rotate, setRotate] = useState<Rot>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState<FormatChoice>('same');

  const buildOptions = useCallback(
    (file: File): ProcessOptions => {
      const targetFormat: TargetFormat = format === 'same' ? normalizeType(file.type) : format;
      return {
        targetFormat,
        quality: 0.92,
        resize: { mode: 'none' },
        transform: { rotate, flipH, flipV },
      };
    },
    [rotate, flipH, flipV, format],
  );

  const controls = (
    <>
      <div>
        <span className="mb-1 block text-sm font-medium text-fg">Rotation</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRotate((r) => (((r + 270) % 360) as Rot))}
            className="btn-ghost flex-1"
          >
            Rotate left
          </button>
          <button
            type="button"
            onClick={() => setRotate((r) => (((r + 90) % 360) as Rot))}
            className="btn-ghost flex-1"
          >
            Rotate right
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Current rotation: {rotate}&deg;</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} />
        Flip horizontal
      </label>
      <label className="flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} />
        Flip vertical
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-fg">Output format</span>
        <Select value={format} onChange={(e) => setFormat(e.target.value as FormatChoice)}>
          <option value="same">Keep original</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
          <option value="image/avif">AVIF</option>
        </Select>
      </label>
    </>
  );

  return (
    <ImageToolShell
      title="Rotate & flip images"
      description="Rotate by 90 degrees or flip horizontally and vertically. Batch, no watermark, no upload."
      actionLabel="Apply"
      buildOptions={buildOptions}
      controls={controls}
      slug="/rotate"
    />
  );
}
