import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import Slider from '../components/Slider';
import { Field, FormatPicker, Segmented, Toggle } from '../components/controls';
import { normalizeType, type ProcessOptions, type ResizeSpec, type TargetFormat } from '../lib/imageTypes';

type Mode = 'longEdge' | 'percent' | 'exact';
type FormatChoice = 'same' | TargetFormat;

export default function Resize() {
  const [mode, setMode] = useState<Mode>('longEdge');
  const [longEdge, setLongEdge] = useState(1600);
  const [percent, setPercent] = useState(50);
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<FormatChoice>('same');
  const [quality, setQuality] = useState(90);

  const buildOptions = useCallback(
    (file: File): ProcessOptions => {
      let resize: ResizeSpec;
      if (mode === 'longEdge') resize = { mode: 'longEdge', longEdge };
      else if (mode === 'percent') resize = { mode: 'percent', percent };
      else resize = { mode: 'exact', width, height, keepAspect };

      const targetFormat: TargetFormat = format === 'same' ? normalizeType(file.type) : format;
      return { targetFormat, quality: quality / 100, resize };
    },
    [mode, longEdge, percent, width, height, keepAspect, format, quality],
  );

  const controls = (
    <>
      <Segmented
        label="Resize by"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'longEdge', label: 'Long edge' },
          { value: 'percent', label: 'Percent' },
          { value: 'exact', label: 'Exact' },
        ]}
      />

      {mode === 'longEdge' && (
        <Slider
          label="Long edge"
          min={100}
          max={6000}
          step={50}
          value={longEdge}
          suffix=" px"
          onChange={setLongEdge}
          hint="The longer side is set to this; the other follows."
        />
      )}
      {mode === 'percent' && (
        <Slider label="Scale" min={5} max={200} value={percent} suffix="%" onChange={setPercent} />
      )}
      {mode === 'exact' && (
        <>
          <Field label="Size in pixels">
            <div className="flex items-center gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Width in pixels</span>
                <input
                  type="number"
                  className="field tabular pl-9"
                  value={width}
                  min={1}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-faint">
                  W
                </span>
              </label>
              <span className="text-muted">&times;</span>
              <label className="relative flex-1">
                <span className="sr-only">Height in pixels</span>
                <input
                  type="number"
                  className="field tabular pl-9"
                  value={height}
                  min={1}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-faint">
                  H
                </span>
              </label>
            </div>
          </Field>
          <Toggle
            label="Keep aspect ratio"
            description="Fit inside the box without stretching."
            checked={keepAspect}
            onChange={setKeepAspect}
          />
        </>
      )}

      <FormatPicker
        value={format}
        onChange={setFormat}
        options={['same', 'image/jpeg', 'image/png', 'image/webp', 'image/avif'] as FormatChoice[]}
      />
      <Slider
        label="Quality"
        min={1}
        max={100}
        value={quality}
        suffix="%"
        onChange={setQuality}
        disabled={format === 'image/png'}
      />
    </>
  );

  return (
    <ImageToolShell
      title="Resize images"
      description="Scale by long edge, percentage or exact pixel dimensions. Batch resize with no watermark and no upload."
      actionLabel="Resize"
      buildOptions={buildOptions}
      controls={controls}
      slug="/resize"
    />
  );
}
