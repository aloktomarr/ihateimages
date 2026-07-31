import type { CSSProperties } from 'react';

interface Props {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  disabled?: boolean;
}

export default function Slider({ label, min, max, step = 1, value, onChange, suffix, disabled }: Props) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <label className={`block ${disabled ? 'opacity-50' : ''}`}>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-fg">{label}</span>
        <span className="tabular-nums text-muted">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` } as CSSProperties}
        className="w-full"
      />
    </label>
  );
}
