import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageToolShell from '../components/ImageToolShell';
import Slider from '../components/Slider';
import { FormatPicker } from '../components/controls';
import ConversionMatrix from '../components/ConversionMatrix';
import { SectionHeader } from '../components/Sections';
import { Icon } from '../components/icons';
import { type ProcessOptions, type TargetFormat } from '../lib/imageTypes';

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
      <FormatPicker
        label="Convert to"
        value={format}
        onChange={setFormat}
        options={['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as TargetFormat[]}
      />

      <Slider
        label="Quality"
        min={1}
        max={100}
        value={quality}
        suffix="%"
        onChange={setQuality}
        disabled={isPng}
        hint={isPng ? 'PNG is lossless, so quality does not apply.' : undefined}
      />
      <p className="hint flex gap-2 rounded-xl bg-subtle px-3 py-2.5">
        <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-fg" />
        <span>
          iPhone <strong className="text-fg">HEIC</strong> photos work too. Drop them in and pick JPG to open them
          anywhere.
        </span>
      </p>
    </>
  );

  return (
    <ImageToolShell
      title="Convert images"
      description="HEIC, JPEG, PNG, WebP and AVIF to any format. Batch convert at full quality, with no watermark and no upload."
      actionLabel="Convert"
      buildOptions={buildOptions}
      controls={controls}
      slug="/convert"
    >
      <section className="mt-28">
        <SectionHeader
          eyebrow="Format pairs"
          title="Every conversion,"
          accent="one click away."
          lead="Each pair has its own converter with the output already set. Pick your starting format on the left."
        >
          <Link to="/convert/heic-to-jpg" className="btn btn-secondary">
            HEIC to JPG <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </SectionHeader>
        <div className="mt-10">
          <ConversionMatrix />
        </div>
      </section>
    </ImageToolShell>
  );
}
