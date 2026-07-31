import { useCallback, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ImageToolShell from '../components/ImageToolShell';
import Slider from '../components/Slider';
import { prefetchConvertLanding } from '../lib/routes';
import {
  CONVERSIONS,
  CONVERSIONS_BY_SLUG,
  conversionFaq,
  conversionSteps,
  type ConversionMeta,
} from '../lib/landing';
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
  const related: ConversionMeta[] = CONVERSIONS.filter(
    (c) => c.slug !== conv.slug && (c.from === conv.from || c.to === conv.to),
  ).slice(0, 6);

  const controls = (
    <>
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
        Output is full resolution with no watermark. Everything runs on your device.
      </p>
    </>
  );

  return (
    <div>
      <ImageToolShell
        title={`Convert ${conv.fromLabel} to ${conv.toLabel}`}
        description={`Turn ${conv.fromLabel} images into ${conv.toLabel} right in your browser. Batch convert for free, with no upload, no watermark and full quality.`}
        actionLabel={`Convert to ${conv.toLabel}`}
        buildOptions={buildOptions}
        controls={controls}
      />

      <div className="mt-14 max-w-3xl space-y-10">
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight">
            How to convert {conv.fromLabel} to {conv.toLabel}
          </h2>
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => (
              <li key={s.name} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-[15px] text-fg">
                  <span className="font-semibold">{s.name}.</span>{' '}
                  <span className="text-muted">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {conv.fromLabel} vs {conv.toLabel}
          </h2>
          <p className="mt-3 text-[15px] text-muted">{conv.fromAbout}</p>
          <p className="mt-2 text-[15px] text-muted">{conv.toAbout}</p>
          <p className="mt-2 text-[15px] text-muted">
            Converting {conv.fromLabel} to {conv.toLabel} gives you a more compatible, easy-to-share
            file while keeping your images private, since nothing is ever uploaded.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold tracking-tight">Frequently asked questions</h2>
          <div className="mt-4 space-y-5">
            {faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-fg">{f.q}</h3>
                <p className="mt-1 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold tracking-tight">Related conversions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {related.map((c) => (
              <Link
                key={c.slug}
                to={c.path}
                onMouseEnter={prefetchConvertLanding}
                className="btn-ghost"
              >
                {c.fromLabel} to {c.toLabel}
              </Link>
            ))}
            <Link to="/convert" className="btn-ghost">
              All formats
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
