import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import { normalizeType, type ProcessOptions } from '../lib/imageTypes';

export default function StripMetadata() {
  const [meta, setMeta] = useState<string[] | null>(null);
  const [scanning, setScanning] = useState(false);

  // Re-encoding through a canvas drops all EXIF/GPS/XMP metadata as a side effect.
  const buildOptions = useCallback(
    (file: File): ProcessOptions => ({
      targetFormat: normalizeType(file.type),
      quality: 0.92,
      resize: { mode: 'none' },
    }),
    [],
  );

  // Scan (on device) so we can show the user exactly what will be removed.
  const onFilesChange = useCallback(async (files: File[]) => {
    setMeta(null);
    setScanning(true);
    try {
      const exifr = (await import('exifr')) as unknown as {
        parse: (input: Blob, options?: unknown) => Promise<Record<string, unknown> | null>;
      };
      const found: string[] = [];
      for (const f of files.slice(0, 5)) {
        const d = await exifr.parse(f, { gps: true, tiff: true, exif: true }).catch(() => null);
        if (d) {
          if (d.latitude || d.GPSLatitude) found.push(`${f.name}: GPS location`);
          if (d.Make || d.Model) {
            found.push(`${f.name}: Camera ${[d.Make, d.Model].filter(Boolean).join(' ')}`);
          }
          if (d.DateTimeOriginal || d.CreateDate) found.push(`${f.name}: Original timestamp`);
        }
      }
      setMeta(found.length ? found : ['No obvious EXIF / GPS metadata detected.']);
    } catch {
      setMeta(null);
    } finally {
      setScanning(false);
    }
  }, []);

  const controls = (
    <div className="card p-3 text-sm">
      <p className="font-semibold text-fg">Detected metadata</p>
      {scanning && <p className="mt-1 text-xs text-muted">Scanning</p>}
      {meta && (
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {meta.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">
        Cleaning re-encodes each image and strips EXIF, GPS location and camera info.
      </p>
    </div>
  );

  return (
    <ImageToolShell
      title="Strip image metadata"
      description="Remove GPS location, camera details and timestamps before you share a photo. Everything stays on your device."
      actionLabel="Clean metadata"
      buildOptions={buildOptions}
      controls={controls}
      onFilesChange={onFilesChange}
      slug="/strip-metadata"
    />
  );
}
