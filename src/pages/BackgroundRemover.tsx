import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import ToolContent from '../components/ToolContent';
import ToolHeader from '../components/ToolHeader';
import CompareSlider from '../components/CompareSlider';
import Thumb from '../components/Thumb';
import { Field, Segmented } from '../components/controls';
import { Icon } from '../components/icons';
import { BusyOverlay, MobileActionBar, SettingsPanel, StageCard, WorkspaceGrid } from '../components/Workspace';
import { formatBytes, renameExt } from '../lib/format';
import { nextPaint } from '../lib/schedule';
import { useIncomingFiles } from '../lib/incoming';
import { downloadBlob } from '../lib/download';
import { formatLabel } from '../lib/suggest';

type Status = 'idle' | 'working' | 'done' | 'error';
type BgMode = 'transparent' | 'color';

const SWATCHES = ['#ffffff', '#f4f5f7', '#0e0f11', '#d4fa4c', '#2563eb', '#ef4444'];

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
  useIncomingFiles(onFiles);

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
    // Paint the loading state before pulling in the model so the click stays responsive (good INP).
    await nextPaint();
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
    downloadBlob(outBlob, renameExt(file.name, 'png'));
  };

  const working = status === 'working';
  const actionLabel = working ? progress || 'Working' : status === 'done' ? 'Run again' : 'Remove background';

  return (
    <div className="container-page">
      <ToolHeader
        title="Remove background"
        description="Erase the background from any photo with on-device AI. The model downloads once, then runs 100% locally. Your image never leaves your device."
      />

      <WorkspaceGrid>
        <div className="min-w-0">
          {!file ? (
            <Dropzone multiple={false} onFiles={onFiles} />
          ) : (
            <StageCard
              file={file}
              onReplace={onFiles}
              onClear={() => {
                cleanup();
                setFile(null);
                setResultUrl(null);
                setCutout(null);
                setOutBlob(null);
                setStatus('idle');
              }}
              disabled={working}
              footer={
                outBlob &&
                status === 'done' && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="tabular text-[13.5px] text-muted">
                      <span className="font-semibold text-fg">Cutout ready</span> &middot; PNG &middot;{' '}
                      {formatBytes(outBlob.size)}
                    </p>
                    <button type="button" onClick={download} className="btn btn-primary hidden sm:inline-flex">
                      <Icon name="download" className="h-4 w-4" />
                      Download PNG
                    </button>
                  </div>
                )
              }
            >
              {resultUrl && origUrl ? (
                <CompareSlider
                  before={origUrl}
                  after={resultUrl}
                  beforeLabel="Original"
                  afterLabel="Cutout"
                  checker={bgMode === 'transparent'}
                />
              ) : (
                <div className="relative overflow-hidden rounded-2xl bg-subtle" style={{ height: 'min(56vh, 480px)' }}>
                  <Thumb src={origUrl ?? undefined} alt="Original" label={formatLabel(file)} fit="contain" className="h-full w-full" />
                  {working && <BusyOverlay label={progress || 'Working'} />}
                </div>
              )}
              {error && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-[13px] font-medium text-danger">
                  <Icon name="alert" className="mt-px h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}
            </StageCard>
          )}
        </div>

        <SettingsPanel
          footer={
            <div className={file ? 'hidden lg:block' : ''}>
              <button type="button" onClick={run} disabled={working || !file} className="btn btn-primary btn-lg w-full">
                {status === 'done' && <Icon name="refresh" className="h-4 w-4" />}
                {status !== 'done' && !working && <Icon name="sparkles" className="h-4 w-4" />}
                {actionLabel}
              </button>
              {outBlob && status === 'done' && (
                <button type="button" onClick={download} className="btn btn-secondary btn-lg mt-2 w-full">
                  <Icon name="download" className="h-4 w-4" />
                  Download PNG
                </button>
              )}
            </div>
          }
        >
          <Segmented
            label="Background"
            value={bgMode}
            onChange={setBgMode}
            options={[
              { value: 'transparent', label: 'Transparent' },
              { value: 'color', label: 'Solid colour' },
            ]}
          />

          {bgMode === 'color' && (
            <Field label="Colour">
              <div className="flex flex-wrap items-center gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    aria-label={`Use ${c}`}
                    aria-pressed={bgColor === c}
                    className={`h-9 w-9 rounded-full border border-line transition ${
                      bgColor === c ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface' : 'hover:scale-105'
                    }`}
                    style={{ background: c }}
                  />
                ))}
                <label className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border border-line" title="Custom colour">
                  <span className="sr-only">Custom colour</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] cursor-pointer"
                  />
                </label>
              </div>
            </Field>
          )}

          <p className="hint flex gap-2 rounded-xl bg-subtle px-3 py-2.5">
            <Icon name="sparkles" className="mt-0.5 h-4 w-4 shrink-0 text-fg" />
            <span>
              The first run downloads a one-time AI model (it is cached after that, and then works offline). Your
              image is never uploaded.
            </span>
          </p>
        </SettingsPanel>
      </WorkspaceGrid>

      {file && (
        <MobileActionBar busy={working}>
          {outBlob && status === 'done' ? (
            <>
              <button type="button" onClick={run} className="btn btn-secondary h-[3.25rem] w-[3.25rem] px-0" aria-label="Run again">
                <Icon name="refresh" className="h-5 w-5" />
              </button>
              <button type="button" onClick={download} className="btn btn-primary btn-lg flex-1">
                <Icon name="download" className="h-4 w-4" />
                Download PNG
              </button>
            </>
          ) : (
            <button type="button" onClick={run} disabled={working} className="btn btn-primary btn-lg flex-1">
              {actionLabel}
            </button>
          )}
        </MobileActionBar>
      )}

      <ToolContent slug="/background-remover" />
    </div>
  );
}
