import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import { FormatPicker, Segmented, Toggle } from '../components/controls';
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
      <Segmented
        label="Scale"
        value={factor}
        onChange={setFactor}
        options={[
          { value: 2, label: '2x' },
          { value: 4, label: '4x' },
        ]}
        hint="Large images at 4x can take a few seconds."
      />

      <Toggle
        label="Sharpen after upscaling"
        description="Crisper edges on enlarged photos."
        checked={sharpen}
        onChange={setSharpen}
      />

      <FormatPicker
        value={format}
        onChange={setFormat}
        options={['same', 'image/png', 'image/jpeg', 'image/webp', 'image/avif'] as FormatChoice[]}
      />
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
