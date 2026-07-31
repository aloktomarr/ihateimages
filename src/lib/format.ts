export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function renameExt(name: string, ext: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

export function savings(inSize: number, outSize: number): string {
  if (!inSize) return '';
  const pct = Math.round((1 - outSize / inSize) * 100);
  return pct >= 0 ? `-${pct}%` : `+${Math.abs(pct)}%`;
}
