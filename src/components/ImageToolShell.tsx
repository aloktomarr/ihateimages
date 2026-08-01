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
  /** Optional custom per-file processor that overrides buildOptions (used by compress to target size). */
  processFile?: (file: File) => Promise<ProcessResult>;
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
  processFile,
  slug,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [needsImage, setNeedsImage] = useState(false);
  const urlsRef = useRef<string[]>([]);
  const previewUrlsRef = useRef<string[]>([]);

  const cleanupUrls = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  const cleanupPreviews = useCallback(() => {
    previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    previewUrlsRef.current = [];
  }, []);

  // Revoke object URLs on unmount so images don't leak memory.
  useEffect(
    () => () => {
      cleanupUrls();
      cleanupPreviews();
    },
    [cleanupUrls, cleanupPreviews],
  );

  const onFiles = useCallback(
    (incoming: File[]) => {
      cleanupUrls();
      cleanupPreviews();
      setFiles(incoming);
      setRows([]);
      setNeedsImage(false);
      setPreviews(
        incoming.map((f) => {
          const u = URL.createObjectURL(f);
          previewUrlsRef.current.push(u);
          return u;
        }),
      );
      onFilesChange?.(incoming);
    },
    [cleanupUrls, cleanupPreviews, onFilesChange],
  );

  const run = useCallback(async () => {
    if (!files.length) {
      setNeedsImage(true);
      return;
    }
    setNeedsImage(false);
    setBusy(true);
    cleanupUrls();
    const next: ResultRow[] = [];
    for (const file of files) {
      try {
        const out = processFile ? await processFile(file) : await processImage(file, buildOptions(file));
        const url = URL.createObjectURL(out.blob);
        urlsRef.current.push(url);
        next.push({ name: file.name, inSize: file.size, out, url });
      } catch (e) {
        next.push({ name: file.name, inSize: file.size, error: (e as Error).message });
      }
      setRows([...next]);
    }
    setBusy(false);
  }, [files, buildOptions, processFile, cleanupUrls]);

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
          <Dropzone onFiles={onFiles} highlight={needsImage} />
        </div>

        {/* Right column: filters + primary action (sticky on desktop) */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
          {controls}
          <button onClick={run} disabled={busy} className="btn-primary w-full">
            {busy ? 'Working' : actionLabel}
          </button>
          {busy && <Spinner label="Processing on your device" />}
          {needsImage && files.length === 0 && (
            <p className="text-sm font-medium text-accent">Please add an image first.</p>
          )}
          {files.length === 0 && !needsImage && (
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
          <div className="space-y-3 lg:col-start-1 lg:row-start-2">
            {files.length === 1 ? (
              <img
                src={previews[0]}
                alt={files[0]?.name ?? 'Preview'}
                className="max-h-64 w-auto rounded-xl border border-line bg-hover object-contain"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={files[i]?.name ?? 'Preview'}
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    style={{ width: 96, height: 96 }}
                    className="rounded-lg border border-line bg-hover object-cover"
                  />
                ))}
              </div>
            )}
            <p className="text-sm text-muted">
              {files.length} image{files.length > 1 ? 's' : ''} ready. Set your options, then{' '}
              {actionLabel.toLowerCase()}.
            </p>
          </div>
        )}
      </div>

      {slug && <ToolContent slug={slug} />}
    </section>
  );
}
