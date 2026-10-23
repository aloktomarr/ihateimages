import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import { Field, FormatPicker, Toggle } from '../components/controls';
import { Icon } from '../components/icons';
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
      <Field label="Rotation">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRotate((r) => ((r + 270) % 360) as Rot)}
            className="btn btn-secondary h-11 flex-1"
            aria-label="Rotate left 90 degrees"
          >
            <Icon name="rotateLeft" className="h-4 w-4" />
            Left
          </button>
          <span
            className="grid h-11 w-16 shrink-0 place-items-center rounded-xl bg-subtle"
            aria-live="polite"
            aria-label={`Current rotation ${rotate} degrees`}
          >
            <span className="flex flex-col items-center">
              <span
                className="block h-4 w-3 rounded-[3px] border-2 border-fg transition-transform duration-300"
                style={{ transform: `rotate(${rotate}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})` }}
              >
                <span className="block h-1 w-full bg-fg" />
              </span>
              <span className="tabular mt-0.5 text-[11px] font-bold text-fg">{rotate}&deg;</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => setRotate((r) => ((r + 90) % 360) as Rot)}
            className="btn btn-secondary h-11 flex-1"
            aria-label="Rotate right 90 degrees"
          >
            Right
            <Icon name="rotate" className="h-4 w-4" />
          </button>
        </div>
      </Field>

      <div className="space-y-4">
        <Toggle label="Flip horizontal" description="Mirror left to right." checked={flipH} onChange={setFlipH} />
        <Toggle label="Flip vertical" description="Mirror top to bottom." checked={flipV} onChange={setFlipV} />
      </div>

      <FormatPicker
        value={format}
        onChange={setFormat}
        options={['same', 'image/jpeg', 'image/png', 'image/webp', 'image/avif'] as FormatChoice[]}
      />
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
