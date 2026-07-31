import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageToolShell from '../components/ImageToolShell';
import Select from '../components/Select';
import Slider from '../components/Slider';
import { type ProcessOptions, type TargetFormat } from '../lib/imageTypes';
import { POPULAR_CONVERSIONS } from '../lib/landing';
import { prefetchConvertLanding } from '../lib/routes';

export default function Convert() {
  const [format, setFormat] = useState<TargetFormat>('image/jpeg');
  const [quality, setQuality] = useState(90);

  const isPng = format === 'image/png';

  const buildOptions = useCallback(
    (_file: File): ProcessOptions => ({
      targetFormat: format,
      quality: quality / 100,
      resize: { mode: 'none' },
    }),
    [format, quality],
  );

  const controls = (
    <>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-fg">Convert to</span>
        <Select value={format} onChange={(e) => setFormat(e.target.value as TargetFormat)}>
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
        disabled={isPng}
      />
      <p className="text-xs text-muted">
        Drop <strong>HEIC</strong> photos from your iPhone to convert them to JPG, PNG, WebP or AVIF.
      </p>
    </>
  );

  return (
    <div>
      <ImageToolShell
        title="Convert images"
        description="HEIC, JPEG, PNG, WebP and AVIF to any format. Batch convert, no watermark, no upload."
        actionLabel="Convert"
        buildOptions={buildOptions}
        controls={controls}
        slug="/convert"
      />

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-extrabold tracking-tight">Popular conversions</h2>
        <p className="mt-2 text-sm text-muted">
          Jump to a dedicated converter for a specific format pair.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {POPULAR_CONVERSIONS.map((c) => (
            <Link
              key={c.slug}
              to={c.path}
              onMouseEnter={prefetchConvertLanding}
              className="btn-ghost"
            >
              {c.fromLabel} to {c.toLabel}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
