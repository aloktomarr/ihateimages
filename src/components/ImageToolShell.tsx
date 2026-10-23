import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Dropzone from './Dropzone';
import ToolContent from './ToolContent';
import ToolHeader from './ToolHeader';
import CompareSlider from './CompareSlider';
import Thumb from './Thumb';
import { Icon } from './icons';
import { BusyOverlay, MobileActionBar, ProgressBar, SettingsPanel, WorkspaceGrid } from './Workspace';
import { processImage } from '../lib/imageEngine';
import { EXT, type ProcessOptions, type ProcessResult, type TargetFormat } from '../lib/imageTypes';
import { formatBytes, renameExt, savings } from '../lib/format';
import { nextPaint } from '../lib/schedule';
import { imageFilesFrom, useIncomingFiles } from '../lib/incoming';
import { downloadUrl, downloadZip } from '../lib/download';
import { formatLabel } from '../lib/suggest';
import { toolForPath } from '../lib/tools';

interface ResultRow {
  out?: ProcessResult;
  url?: string;
  error?: string;
}

interface Props {
  title: string;
  description: string;
  actionLabel: string;
  buildOptions: (file: File) => ProcessOptions;
  controls?: ReactNode;
  onFilesChange?: (files: File[]) => void;
  /** Optional custom per-file processor that overrides buildOptions (used by compress to target size). */
  processFile?: (file: File) => Promise<ProcessResult>;
  /** Route path (e.g. "/compress") used to render the on-page SEO content block. */
  slug?: string;
  /** Extra page content rendered between the workspace and the how-to section. */
  children?: ReactNode;
}

function extFor(outType: string): string {
  return EXT[outType as TargetFormat] ?? 'img';
}

const hasAlpha = (t: string) => t === 'image/png' || t === 'image/webp' || t === 'image/avif';

