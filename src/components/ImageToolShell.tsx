import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from './Dropzone';
import Spinner from './Spinner';
import ToolContent from './ToolContent';
import { processImage } from '../lib/imageEngine';
import { EXT, type ProcessOptions, type ProcessResult, type TargetFormat } from '../lib/imageTypes';
import { formatBytes, renameExt, savings } from '../lib/format';

interface ResultRow {
  name: string;
  inSize: number;
  out?: ProcessResult;
  url?: string;
  error?: string;
}

interface Props {
  title: string;
  description: string;
  actionLabel: string;
  buildOptions: (file: File) => ProcessOptions;
  controls?: React.ReactNode;
  onFilesChange?: (files: File[]) => void;
  /** Route path (e.g. "/compress") used to render the on-page SEO content block. */
  slug?: string;
}

function extFor(outType: string): string {
  return EXT[outType as TargetFormat] ?? 'img';
}

function triggerDownload(row: ResultRow) {
  if (!row.out || !row.url) return;
  const a = document.createElement('a');
  a.href = row.url;
  a.download = renameExt(row.name, extFor(row.out.outType));
  a.click();
}

function ResultCard({ row }: { row: ResultRow }) {
  return (
    <div className="card flex items-center gap-3 p-3">
      {row.url ? (
        <img
          src={row.url}
          alt={row.name}
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
          className="h-14 w-14 shrink-0 rounded-lg bg-hover object-cover"
        />
      ) : (
        <div className="h-14 w-14 shrink-0 rounded-lg bg-hover" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{row.name}</p>
        {row.error ? (
          <p className="text-xs text-red-500">{row.error}</p>
        ) : row.out ? (
          <p className="text-xs text-muted">
            {formatBytes(row.inSize)} →{' '}
            <span className="font-semibold text-accent">{formatBytes(row.out.blob.size)}</span> · {row.out.width}×
            {row.out.height} · {extFor(row.out.outType).toUpperCase()} ·{' '}
            {savings(row.inSize, row.out.blob.size)}
          </p>
        ) : (
          <p className="text-xs text-muted">Queued</p>
        )}
      </div>
      {row.out && (
        <button onClick={() => triggerDownload(row)} className="btn-ghost shrink-0">
          Download
        </button>
      )}
    </div>
  );
}

export default function ImageToolShell({
  title,
  description,
  actionLabel,
  buildOptions,
  controls,
  onFilesChange,
  slug,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [busy, setBusy] = useState(false);
  const urlsRef = useRef<string[]>([]);

  const cleanupUrls = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  // Revoke object URLs on unmount so processed images don't leak memory.
  useEffect(() => cleanupUrls, [cleanupUrls]);

  const onFiles = useCallback(
    (incoming: File[]) => {
      setFiles(incoming);
      setRows([]);
      cleanupUrls();
      onFilesChange?.(incoming);
    },
    [cleanupUrls, onFilesChange],
  );

  const run = useCallback(async () => {
    if (!files.length) return;
    setBusy(true);
    cleanupUrls();
    const next: ResultRow[] = [];
    for (const file of files) {
      try {
        const out = await processImage(file, buildOptions(file));
        const url = URL.createObjectURL(out.blob);
        urlsRef.current.push(url);
        next.push({ name: file.name, inSize: file.size, out, url });
      } catch (e) {
        next.push({ name: file.name, inSize: file.size, error: (e as Error).message });
      }
      setRows([...next]);
    }
    setBusy(false);
  }, [files, buildOptions, cleanupUrls]);

  const downloadAll = useCallback(async () => {
    const done = rows.filter((r) => r.out);
    if (!done.length) return;
    if (done.length === 1) {
      triggerDownload(done[0]);
      return;
    }
    const { zipSync } = await import('fflate');
    const entries: Record<string, Uint8Array> = {};
    for (const r of done) {
      const buf = new Uint8Array(await r.out!.blob.arrayBuffer());
      entries[renameExt(r.name, extFor(r.out!.outType))] = buf;
    }
    const zipped = zipSync(entries, { level: 0 });
    const url = URL.createObjectURL(new Blob([zipped], { type: 'application/zip' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ihateimages.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [rows]);

  const totalIn = rows.reduce((s, r) => s + r.inSize, 0);
  const totalOut = rows.reduce((s, r) => s + (r.out?.blob.size ?? 0), 0);

  return (
    <section>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="mb-5 max-w-2xl text-[15px] text-muted">{description}</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left column: upload area */}
        <div className="lg:col-start-1 lg:row-start-1">
          <Dropzone onFiles={onFiles} />
        </div>

        {/* Right column: filters + primary action (sticky on desktop) */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
          {controls}
          <button onClick={run} disabled={busy || files.length === 0} className="btn-primary w-full">
            {busy ? 'Working' : actionLabel}
          </button>
          {busy && <Spinner label="Processing on your device" />}
          {files.length === 0 && (
            <p className="text-xs text-muted">Drop an image on the left to get started.</p>
          )}
        </aside>

        {/* Left column, below the upload: results */}
        {rows.length > 0 && (
          <div className="space-y-2 lg:col-start-1 lg:row-start-2">
            {rows.map((r, i) => (
              <ResultCard key={i} row={r} />
            ))}
            {totalOut > 0 && (
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-muted">
                  Total: {formatBytes(totalIn)} →{' '}
                  <span className="font-semibold text-accent">{formatBytes(totalOut)}</span> (
                  {savings(totalIn, totalOut)})
                </span>
                <button onClick={downloadAll} className="btn-primary">
                  Download all
                </button>
              </div>
            )}
          </div>
        )}

        {files.length > 0 && rows.length === 0 && (
          <p className="text-sm text-muted lg:col-start-1 lg:row-start-2">
            {files.length} image{files.length > 1 ? 's' : ''} ready. Set your options, then{' '}
            {actionLabel.toLowerCase()}.
          </p>
        )}
      </div>

      {slug && <ToolContent slug={slug} />}
    </section>
  );
}
