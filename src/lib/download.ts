// Save helpers. Everything is a local object URL; nothing goes over the network.

export function downloadUrl(url: string, name: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, name);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "photo.jpg" -> "photo (2).jpg" until the name is unused. */
function uniqueName(name: string, taken: Set<string>): string {
  if (!taken.has(name)) return name;
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let n = 2;
  while (taken.has(`${base} (${n})${ext}`)) n += 1;
  return `${base} (${n})${ext}`;
}

/** Zip the files (fflate is loaded only when needed) and save the archive. */
export async function downloadZip(entries: { name: string; blob: Blob }[], zipName: string): Promise<void> {
  const { zipSync } = await import('fflate');
  const files: Record<string, Uint8Array> = {};
  const taken = new Set<string>();
  for (const e of entries) {
    const name = uniqueName(e.name, taken);
    taken.add(name);
    files[name] = new Uint8Array(await e.blob.arrayBuffer());
  }
  // Images are already compressed, so store them as-is (level 0) for speed.
  const zipped = zipSync(files, { level: 0 });
  downloadBlob(new Blob([zipped], { type: 'application/zip' }), zipName);
}
