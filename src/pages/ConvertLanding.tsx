import { useCallback, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ImageToolShell from '../components/ImageToolShell';
import Slider from '../components/Slider';
import ConversionMatrix from '../components/ConversionMatrix';
import { FaqSection, SectionHeader, StepCards } from '../components/Sections';
import { CONVERSIONS_BY_SLUG, conversionFaq, conversionSteps } from '../lib/landing';
import type { ProcessOptions } from '../lib/imageTypes';

export default function ConvertLanding() {
  const { slug } = useParams();
  const conv = slug ? CONVERSIONS_BY_SLUG[slug] : undefined;
  const [quality, setQuality] = useState(90);

  const buildOptions = useCallback(
    (): ProcessOptions => ({
      targetFormat: conv ? conv.targetMime : 'image/jpeg',
      quality: quality / 100,
      resize: { mode: 'none' },
    }),
    [conv, quality],
  );

  // Unknown slug -> send to the general converter.
  if (!conv) return <Navigate to="/convert" replace />;

  const isPng = conv.targetMime === 'image/png';
  const steps = conversionSteps(conv);
  const faq = conversionFaq(conv);

  const controls = (
    <>
      <div className="flex items-center gap-3 rounded-xl bg-subtle p-3">
        <span className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-fg">
          {conv.fromLabel}
        </span>
        <span className="h-px flex-1 bg-line-strong" />
        <span className="rounded-lg bg-ink px-2.5 py-1.5 text-[13px] font-bold text-ink-fg">{conv.toLabel}</span>
      </div>
      <Slider
        label="Quality"
        min={1}
        max={100}
        value={quality}
        suffix="%"
        onChange={setQuality}
        disabled={isPng}
        hint={
          isPng
            ? 'PNG is lossless, so quality does not apply.'
            : 'Full resolution and no watermark at any setting.'
        }
      />
    </>
  );

  return (
    <ImageToolShell
      title={`Convert ${conv.fromLabel} to ${conv.toLabel}`}
      description={`Turn ${conv.fromLabel} images into ${conv.toLabel} right in your browser. Batch convert for free, with no upload, no watermark and full quality.`}
      actionLabel={`Convert to ${conv.toLabel}`}
      buildOptions={buildOptions}
      controls={controls}
    >
      <div className="mt-28 space-y-28">
        <section>
          <SectionHeader title={`How to convert ${conv.fromLabel} to`} accent={`${conv.toLabel}.`} />
          <div className="mt-10">
            <StepCards steps={steps} />
          </div>
        </section>

        <section>
          <SectionHeader title={`${conv.fromLabel} vs`} accent={`${conv.toLabel}.`} />
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {[
              [conv.fromLabel, conv.fromAbout, 'From'],
              [conv.toLabel, conv.toAbout, 'To'],
            ].map(([label, about, tag]) => (
              <div key={tag} className="card p-6">
                <p className="eyebrow">{tag}</p>
                <p className="display mt-3 text-[2.5rem]">{label}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{about}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted">
            Converting {conv.fromLabel} to {conv.toLabel} gives you a more compatible, easy-to-share file while
            keeping your images private, since nothing is ever uploaded.
          </p>
        </section>

        <FaqSection items={faq} />

        <section>
          <SectionHeader title="Other" accent="conversions." />
          <div className="mt-10">
            <ConversionMatrix />
          </div>
        </section>
      </div>
    </ImageToolShell>
  );
}
