export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-muted">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent"
        aria-hidden
      />
      {label && <span>{label}</span>}
    </div>
  );
}
