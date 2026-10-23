// Brand mark: a dark tile with a white landscape and a lime sun. The tile stays dark in both
// themes (slightly lifted in dark mode so it does not vanish into the background).
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="16" className="fill-[#0e0f11] dark:fill-[#25262c]" />
      <circle cx="43" cy="22" r="7" fill="#d4fa4c" />
      <path d="M9 52 L25 32 L36 44 L43 37 L55 52 Z" fill="#ffffff" />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-[-0.03em] [font-feature-settings:'cv08'] ${className}`}>
      iHate<span className="text-muted">Images</span>
    </span>
  );
}
