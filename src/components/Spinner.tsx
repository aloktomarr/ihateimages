export default function Spinner({ label, className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-[13.5px] text-muted ${className}`} role="status">
      <span
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-on"
        aria-hidden
      />
      {label && <span>{label}</span>}
    </div>
  );
}