function SavingsChip({ inSize, outSize }: { inSize: number; outSize: number }) {
  const text = savings(inSize, outSize);
  if (!text) return null;
  return outSize <= inSize ? (
    <span className="chip-pop">{text}</span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-subtle px-2 py-0.5 text-[12px] font-bold tabular-nums text-muted">
      {text}
    </span>
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
  children,
}: Props) {
  const { pathname } = useLocation();
  const multiple = toolForPath(pathname)?.multiple ?? true;

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  // Aligned with `files`; undefined means "not processed yet".
  const [rows, setRows] = useState<(ResultRow | undefined)[]>([]);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [selected, setSelected] = useState(0);
  const [needsImage, setNeedsImage] = useState(false);
  const [stale, setStale] = useState(false);
  const resultUrls = useRef<string[]>([]);
  const previewUrls = useRef<string[]>([]);
  const addInput = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const clearResults = useCallback(() => {
    resultUrls.current.forEach((u) => URL.revokeObjectURL(u));
    resultUrls.current = [];
    setRows([]);
    setStale(false);
  }, []);

  // Revoke object URLs on unmount so images don't leak memory.
  useEffect(
    () => () => {
      resultUrls.current.forEach((u) => URL.revokeObjectURL(u));
      previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const makePreviews = (list: File[]) =>
    list.map((f) => {
      const u = URL.createObjectURL(f);
      previewUrls.current.push(u);
      return u;
    });

  const replaceFiles = useCallback(
    (next: File[]) => {
      const list = multiple ? next : next.slice(0, 1);
      clearResults();
      previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
      previewUrls.current = [];
      setFiles(list);
      setPreviews(makePreviews(list));
      setSelected(0);
      setNeedsImage(false);
      onFilesChange?.(list);
    },
    [multiple, clearResults, onFilesChange],
  );

  const addFiles = useCallback(
    (more: File[]) => {
      if (!more.length) return;
      if (!multiple || !files.length) {
        replaceFiles(more);
        return;
      }
      clearResults();
      const list = [...files, ...more];
      setFiles(list);
      setPreviews((p) => [...p, ...makePreviews(more)]);
      setSelected(files.length);
      onFilesChange?.(list);
    },
    [multiple, files, replaceFiles, clearResults, onFilesChange],
  );

  const removeFile = useCallback(
    (i: number) => {
      const url = previews[i];
      if (url) URL.revokeObjectURL(url);
      previewUrls.current = previewUrls.current.filter((u) => u !== url);
      const resUrl = rows[i]?.url;
      if (resUrl) URL.revokeObjectURL(resUrl);
      resultUrls.current = resultUrls.current.filter((u) => u !== resUrl);
      const list = files.filter((_, j) => j !== i);
      setFiles(list);
      setPreviews((p) => p.filter((_, j) => j !== i));
      setRows((r) => r.filter((_, j) => j !== i));
      setSelected((s) => Math.max(0, Math.min(s > i ? s - 1 : s, list.length - 1)));
      onFilesChange?.(list);
    },
    [files, previews, rows, onFilesChange],
  );

  // Images handed over from elsewhere: the home page, a drop or paste anywhere, the share
  // sheet, "Open with", the extension or a ?src= link.
  useIncomingFiles(addFiles);

  // Results no longer match once a setting changes.
  useEffect(() => {
    if (rows.length) setStale(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildOptions, processFile]);

  const run = useCallback(async () => {
    if (!files.length) {
      setNeedsImage(true);
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setNeedsImage(false);
    setBusy(true);
    clearResults();
    // Let the busy state paint before heavy encoding starts so the click stays responsive (good INP).
    await nextPaint();
    const next: (ResultRow | undefined)[] = files.map(() => undefined);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrent(i);
      try {
        const out = processFile ? await processFile(file) : await processImage(file, buildOptions(file));
        const url = URL.createObjectURL(out.blob);
        resultUrls.current.push(url);
        next[i] = { out, url };
      } catch (e) {
        next[i] = { error: (e as Error).message || 'Could not process this image' };
      }
      setRows([...next]);
      // Yield a frame between files so each result paints and the page stays responsive.
      await nextPaint();
    }
    setCurrent(-1);
    setStale(false);
    setBusy(false);
  }, [files, buildOptions, processFile, clearResults]);

  const outName = (i: number) => renameExt(files[i].name, extFor(rows[i]!.out!.outType));

  const doneIdx = rows.map((r, i) => (r?.out ? i : -1)).filter((i) => i >= 0);
  const downloadAll = useCallback(async () => {
    if (!doneIdx.length) return;
    if (doneIdx.length === 1) {
      const i = doneIdx[0];
      downloadUrl(rows[i]!.url!, outName(i));
      return;
    }
    await downloadZip(
      doneIdx.map((i) => ({ name: outName(i), blob: rows[i]!.out!.blob })),
      'ihateimages.zip',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, files]);

  const sel = Math.min(selected, Math.max(0, files.length - 1));
  const selFile = files[sel];
  const selRow = rows[sel];
  const processed = rows.filter(Boolean).length;
  const inDone = doneIdx.reduce((s, i) => s + files[i].size, 0);
  const outDone = doneIdx.reduce((s, i) => s + rows[i]!.out!.blob.size, 0);
  const progress = busy ? processed / Math.max(1, files.length) : null;
  const finished = !busy && doneIdx.length > 0;

  const actionText = busy ? (
    <>
      Working <span className="tabular opacity-70">{processed}/{files.length}</span>
    </>
  ) : (
    <>
      {(stale || finished) && <Icon name="refresh" className="h-4 w-4" />}
      {actionLabel}
      {files.length > 1 && (
        <span className="tabular rounded-full bg-ink-fg/15 px-2 py-0.5 text-[12px]">{files.length}</span>
      )}
    </>
  );

  return (
    <div className="container-page">
      <ToolHeader title={title} description={description} />

      <WorkspaceGrid>
        <div ref={stageRef} className="min-w-0">
          {files.length === 0 ? (
            <Dropzone onFiles={replaceFiles} highlight={needsImage} multiple={multiple} />
          ) : (
            <div className="card animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 pl-4 pr-2 sm:pl-5">
                <p className="truncate text-[13.5px] text-muted">
                  <span className="font-semibold text-fg">
                    {files.length} {files.length === 1 ? 'image' : 'images'}
                  </span>{' '}
                  &middot; {formatBytes(files.reduce((s, f) => s + f.size, 0))}
                </p>
                <div className="flex shrink-0 items-center">
                  <input
                    ref={addInput}
                    type="file"
                    accept="image/*,.heic,.heif"
                    multiple={multiple}
                    hidden
                    onChange={(e) => {
                      addFiles(imageFilesFrom(e.target.files));
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addInput.current?.click()}
                    disabled={busy}
                    className="btn btn-ghost btn-sm"
                  >
                    <Icon name={multiple ? 'plus' : 'refresh'} className="h-4 w-4" />
                    {multiple ? 'Add more' : 'Replace'}
                  </button>
                  <button type="button" onClick={() => replaceFiles([])} disabled={busy} className="btn btn-ghost btn-sm">
                    <Icon name="trash" className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                {selRow?.out && selRow.url ? (
                  <CompareSlider
                    key={selRow.url}
                    before={previews[sel]}
                    after={selRow.url}
                    beforeLabel={`Original · ${formatBytes(selFile.size)}`}
                    afterLabel={`Result · ${formatBytes(selRow.out.blob.size)}`}
                    checker={hasAlpha(selRow.out.outType)}
                  />
                ) : (
                  <div className="relative overflow-hidden rounded-2xl bg-subtle" style={{ height: 'min(56vh, 480px)' }}>
                    <Thumb
                      key={previews[sel]}
                      src={previews[sel]}
                      alt={selFile.name}
                      label={formatLabel(selFile)}
                      fit="contain"
                      className="h-full w-full"
                    />
                    {busy && current === sel && <BusyOverlay label="Processing on your device" />}
                    {selRow?.error && (
                      <div className="absolute inset-x-3 bottom-3 flex items-start gap-2 rounded-xl bg-danger px-3 py-2.5 text-[13px] font-medium text-white">
                        <Icon name="alert" className="mt-px h-4 w-4 shrink-0" />
                        {selRow.error}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-fg">{selFile.name}</p>
                    <p className="tabular mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
                      {selRow?.out ? (
                        <>
                          <span>
                            {formatLabel(selFile)} &rarr; {extFor(selRow.out.outType).toUpperCase()}
                          </span>
                          <span>&middot;</span>
                          <span>
                            {selRow.out.width}&times;{selRow.out.height}
                          </span>
                          <span>&middot;</span>
                          <span>
                            {formatBytes(selFile.size)} &rarr;{' '}
                            <span className="font-semibold text-fg">{formatBytes(selRow.out.blob.size)}</span>
                          </span>
                          <SavingsChip inSize={selFile.size} outSize={selRow.out.blob.size} />
                        </>
                      ) : (
                        <span>
                          {formatLabel(selFile)} &middot; {formatBytes(selFile.size)} &middot;{' '}
                          {busy ? (current === sel ? 'Processing' : 'Queued') : 'Ready'}
                        </span>
                      )}
                    </p>
                  </div>
                  {selRow?.out && selRow.url && (
                    <button
                      type="button"
                      onClick={() => downloadUrl(selRow.url!, outName(sel))}
                      className="btn btn-secondary btn-sm"
                    >
                      <Icon name="download" className="h-4 w-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {files.length > 1 && (
                <div className="border-t border-line p-3 sm:p-4">
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
                    {files.map((f, i) => {
                      const r = rows[i];
                      return (
                        <li key={previews[i]} className="group relative min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelected(i)}
                            aria-pressed={i === sel}
                            aria-label={`Show ${f.name}`}
                            className={`relative block aspect-square w-full overflow-hidden rounded-xl bg-subtle ring-offset-2 ring-offset-surface transition ${
                              i === sel ? 'ring-2 ring-fg' : 'hover:opacity-90'
                            }`}
                          >
                            <Thumb src={r?.url ?? previews[i]} alt={f.name} label={formatLabel(f)} className="h-full w-full" />
                            {busy && current === i && (
                              <span className="absolute inset-0 grid place-items-center bg-black/40">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              </span>
                            )}
                            {busy && i > current && !r && <span className="absolute inset-0 bg-surface/50" />}
                            {r?.out && (
                              <span className="absolute bottom-1.5 left-1.5">
                                <SavingsChip inSize={f.size} outSize={r.out.blob.size} />
                              </span>
                            )}
                            {r?.error && (
                              <span className="absolute inset-0 grid place-items-center bg-danger/85 text-white">
                                <Icon name="alert" className="h-6 w-6" />
                              </span>
                            )}
                          </button>
                          {!busy && (
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              aria-label={`Remove ${f.name}`}
                              className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink text-ink-fg shadow-lift transition focus:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                            >
                              <Icon name="close" className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <p className="mt-1.5 truncate text-[12px] text-muted">{f.name}</p>
                        </li>
                      );
                    })}
                    {multiple && !busy && (
                      <li>
                        <Dropzone variant="tile" onFiles={addFiles} className="aspect-square" />
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {doneIdx.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subtle/50 px-4 py-3.5 sm:px-5">
                  <p className="tabular text-[14px] text-muted">
                    {outDone <= inDone ? (
                      <>
                        <span className="font-semibold text-fg">Saved {formatBytes(inDone - outDone)}</span> (
                        {formatBytes(inDone)} &rarr; {formatBytes(outDone)})
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-fg">{formatBytes(outDone)}</span> in total
                      </>
                    )}
                    {rows.some((r) => r?.error) && (
                      <span className="ml-2 font-semibold text-danger">Some images failed.</span>
                    )}
                  </p>
                  <button type="button" onClick={downloadAll} className="btn btn-primary hidden sm:inline-flex">
                    <Icon name="download" className="h-4 w-4" />
                    {doneIdx.length > 1 ? `Download all (${doneIdx.length}) as ZIP` : 'Download'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <SettingsPanel
          badge={
            stale ? (
              <span className="rounded-full bg-pop px-2 py-0.5 text-[11.5px] font-bold text-pop-fg">Changed</span>
            ) : null
          }
          footer={
            <div className={files.length ? 'hidden lg:block' : ''}>
              <button type="button" onClick={run} disabled={busy} className="btn btn-primary btn-lg w-full">
                {actionText}
              </button>
              {busy && <ProgressBar value={progress ?? 0} className="mt-3" />}
              {stale && !busy && (
                <p className="hint mt-3 text-center">Settings changed. Run again to update the results.</p>
              )}
            </div>
          }
        >
          {controls}
        </SettingsPanel>
      </WorkspaceGrid>

      {files.length > 0 && (
        <MobileActionBar busy={busy} progress={progress ?? undefined}>
          {finished && !stale ? (
            <>
              <button type="button" onClick={run} className="btn btn-secondary h-[3.25rem] w-[3.25rem] px-0" aria-label="Run again">
                <Icon name="refresh" className="h-5 w-5" />
              </button>
              <button type="button" onClick={downloadAll} className="btn btn-primary btn-lg flex-1">
                <Icon name="download" className="h-4 w-4" />
                {doneIdx.length > 1 ? `Download all (${doneIdx.length})` : 'Download'}
              </button>
            </>
          ) : (
            <button type="button" onClick={run} disabled={busy} className="btn btn-primary btn-lg flex-1">
              {actionText}
            </button>
          )}
        </MobileActionBar>
      )}

      {children}
      {slug && <ToolContent slug={slug} />}
    </div>
  );
}
