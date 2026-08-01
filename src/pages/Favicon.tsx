import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import Spinner from '../components/Spinner';
import ToolContent from '../components/ToolContent';
import { generateFavicons } from '../lib/favicon';
import { formatBytes } from '../lib/format';
import { nextPaint } from '../lib/schedule';

export default function Favicon() {
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<{ size: number; url: string }[]>([]);
  const [archive, setArchive] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const urlsRef = useRef<string[]>([]);

  const cleanup = useCallback(() => {
    urlsRef.current.forEach(URL.revokeObjectURL);
    urlsRef.current = [];
  }, []);
  useEffect(() => cleanup, [cleanup]);

  const onFiles = useCallback(
    async (files: File[]) => {
      cleanup();
      setPreviews([]);
      setArchive(null);
      setError('');
      setBusy(true);
      // Paint the busy state before building the icons so the click stays responsive (good INP).
      await nextPaint();
      try {
        const { archive: blob, previews: p } = await generateFavicons(files[0]);
        p.forEach((x) => urlsRef.current.push(x.url));
        setPreviews(p);
        setArchive(blob);
      } catch {
        setError('Could not read that image. PNG, JPG, WebP or SVG work best for icons.');
      } finally {
        setBusy(false);
      }
    },
    [cleanup],
  );

  const download = () => {
    if (!archive) return;
    const url = URL.createObjectURL(archive);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicons.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Favicon &amp; app icons</h1>
      <p className="mb-5 max-w-2xl text-[15px] text-muted">
        Turn one image into a full icon set: favicon.ico, PNGs, an apple-touch-icon, PWA icons and a
        web manifest, zipped and ready to drop into your site. A square image works best.
      </p>

      <Dropzone multiple={false} onFiles={onFiles} />

      {busy && (
        <div className="mt-6">
          <Spinner label="Generating icons" />
        </div>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {previews.length > 0 && (
        <div className="mt-6 space-y-5">
          <div className="card flex flex-wrap items-end gap-5 p-4">
            {previews.map((p) => {
              const dim = Math.min(p.size, 96);
              return (
                <figure key={p.size} className="text-center">
                  <img
                    src={p.url}
                    alt={`${p.size}px icon`}
                    style={{ width: dim, height: dim }}
                    className="rounded-lg border border-line bg-hover"
                  />
                  <figcaption className="mt-1 text-xs text-muted">
                    {p.size}×{p.size}
                  </figcaption>
                </figure>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={download} className="btn-primary">
              Download favicons.zip {archive ? `(${formatBytes(archive.size)})` : ''}
            </button>
            <span className="text-xs text-muted">
              Includes favicon.ico, 16-512px PNGs, apple-touch-icon, site.webmanifest and an HTML
              snippet.
            </span>
          </div>
        </div>
      )}

      <ToolContent slug="/favicon" />
    </section>
  );
}
