import { useCallback, useState } from 'react';
import ImageToolShell from '../components/ImageToolShell';
import { Icon } from '../components/icons';
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
    <div>
      <p className="text-[13px] font-semibold text-fg">What we found</p>
      <div className="mt-2 rounded-xl border border-line bg-subtle/50 p-3.5">
        {!meta && !scanning && (
          <p className="hint">Add photos to scan them on this device for hidden location and camera data.</p>
        )}
        {scanning && <p className="hint">Scanning on your device&hellip;</p>}
        {meta && (
          <ul className="space-y-2">
            {meta.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-fg">
                <Icon
                  name={m.startsWith('No obvious') ? 'check' : 'eye'}
                  className={`mt-px h-4 w-4 shrink-0 ${m.startsWith('No obvious') ? 'text-good' : 'text-danger'}`}
                />
                <span className="min-w-0 break-words">{m}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="hint mt-3">
        Cleaning re-encodes each image, which drops EXIF, GPS location and camera details. The picture itself is
        unchanged.
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
