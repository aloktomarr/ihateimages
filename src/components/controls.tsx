import type { ReactNode } from 'react';

// Small, shared form primitives for tool settings. Native elements underneath, so keyboard and
// screen reader support come for free.

export function Field({
  label,
  hint,
  aside,
  children,
}: {
  label: string;
  hint?: ReactNode;
  /** Optional element on the right of the label row (e.g. a current value). */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold text-fg">{label}</span>
        {aside}
      </div>
      {children}
      {hint && <p className="hint mt-2">{hint}</p>}
    </div>
  );
}

interface SegmentedProps<T extends string | number> {
  label?: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  hint?: ReactNode;
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  hint,
}: SegmentedProps<T>) {
  const group = (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className="seg-btn"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
  if (!label) return group;
  return (
    <Field label={label} hint={hint}>
      {group}
    </Field>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center justify-between gap-4 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold text-fg">{label}</span>
        {description && <span className="hint block">{description}</span>}
      </span>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-on' : 'bg-line-strong'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full shadow-soft transition-all ${
            checked ? 'left-[1.125rem] bg-on-fg' : 'left-0.5 bg-white'
          }`}
        />
      </span>
    </button>
  );
}

const FORMAT_INFO: Record<string, { label: string; caption: string }> = {
  same: { label: 'Original', caption: 'Keep the same format' },
  'image/webp': { label: 'WebP', caption: 'Best for the web' },
  'image/avif': { label: 'AVIF', caption: 'Smallest files' },
  'image/jpeg': { label: 'JPEG', caption: 'Opens anywhere' },
  'image/png': { label: 'PNG', caption: 'Lossless' },
};

/** Output format as a grid of cards, each with a one-line reason to pick it. */
export function FormatPicker<T extends string>({
  label = 'Output format',
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={label}>
        {options.map((o, i) => {
          const info = FORMAT_INFO[o] ?? { label: o, caption: '' };
          const active = o === value;
          const wide = options.length % 2 === 1 && i === options.length - 1;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o)}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${wide ? 'col-span-2' : ''} ${
                active
                  ? 'border-fg bg-subtle shadow-[inset_0_0_0_1px_rgb(var(--fg))]'
                  : 'border-line hover:border-line-strong hover:bg-subtle/50'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-fg">{info.label}</span>
                {active && (
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-ink text-ink-fg">
                    <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={3.5} aria-hidden>
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                )}
              </span>
              <span className="mt-0.5 block truncate text-[12px] leading-snug text-muted">{info.caption}</span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}

/** Pill buttons for quick values (e.g. 50 KB, 100 KB). */
export function Presets<T extends string | number>({
  options,
  value,
  onChange,
  format = (v) => String(v),
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={`h-8 rounded-full border px-3 text-[12.5px] font-semibold transition ${
            o === value
              ? 'border-transparent bg-ink text-ink-fg'
              : 'border-line text-muted hover:border-line-strong hover:text-fg'
          }`}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}

/** Thin divider used between groups of settings. */
export function Divider() {
  return <hr className="border-line" />;
}
