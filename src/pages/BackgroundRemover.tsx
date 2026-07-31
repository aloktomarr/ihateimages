import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import Spinner from '../components/Spinner';
import ToolContent from '../components/ToolContent';
import { formatBytes, renameExt } from '../lib/format';

type Status = 'idle' | 'working' | 'done' | 'error';
type BgMode = 'transparent' | 'color';

// The AI cutout runs fully on-device. The model files download once from the CDN and are then
// cached by the browser/service worker, so repeat runs work offline. The image is never uploaded.
export default function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [origUrl, setOrigUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [cutout, setCutout] = useState<Blob | null>(null); // transparent PNG from the model
  const [outBlob, setOutBlob] = useState<Blob | null>(null); // final (composited) PNG to download
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [bgMode, setBgMode] = useState<BgMode>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');

  const urls = useRef<string[]>([]);
  const track = (u: string) => {
    urls.current.push(u);
    return u;
  };
  const cleanup = useCallback(() => {
    urls.current.forEach(URL.revokeObjectURL);
    urls.current = [];
  }, []);
  useEffect(() => cleanup, [cleanup]);

  const onFiles = useCallback(
    (files: File[]) => {
      cleanup();
      const f = files[0];
      setFile(f);
      setOrigUrl(track(URL.createObjectURL(f)));
      setResultUrl(null);
      setCutout(null);
      setOutBlob(null);
      setStatus('idle');
      setError('');
      setProgress('');
    },
    [cleanup],
  );

  // Draw the transparent cut-out over a solid colour when the user wants a filled background.
  const composite = useCallback(async (src: Blob, mode: BgMode, color: string): Promise<Blob> => {
    if (mode === 'transparent') return src;
    const bmp = await createImageBitmap(src);
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, bmp.width, bmp.height);
    ctx.drawImage(bmp, 0, 0);
    bmp.close();
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
  }, []);

  const setResult = useCallback((blob: Blob) => {
    setOutBlob(blob);
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return track(URL.createObjectURL(blob));
    });
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setStatus('working');
    setError('');
    setProgress('Loading AI model');
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const transparent = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          const pct = total ? Math.round((current / total) * 100) : 0;
          setProgress(key.startsWith('fetch') ? `Downloading model ${pct}%` : `Removing background ${pct}%`);
        },
      });
      setCutout(transparent);
      setResult(await composite(transparent, bgMode, bgColor));
      setStatus('done');
      setProgress('');
    } catch (e) {
      setError((e as Error).message || 'Could not remove the background');
      setStatus('error');
    }
  }, [file, bgMode, bgColor, composite, setResult]);

  // Re-composite instantly when the background option changes (no need to re-run the model).
  useEffect(() => {
    if (!cutout) return;
    let cancelled = false;
    composite(cutout, bgMode, bgColor).then((b) => {
      if (!cancelled) setResult(b);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgMode, bgColor]);

  const download = () => {
    if (!outBlob || !file) return;
    const href = URL.createObjectURL(outBlob);
    const a = document.createElement('a');
    a.href = href;
    a.download = renameExt(file.name, 'png');
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  return (
    <section>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Remove background</h1>
      <p className="mb-5 max-w-2xl text-[15px] text-muted">
        Erase the background from any photo with on-device AI. The model downloads once, then runs
        100% locally. Your image never leaves your device.
      </p>

      <Dropzone multiple={false} onFiles={onFiles} />

      {file && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="card p-3">
              <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Original
              </figcaption>
              {origUrl && (
                <img src={origUrl} alt="Original" className="max-h-[60vh] w-full rounded-lg object-contain" />
              )}
            </figure>
            <figure className="card p-3">
              <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Result
              </figcaption>
              {resultUrl ? (
                <img
                  src={resultUrl}
                  alt="Background removed"
                  className="checkerboard max-h-[60vh] w-full rounded-lg object-contain"
                />
              ) : (
                <div className="grid h-40 place-items-center rounded-lg border border-dashed border-line text-sm text-muted">
                  {status === 'working' ? <Spinner label={progress || 'Working'} /> : 'No result yet'}
                </div>
              )}
            </figure>
          </div>

          <aside className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-fg">Background</span>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBgMode('transparent')}
                  className={`btn-ghost flex-1 ${bgMode === 'transparent' ? 'border-accent text-accent' : ''}`}
                >
                  Transparent
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('color')}
                  className={`btn-ghost flex-1 ${bgMode === 'color' ? 'border-accent text-accent' : ''}`}
                >
                  Solid colour
                </button>
              </div>
            </div>

            {bgMode === 'color' && (
              <label className="flex items-center justify-between text-sm text-fg">
                Pick a colour
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-lg border border-line bg-transparent"
                />
              </label>
            )}

            <button type="button" onClick={run} disabled={status === 'working'} className="btn-primary w-full">
              {status === 'working' ? 'Working' : status === 'done' ? 'Run again' : 'Remove background'}
            </button>

            {status === 'working' && <Spinner label={progress || 'Processing on your device'} />}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {outBlob && status === 'done' && (
              <button type="button" onClick={download} className="btn-ghost w-full">
                Download PNG ({formatBytes(outBlob.size)})
              </button>
            )}

            <p className="text-xs text-muted">
              First run downloads a one-time AI model, then it works offline. The image itself is
              never uploaded.
            </p>
          </aside>
        </div>
      )}

      <ToolContent slug="/background-remover" />
    </section>
  );
}
