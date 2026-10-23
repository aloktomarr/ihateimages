import { useState, type CSSProperties } from 'react';
import { Icon } from './icons';

interface Props {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  /** Show a checkerboard behind the images (for transparent results). */
  checker?: boolean;
  className?: string;
}

// Drag (or use the arrow keys) to wipe between the original and the result. When the two have
// different shapes (a rotate, for example) or the original cannot be drawn (HEIC in most
// browsers), it falls back to showing them side by side.
export default function CompareSlider({ before, after, beforeLabel, afterLabel, checker, className = '' }: Props) {
  const [pos, setPos] = useState(50);
  const [ratioA, setRatioA] = useState<number | null>(null);
  const [ratioB, setRatioB] = useState<number | null>(null);
  const [beforeBroken, setBeforeBroken] = useState(false);

  const ratio = ratioB ?? ratioA ?? 4 / 3;
  const mismatch = ratioA !== null && ratioB !== null && Math.abs(ratioA - ratioB) / ratioB > 0.02;
  const bg = checker ? 'checkerboard' : 'bg-subtle';

  const onLoad = (set: (r: number) => void) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) set(img.naturalWidth / img.naturalHeight);
  };

  if (mismatch || beforeBroken) {
    return (
      <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
        {[
          { src: before, label: beforeLabel, broken: beforeBroken },
          { src: after, label: afterLabel, broken: false },
        ].map((s) => (
          <figure key={s.label} className={`relative overflow-hidden rounded-2xl ${bg}`} style={{ height: 'min(56vh, 480px)' }}>
            {s.broken ? (
              <div className="grid h-full place-items-center text-[13px] text-muted">Preview not available</div>
            ) : (
              <img src={s.src} alt={s.label} className="h-full w-full object-contain" />
            )}
            <figcaption className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur">
              {s.label}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full select-none overflow-hidden rounded-2xl ring-offset-2 ring-offset-surface [&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-fg ${bg} ${className}`}
      style={{ aspectRatio: String(ratio), maxHeight: '62vh' }}
    >
      <img
        src={after}
        alt={afterLabel}
        onLoad={onLoad(setRatioB)}
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />
      <img
        src={before}
        alt={beforeLabel}
        onLoad={onLoad(setRatioA)}
        onError={() => setBeforeBroken(true)}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` } as CSSProperties}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.15)]" />
        <div className="absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#0e0f11] shadow-lift">
          <span className="flex">
            <Icon name="chevronRight" className="-mr-1 h-4 w-4 rotate-180" />
            <Icon name="chevronRight" className="-ml-1 h-4 w-4" />
          </span>
        </div>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur">
        {afterLabel}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Drag to compare the original and the result"
        className="absolute inset-0 m-0 cursor-ew-resize opacity-0"
        style={{ height: '100%' }}
      />
    </div>
  );
}
