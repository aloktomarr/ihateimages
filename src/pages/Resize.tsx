import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import Select from '../components/Select';
import Slider from '../components/Slider';
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
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-fg">Resize mode</span>
        <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="longEdge">Fit long edge</option>
          <option value="percent">Percentage</option>
          <option value="exact">Exact size</option>
        </Select>
      </label>

      {mode === 'longEdge' && (
        <Slider label="Long edge" min={100} max={6000} step={50} value={longEdge} suffix=" px" onChange={setLongEdge} />
      )}
      {mode === 'percent' && (
        <Slider label="Scale" min={5} max={200} value={percent} suffix="%" onChange={setPercent} />
      )}
      {mode === 'exact' && (
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm text-fg">Width (px)</span>
            <input
              type="number"
              className="field mt-1"
              value={width}
              min={1}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </label>
          <label className="block">
            <span className="text-sm text-fg">Height (px)</span>
            <input
              type="number"
              className="field mt-1"
              value={height}
              min={1}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(e) => setKeepAspect(e.target.checked)}
            />
            Keep aspect ratio
          </label>
        </div>
      )}

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
      description="Scale by long edge, percentage or exact dimensions. Batch, no watermark, no upload."
      actionLabel="Resize"
      buildOptions={buildOptions}
      controls={controls}
      slug="/resize"
    />
  );
}
